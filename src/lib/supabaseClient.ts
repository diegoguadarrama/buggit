import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cmhlsazxczewkcdjsony.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtaGxzYXp4Y3pld2tjZGpzb255Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDY4OTQxNzAsImV4cCI6MjAyMjQ3MDE3MH0.Gu_sD4KZOB_0RzGw2aCGNm_s4kz_ZeN2xYl3lUynvdE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);