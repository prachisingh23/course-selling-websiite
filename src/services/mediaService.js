import { getSupabase } from '@/lib/loadSupabaseClient';
import {
  MEDIA_CATEGORIES,
  RESOLUTION_OPTIONS,
  SORT_OPTIONS,
  TRENDING_TAGS,
} from '@/constants/mediaCatalog';
import { attachProfileNames } from '@/utils/profileLookup';
import { getCloudinaryVideoPosterFromUrl } from '@/utils/cloudinary';
import {
  buildHashtagSearch,
  coerceHashtagArray,
  extractHashtagsFromText,
  formatHashtagLabel,
  splitHashtagMetadata,
  uniqueHashtags,
} from '@/utils/hashtags';
export {
  MEDIA_CATEGORIES,
  RESOLUTION_OPTIONS,
  SORT_OPTIONS,
  TRENDING_TAGS,
};
const MEDIA_CATALOG_CACHE_KEY = 'lifelapss_media_catalog_cache_v1';
const MEDIA_CATALOG_TTL_MS = 1000 * 60 * 2;

const IMAGE_SELECT_FIELDS = 'id, title, description, image_url, watermarked_image_url, is_free, price, created_at, user_id, tags';
const IMAGE_SELECT_FIELDS_FALLBACK = 'id, title, description, image_url, watermarked_image_url, is_free, price, created_at, user_id';

const DEFAULT_VIDEO_THUMBNAIL = 'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 1280 720%22%3E%3Crect width=%221280%22 height=%22720%22 fill=%22%2308151f%22/%3E%3Ccircle cx=%22640%22 cy=%22360%22 r=%2290%22 fill=%22rgba(255,255,255,0.10)%22/%3E%3Cpolygon points=%22605,308 605,412 700,360%22 fill=%22%23e6fbff%22/%3E%3Ctext x=%22640%22 y=%22580%22 fill=%22%23d3e7ef%22 font-size=%2244%22 text-anchor=%22middle%22 font-family=%22Arial, sans-serif%22%3EVideo Preview%3C/text%3E%3C/svg%3E';

const inferCategory = (text = '', type = 'photo') => {
  const normalized = text.toLowerCase();

  if (normalized.includes('drone')) return 'Drone Footage';
  if (
    normalized.includes('lifestyle') ||
    normalized.includes('people') ||
    normalized.includes('person') ||
    normalized.includes('fashion') ||
    normalized.includes('workspace') ||
    normalized.includes('editorial')
  ) {
    return 'Lifestyle';
  }
  if (normalized.includes('portrait') || normalized.includes('face')) return 'Portraits';
  if (normalized.includes('nature') || normalized.includes('forest') || normalized.includes('mountain') || normalized.includes('landscape')) return 'Nature Shots';
  if (normalized.includes('building') || normalized.includes('architecture') || normalized.includes('interior')) return 'Architecture';
  if (normalized.includes('city') || normalized.includes('night') || normalized.includes('urban')) return 'City Lights';
  if (normalized.includes('ocean') || normalized.includes('sea') || normalized.includes('wave') || normalized.includes('beach')) return 'Ocean Waves';
  if (normalized.includes('texture') || normalized.includes('abstract')) return 'Textures';
  if (normalized.includes('minimal')) return 'Minimalism';

  return type === 'video' ? 'Videos' : 'Photos';
};

const inferResolution = (item, type) => {
  const text = `${item.title || ''} ${item.description || ''} ${item.category || ''}`.toLowerCase();

  if (text.includes('4k') || text.includes('ultra')) return '4K';
  if (type === 'video') return item.price > 0 ? '4K' : 'HD';
  return item.price > 0 ? '4K' : 'HD';
};

export const getYouTubeId = (url = '') => {
  if (!url) return null;

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, '');

    if (host === 'youtu.be') {
      const id = parsed.pathname.split('/').filter(Boolean)[0];
      return id?.length === 11 ? id : null;
    }

    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com') {
      if (parsed.pathname === '/watch') {
        const id = parsed.searchParams.get('v');
        return id?.length === 11 ? id : null;
      }

      const pathParts = parsed.pathname.split('/').filter(Boolean);
      const candidate = pathParts[1];

      if (['embed', 'shorts', 'live', 'v'].includes(pathParts[0]) && candidate?.length === 11) {
        return candidate;
      }
    }
  } catch {
    // Fall back to a looser match for partially malformed URLs.
  }

  const regExp = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/|v\/))([^#&?]{11})/;
  const match = url.match(regExp);
  return match?.[1] || null;
};

const isImageTagsColumnMissing = (error) => {
  const message = error?.message?.toLowerCase() || '';
  return message.includes('images.tags')
    || message.includes("column 'tags'")
    || message.includes('column images.tags')
    || message.includes('column "tags" does not exist');
};

const selectImagesForMedia = async ({ id = null } = {}) => {
  const supabase = await getSupabase();

  const runQuery = (selectFields) => {
    let query = supabase
      .from('images')
      .select(selectFields)
      .eq('status', 'approved');

    if (id !== null) {
      query = query.eq('id', id).single();
    }

    return query;
  };

  let result = await runQuery(IMAGE_SELECT_FIELDS);

  if (result.error && isImageTagsColumnMissing(result.error)) {
    result = await runQuery(IMAGE_SELECT_FIELDS_FALLBACK);
  }

  return result;
};

export const normalizeImage = (image) => {
  const { text: cleanDescription, tags: metadataTags } = splitHashtagMetadata(image.description || '');
  const category = inferCategory(`${image.title} ${cleanDescription}`, 'photo');
  const resolution = inferResolution(image, 'photo');
  const tags = uniqueHashtags([
    ...coerceHashtagArray(image.tags || []),
    ...metadataTags,
    ...extractHashtagsFromText(`${image.title || ''} ${cleanDescription}`),
  ]);
  const hashtagLabels = tags.map(formatHashtagLabel).filter(Boolean);

  return {
    id: String(image.id),
    type: 'photo',
    title: image.title || 'Untitled Photo',
    description: cleanDescription || 'Royalty-free photo asset.',
    category,
    resolution,
    isFree: image.is_free,
    price: Number(image.price || 0),
    createdAt: image.created_at,
    creatorId: image.user_id,
    creatorName: image.creator_name || 'Community Creator',
    thumbnailUrl: image.watermarked_image_url || image.image_url,
    previewUrl: image.watermarked_image_url || image.image_url,
    downloadUrl: image.image_url,
    downloadableUrl: image.image_url,
    originalUrl: image.image_url,
    tags,
    searchTags: tags,
    searchableText: `${image.title || ''} ${cleanDescription} ${category} ${tags.join(' ')} ${hashtagLabels.join(' ')}`.toLowerCase(),
    sortScore: Number(image.price || 0) + (image.is_free ? 5 : 20),
  };
};

export const normalizeVideo = (video) => {
  const youtubeId = getYouTubeId(video.video_url);
  const { text: cleanDescription, tags: metadataTags } = splitHashtagMetadata(video.description || '');
  const category = video.category || inferCategory(`${video.title} ${cleanDescription}`, 'video');
  const resolution = inferResolution(video, 'video');
  const posterUrl = video.thumbnail_url || getCloudinaryVideoPosterFromUrl(video.video_url) || (youtubeId ? `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg` : DEFAULT_VIDEO_THUMBNAIL);
  const tags = uniqueHashtags([
    ...metadataTags,
    ...extractHashtagsFromText(`${video.title || ''} ${cleanDescription} ${category}`),
  ]);
  const hashtagLabels = tags.map(formatHashtagLabel).filter(Boolean);

  return {
    id: String(video.id),
    type: 'video',
    title: video.title || 'Untitled Video',
    description: cleanDescription || 'Royalty-free video asset.',
    category,
    resolution,
    isFree: video.is_free,
    price: Number(video.price || 0),
    createdAt: video.created_at,
    creatorId: video.user_id,
    creatorName: video.creator_name || 'Community Creator',
    thumbnailUrl: posterUrl,
    previewUrl: posterUrl,
    downloadUrl: video.video_url,
    downloadableUrl: video.video_url,
    originalUrl: video.video_url,
    youtubeId,
    tags,
    searchTags: tags,
    searchableText: `${video.title || ''} ${cleanDescription} ${category} ${tags.join(' ')} ${hashtagLabels.join(' ')}`.toLowerCase(),
    sortScore: Number(video.price || 0) + (video.is_free ? 8 : 24),
  };
};

const filterAndSortItems = (items, options = {}) => {
  const {
    search = '',
    category = 'All',
    resolution = 'All',
    sort = 'Trending',
  } = options;

  const { plainText, hashtagTerms } = buildHashtagSearch(search);

  const filtered = items.filter((item) => {
    const matchesSearch =
      !plainText || item.searchableText.includes(plainText);
    const matchesHashtags =
      hashtagTerms.length === 0 || hashtagTerms.every((tag) => item.searchTags?.includes(tag));
    const matchesCategory =
      category === 'All' ||
      item.category === category ||
      (category === 'Photos' && item.type === 'photo') ||
      (category === 'Videos' && item.type === 'video');
    const matchesResolution = resolution === 'All' || item.resolution === resolution;

    return matchesSearch && matchesHashtags && matchesCategory && matchesResolution;
  });

  return filtered.sort((left, right) => {
    if (sort === 'Newest') {
      return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
    }

    if (sort === 'Popular') {
      return right.sortScore - left.sortScore;
    }

    return (right.sortScore + new Date(right.createdAt).getTime() / 100000000) -
      (left.sortScore + new Date(left.createdAt).getTime() / 100000000);
  });
};

let mediaCatalogCache = null;
let mediaCatalogCacheExpiresAt = 0;
let mediaCatalogPromise = null;

const getCachedMediaCatalog = () => {
  if (mediaCatalogCache && mediaCatalogCacheExpiresAt > Date.now()) {
    return mediaCatalogCache;
  }

  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const storedValue = window.sessionStorage.getItem(MEDIA_CATALOG_CACHE_KEY);

    if (!storedValue) {
      return null;
    }

    const parsed = JSON.parse(storedValue);
    const expiresAt = Number(parsed?.expiresAt || 0);
    const items = Array.isArray(parsed?.items) ? parsed.items : null;

    if (!items || expiresAt <= Date.now()) {
      window.sessionStorage.removeItem(MEDIA_CATALOG_CACHE_KEY);
      return null;
    }

    mediaCatalogCache = items;
    mediaCatalogCacheExpiresAt = expiresAt;
    return items;
  } catch (error) {
    console.warn('Unable to read cached media catalog:', error);
    return null;
  }
};

const storeMediaCatalog = (items) => {
  mediaCatalogCache = items;
  mediaCatalogCacheExpiresAt = Date.now() + MEDIA_CATALOG_TTL_MS;

  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.sessionStorage.setItem(
      MEDIA_CATALOG_CACHE_KEY,
      JSON.stringify({
        expiresAt: mediaCatalogCacheExpiresAt,
        items,
      })
    );
  } catch (error) {
    console.warn('Unable to store cached media catalog:', error);
  }
};

export const clearMediaCatalogCache = () => {
  mediaCatalogCache = null;
  mediaCatalogCacheExpiresAt = 0;
  mediaCatalogPromise = null;

  if (typeof window !== 'undefined') {
    window.sessionStorage.removeItem(MEDIA_CATALOG_CACHE_KEY);
  }
};

const fetchMediaCatalog = async ({ forceFresh = false } = {}) => {
  if (!forceFresh) {
    const cachedCatalog = getCachedMediaCatalog();

    if (cachedCatalog) {
      return cachedCatalog;
    }

    if (mediaCatalogPromise) {
      return mediaCatalogPromise;
    }
  }

  mediaCatalogPromise = (async () => {
    const supabase = await getSupabase();
    const [imagesResult, videosResult] = await Promise.all([
      selectImagesForMedia(),
      supabase
        .from('videos')
        .select('id, title, description, category, video_url, thumbnail_url, is_free, price, created_at, user_id')
        .eq('status', 'approved'),
    ]);

    if (imagesResult.error) throw imagesResult.error;
    if (videosResult.error) throw videosResult.error;

    const [enrichedImages, enrichedVideos] = await Promise.all([
      attachProfileNames(imagesResult.data || [], { fallback: 'Community Creator' }),
      attachProfileNames(videosResult.data || [], { fallback: 'Community Creator' }),
    ]);

    const normalizedCatalog = [
      ...enrichedImages.map(normalizeImage),
      ...enrichedVideos.map(normalizeVideo),
    ];

    storeMediaCatalog(normalizedCatalog);
    return normalizedCatalog;
  })();

  try {
    return await mediaCatalogPromise;
  } finally {
    mediaCatalogPromise = null;
  }
};

export const fetchMediaItems = async (options = {}) => {
  const { type = 'all', forceFresh = false } = options;
  const catalog = await fetchMediaCatalog({ forceFresh });

  const scopedCatalog = catalog.filter((item) => {
    if (type === 'photos') {
      return item.type === 'photo';
    }

    if (type === 'videos') {
      return item.type === 'video';
    }

    return true;
  });

  return filterAndSortItems(scopedCatalog, options);
};

export const fetchMediaItemById = async (type, id) => {
  const catalog = await fetchMediaCatalog();
  const cachedItem = catalog.find((item) => item.type === type && String(item.id) === String(id));

  if (cachedItem) {
    return cachedItem;
  }

  if (type === 'photo') {
    const { data, error } = await selectImagesForMedia({ id });

    if (error) throw error;
    const [enrichedImage] = await attachProfileNames([data], { fallback: 'Community Creator' });
    return normalizeImage(enrichedImage);
  }

  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from('videos')
    .select('id, title, description, category, video_url, thumbnail_url, is_free, price, created_at, user_id')
    .eq('status', 'approved')
    .eq('id', id)
    .single();

  if (error) throw error;
  const [enrichedVideo] = await attachProfileNames([data], { fallback: 'Community Creator' });
  return normalizeVideo(enrichedVideo);
};

export const fetchRelatedMedia = async (item) => {
  const related = await fetchMediaItems({
    type: item.type === 'photo' ? 'photos' : 'videos',
    category: item.category,
    sort: 'Popular',
  });

  return related.filter((candidate) => candidate.id !== item.id).slice(0, 4);
};
