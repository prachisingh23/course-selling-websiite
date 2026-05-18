import { supabase } from '@/lib/customSupabaseClient';

const PREFERRED_BUCKETS = ['media_library', 'media-library', 'uploads'];
const DEFAULT_BUCKET = 'media_library';
const KNOWN_BUCKET_CANDIDATES = [...new Set([DEFAULT_BUCKET, ...PREFERRED_BUCKETS].filter(Boolean))];

let cachedBucketName;
let resolvedOnce = false;

const isBucketMissingMessage = (message = '') => {
  const normalizedMessage = String(message).toLowerCase();

  return normalizedMessage.includes('bucket not found')
    || normalizedMessage.includes('the resource was not found')
    || normalizedMessage.includes('not found')
    || normalizedMessage.includes('does not exist');
};

export const formatStorageErrorMessage = (error) => {
  const message = error?.message || 'Storage request failed.';

  if (isBucketMissingMessage(message)) {
    return 'No storage bucket is configured in Supabase. Create a public bucket such as media_library, or use a direct URL instead of uploading a file.';
  }

  return message;
};

const probeBucketAccess = async (bucketName) => {
  try {
    const { error } = await supabase.storage.from(bucketName).list('', {
      limit: 1,
      offset: 0,
      sortBy: { column: 'name', order: 'asc' },
    });

    if (!error) {
      return true;
    }

    if (isBucketMissingMessage(error.message)) {
      return false;
    }

    console.warn(`Unable to verify storage bucket "${bucketName}" via list():`, error);
    return true;
  } catch (error) {
    if (isBucketMissingMessage(error?.message)) {
      return false;
    }

    console.warn(`Unexpected error while probing storage bucket "${bucketName}":`, error);
    return true;
  }
};

export const resolveMediaBucketName = async () => {
  if (resolvedOnce) {
    return cachedBucketName;
  }

  resolvedOnce = true;

  try {
    const { data, error } = await supabase.storage.listBuckets();

    if (error) {
      console.error('Failed to list storage buckets:', error);
    } else if (data?.length) {
      const preferredBucket = PREFERRED_BUCKETS.find((name) => data.some((bucket) => bucket.name === name));
      cachedBucketName = preferredBucket || data[0].name;
      return cachedBucketName;
    }
  } catch (error) {
    console.error('Unexpected error while resolving storage bucket:', error);
  }

  for (const bucketName of KNOWN_BUCKET_CANDIDATES) {
    if (await probeBucketAccess(bucketName)) {
      cachedBucketName = bucketName;
      return cachedBucketName;
    }
  }

  cachedBucketName = null;
  return cachedBucketName;
};

export const uploadMediaFile = async (file, { prefix = '' } = {}) => {
  const bucketName = await resolveMediaBucketName();

  if (!bucketName) {
    return {
      data: null,
      error: { message: 'No storage bucket is configured in Supabase. Create one before uploading files.' },
    };
  }

  const fileName = `${prefix ? `${prefix}_` : ''}${Date.now()}_${file.name}`;
  const { error } = await supabase.storage.from(bucketName).upload(fileName, file);

  if (error) {
    return {
      data: null,
      error: { ...error, message: formatStorageErrorMessage(error) },
    };
  }

  const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(fileName);

  return {
    data: {
      bucketName,
      fileName,
      publicUrl: publicUrlData.publicUrl,
    },
    error: null,
  };
};

export const listMediaFiles = async () => {
  const bucketName = await resolveMediaBucketName();

  if (!bucketName) {
    return {
      data: [],
      bucketName: null,
      error: { message: 'No storage bucket is configured in Supabase. Create one before using the media library.' },
    };
  }

  const { data, error } = await supabase.storage.from(bucketName).list('', {
    limit: 100,
    offset: 0,
    sortBy: { column: 'created_at', order: 'desc' },
  });

  if (error) {
    return {
      data: [],
      bucketName,
      error: { ...error, message: formatStorageErrorMessage(error) },
    };
  }

  return { data: data || [], bucketName, error: null };
};

export const removeMediaFile = async (fileName, bucketName) => {
  const resolvedBucket = bucketName || await resolveMediaBucketName();

  if (!resolvedBucket) {
    return {
      error: { message: 'No storage bucket is configured in Supabase. Nothing can be deleted yet.' },
    };
  }

  const { error } = await supabase.storage.from(resolvedBucket).remove([fileName]);

  if (error) {
    return {
      error: { ...error, message: formatStorageErrorMessage(error) },
    };
  }

  return { error: null };
};

export const getMediaPublicUrl = (fileName, bucketName = cachedBucketName || DEFAULT_BUCKET) => {
  if (!bucketName) return '';

  const { data } = supabase.storage.from(bucketName).getPublicUrl(fileName);
  return data.publicUrl;
};

export const isManagedMediaUrl = (url = '', bucketName = cachedBucketName || DEFAULT_BUCKET) => {
  if (!url || !bucketName) return false;

  return url.includes(`/storage/v1/object/public/${bucketName}/`) || url.includes(`/storage/v1/object/${bucketName}/`);
};
