import { supabase } from '../lib/supabase';
import { normalizeOrderStatus, type Order, type OrderItem, type PaymentMethod, type PaymentStatus } from '../types';

const normalizePhone = (value: string): string => value.replace(/[^0-9]/g, '');

const normalizeCode = (value: string): string =>
  value
    .replace(/^#/, '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/[^A-Za-z0-9-]/g, '')
    .trim()
    .toUpperCase();

export const OrderService = {
  async saveOrder(order: Order, items: OrderItem[]): Promise<Order> {
    const formattedItems = items.map((item) => ({
      productId: item.productId || undefined,
      name: item.name || 'منتج غير محدد',
      size: item.size || 'M',
      quantity: Number(item.quantity || 1),
      price: Number(item.price || 0),
    }));

    // Exact database payload matching orders table schema
    const orderPayload: any = {
      full_name: order.customerName,
      phone: normalizePhone(order.phone),
      governorate: order.governorate || null,
      address: order.address,
      notes: order.notes ? order.notes.trim() : null,
      total_amount: Number(order.total ?? 0),
      status: normalizeOrderStatus(order.status),
    };

    // If the frontend supplied a logged-in user's ID, persist it for account-based tracking
    if (order.userId) {
      orderPayload.user_id = String(order.userId);
    }

    // 1. Insert parent order and retrieve generated row
    const { data: savedOrder, error: orderError } = await supabase
      .from('orders')
      .insert([orderPayload])
      .select()
      .single();

    if (orderError) {
      console.error('Supabase orders insert failed:', orderError);
      throw new Error(orderError.message || 'Failed to save order to database');
    }

    if (!savedOrder) {
      throw new Error('Database did not return saved order details');
    }

    // 2. Capture returned order_id accurately
    const createdOrderId = savedOrder.id ?? savedOrder.order_id;
    if (!createdOrderId) {
      console.error('Supabase order returned without an ID:', savedOrder);
      throw new Error('Created order is missing a valid database ID');
    }

    // 3. Insert items into order_items with foreign key order_id and product snapshots
    if (formattedItems.length > 0) {
      const itemRows = formattedItems.map((item) => ({
        order_id: createdOrderId,
        product_id: item.productId || null,
        product_name: item.name,
        size: item.size,
        quantity: item.quantity,
        price: item.price,
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(itemRows);
      if (itemsError) {
        console.error('Supabase order_items insert failed:', itemsError);
        throw new Error(itemsError.message || 'Failed to save order items to database');
      }
    }

    return {
      ...order,
      id: String(createdOrderId),
      orderCode: String(savedOrder.id ?? order.orderCode ?? ''),
      customerName: String(savedOrder.full_name || order.customerName),
      phone: String(savedOrder.phone || order.phone),
      governorate: savedOrder.governorate ? String(savedOrder.governorate) : order.governorate,
      address: String(savedOrder.address || order.address),
      notes: savedOrder.notes ? String(savedOrder.notes) : order.notes,
      total: Number(savedOrder.total_amount ?? order.total),
      status: normalizeOrderStatus(savedOrder.status as string | null),
      createdAt: String(savedOrder.created_at || order.createdAt),
      userId: savedOrder.user_id ? String(savedOrder.user_id) : order.userId,
      items: formattedItems,
    };
  },

  async fetchUserOrders(userPhone: string, userId?: string, searchQuery?: string): Promise<Order[]> {
    const cleanUserPhone = normalizePhone(String(userPhone || '') || '');

    // If a userId is supplied, enforce fetch by `user_id` to guarantee privacy
    try {
      let query: any = supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false });

      if (userId) {
        query = query.eq('user_id', String(userId));
      } else if (cleanUserPhone) {
        query = query.eq('phone', cleanUserPhone);
      } else {
        return [];
      }

      const cleanSearch = (searchQuery || '').trim();
      // If user typed a specific order ID or code, filter for that order id
      if (cleanSearch) {
        // Only apply additional search when it doesn't equal the phone (avoid accidental collisions)
        if (cleanSearch !== cleanUserPhone) {
          query = query.or(`id.eq.${cleanSearch},id.ilike.%${cleanSearch}%`);
        }
      }

      const { data, error } = await query;
      if (error) {
        console.warn('Supabase fetchUserOrders error:', error.message);
        return [];
      }

      if (!Array.isArray(data)) return [];

      const orderIds = data.map((row: any) => row.id).filter(Boolean);
      let itemMap: Record<string, OrderItem[]> = {};

      if (orderIds.length > 0 && !data[0]?.order_items) {
        try {
          const { data: fetchedItems } = await supabase
            .from('order_items')
            .select('*')
            .in('order_id', orderIds);

          if (Array.isArray(fetchedItems)) {
            for (const it of fetchedItems) {
              const oid = String(it.order_id);
              if (!itemMap[oid]) itemMap[oid] = [];
              itemMap[oid].push({
                productId: it.product_id ? String(it.product_id) : undefined,
                name: String(it.product_name ?? it.name ?? ''),
                size: String(it.size ?? 'M'),
                quantity: Number(it.quantity ?? 1),
                price: Number(it.price ?? 0),
              });
            }
          }
        } catch {
          // ignore
        }
      }

      return data.map((row: any) => {
        const rowId = String(row.id ?? '');
        const embeddedItems = Array.isArray(row.order_items) && row.order_items.length > 0
          ? row.order_items.map((it: any) => ({
              productId: it.product_id ? String(it.product_id) : undefined,
              name: String(it.product_name ?? it.name ?? ''),
              size: String(it.size ?? 'M'),
              quantity: Number(it.quantity ?? 1),
              price: Number(it.price ?? 0),
            }))
          : (itemMap[rowId] ?? []);

        return {
          id: rowId,
          orderCode: String(row.id ?? ''),
          customerName: String(row.full_name ?? ''),
          phone: String(row.phone ?? ''),
          governorate: row.governorate ? String(row.governorate) : undefined,
          address: String(row.address ?? ''),
          notes: row.notes ? String(row.notes) : '',
          total: Number(row.total_amount ?? row.total ?? 0),
          status: normalizeOrderStatus(row.status as string | null),
          createdAt: String(row.created_at ?? new Date().toISOString()),
          items: embeddedItems,
          paymentMethod: ('الدفع عند الاستلام' as PaymentMethod),
          paymentStatus: ('جاري الفحص' as PaymentStatus),
        };
      });
    } catch (error) {
      console.warn('fetchUserOrders failed:', error);
      return [];
    }
  },

  async fetchOrdersByPhoneOrCode(searchValue: string, authenticatedPhone?: string): Promise<Order[]> {
    const raw = searchValue.trim();
    if (!raw) return [];

    // If authenticatedPhone is supplied, enforce that only orders belonging to authenticatedPhone can be fetched
    if (authenticatedPhone) {
      return this.fetchUserOrders(authenticatedPhone, raw);
    }

    const phoneQuery = normalizePhone(raw);
    if (!phoneQuery) return [];

    try {
      let query = supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false });

      if (phoneQuery.length >= 7) {
        query = query.eq('phone', phoneQuery);
      } else {
        query = query.ilike('phone', `%${phoneQuery}%`);
      }

      const { data, error } = await query;
      if (error || !Array.isArray(data)) return [];

      const orderIds = data.map((row: any) => row.id).filter(Boolean);
      let itemMap: Record<string, OrderItem[]> = {};

      if (orderIds.length > 0 && !data[0]?.order_items) {
        try {
          const { data: fetchedItems } = await supabase
            .from('order_items')
            .select('*')
            .in('order_id', orderIds);

          if (Array.isArray(fetchedItems)) {
            for (const it of fetchedItems) {
              const oid = String(it.order_id);
              if (!itemMap[oid]) itemMap[oid] = [];
              itemMap[oid].push({
                productId: it.product_id ? String(it.product_id) : undefined,
                name: String(it.product_name ?? it.name ?? ''),
                size: String(it.size ?? 'M'),
                quantity: Number(it.quantity ?? 1),
                price: Number(it.price ?? 0),
              });
            }
          }
        } catch {
          // ignore
        }
      }

      return data.map((row: any) => {
        const rowId = String(row.id ?? '');
        const embeddedItems = Array.isArray(row.order_items) && row.order_items.length > 0
          ? row.order_items.map((it: any) => ({
              productId: it.product_id ? String(it.product_id) : undefined,
              name: String(it.product_name ?? it.name ?? ''),
              size: String(it.size ?? 'M'),
              quantity: Number(it.quantity ?? 1),
              price: Number(it.price ?? 0),
            }))
          : (itemMap[rowId] ?? []);

        return {
          id: rowId,
          orderCode: String(row.id ?? ''),
          customerName: String(row.full_name ?? ''),
          phone: String(row.phone ?? ''),
          governorate: row.governorate ? String(row.governorate) : undefined,
          address: String(row.address ?? ''),
          notes: row.notes ? String(row.notes) : '',
          total: Number(row.total_amount ?? row.total ?? 0),
          status: normalizeOrderStatus(row.status as string | null),
          createdAt: String(row.created_at ?? new Date().toISOString()),
          items: embeddedItems,
          paymentMethod: ('الدفع عند الاستلام' as PaymentMethod),
          paymentStatus: ('جاري الفحص' as PaymentStatus),
        };
      });
    } catch (error) {
      console.warn('fetchOrdersByPhoneOrCode failed:', error);
      return [];
    }
  },

  async fetchAllOrders(): Promise<Order[]> {
    try {
      let { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false });

      if (error) {
        const fallback = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });
        data = fallback.data;
        error = fallback.error;
      }

      if (error || !Array.isArray(data)) {
        return [];
      }

      const orderIds = data.map((row: any) => row.id).filter(Boolean);
      let itemMap: Record<string, OrderItem[]> = {};

      if (orderIds.length > 0 && !data[0]?.order_items) {
        try {
          const { data: fetchedItems } = await supabase
            .from('order_items')
            .select('*')
            .in('order_id', orderIds);

          if (Array.isArray(fetchedItems)) {
            for (const it of fetchedItems) {
              const oid = String(it.order_id);
              if (!itemMap[oid]) itemMap[oid] = [];
              itemMap[oid].push({
                name: String(it.product_name ?? it.name ?? ''),
                size: String(it.size ?? 'M'),
                quantity: Number(it.quantity ?? 1),
                price: Number(it.price ?? 0),
              });
            }
          }
        } catch {
          // ignore
        }
      }

      return data.map((row: any) => {
        const rowId = String(row.id ?? '');
        const embeddedItems = Array.isArray(row.order_items) && row.order_items.length > 0
          ? row.order_items.map((it: any) => ({
              name: String(it.product_name ?? it.name ?? ''),
              size: String(it.size ?? 'M'),
              quantity: Number(it.quantity ?? 1),
              price: Number(it.price ?? 0),
            }))
          : (itemMap[rowId] ?? (Array.isArray(row.items) ? row.items : []));

        return {
          id: rowId,
          orderCode: String(row.id ?? ''),
          customerName: String(row.full_name ?? row.customer_name ?? ''),
          phone: String(row.phone ?? ''),
          governorate: row.governorate ? String(row.governorate) : undefined,
          address: String(row.address ?? ''),
          notes: row.notes ? String(row.notes) : '',
          total: Number(row.total_amount ?? row.total ?? 0),
          status: normalizeOrderStatus(row.status as string | null),
          createdAt: String(row.created_at ?? new Date().toISOString()),
          items: embeddedItems,
          paymentMethod: 'الدفع عند الاستلام',
          paymentStatus: 'جاري الفحص',
        };
      });
    } catch (error) {
      console.warn('fetchAllOrders failed:', error);
      return [];
    }
  },

  async updateOrderStatus(orderId: string, status: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) {
        console.warn('Failed to update order status in Supabase:', error.message);
        return false;
      }
      return true;
    } catch (error) {
      console.warn('updateOrderStatus error:', error);
      return false;
    }
  },
};

