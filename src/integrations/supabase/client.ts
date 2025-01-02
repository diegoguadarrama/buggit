import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://cmhlsazxczewkcdjsony.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtaGxzYXp4Y3pld2tjZGpzb255Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5Njg4MTksImV4cCI6MjA1MDU0NDgxOX0.ZuyO1-OoX1E90iCh4MdZdTXdLxozj1wDQkFTeRm8Y4o";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});
