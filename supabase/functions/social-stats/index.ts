const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json',
};

const GRAPH_API_VERSION = 'v25.0';
const DEFAULT_YOUTUBE_CHANNEL_ID = 'UC0lt6H3I4TdSdM3vvJd0Qng';
const DEFAULT_YOUTUBE_CHANNEL_HANDLE = '@life_lapsyt';
const DEFAULT_INSTAGRAM_USERNAME = 'life_knowledge0';
const DEFAULT_INSTAGRAM_PROFILE_URL = `https://www.instagram.com/${DEFAULT_INSTAGRAM_USERNAME}/`;
const DEFAULT_INSTAGRAM_REELS_URL = `https://www.instagram.com/${DEFAULT_INSTAGRAM_USERNAME}/reels/`;
const DEFAULT_INSTAGRAM_APP_ID = '936619743392459';

const createErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Unknown error';

const toNumber = (value: unknown) => {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
};

const decodeHtml = (value: string) =>
  value
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>');

const trimText = (value: string | null | undefined, length = 110) => {
  if (!value) {
    return '';
  }

  const cleaned = value.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= length) {
    return cleaned;
  }

  return `${cleaned.slice(0, Math.max(0, length - 1)).trim()}…`;
};

const getJson = async (url: string, init?: RequestInit) => {
  const response = await fetch(url, init);
  const data = await response.json();

  if (!response.ok || data?.error) {
    throw new Error(data?.error?.message || `Request failed with status ${response.status}`);
  }

  return data;
};

const getText = async (url: string, init?: RequestInit) => {
  const response = await fetch(url, init);
  const data = await response.text();

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return data;
};

const loadYoutubeChannel = async () => {
  const apiKey = Deno.env.get('YOUTUBE_API_KEY');
  const configuredChannelId = Deno.env.get('YOUTUBE_CHANNEL_ID') || DEFAULT_YOUTUBE_CHANNEL_ID;
  const channelHandle = Deno.env.get('YOUTUBE_CHANNEL_HANDLE') || DEFAULT_YOUTUBE_CHANNEL_HANDLE;

  if (!apiKey) {
    return {
      profile: {
        channelId: configuredChannelId,
        channelHandle,
        channelName: 'Life Laps',
        channelUrl: `https://www.youtube.com/${channelHandle}`,
        description: '',
        subscriberCount: null,
        viewCount: null,
        videoCount: null,
        uploadsPlaylistId: null,
        source: 'fallback',
      },
      apiKey: null,
    };
  }

  const params = new URLSearchParams({
    part: 'snippet,statistics,contentDetails',
    key: apiKey,
  });

  if (configuredChannelId) {
    params.set('id', configuredChannelId);
  } else {
    params.set('forHandle', channelHandle.replace(/^@/, ''));
  }

  const data = await getJson(`https://www.googleapis.com/youtube/v3/channels?${params.toString()}`);
  const channel = data?.items?.[0];

  if (!channel) {
    throw new Error('YouTube channel not found');
  }

  const channelId = channel.id || configuredChannelId;
  const handle = channelHandle || (channel.snippet?.customUrl ? `@${channel.snippet.customUrl.replace(/^@/, '')}` : DEFAULT_YOUTUBE_CHANNEL_HANDLE);

  return {
    apiKey,
    profile: {
      channelId,
      channelHandle: handle,
      channelName: channel.snippet?.title || 'Life Laps',
      channelUrl: `https://www.youtube.com/${handle}`,
      description: channel.snippet?.description || '',
      subscriberCount: toNumber(channel.statistics?.subscriberCount),
      viewCount: toNumber(channel.statistics?.viewCount),
      videoCount: toNumber(channel.statistics?.videoCount),
      uploadsPlaylistId: channel.contentDetails?.relatedPlaylists?.uploads || null,
      source: 'live',
    },
  };
};

const loadYoutubeVideoStats = async (apiKey: string, videoIds: string[]) => {
  if (!videoIds.length) {
    return {};
  }

  const params = new URLSearchParams({
    part: 'statistics',
    id: videoIds.join(','),
    key: apiKey,
  });

  const data = await getJson(`https://www.googleapis.com/youtube/v3/videos?${params.toString()}`);

  return (data?.items || []).reduce((accumulator: Record<string, { viewCount: number | null }>, item: Record<string, unknown>) => {
    const id = item.id as string | undefined;
    if (!id) {
      return accumulator;
    }

    accumulator[id] = {
      viewCount: toNumber((item.statistics as Record<string, unknown> | undefined)?.viewCount),
    };

    return accumulator;
  }, {});
};

const loadYoutubeVideosFromApi = async (apiKey: string, uploadsPlaylistId: string | null) => {
  if (!uploadsPlaylistId) {
    return [];
  }

  const params = new URLSearchParams({
    part: 'snippet,contentDetails',
    playlistId: uploadsPlaylistId,
    maxResults: '5',
    key: apiKey,
  });

  const data = await getJson(`https://www.googleapis.com/youtube/v3/playlistItems?${params.toString()}`);
  const items = data?.items || [];
  const videoIds = items
    .map((item: Record<string, unknown>) => (item.contentDetails as Record<string, unknown> | undefined)?.videoId)
    .filter((value: unknown): value is string => typeof value === 'string');
  const statsMap = await loadYoutubeVideoStats(apiKey, videoIds);

  return items
    .map((item: Record<string, unknown>) => {
      const snippet = (item.snippet as Record<string, unknown> | undefined) || {};
      const videoId = (item.contentDetails as Record<string, unknown> | undefined)?.videoId as string | undefined;
      const thumbnails = (snippet.thumbnails as Record<string, Record<string, string>> | undefined) || {};

      if (!videoId) {
        return null;
      }

      return {
        id: videoId,
        title: (snippet.title as string | undefined) || 'Latest upload',
        publishedAt: (snippet.publishedAt as string | undefined) || null,
        thumbnailUrl:
          thumbnails.maxres?.url ||
          thumbnails.standard?.url ||
          thumbnails.high?.url ||
          thumbnails.medium?.url ||
          thumbnails.default?.url ||
          '',
        videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
        views: statsMap[videoId]?.viewCount || null,
        source: 'live',
      };
    })
    .filter(Boolean);
};

const extractXmlValue = (entry: string, pattern: RegExp) => {
  const match = entry.match(pattern);
  return match ? decodeHtml(match[1].trim()) : '';
};

const loadYoutubeVideosFromFeed = async (channelId: string) => {
  const xml = await getText(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`);
  const entries = Array.from(xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)).slice(0, 5);

  return entries.map((entryMatch) => {
    const entry = entryMatch[1];
    const id = extractXmlValue(entry, /<yt:videoId>([^<]+)<\/yt:videoId>/);
    const title = extractXmlValue(entry, /<title>([\s\S]*?)<\/title>/);
    const publishedAt = extractXmlValue(entry, /<published>([^<]+)<\/published>/);
    const thumbnailUrl = extractXmlValue(entry, /<media:thumbnail url="([^"]+)"/);
    const link = extractXmlValue(entry, /<link rel="alternate" href="([^"]+)"/);
    const views = toNumber(extractXmlValue(entry, /<media:statistics views="([^"]+)"/));

    return {
      id,
      title: title || 'Latest upload',
      publishedAt: publishedAt || null,
      thumbnailUrl,
      videoUrl: link || `https://www.youtube.com/watch?v=${id}`,
      views,
      source: 'live',
    };
  }).filter((item) => item.id);
};

const loadFacebookPage = async (accessToken: string, pageId: string) => {
  const params = new URLSearchParams({
    fields: 'name,followers_count,fan_count,connected_instagram_account,instagram_business_account',
    access_token: accessToken,
  });

  return getJson(`https://graph.facebook.com/${GRAPH_API_VERSION}/${pageId}?${params.toString()}`);
};

const resolveInstagramUserId = (pageData: Record<string, unknown>) => {
  const configuredIgUserId = Deno.env.get('INSTAGRAM_USER_ID');
  const pageIgAccount =
    (pageData.instagram_business_account as { id?: string } | undefined)?.id ||
    (pageData.connected_instagram_account as { id?: string } | undefined)?.id ||
    null;

  return configuredIgUserId || pageIgAccount;
};

const loadInstagramStatsFromMeta = async (accessToken: string, igUserId: string) => {
  const params = new URLSearchParams({
    fields: 'username,followers_count,media_count,biography,website',
    access_token: accessToken,
  });

  return getJson(`https://graph.facebook.com/${GRAPH_API_VERSION}/${igUserId}?${params.toString()}`);
};

const loadInstagramMediaFromMeta = async (accessToken: string, igUserId: string, username: string) => {
  const params = new URLSearchParams({
    fields: 'id,caption,media_type,media_product_type,media_url,thumbnail_url,permalink,timestamp',
    access_token: accessToken,
    limit: '6',
  });

  const data = await getJson(`https://graph.facebook.com/${GRAPH_API_VERSION}/${igUserId}/media?${params.toString()}`);

  return (data?.data || [])
    .filter((item: Record<string, unknown>) => {
      const mediaType = item.media_type as string | undefined;
      const productType = item.media_product_type as string | undefined;
      return mediaType === 'VIDEO' || productType === 'REELS';
    })
    .map((item: Record<string, unknown>) => {
      const caption = (item.caption as string | undefined) || '';

      return {
        id: (item.id as string | undefined) || crypto.randomUUID(),
        title: trimText(caption, 72) || `Latest reel from @${username}`,
        description: trimText(caption, 120) || 'Open this Instagram video.',
        thumbnailUrl: (item.thumbnail_url as string | undefined) || (item.media_url as string | undefined) || '',
        permalink: (item.permalink as string | undefined) || DEFAULT_INSTAGRAM_REELS_URL,
        publishedAt: (item.timestamp as string | undefined) || null,
        source: 'live',
      };
    });
};

const buildInstagramPermalink = (username: string, shortcode: string, productType?: string | null) => {
  const path = productType === 'clips' ? 'reel' : 'p';
  return `https://www.instagram.com/${path}/${shortcode}/`;
};

const loadInstagramPublicProfile = async () => {
  const username = Deno.env.get('INSTAGRAM_USERNAME') || DEFAULT_INSTAGRAM_USERNAME;
  const profileUrl = `https://www.instagram.com/${username}/`;
  const reelsUrl = `https://www.instagram.com/${username}/reels/`;
  const appId = Deno.env.get('INSTAGRAM_PUBLIC_APP_ID') || DEFAULT_INSTAGRAM_APP_ID;

  const data = await getJson(
    `https://www.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(username)}`,
    {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'x-ig-app-id': appId,
        referer: profileUrl,
        accept: '*/*',
      },
    },
  );

  const user = data?.data?.user || {};
  const followersCount =
    toNumber(user.followers_count) ??
    toNumber(user.edge_followed_by?.count);
  const followingCount =
    toNumber(user.following_count) ??
    toNumber(user.edge_follow?.count);
  const mediaCount =
    toNumber(user.media_count) ??
    toNumber(user.edge_owner_to_timeline_media?.count);
  const fullName =
    (user.full_name as string | undefined) ||
    (user.username as string | undefined) ||
    username;
  const bio =
    (user.biography as string | undefined) ||
    (user.biography_with_entities?.raw_text as string | undefined) ||
    '';
  const profileImageUrl =
    (user.profile_pic_url_hd as string | undefined) ||
    (user.profile_pic_url as string | undefined) ||
    '';

  const collections = [
    user.edge_felix_video_timeline?.edges,
    user.edge_owner_to_timeline_media?.edges,
    user.edge_owner_to_timeline_video_media?.edges,
  ].filter(Array.isArray) as Array<Array<Record<string, unknown>>>;

  const seen = new Set<string>();
  const videos = collections
    .flatMap((edges) => edges)
    .map((edge) => (edge.node as Record<string, unknown> | undefined) || edge)
    .filter((node) => {
      const isVideo =
        Boolean(node.is_video) ||
        node.media_type === 2 ||
        node.media_type === 'VIDEO' ||
        node.product_type === 'clips';
      return isVideo;
    })
    .map((node) => {
      const shortcode = (node.shortcode as string | undefined) || '';
      const id = (node.id as string | undefined) || shortcode;

      if (!id || seen.has(id)) {
        return null;
      }

      seen.add(id);

      const titleSource =
        (node.edge_media_to_caption?.edges?.[0]?.node?.text as string | undefined) ||
        (node.title as string | undefined) ||
        '';
      const displayUrl =
        (node.display_url as string | undefined) ||
        (node.thumbnail_src as string | undefined) ||
        profileImageUrl;

      return {
        id,
        title: trimText(titleSource, 72) || `Latest video from @${username}`,
        description: trimText(titleSource, 120) || 'Open this Instagram video.',
        thumbnailUrl: displayUrl,
        permalink:
          (node.permalink as string | undefined) ||
          (shortcode ? buildInstagramPermalink(username, shortcode, node.product_type as string | undefined) : reelsUrl),
        publishedAt:
          (node.taken_at_timestamp ? new Date(Number(node.taken_at_timestamp) * 1000).toISOString() : null) ||
          (node.created_at ? new Date(Number(node.created_at) * 1000).toISOString() : null),
        source: 'live',
      };
    })
    .filter(Boolean)
    .slice(0, 6);

  return {
    profile: {
      name: fullName,
      handle: `@${username}`,
      profileUrl,
      reelsUrl,
      followers: followersCount,
      following: followingCount,
      posts: mediaCount,
      bio,
      courseUrl:
        (user.external_url as string | undefined) ||
        DEFAULT_INSTAGRAM_PROFILE_URL,
      contactEmail: 'studio@lifelapss.com',
      profileImageUrl,
      statsCapturedOn: new Date().toISOString().slice(0, 10),
      source: 'live',
    },
    videos,
    followersCount,
    followingCount,
    mediaCount,
  };
};

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response(JSON.stringify({ ok: true }), {
      headers: corsHeaders,
    });
  }

  const fetchedAt = new Date().toISOString();
  const platforms: Record<string, Record<string, unknown>> = {};
  const errors: Record<string, string> = {};
  let youtubeProfile: Record<string, unknown> | null = null;
  let youtubeVideos: Array<Record<string, unknown>> = [];
  let instagramProfile: Record<string, unknown> | null = null;
  let instagramVideos: Array<Record<string, unknown>> = [];

  const youtubeTask = (async () => {
    const { apiKey, profile } = await loadYoutubeChannel();
    youtubeProfile = profile;
    platforms.youtube = {
      subscriberCount: profile.subscriberCount,
      viewCount: profile.viewCount,
      videoCount: profile.videoCount,
    };

    youtubeVideos = apiKey
      ? await loadYoutubeVideosFromApi(apiKey, profile.uploadsPlaylistId as string | null)
      : await loadYoutubeVideosFromFeed((profile.channelId as string | undefined) || DEFAULT_YOUTUBE_CHANNEL_ID);
  })().catch((error) => {
    errors.youtube = createErrorMessage(error);
  });

  const metaAccessToken = Deno.env.get('META_ACCESS_TOKEN');
  const facebookPageId = Deno.env.get('FACEBOOK_PAGE_ID');

  const metaTask = (async () => {
    if (!metaAccessToken || !facebookPageId) {
      throw new Error('Missing META_ACCESS_TOKEN or FACEBOOK_PAGE_ID');
    }

    const page = await loadFacebookPage(metaAccessToken, facebookPageId);
    const igUserId = resolveInstagramUserId(page);

    platforms.facebook = {
      name: page?.name || null,
      followersCount: toNumber(page?.followers_count),
      fanCount: toNumber(page?.fan_count),
    };

    if (!igUserId) {
      throw new Error('No Instagram account linked to the configured Facebook Page');
    }

    const instagram = await loadInstagramStatsFromMeta(metaAccessToken, igUserId);
    instagramVideos = await loadInstagramMediaFromMeta(metaAccessToken, igUserId, (instagram?.username as string | undefined) || DEFAULT_INSTAGRAM_USERNAME);
    instagramProfile = {
      name: page?.name || DEFAULT_INSTAGRAM_USERNAME,
      handle: `@${(instagram?.username as string | undefined) || DEFAULT_INSTAGRAM_USERNAME}`,
      profileUrl: `https://www.instagram.com/${(instagram?.username as string | undefined) || DEFAULT_INSTAGRAM_USERNAME}/`,
      reelsUrl: `https://www.instagram.com/${(instagram?.username as string | undefined) || DEFAULT_INSTAGRAM_USERNAME}/reels/`,
      followers: toNumber(instagram?.followers_count),
      following: null,
      posts: toNumber(instagram?.media_count),
      bio: (instagram?.biography as string | undefined) || '',
      courseUrl: (instagram?.website as string | undefined) || DEFAULT_INSTAGRAM_PROFILE_URL,
      contactEmail: 'studio@lifelapss.com',
      profileImageUrl: '',
      statsCapturedOn: fetchedAt.slice(0, 10),
      source: 'live',
    };

    platforms.instagram = {
      followersCount: toNumber(instagram?.followers_count),
      mediaCount: toNumber(instagram?.media_count),
      username: (instagram?.username as string | undefined) || DEFAULT_INSTAGRAM_USERNAME,
    };
  })().catch((error) => {
    errors.facebook = errors.facebook || createErrorMessage(error);
  });

  await Promise.allSettled([youtubeTask, metaTask]);

  const publicInstagramTask = (async () => {
    const publicInstagram = await loadInstagramPublicProfile();

    if (!instagramProfile) {
      instagramProfile = publicInstagram.profile;
    } else {
      instagramProfile = {
        ...publicInstagram.profile,
        ...instagramProfile,
        profileImageUrl: (instagramProfile.profileImageUrl as string | undefined) || publicInstagram.profile.profileImageUrl,
      };
    }

    if (!instagramVideos.length) {
      instagramVideos = publicInstagram.videos;
    }

    platforms.instagram = {
      ...platforms.instagram,
      followersCount: (platforms.instagram?.followersCount as number | null | undefined) ?? publicInstagram.followersCount,
      mediaCount: (platforms.instagram?.mediaCount as number | null | undefined) ?? publicInstagram.mediaCount,
      followingCount: publicInstagram.followingCount,
    };
  })().catch((error) => {
    errors.instagram = createErrorMessage(error);
  });

  await publicInstagramTask;

  return new Response(
    JSON.stringify({
      fetchedAt,
      live: Object.keys(platforms).length > 0,
      platforms,
      errors,
      youtubeProfile,
      youtubeVideos,
      instagramProfile,
      instagramVideos,
    }),
    {
      headers: {
        ...corsHeaders,
        'Cache-Control': 'public, max-age=0, s-maxage=7200',
      },
    },
  );
});
