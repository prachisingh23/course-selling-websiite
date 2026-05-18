import { resilientImport } from '@/lib/resilientImport';

let supabasePromise = null;

export const getSupabase = async () => {
  if (!supabasePromise) {
    supabasePromise = resilientImport(
      () => import('@/lib/customSupabaseClient'),
      'custom-supabase-client',
    ).then((module) => module.supabase);
  }

  return supabasePromise;
};
