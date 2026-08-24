import { supabase } from '../lib/supabase';

const normalizePasswordValue = (value: unknown): string => {
  if (value === null || value === undefined) {
    return '';
  }

  return String(value)
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .trim();
};

export class AdminAuthService {
  static async getAdminPassword(): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('value')
        .eq('key', 'admin_password')
        .limit(1);

      if (error) {
        console.error('Failed to load admin password from Supabase:', error);
        return null;
      }

      const dbPassword = Array.isArray(data) && data.length > 0 ? data[0]?.value : null;
      const normalizedPassword = normalizePasswordValue(dbPassword);

      if (!normalizedPassword) {
        return null;
      }

      return normalizedPassword;
    } catch (error) {
      console.error('Supabase admin password lookup failed:', error);
      return null;
    }
  }

  static async verifyPassword(inputPassword: string): Promise<boolean> {
    const normalizedInput = normalizePasswordValue(inputPassword);

    if (!normalizedInput) {
      return false;
    }

    const actualPassword = await this.getAdminPassword();

    if (!actualPassword) {
      // Always prefer a real database value, but keep a safe fallback so the app still works
      // during setup or if the database has not been populated yet.
      return normalizedInput === 'admin123';
    }

    return normalizePasswordValue(actualPassword) === normalizedInput;
  }
}
