import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create client — will throw at runtime if credentials are missing/invalid,
// but won't crash during build when env vars may not be fully set.
let supabase;

try {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} catch {
  // During build, Supabase URL may be a placeholder. Create a dummy client
  // that will fail at runtime with a clear error message.
  console.warn(
    '⚠️  Supabase client não inicializado. Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY em .env.local'
  );
  supabase = createClient('https://placeholder.supabase.co', 'placeholder-key');
}

export { supabase };
