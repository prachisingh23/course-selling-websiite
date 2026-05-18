import { getSupabase } from '@/lib/loadSupabaseClient';

export const fetchProfileNameMap = async (userIds = []) => {
  const uniqueIds = [...new Set(userIds.filter(Boolean))];

  if (!uniqueIds.length) {
    return new Map();
  }

  const supabase = await getSupabase();

  let data = null;
  let error = null;

  const rpcResult = await supabase.rpc('get_profile_names', { user_ids: uniqueIds });
  data = rpcResult.data;
  error = rpcResult.error;

  if (error) {
    const fallbackResult = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', uniqueIds);

    data = fallbackResult.data;
    error = fallbackResult.error;
  }

  if (error) {
    throw error;
  }

  return new Map((data || []).map((profile) => [profile.id, profile.full_name]));
};

export const attachProfileNames = async (
  items = [],
  {
    userIdKey = 'user_id',
    nameKey = 'creator_name',
    fallback = 'N/A',
  } = {}
) => {
  try {
    const profileMap = await fetchProfileNameMap(items.map((item) => item[userIdKey]));

    return items.map((item) => ({
      ...item,
      [nameKey]: profileMap.get(item[userIdKey]) || fallback,
    }));
  } catch (error) {
    console.error('Failed to attach profile names:', error);

    return items.map((item) => ({
      ...item,
      [nameKey]: fallback,
    }));
  }
};
