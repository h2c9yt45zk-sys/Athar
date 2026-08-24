import { supabase } from '../lib/supabase';
import type { Order, OrderItem } from '../types';

const normalizePhone = (value: string): string => value.replace(/[^0-9]/g, '');

const normalizeCode = (value: string): string =>
  value
    .replace(/^#/, '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/[^A-Za-z0-9-]/g, '')
    .trim()
    .toUpperCase();

const CODE_CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

export const OrderService = {
  generateOrderCode(existingOrders: Order[] = []): string {
    let randomPart = '';
    for (let i = 0; i < 4; i++) {
      randomPart += CODE_CHARS.charAt(Math.floor(Math.random() * CODE_CHARS.length));
    }
    const candidate = `ATHAR-${randomPart}`;
    const isTaken = existingOrders.some(
      (order) => order.orderCode && normalizeCode(order.orderCode) === candidate
    );
    return isTaken ? this.generateOrderCode(existingOrders) : candidate;
  },

  async saveOrder(order: Order, items: OrderItem[]): Promise<Order> {
    const formattedItems = items.map((item) => ({
      productId: item.productId || undefined,
      name: item.name || 'منتج غير محدد',
      size: item.size || 'M',
      quantity: Number(item.quantity || 1),
      price: Number(item.price || 0),
    }));

    // Exact database payload matching orders table schema
    const orderPayload = {
      full_name: order.customerName,
      phone: normalizePhone(order.phone),
      governorate: order.governorate || null,
      address: order.address,
      notes: order.notes ? order.notes.trim() : null,
      total_amount: Number(order.total ?? 0),
      status: order.status || 'قيد الانتظار',
      tracking_id: order.orderCode,
    };

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
      orderCode: String(savedOrder.tracking_id || order.orderCode),
      customerName: String(savedOrder.full_name || order.customerName),
      phone: String(savedOrder.phone || order.phone),
      governorate: savedOrder.governorate ? String(savedOrder.governorate) : order.governorate,
      address: String(savedOrder.address || order.address),
      notes: savedOrder.notes ? String(savedOrder.notes) : order.notes,
      total: Number(savedOrder.total_amount ?? order.total),
      status: (savedOrder.status as Order['status']) || order.status,
      createdAt: String(savedOrder.created_at || order.createdAt),
      items: formattedItems,
    };
  },

  async fetchOrdersByPhoneOrCode(searchValue: string): Promise<Order[]> {
    const raw = searchValue.trim();
    if (!raw) {
      return [];
    }

    const phoneQuery = normalizePhone(raw);
    const codeQuery = normalizeCode(raw);

    const conditions: string[] = [];
    if (phoneQuery.length >= 3) {
      conditions.push(`phone.ilike.%${phoneQuery}%`);
    }
    if (codeQuery.length >= 2) {
      conditions.push(`tracking_id.ilike.%${codeQuery}%`);
      conditions.push(`id.ilike.%${codeQuery}%`);
    }

    let dbOrders: Order[] = [];

    if (conditions.length > 0) {
      try {
        // Try selecting with embedded order_items relation
        let { data, error } = await supabase
          .from('orders')
          .select('*, order_items(*)')
          .or(conditions.join(','))
          .order('created_at', { ascending: false });

        // If relation join fails, fall back to flat order select
        if (error) {
          console.warn('Supabase join lookup warning, falling back to flat select:', error.message);
          const fallback = await supabase
            .from('orders')
            .select('*')
            .or(conditions.join(','))
            .order('created_at', { ascending: false });

          data = fallback.data;
          error = fallback.error;
        }

        if (error) {
          console.warn('Supabase orders lookup failed:', error.message);
        } else if (Array.isArray(data)) {
          // If flat select succeeded without embedded order_items, fetch items separately
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
            } catch (itemFetchErr) {
              console.warn('Could not fetch separate order_items:', itemFetchErr);
            }
          }

          dbOrders = data.map((row: any) => {
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
              orderCode: String(row.tracking_id ?? row.order_code ?? row.id ?? ''),
              customerName: String(row.full_name ?? row.customer_name ?? ''),
              phone: String(row.phone ?? ''),
              governorate: row.governorate ? String(row.governorate) : undefined,
              address: String(row.address ?? ''),
              notes: row.notes ? String(row.notes) : '',
              total: Number(row.total_amount ?? row.total ?? 0),
              status: (row.status as Order['status']) ?? 'قيد الانتظار',
              createdAt: String(row.created_at ?? new Date().toISOString()),
              items: embeddedItems,
              paymentMethod: 'الدفع عند الاستلام',
              paymentStatus: 'جاري الفحص',
            };
          });
        }
      } catch (error) {
        console.warn('Supabase fetchOrdersByPhoneOrCode failed:', error);
      }
    }

    // Merge with local orders for resilience
    let localOrders: Order[] = [];
    try {
      const stored = window.localStorage.getItem('athar_orders');
      if (stored) {
        const parsed = JSON.parse(stored) as Order[];
        if (Array.isArray(parsed)) {
          localOrders = parsed.filter((order) => {
            const orderPhone = normalizePhone(order.phone || '');
            const orderCode = normalizeCode(order.orderCode || order.id || '');
            const phoneMatch = phoneQuery && orderPhone.includes(phoneQuery);
            const codeMatch = codeQuery && (orderCode.includes(codeQuery) || codeQuery.includes(orderCode));
            return phoneMatch || codeMatch;
          });
        }
      }
    } catch {
      // LocalStorage access fallback
    }

    // Deduplicate by id or orderCode
    const combinedMap = new Map<string, Order>();
    for (const order of [...dbOrders, ...localOrders]) {
      const key = order.id || order.orderCode;
      if (key && !combinedMap.has(key)) {
        combinedMap.set(key, order);
      }
    }

    return Array.from(combinedMap.values());
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
          orderCode: String(row.tracking_id ?? row.order_code ?? row.id ?? ''),
          customerName: String(row.full_name ?? row.customer_name ?? ''),
          phone: String(row.phone ?? ''),
          governorate: row.governorate ? String(row.governorate) : undefined,
          address: String(row.address ?? ''),
          notes: row.notes ? String(row.notes) : '',
          total: Number(row.total_amount ?? row.total ?? 0),
          status: (row.status as Order['status']) ?? 'قيد الانتظار',
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

