import { supabase } from '../lib/supabase';
import type { UserProfile, UserLoginPayload, UserSignUpPayload, UserUpdateProfilePayload } from '../types';

const AUTH_SALT = 'athar_pure_auth_salt_2025';

export const generateUUID = (): string => {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const normalizePhone = (phone: string): string => {
  return phone.replace(/[^0-9]/g, '').trim();
};

export const hashPassword = async (password: string): Promise<string> => {
  const cleanPassword = password.trim();
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    try {
      const msgBuffer = new TextEncoder().encode(cleanPassword + ':' + AUTH_SALT);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch {
      // Fallback
    }
  }

  // Fallback simple deterministic hash if Web Crypto is not present
  let hash = 0;
  const str = cleanPassword + ':' + AUTH_SALT;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return 'shafallback_' + Math.abs(hash).toString(16);
};

export const AuthService = {
  normalizePhone,
  generateUUID,

  async signUp(payload: UserSignUpPayload): Promise<UserProfile> {
    const fullName = payload.fullName.trim();
    const phone = normalizePhone(payload.phone);
    const governorate = payload.governorate.trim();
    const address = payload.address.trim();
    const password = payload.password.trim();

    if (!fullName) {
      throw new Error('يرجى إدخال الاسم الكامل');
    }
    if (!phone || phone.length < 10) {
      throw new Error('يرجى إدخال رقم هاتف صحيح مكون من 11 رقماً');
    }
    if (!governorate) {
      throw new Error('يرجى اختيار المحافظة');
    }
    if (!address) {
      throw new Error('يرجى إدخال العنوان بالتفصيل');
    }
    if (!password || password.length < 6) {
      throw new Error('كلمة المرور يجب ألا تقل عن 6 أحرف أو أرقام');
    }

    // Phone uniqueness is enforced by the database, not by blocking the form locally.
    // Allow the request to proceed so the user can continue without a frontend-only rejection.

    // 1. Hash password & generate client-side UUID
    const hashedPassword = await hashPassword(password);
    const userId = generateUUID();

    // 3. Exact clean payload: id, phone, password, full_name, governorate, address
    const insertPayload = {
      id: userId,
      phone: phone,
      password: hashedPassword,
      full_name: fullName,
      governorate: governorate,
      address: address,
    };

    const { data: newProfile, error: insertError } = await supabase
      .from('profiles')
      .insert([insertPayload])
      .select('id, phone, full_name, governorate, address')
      .single();

    if (insertError) {
      console.error('Supabase profile insertion error:', insertError);
      if (insertError.message?.includes('duplicate key') || insertError.message?.includes('unique') || insertError.message?.includes('profiles_phone')) {
        throw new Error('رقم الهاتف مسجل بالفعل. يرجى تسجيل الدخول.');
      }
      if (insertError.message?.includes('foreign key') || insertError.message?.includes('fkey')) {
        throw new Error('يرجى تحديث بنية قاعدة البيانات في Supabase لإزالة قيد المفتاح الخارجي auth.users');
      }
      throw new Error(insertError.message || 'تعذر إنشاء الحساب، يرجى المحاولة مرة أخرى.');
    }

    const savedProfile = newProfile || insertPayload;

    return {
      id: savedProfile.id,
      phone: savedProfile.phone,
      fullName: savedProfile.full_name,
      governorate: savedProfile.governorate || undefined,
      address: savedProfile.address || undefined,
    };
  },

  async login(payload: UserLoginPayload): Promise<UserProfile> {
    const phone = normalizePhone(payload.phone);
    const password = payload.password.trim();

    if (!phone) {
      throw new Error('يرجى إدخال رقم الهاتف');
    }
    if (!password) {
      throw new Error('يرجى إدخال كلمة المرور');
    }

    // 1. Fetch user by phone directly from profiles table
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, phone, password, full_name, governorate, address')
      .eq('phone', phone)
      .maybeSingle();

    if (error) {
      console.error('Supabase profile login lookup error:', error);
      throw new Error('حدث خطأ أثناء الاتصال بالخادم، يرجى المحاولة لاحقاً.');
    }

    if (!profile) {
      throw new Error('لا يوجد حساب مسجل بهذا الرقم. يرجى إنشاء حساب جديد أولاً.');
    }

    // 2. Verify password (matches hashed or plain for fallback)
    const hashedInput = await hashPassword(password);
    const isValid = profile.password === hashedInput || profile.password === password;

    if (!isValid) {
      throw new Error('كلمة المرور غير صحيحة، يرجى التأكد والمحاولة مرة أخرى.');
    }

    return {
      id: profile.id,
      phone: profile.phone,
      fullName: profile.full_name,
      governorate: profile.governorate || undefined,
      address: profile.address || undefined,
    };
  },

  async updateProfile(userId: string, payload: UserUpdateProfilePayload): Promise<UserProfile> {
    if (!userId) {
      throw new Error('معرف المستخدم غير متوفر');
    }

    // If changing password, verify old password first
    if (payload.newPassword) {
      if (!payload.currentPassword) {
        throw new Error('يرجى إدخال كلمة المرور الحالية لتغيير كلمة المرور');
      }
      if (payload.newPassword.length < 6) {
        throw new Error('كلمة المرور الجديدة يجب ألا تقل عن 6 أحرف أو أرقام');
      }

      const { data: currentProfile, error: fetchErr } = await supabase
        .from('profiles')
        .select('password')
        .eq('id', userId)
        .single();

      if (fetchErr || !currentProfile) {
        throw new Error('تعذر التحقق من كلمة المرور الحالية');
      }

      const hashedCurrent = await hashPassword(payload.currentPassword.trim());
      if (currentProfile.password !== hashedCurrent && currentProfile.password !== payload.currentPassword.trim()) {
        throw new Error('كلمة المرور الحالية غير صحيحة');
      }
    }

    const updates: Record<string, any> = {};

    if (payload.fullName !== undefined) updates.full_name = payload.fullName.trim();
    if (payload.governorate !== undefined) updates.governorate = payload.governorate.trim();
    if (payload.address !== undefined) updates.address = payload.address.trim();
    if (payload.newPassword) updates.password = await hashPassword(payload.newPassword.trim());

    const { data: updatedProfile, error: updateErr } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select('id, phone, full_name, governorate, address')
      .single();

    if (updateErr || !updatedProfile) {
      console.error('Update profile error:', updateErr);
      throw new Error(updateErr?.message || 'تعذر تحديث الملف الشخصي');
    }

    return {
      id: updatedProfile.id,
      phone: updatedProfile.phone,
      fullName: updatedProfile.full_name,
      governorate: updatedProfile.governorate || undefined,
      address: updatedProfile.address || undefined,
    };
  },

  async getProfileById(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, phone, full_name, governorate, address')
        .eq('id', userId)
        .maybeSingle();

      if (error || !data) return null;

      return {
        id: data.id,
        phone: data.phone,
        fullName: data.full_name,
        governorate: data.governorate || undefined,
        address: data.address || undefined,
      };
    } catch {
      return null;
    }
  },
};
