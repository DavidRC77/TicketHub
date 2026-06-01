import { createClient as createServerClient } from '@/utils/supabase/server';
import { createClient as createBrowserClient } from '@/utils/supabase/client';

export { createServerClient as createClient };

export const getSupabaseClient = createBrowserClient;