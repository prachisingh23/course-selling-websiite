import { useEffect, useState } from 'react';
import {
  buildFallbackInstagramProfile,
  buildFallbackSocialCards,
  buildFallbackYoutubeProfile,
  buildFallbackYoutubeVideos,
  getSocialStats,
  hydrateSocialCards,
} from '@/services/socialStatsService';

const SOCIAL_PRESENCE_CACHE_KEY = 'lifelapss_social_presence_cache_v1';
const SOCIAL_PRESENCE_TTL_MS = 2 * 60 * 60 * 1000;
const SOCIAL_PRESENCE_FALLBACK_TTL_MS = 5 * 60 * 1000;

let memoryState = null;
let memoryFetchedAt = 0;
let inflightRequest = null;

const listeners = new Set();

const buildFallbackInstagramVideos = (instagramProfile) => [
  {
    id: 'instagram-reels',
    title: 'Open Instagram Reels',
    description: 'Jump straight into the creator reel feed.',
    thumbnailUrl: instagramProfile.profileImageUrl || '',
    permalink: instagramProfile.reelsUrl,
    publishedAt: null,
    source: 'fallback',
  },
  {
    id: 'instagram-profile',
    title: `Visit ${instagramProfile.handle}`,
    description: 'Open the full Instagram profile and follow from there.',
    thumbnailUrl: instagramProfile.profileImageUrl || '',
    permalink: instagramProfile.profileUrl,
    publishedAt: null,
    source: 'fallback',
  },
];

const buildInitialState = (loading = true) => {
  const instagramProfile = buildFallbackInstagramProfile();

  return {
    socialCards: buildFallbackSocialCards(),
    socialMeta: {
      loading,
      hasLiveStats: false,
      lastUpdated: null,
      error: null,
    },
    youtubeProfile: buildFallbackYoutubeProfile(),
    youtubeVideos: buildFallbackYoutubeVideos(),
    instagramProfile,
    instagramVideos: buildFallbackInstagramVideos(instagramProfile),
  };
};

const hydrateCachedState = (state) => {
  const initialState = buildInitialState(false);
  const instagramProfile = {
    ...initialState.instagramProfile,
    ...(state?.instagramProfile || {}),
  };

  return {
    socialCards: hydrateSocialCards(state?.socialCards || initialState.socialCards),
    socialMeta: {
      ...initialState.socialMeta,
      ...(state?.socialMeta || {}),
      loading: false,
    },
    youtubeProfile: {
      ...initialState.youtubeProfile,
      ...(state?.youtubeProfile || {}),
    },
    youtubeVideos: Array.isArray(state?.youtubeVideos) && state.youtubeVideos.length > 0
      ? state.youtubeVideos
      : initialState.youtubeVideos,
    instagramProfile,
    instagramVideos: Array.isArray(state?.instagramVideos) && state.instagramVideos.length > 0
      ? state.instagramVideos
      : buildFallbackInstagramVideos(instagramProfile),
  };
};

const getCacheTtl = (state) =>
  state?.socialMeta?.hasLiveStats ? SOCIAL_PRESENCE_TTL_MS : SOCIAL_PRESENCE_FALLBACK_TTL_MS;

const isFresh = (fetchedAt, state) =>
  fetchedAt > 0 && Date.now() - fetchedAt < getCacheTtl(state);

const resolveFreshnessTimestamp = (lastUpdated) => {
  const parsed = new Date(lastUpdated || '').getTime();
  return Number.isFinite(parsed) && parsed > 0 ? parsed : Date.now();
};

const notifyListeners = () => {
  listeners.forEach((listener) => {
    listener(memoryState);
  });
};

const readStorageCache = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const stored = window.localStorage.getItem(SOCIAL_PRESENCE_CACHE_KEY);
    if (!stored) {
      return null;
    }

    const parsed = JSON.parse(stored);
    if (!parsed?.state || !parsed?.fetchedAt) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
};

const writeStorageCache = (state, fetchedAt) => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(
      SOCIAL_PRESENCE_CACHE_KEY,
      JSON.stringify({ state, fetchedAt }),
    );
  } catch {
    // Ignore storage write errors and keep using memory cache.
  }
};

const buildStateFromResult = (result) => ({
  socialCards: hydrateSocialCards(result.cards),
  socialMeta: {
    loading: false,
    hasLiveStats: result.hasLiveStats,
    lastUpdated: result.lastUpdated,
    error: result.errors.general || null,
  },
  youtubeProfile: result.youtubeProfile,
  youtubeVideos: result.youtubeVideos,
  instagramProfile: result.instagramProfile,
  instagramVideos: result.instagramVideos,
});

const ensureHydratedCache = () => {
  if (memoryState) {
    return;
  }

  const cached = readStorageCache();
  if (!cached) {
    return;
  }

  memoryState = hydrateCachedState(cached.state);
  memoryFetchedAt = cached.fetchedAt;
};

const setCachedState = (state, fetchedAt = Date.now()) => {
  memoryState = state;
  memoryFetchedAt = fetchedAt;
  writeStorageCache(state, fetchedAt);
  notifyListeners();
};

export const primeSocialPresence = async ({ force = false } = {}) => {
  ensureHydratedCache();

  if (!force && memoryState && isFresh(memoryFetchedAt, memoryState)) {
    return memoryState;
  }

  if (!force && inflightRequest) {
    return inflightRequest;
  }

  inflightRequest = getSocialStats()
    .then((result) => {
      const nextState = buildStateFromResult(result);
      setCachedState(nextState, resolveFreshnessTimestamp(result.lastUpdated));
      return nextState;
    })
    .finally(() => {
      inflightRequest = null;
    });

  return inflightRequest;
};

export const useSocialPresence = () => {
  ensureHydratedCache();

  const [state, setState] = useState(() => {
    if (memoryState) {
      return memoryState;
    }

    return buildInitialState(true);
  });

  useEffect(() => {
    const handleUpdate = (nextState) => {
      if (nextState) {
        setState(nextState);
      }
    };

    listeners.add(handleUpdate);

    if (memoryState) {
      setState(memoryState);
    }

    const shouldRefresh = !memoryState || !isFresh(memoryFetchedAt, memoryState);
    if (shouldRefresh) {
      primeSocialPresence().catch(() => {
        // getSocialStats already falls back safely; keep silent here.
      });
    }

    return () => {
      listeners.delete(handleUpdate);
    };
  }, []);

  return state;
};
