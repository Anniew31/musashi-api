import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const TABLES = {
  accounts: 'user_accounts',
  pluginUsage: 'plugin_usage_records',
  subscriptions: 'orders_subscriptions',
} as const;

export type AppDatabase = {
  public: {
    Tables: {
      user_accounts: {
        Row: {
          id: string;
          email: string;
          role: 'user' | 'admin';
          subscription_status: 'free' | 'trial' | 'active' | 'canceled' | 'expired';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          role?: 'user' | 'admin';
          subscription_status?: 'free' | 'trial' | 'active' | 'canceled' | 'expired';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: 'user' | 'admin';
          subscription_status?: 'free' | 'trial' | 'active' | 'canceled' | 'expired';
          created_at?: string;
          updated_at?: string;
        };
      };
      plugin_usage_records: {
        Row: {
          id: string;
          user_id: string;
          extension_version: string;
          device_id: string;
          event_type: 'install' | 'activate' | 'usage';
          is_active: boolean;
          activity_at: string;
          metadata: Record<string, unknown> | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          extension_version: string;
          device_id: string;
          event_type: 'install' | 'activate' | 'usage';
          is_active?: boolean;
          activity_at?: string;
          metadata?: Record<string, unknown> | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          extension_version?: string;
          device_id?: string;
          event_type?: 'install' | 'activate' | 'usage';
          is_active?: boolean;
          activity_at?: string;
          metadata?: Record<string, unknown> | null;
        };
      };
      orders_subscriptions: {
        Row: {
          id: string;
          user_id: string;
          amount_usd: number;
          payment_method: 'card' | 'paypal' | 'apple_pay' | 'google_pay' | 'crypto' | 'other';
          subscription_status: 'pending' | 'active' | 'canceled' | 'expired' | 'refunded';
          started_at: string;
          expires_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount_usd: number;
          payment_method: 'card' | 'paypal' | 'apple_pay' | 'google_pay' | 'crypto' | 'other';
          subscription_status?: 'pending' | 'active' | 'canceled' | 'expired' | 'refunded';
          started_at?: string;
          expires_at: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          amount_usd?: number;
          payment_method?: 'card' | 'paypal' | 'apple_pay' | 'google_pay' | 'crypto' | 'other';
          subscription_status?: 'pending' | 'active' | 'canceled' | 'expired' | 'refunded';
          started_at?: string;
          expires_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};

export function createSupabaseBrowserClient(
  supabaseUrl: string,
  supabaseAnonKey: string,
): SupabaseClient<AppDatabase> {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase URL or Anon Key.');
  }

  return createClient<AppDatabase>(supabaseUrl, supabaseAnonKey);
}

export async function testSupabaseConnection(client: SupabaseClient<AppDatabase>): Promise<void> {
  const [accountsResult, usageResult, subscriptionsResult] = await Promise.all([
    client.from(TABLES.accounts).select('id').limit(1),
    client.from(TABLES.pluginUsage).select('id').limit(1),
    client.from(TABLES.subscriptions).select('id').limit(1),
  ]);

  const errors = [accountsResult.error, usageResult.error, subscriptionsResult.error].filter(Boolean);

  if (errors.length > 0) {
    const details = errors.map((error) => error?.message ?? 'Unknown Supabase error').join(' | ');
    throw new Error(`Supabase connection failed: ${details}`);
  }
}
