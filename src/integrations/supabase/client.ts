// This file configures the Supabase client with environment variables
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Use the actual Supabase project URL and anon key
const supabaseUrl = 'https://cmhlsazxczewkcdjsony.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtaGxzYXp4Y3pld2tjZGpzb255Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDY4OTQxNzAsImV4cCI6MjAyMjQ3MDE3MH0.Gu_sD4KZOB_0RzGw2aCGNm_s4kz_ZeN2xYl3lUynvdE';

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);