import {
  creatorInstagramProfile,
  creatorYoutubeProfile,
  creatorYoutubeVideos,
  socialPlatforms,
} from '@/data/socialData';
import { supabase } from '@/lib/customSupabaseClient';

const SOCIAL_STATS_FUNCTION_NAME = import.meta.env.VITE_SOCIAL_STATS_FUNCTION_NAME || 'social-stats';
const SOCIAL_STATS_ENABLED = import.meta.env.VITE_ENABLE_SOCIAL_STATS === 'true';

const compactNumberFormatter = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

const toNumber = (value) => {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
};

export const formatCompactCount = (value) => {
  if (!Number.isFinite(value)) {
    return null;
  }

  return compactNumberFormatter.format(value);
};

const buildMetricValue = (platform, stats) => {
  const count = platform.id === 'youtube'
    ? stats?.subscriberCount
    : stats?.followersCount;

  return formatCompactCount(count) || platform.fallbackMetric;
};

const buildDetailValue = (platform, stats) => {
  if (platform.id === 'instagram') {
    return formatCompactCount(stats?.mediaCount)
      ? `${formatCompactCount(stats.mediaCount)} posts`
      : platform.fallbackDetail;
  }

  if (platform.id === 'facebook') {
    return formatCompactCount(stats?.fanCount)
      ? `${formatCompactCount(stats.fanCount)} likes`
      : platform.fallbackDetail;
  }

  return formatCompactCount(stats?.videoCount)
    ? `${formatCompactCount(stats.videoCount)} videos`
    : platform.fallbackDetail;
};

const buildSocialCardsFromSources = ({
  platformStats = {},
  youtubeProfile,
  youtubeVideos = [],
  instagramProfile,
  instagramVideos = [],
}) =>
  socialPlatforms.map((platform) => {
    const stats = platformStats[platform.id] || {};

    if (platform.id === 'instagram') {
      const followersCount = toNumber(stats?.followersCount) ?? toNumber(instagramProfile?.followers);
      const mediaCount = toNumber(stats?.mediaCount) ?? toNumber(instagramProfile?.posts);
      const hasLiveInstagram =
        Number.isFinite(followersCount) ||
        Number.isFinite(mediaCount) ||
        instagramProfile?.source === 'live' ||
        instagramVideos.some((video) => video?.source === 'live');

      return {
        ...platform,
        url: instagramProfile?.profileUrl || platform.url,
        handle: instagramProfile?.handle || platform.handle,
        metricValue: formatCompactCount(followersCount) || platform.fallbackMetric,
        detailValue: formatCompactCount(mediaCount)
          ? `${formatCompactCount(mediaCount)} posts`
          : instagramVideos.some((video) => video?.source === 'live')
            ? `${instagramVideos.length} recent videos`
            : platform.fallbackDetail,
        isLive: hasLiveInstagram,
        error: null,
      };
    }

    if (platform.id === 'youtube') {
      const subscriberCount = toNumber(stats?.subscriberCount) ?? toNumber(youtubeProfile?.subscriberCount);
      const videoCount = toNumber(stats?.videoCount) ?? toNumber(youtubeProfile?.videoCount);
      const hasLiveYoutube =
        Number.isFinite(subscriberCount) ||
        Number.isFinite(videoCount) ||
        youtubeProfile?.source === 'live' ||
        youtubeVideos.some((video) => video?.source === 'live');

      return {
        ...platform,
        url: youtubeProfile?.channelUrl || platform.url,
        handle: youtubeProfile?.channelHandle || platform.handle,
        metricValue: formatCompactCount(subscriberCount) || platform.fallbackMetric,
        detailValue: formatCompactCount(videoCount)
          ? `${formatCompactCount(videoCount)} videos`
          : youtubeVideos.some((video) => video?.source === 'live')
            ? `${youtubeVideos.length} recent uploads`
            : platform.fallbackDetail,
        isLive: hasLiveYoutube,
        error: null,
      };
    }

    return {
      ...platform,
      metricValue: buildMetricValue(platform, stats),
      detailValue: buildDetailValue(platform, stats),
      isLive: Boolean(
        Number.isFinite(toNumber(stats?.followersCount)) ||
        Number.isFinite(toNumber(stats?.fanCount)),
      ),
      error: null,
    };
  });

export const buildFallbackSocialCards = () =>
  socialPlatforms.map((platform) => ({
    ...platform,
    metricValue: platform.fallbackMetric,
    detailValue: platform.fallbackDetail,
    isLive: false,
    error: null,
  }));

export const hydrateSocialCards = (cards = []) =>
  socialPlatforms.map((platform) => {
    const cachedCard = cards.find((card) => card?.id === platform.id);

    return {
      ...platform,
      metricValue: cachedCard?.metricValue || platform.fallbackMetric,
      detailValue: cachedCard?.detailValue || platform.fallbackDetail,
      isLive: Boolean(cachedCard?.isLive),
      error: cachedCard?.error || null,
    };
  });

export const buildFallbackYoutubeProfile = () => ({
  ...creatorYoutubeProfile,
  subscriberCount: null,
  videoCount: creatorYoutubeVideos.length,
  source: 'fallback',
});

export const buildFallbackYoutubeVideos = () =>
  creatorYoutubeVideos.map((video) => ({
    ...video,
    source: 'fallback',
  }));

export const buildFallbackInstagramProfile = () => ({
  ...creatorInstagramProfile,
  source: 'fallback',
});

const buildFallbackInstagramVideos = (profile) => [
  {
    id: 'instagram-reels',
    title: 'Open Instagram Reels',
    description: 'Jump straight into the creator reel feed.',
    thumbnailUrl: profile.profileImageUrl || '',
    permalink: profile.reelsUrl,
    publishedAt: null,
    source: 'fallback',
  },
  {
    id: 'instagram-profile',
    title: `Visit ${profile.handle}`,
    description: 'Open the full Instagram profile and follow from there.',
    thumbnailUrl: profile.profileImageUrl || '',
    permalink: profile.profileUrl,
    publishedAt: null,
    source: 'fallback',
  },
];

const normalizeYoutubeProfile = (profile) => ({
  ...buildFallbackYoutubeProfile(),
  ...profile,
  channelName: profile?.channelName || profile?.title || creatorYoutubeProfile.channelName,
  channelHandle: profile?.channelHandle || profile?.handle || creatorYoutubeProfile.channelHandle,
  channelUrl: profile?.channelUrl || creatorYoutubeProfile.channelUrl,
  description: profile?.description || creatorYoutubeProfile.description,
  channelId: profile?.channelId || creatorYoutubeProfile.channelId,
});

const normalizeYoutubeVideos = (videos) => {
  if (!Array.isArray(videos) || videos.length === 0) {
    return buildFallbackYoutubeVideos();
  }

  return videos
    .filter((video) => video?.id && video?.videoUrl)
    .slice(0, 5)
    .map((video) => ({
      id: video.id,
      title: video.title || 'Latest upload',
      publishedAt: video.publishedAt || null,
      views: Number.isFinite(video.views) ? video.views : null,
      thumbnailUrl: video.thumbnailUrl || '',
      videoUrl: video.videoUrl,
      source: video.source || 'live',
    }));
};

const normalizeInstagramProfile = (profile) => ({
  ...buildFallbackInstagramProfile(),
  ...profile,
  handle: profile?.handle || creatorInstagramProfile.handle,
  name: profile?.name || creatorInstagramProfile.name,
  profileUrl: profile?.profileUrl || creatorInstagramProfile.profileUrl,
  reelsUrl: profile?.reelsUrl || creatorInstagramProfile.reelsUrl,
  courseUrl: profile?.courseUrl || creatorInstagramProfile.courseUrl,
  contactEmail: profile?.contactEmail || creatorInstagramProfile.contactEmail,
  bio: profile?.bio || creatorInstagramProfile.bio,
  followers: formatCompactCount(toNumber(profile?.followers)) || profile?.followers || creatorInstagramProfile.followers,
  following: formatCompactCount(toNumber(profile?.following)) || profile?.following || creatorInstagramProfile.following,
  posts: formatCompactCount(toNumber(profile?.posts)) || profile?.posts || creatorInstagramProfile.posts,
  profileImageUrl: profile?.profileImageUrl || creatorInstagramProfile.profileImageUrl || '',
  statsCapturedOn: profile?.statsCapturedOn || creatorInstagramProfile.statsCapturedOn,
});

const normalizeInstagramVideos = (videos, profile) => {
  if (!Array.isArray(videos) || videos.length === 0) {
    return buildFallbackInstagramVideos(profile);
  }

  return videos
    .filter((video) => video?.id && video?.permalink)
    .slice(0, 6)
    .map((video) => ({
      id: video.id,
      title: video.title || video.caption || 'Instagram video',
      description: video.description || video.caption || '',
      thumbnailUrl: video.thumbnailUrl || profile.profileImageUrl || '',
      permalink: video.permalink,
      publishedAt: video.publishedAt || null,
      source: video.source || 'live',
    }));
};

export const formatSocialUpdatedAt = (value) => {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

export const getSocialStats = async () => {
  const fallbackInstagramProfile = buildFallbackInstagramProfile();

  if (!SOCIAL_STATS_ENABLED) {
    return {
      cards: buildFallbackSocialCards(),
      hasLiveStats: false,
      lastUpdated: null,
      errors: {},
      youtubeProfile: buildFallbackYoutubeProfile(),
      youtubeVideos: buildFallbackYoutubeVideos(),
      instagramProfile: fallbackInstagramProfile,
      instagramVideos: buildFallbackInstagramVideos(fallbackInstagramProfile),
    };
  }

  try {
    const { data, error } = await supabase.functions.invoke(SOCIAL_STATS_FUNCTION_NAME, {
      body: {},
    });

    if (error) {
      throw error;
    }

    const platformStats = data?.platforms || {};
    const youtubeProfile = normalizeYoutubeProfile(data?.youtubeProfile || {});
    const youtubeVideos = normalizeYoutubeVideos(data?.youtubeVideos);
    const instagramProfile = normalizeInstagramProfile(data?.instagramProfile || fallbackInstagramProfile);
    const instagramVideos = normalizeInstagramVideos(data?.instagramVideos, instagramProfile);
    const cards = buildSocialCardsFromSources({
      platformStats,
      youtubeProfile,
      youtubeVideos,
      instagramProfile,
      instagramVideos,
    }).map((card) => ({
      ...card,
      error: data?.errors?.[card.id] || null,
    }));

    return {
      cards: hydrateSocialCards(cards),
      hasLiveStats: cards.some((card) => card.isLive),
      lastUpdated: data?.fetchedAt || null,
      errors: data?.errors || {},
      youtubeProfile,
      youtubeVideos,
      instagramProfile,
      instagramVideos,
    };
  } catch (error) {
    const instagramProfile = buildFallbackInstagramProfile();

    return {
      cards: buildFallbackSocialCards(),
      hasLiveStats: false,
      lastUpdated: null,
      errors: {
        general: error.message || 'Live social stats are unavailable right now.',
      },
      youtubeProfile: buildFallbackYoutubeProfile(),
      youtubeVideos: buildFallbackYoutubeVideos(),
      instagramProfile,
      instagramVideos: buildFallbackInstagramVideos(instagramProfile),
    };
  }
};
