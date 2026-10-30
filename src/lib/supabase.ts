import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

/**
 * Standard browser/client Supabase instance.
 * Used for calling PostgREST RPC endpoints, subscriptions, and edge functions.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

