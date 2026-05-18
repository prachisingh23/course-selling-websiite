import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tkvgrurwlgfutqmixzyx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrdmdydXJ3bGdmdXRxbWl4enl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3MTkxODUsImV4cCI6MjA3NjI5NTE4NX0.nV3EIMsdBw18MpYxpR3fsxo2T-y8VnGkLsvdxgcLsJU';

const customSupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export default customSupabaseClient;

export { 
    customSupabaseClient,
    customSupabaseClient as supabase,
};
