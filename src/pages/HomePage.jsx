import React, { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  ArrowRight,
  Clapperboard,
  Coins,
  Image as ImageIcon,
  Loader2,
  PlayCircle,
  Search,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getFavorites, getFavoriteKey, toggleFavorite } from '@/services/favoritesService';
import {
  MEDIA_CATEGORIES,
  RESOLUTION_OPTIONS,
  SORT_OPTIONS,
  TRENDING_TAGS,
} from '@/constants/mediaCatalog';
import { resilientImport } from '@/lib/resilientImport';
import MediaHero from '@/components/media/MediaHero';
import DeferredSection from '@/components/DeferredSection';

const MediaCard = lazy(() => import('@/components/media/MediaCard'));
const MediaFilters = lazy(() => import('@/components/media/MediaFilters'));
const SocialSpotlightsSection = lazy(() => import('@/components/media/SocialSpotlightsSection'));

let mediaServicePromise = null;

const loadMediaService = async () => {
  if (!mediaServicePromise) {
    mediaServicePromise = resilientImport(
      () => import('@/services/mediaService'),
      'media-service',
    );
  }

  return mediaServicePromise;
};

const scheduleDeferredTask = (callback, timeout = 2200) => {
  if (typeof window === 'undefined') {
    return null;
  }

  if ('requestIdleCallback' in window) {
    return window.requestIdleCallback(callback, { timeout });
  }

  return window.setTimeout(callback, timeout);
};

const cancelDeferredTask = (handle) => {
  if (typeof window === 'undefined' || handle == null) {
    return;
  }

  if ('cancelIdleCallback' in window) {
    window.cancelIdleCallback(handle);
    return;
  }

  window.clearTimeout(handle);
};

const SECTION_TARGET_MAP = {
  'guided-discovery': 'guided',
  'free-assets': 'browse-lanes',
  collections: 'collections',
  pricing: 'collections',
  'browse-all': 'browse-all',
};

const SocialSpotlightsFallback = () => (
  <section className="grid gap-6 lg:grid-cols-[0.94fr_1.06fr]">
    <div className="media-panel-soft rounded-[34px] p-6 md:p-8">
      <div className="animate-pulse space-y-5">
        <div className="h-6 w-28 rounded-full bg-white/[0.08]" />
        <div className="h-10 w-3/4 rounded-full bg-white/[0.08]" />
        <div className="h-4 w-full rounded-full bg-white/[0.06]" />
        <div className="h-4 w-5/6 rounded-full bg-white/[0.06]" />
        <div className="mt-3 aspect-[16/10] rounded-[28px] bg-white/[0.05]" />
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="h-32 rounded-[24px] bg-white/[0.05]" />
          <div className="h-32 rounded-[24px] bg-white/[0.05]" />
        </div>
      </div>
    </div>
    <div className="media-panel-soft rounded-[34px] p-6 md:p-8">
      <div className="animate-pulse space-y-5">
        <div className="h-6 w-32 rounded-full bg-white/[0.08]" />
        <div className="h-10 w-2/3 rounded-full bg-white/[0.08]" />
        <div className="h-4 w-full rounded-full bg-white/[0.06]" />
        <div className="grid gap-3 md:grid-cols-3">
          <div className="h-24 rounded-[24px] bg-white/[0.05]" />
          <div className="h-24 rounded-[24px] bg-white/[0.05]" />
          <div className="h-24 rounded-[24px] bg-white/[0.05]" />
        </div>
        <div className="h-44 rounded-[28px] bg-white/[0.05]" />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="aspect-[16/10] rounded-[26px] bg-white/[0.05]" />
          <div className="aspect-[16/10] rounded-[26px] bg-white/[0.05]" />
        </div>
      </div>
    </div>
  </section>
);

const AssetGridFallback = ({ columns = 'xl:grid-cols-3' }) => (
  <div className={`grid gap-6 sm:grid-cols-2 ${columns}`}>
    {Array.from({ length: 3 }, (_, index) => (
      <div key={`media-grid-fallback-${index}`} className="media-panel overflow-hidden rounded-[32px]">
        <div className="animate-pulse">
          <div className="aspect-[16/11] bg-white/[0.05]" />
          <div className="space-y-4 p-5">
            <div className="h-4 w-24 rounded-full bg-white/[0.07]" />
            <div className="h-8 w-3/4 rounded-full bg-white/[0.07]" />
            <div className="h-4 w-full rounded-full bg-white/[0.05]" />
            <div className="h-4 w-5/6 rounded-full bg-white/[0.05]" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

const FiltersFallback = () => (
  <div className="media-panel-soft rounded-[32px] p-6 md:p-8">
    <div className="animate-pulse space-y-4">
      <div className="h-4 w-32 rounded-full bg-white/[0.08]" />
      <div className="h-10 w-1/2 rounded-full bg-white/[0.08]" />
      <div className="grid gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={`filters-fallback-${index}`} className="h-12 rounded-[18px] bg-white/[0.05]" />
        ))}
      </div>
    </div>
  </div>
);

const quickBrowse = [
  {
    id: 'videos',
    icon: Clapperboard,
    title: 'Motion Library',
    copy: 'Open cinematic clips, drone movement, and polished visual loops.',
    actionLabel: 'Browse videos',
  },
  {
    id: 'photos',
    icon: ImageIcon,
    title: 'Photo Archive',
    copy: 'Explore portraits, textures, products, and atmospheric stills.',
    actionLabel: 'Browse photos',
  },
  {
    id: 'short-form',
    icon: PlayCircle,
    title: 'Short-Form',
    copy: 'Jump into reel-ready vertical motion built for fast edits.',
    actionLabel: 'Open short-form',
  },
  {
    id: 'drone',
    icon: Sparkles,
    title: 'Drone Atmospheres',
    copy: 'Find wide aerials and cinematic top shots with immediate scale.',
    actionLabel: 'Explore drone',
  },
];

const collectionCards = [
  {
    title: 'Travel Stories',
    query: 'travel cinematic landscape nature',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
    copy: 'Destinations, aerial motion, and story-led frames for brand journeys and reels.',
  },
  {
    title: 'Urban Nights',
    query: 'city lights urban night cinematic',
    image: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1200&q=80',
    copy: 'Neon streets, glass reflections, and after-dark city visuals with edge.',
  },
  {
    title: 'Luxury Lifestyle',
    query: 'lifestyle editorial fashion luxury portrait',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80',
    copy: 'Premium editorial portraits and lifestyle imagery that feels current.',
  },
  {
    title: 'Minimal Product Space',
    query: 'minimal textures abstract background product',
    image: 'https://images.unsplash.com/photo-1519337265831-281ec6cc8514?auto=format&fit=crop&w=1200&q=80',
    copy: 'Clean surfaces, soft gradients, and product-friendly visual space.',
  },
];

const pricingCards = [
  {
    title: 'Free Entry',
    price: 'Free',
    kicker: 'Start exploring',
    features: ['Selected free downloads', 'Fast creator experiments'],
  },
  {
    title: 'Premium Singles',
    price: 'From $4',
    kicker: 'Unlock only what fits',
    features: ['Pay per photo or video', 'Good for one-off campaigns'],
  },
  {
    title: 'Curated Packs',
    price: 'From $29',
    kicker: 'Move faster',
    features: ['Mood-led batches', 'Less searching, more building'],
  },
];

const guidedRoutes = [
  {
    id: 'travel-stories',
    label: 'Travel Loop',
    title: 'Travel stories with movement and scale',
    copy: 'Guide people into landscapes, drone motion, and destination visuals that naturally pull them into the next asset.',
    query: '#travel #nature cinematic',
    chips: ['travel', 'nature', 'cinematic'],
    category: 'Nature Shots',
    preferredType: 'video',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80',
    terms: ['travel', 'nature', 'landscape', 'drone'],
    minimumMatches: 2,
  },
  {
    id: 'urban-nights',
    label: 'Night Energy',
    title: 'Urban nights that keep the energy high',
    copy: 'Neon, reflections, city motion, and after-dark framing keep the browsing rhythm sharp instead of flat.',
    query: '#citylights #urban cinematic',
    chips: ['citylights', 'urban', 'night'],
    category: 'City Lights',
    preferredType: 'video',
    image: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1600&q=80',
    terms: ['city', 'urban', 'night', 'lights'],
    minimumMatches: 2,
  },
  {
    id: 'editorial-lifestyle',
    label: 'Editorial Mood',
    title: 'Lifestyle and portrait picks that feel premium',
    copy: 'People stay longer when the catalog feels intentional, current, and visually rich instead of random.',
    query: '#lifestyle #portrait editorial',
    chips: ['lifestyle', 'portrait', 'editorial'],
    category: 'Lifestyle',
    preferredType: 'photo',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1600&q=80',
    terms: ['lifestyle', 'portrait', 'editorial', 'fashion'],
    minimumMatches: 2,
  },
  {
    id: 'texture-lab',
    label: 'Texture Lab',
    title: 'Minimal textures for product and brand systems',
    copy: 'Quiet backgrounds, materials, and abstract surfaces create the kind of deep-browse lane designers revisit repeatedly.',
    query: '#textures #minimal product',
    chips: ['textures', 'minimal', 'product'],
    category: 'Textures',
    preferredType: 'photo',
    image: 'https://images.unsplash.com/photo-1519337265831-281ec6cc8514?auto=format&fit=crop&w=1600&q=80',
    terms: ['texture', 'minimal', 'abstract', 'product'],
    minimumMatches: 2,
  },
];

const HomePage = ({ onNavigate }) => {
  const [items, setItems] = useState([]);
  const [catalogItems, setCatalogItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [resolution, setResolution] = useState('All');
  const [sort, setSort] = useState('Trending');
  const [favorites, setFavorites] = useState(() => getFavorites());
  const [activeRouteId, setActiveRouteId] = useState(guidedRoutes[0].id);
  const [revealedSections, setRevealedSections] = useState({});

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { fetchMediaItems } = await loadMediaService();
        const media = await fetchMediaItems({ search, category, resolution, sort });
        setItems(media);
      } catch (error) {
        console.error('Failed to load discover media:', error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [search, category, resolution, sort]);

  useEffect(() => {
    let cancelled = false;
    let loadHandle = null;

    const loadCatalog = async () => {
      try {
        const { fetchMediaItems } = await loadMediaService();
        const media = await fetchMediaItems({ sort: 'Trending' });
        if (!cancelled) {
          setCatalogItems(media);
        }
      } catch (error) {
        console.error('Failed to load guided discovery media:', error);
        if (!cancelled) {
          setCatalogItems([]);
        }
      }
    };

    if (revealedSections.guided) {
      loadCatalog();
    } else {
      loadHandle = scheduleDeferredTask(() => {
        loadCatalog();
      });
    }

    return () => {
      cancelled = true;
      cancelDeferredTask(loadHandle);
    };
  }, [revealedSections.guided]);

  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (!hash) return;

    const sectionKey = SECTION_TARGET_MAP[hash];

    if (sectionKey) {
      setRevealedSections((current) => (
        current[sectionKey]
          ? current
          : { ...current, [sectionKey]: true }
      ));
    }

    const timer = window.setTimeout(() => {
      const section = document.getElementById(hash);
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 80);

    return () => window.clearTimeout(timer);
  }, [items.length]);

  const favoriteSet = useMemo(
    () => new Set(favorites.map((item) => getFavoriteKey(item.type, item.id))),
    [favorites]
  );

  const uniqueSlice = (list, limit = 4) => {
    const seen = new Set();

    return list.filter((item) => {
      const key = `${item.type}-${item.id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, limit);
  };

  const routeCollections = useMemo(
    () =>
      guidedRoutes.map((route) => {
        const routeTerms = route.terms.map((term) => term.toLowerCase());
        const matchedItems = catalogItems
          .filter((item) => {
            const text = item.searchableText || '';
            const tags = item.searchTags || [];
            const termHits = routeTerms.filter((term) => text.includes(term) || tags.includes(term)).length;
            const categoryMatch = route.category ? item.category === route.category : false;

            return termHits >= route.minimumMatches || (categoryMatch && termHits >= 1);
          })
          .sort((left, right) => {
            const leftPriority = left.type === route.preferredType ? 0 : 1;
            const rightPriority = right.type === route.preferredType ? 0 : 1;
            return leftPriority - rightPriority;
          });

        const itemsForRoute = uniqueSlice(
          [
            ...matchedItems,
            ...catalogItems.filter((item) => item.type === route.preferredType),
            ...catalogItems,
          ],
          4
        );

        return {
          ...route,
          items: itemsForRoute,
          totalMatches: matchedItems.length || itemsForRoute.length,
          freeMatches: itemsForRoute.filter((item) => item.isFree).length,
          savedMatches: itemsForRoute.filter((item) =>
            favoriteSet.has(getFavoriteKey(item.type, item.id))
          ).length,
        };
      }),
    [catalogItems, favoriteSet]
  );

  useEffect(() => {
    if (!routeCollections.some((route) => route.id === activeRouteId)) {
      setActiveRouteId(routeCollections[0]?.id || guidedRoutes[0].id);
    }
  }, [activeRouteId, routeCollections]);

  useEffect(() => {
    if (routeCollections.length <= 1 || !revealedSections.guided) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setActiveRouteId((current) => {
        const currentIndex = routeCollections.findIndex((route) => route.id === current);
        const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % routeCollections.length : 0;
        return routeCollections[nextIndex].id;
      });
    }, 6500);

    return () => window.clearInterval(timer);
  }, [revealedSections.guided, routeCollections]);

  const fallbackActiveRoute = guidedRoutes.find((route) => route.id === activeRouteId)
    || guidedRoutes[0];
  const activeRoute = routeCollections.find((route) => route.id === activeRouteId)
    || {
      ...fallbackActiveRoute,
      items: [],
      totalMatches: 0,
      freeMatches: 0,
      savedMatches: 0,
    };

  const latestItems = uniqueSlice(items, 3);
  const discoverGrid = items.slice(0, 6);
  const freeItems = items.filter((item) => item.isFree).slice(0, 2);
  const heroSpotlightItems = uniqueSlice([
    ...items.filter((item) => item.type === 'video'),
    ...items.filter((item) => item.type === 'photo'),
  ], 3);

  const stats = useMemo(() => {
    const fourK = items.filter((item) => item.resolution === '4K').length;
    const free = items.filter((item) => item.isFree).length;

    return [
      { label: 'Curated Assets', value: items.length || '0' },
      { label: '4K Ready', value: fourK || '0' },
      { label: 'Free Downloads', value: free || '0' },
      { label: 'Saved Picks', value: favorites.length || '0' },
    ];
  }, [favorites.length, items]);

  const handleFavorite = (item) => {
    setFavorites(toggleFavorite(item));
  };

  const handleDownload = (item) => {
    if (!item.isFree) {
      onNavigate('media', { type: item.type, id: item.id });
      return;
    }

    window.open(item.downloadUrl, '_blank', 'noopener,noreferrer');
  };

  const handleHeroSearch = (query) => {
    if (!query) return;
    onNavigate('search', { query });
  };

  const handleRouteLoad = (route) => {
    setSearch(route.query);
    setCategory('All');
    setResolution('All');
    setSort('Trending');
    window.setTimeout(() => scrollToSection('browse-all'), 20);
  };

  const scrollToSection = (id) => {
    const sectionKey = SECTION_TARGET_MAP[id];

    if (sectionKey) {
      setRevealedSections((current) => (
        current[sectionKey]
          ? current
          : { ...current, [sectionKey]: true }
      ));
    }

    const scroll = () => {
      const section = document.getElementById(id);

      if (!section) {
        return;
      }

      window.location.hash = id;
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    if (sectionKey) {
      window.requestAnimationFrame(() => {
        window.setTimeout(scroll, 80);
      });
      return;
    }

    scroll();
  };

  const handleSectionCategory = (nextCategory) => {
    if (nextCategory === 'Videos' || nextCategory === 'Photos' || MEDIA_CATEGORIES.includes(nextCategory)) {
      setCategory(nextCategory);
      window.setTimeout(() => scrollToSection('browse-all'), 20);
      return;
    }

    handleHeroSearch(nextCategory);
  };

  const resetFilters = () => {
    setSearch('');
    setCategory('All');
    setResolution('All');
    setSort('Trending');
  };

  const renderAssetGrid = (sectionItems, emptyCopy, columns = 'xl:grid-cols-3') => {
    if (loading) {
      return (
        <div className="media-panel flex min-h-[280px] items-center justify-center rounded-[32px]">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-200" />
        </div>
      );
    }

    if (sectionItems.length === 0) {
      return (
        <div className="media-panel flex min-h-[220px] flex-col items-center justify-center rounded-[32px] text-center">
          <Search className="mb-4 h-10 w-10 text-cyan-100/38" />
          <p className="max-w-xl text-sm leading-7 text-white/58">{emptyCopy}</p>
        </div>
      );
    }

    return (
      <Suspense fallback={<AssetGridFallback columns={columns} />}>
        <div className={`grid gap-6 sm:grid-cols-2 ${columns}`}>
          {sectionItems.map((item) => (
            <MediaCard
              key={`${item.type}-${item.id}`}
              item={item}
              saved={favoriteSet.has(getFavoriteKey(item.type, item.id))}
              onToggleSave={handleFavorite}
              onDownload={handleDownload}
              onTagSelect={(tag) => onNavigate('search', { query: `#${tag}` })}
              onPreview={(mediaItem) => onNavigate('media', { type: mediaItem.type, id: mediaItem.id })}
            />
          ))}
        </div>
      </Suspense>
    );
  };

  return (
    <>
      <Helmet>
        <title>Lifelapss Media - Royalty-Free Photos and Videos</title>
        <meta
          name="description"
          content="Browse cinematic royalty-free photos and videos through a cleaner homepage with stronger 3D visuals, faster search, and easier discovery."
        />
      </Helmet>

      <div className="media-shell pb-20 pt-28 lg:pt-32">
        <main className="mx-auto max-w-7xl space-y-8 px-4 md:space-y-10">
          <section id="discover" className="scroll-mt-32">
            <MediaHero
              onSearch={handleHeroSearch}
              onTagClick={(tag) => onNavigate('search', { query: tag })}
              onPrimaryAction={() => scrollToSection('free-assets')}
              onSecondaryAction={() => onNavigate('videos')}
              trendingTags={TRENDING_TAGS}
              categories={['All', 'Videos', 'Photos', 'Drone Footage', 'Lifestyle', 'Textures']}
              onCategorySelect={handleSectionCategory}
              activeCategory={category}
              metrics={stats}
              spotlightItems={heroSpotlightItems}
              title="A cleaner media archive for videos, photos, and creators."
              description="Lifelapss now opens with one focused visual stage, faster search, and clearer paths into videos, photos, and free assets."
              primaryLabel="See Free Assets"
              secondaryLabel="Browse Videos"
            />
          </section>

          <DeferredSection forceRender={Boolean(revealedSections.guided)} minHeight={1240}>
            <section id="guided-discovery" className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr] scroll-mt-32">
              <div className="media-panel rounded-[34px] p-6 md:p-8">
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="media-kicker">Guided Discovery</p>
                  <h2 className="mt-3 text-4xl text-white">Follow a mood, not a messy grid.</h2>
                  <p className="media-copy mt-4 max-w-2xl">
                    These routes keep people moving from one visual lane to the next instead of dropping them into a flat archive.
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="rounded-full border-white/10 bg-white/5 hover:bg-white/10"
                  onClick={() => onNavigate('search', { query: '#cinematic' })}
                >
                  Open hashtag search
                </Button>
              </div>

              <div className="mt-6 space-y-3">
                {routeCollections.map((route) => {
                  const isActive = route.id === activeRoute.id;

                  return (
                    <button
                      key={route.id}
                      type="button"
                      onClick={() => setActiveRouteId(route.id)}
                      className={`w-full rounded-[26px] border p-5 text-left transition-all ${
                        isActive
                          ? 'border-cyan-300/30 bg-cyan-300/[0.08] shadow-[0_20px_60px_rgba(34,211,238,0.08)]'
                          : 'border-white/10 bg-white/[0.04] hover:-translate-y-0.5 hover:border-white/18'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/42">
                            {route.label}
                          </p>
                          <h3 className="mt-2 text-2xl text-white">{route.title}</h3>
                        </div>
                        <ArrowRight className={`mt-1 h-4 w-4 ${isActive ? 'text-cyan-100' : 'text-white/34'}`} />
                      </div>

                      <p className="mt-3 text-sm leading-7 text-white/60">{route.copy}</p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {route.chips.map((chip) => (
                          <span
                            key={`${route.id}-${chip}`}
                            className="media-chip border-white/8 bg-white/[0.04] text-white/72"
                          >
                            #{chip}
                          </span>
                        ))}
                      </div>

                      <div className="mt-4 flex flex-wrap gap-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/40">
                        <span>{route.totalMatches} route matches</span>
                        <span>{route.freeMatches} free picks</span>
                        <span>{route.savedMatches} already saved</span>
                      </div>
                    </button>
                  );
                })}
              </div>
              </div>
              <div className="media-panel relative overflow-hidden rounded-[34px]">
                <div className="absolute inset-0">
                  <img
                    src={activeRoute.items[0]?.previewUrl || activeRoute.image}
                    alt={activeRoute.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,10,16,0.22),rgba(3,10,16,0.82)),radial-gradient(circle_at_top_left,rgba(125,211,252,0.18),transparent_28%)]" />
                </div>

                <div
                  key={activeRoute.id}
                  className="relative z-10 p-6 transition-opacity duration-300 md:p-8"
                >
                  <div className="max-w-2xl">
                    <p className="media-kicker">{activeRoute.label}</p>
                    <h2 className="mt-3 text-4xl leading-[0.94] text-white md:text-5xl">
                      {activeRoute.title}
                    </h2>
                    <p className="media-copy mt-4 max-w-2xl">{activeRoute.copy}</p>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <Button
                      className="rounded-full bg-cyan-300 text-[#041b26] hover:bg-cyan-200"
                      onClick={() => handleRouteLoad(activeRoute)}
                    >
                      Load this mood
                    </Button>
                    <Button
                      variant="outline"
                      className="rounded-full border-white/10 bg-white/5 hover:bg-white/10"
                      onClick={() => onNavigate('search', { query: activeRoute.query })}
                    >
                      Open dedicated results
                    </Button>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    {activeRoute.chips.map((chip) => (
                      <button
                        key={`${activeRoute.id}-chip-${chip}`}
                        type="button"
                        onClick={() => onNavigate('search', { query: `#${chip}` })}
                        className="media-chip border-cyan-300/20 bg-[#0c1a24]/70 text-cyan-100 transition-all hover:-translate-y-0.5 hover:border-cyan-300/35"
                      >
                        #{chip}
                      </button>
                    ))}
                  </div>

                  <div className="mt-8 grid gap-3 md:grid-cols-3">
                    <div className="rounded-[24px] border border-white/10 bg-black/20 p-4 backdrop-blur-sm">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/42">Route Matches</p>
                      <p className="mt-3 text-3xl text-white">{activeRoute.totalMatches}</p>
                    </div>
                    <div className="rounded-[24px] border border-white/10 bg-black/20 p-4 backdrop-blur-sm">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/42">Free Picks</p>
                      <p className="mt-3 text-3xl text-white">{activeRoute.freeMatches}</p>
                    </div>
                    <div className="rounded-[24px] border border-white/10 bg-black/20 p-4 backdrop-blur-sm">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/42">Saved in Route</p>
                      <p className="mt-3 text-3xl text-white">{activeRoute.savedMatches}</p>
                    </div>
                  </div>
                </div>

                <div className="relative z-10 border-t border-white/10 bg-black/20 p-6 md:p-8">
                  <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/42">Inside This Route</p>
                      <h3 className="mt-2 text-2xl text-white">Three fast exits into deeper browsing</h3>
                    </div>
                    <Button
                      variant="outline"
                      className="rounded-full border-white/10 bg-white/5 hover:bg-white/10"
                      onClick={() => scrollToSection('browse-all')}
                    >
                      Explore current filters
                    </Button>
                  </div>

                  <div className="mt-5">
                    {activeRoute.items.length === 0 ? (
                      <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6 text-white/58">
                        Curated route previews are loading. The archive will slot in here automatically.
                      </div>
                    ) : (
                      <div className="grid gap-4 md:grid-cols-3">
                        {activeRoute.items.slice(0, 3).map((item) => (
                          <button
                            key={`${activeRoute.id}-${item.type}-${item.id}`}
                            type="button"
                            onClick={() => onNavigate('media', { type: item.type, id: item.id })}
                            className="overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.04] text-left transition-all hover:-translate-y-1 hover:border-cyan-300/20"
                          >
                            <div className="relative aspect-[4/3] overflow-hidden">
                              <img
                                src={item.previewUrl}
                                alt={item.title}
                                className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                                loading="lazy"
                                decoding="async"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-[#040b11] via-transparent to-transparent" />
                              <div className="absolute left-4 top-4 flex items-center gap-2">
                                <span className="media-chip border-white/10 bg-black/35 text-white/78">
                                  {item.type === 'video' ? 'Motion' : 'Still'}
                                </span>
                                <span className="media-chip border-cyan-300/20 bg-[#0c1a24]/72 text-cyan-100">
                                  {item.resolution}
                                </span>
                              </div>
                            </div>
                            <div className="p-4">
                              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/40">
                                {item.category}
                              </p>
                              <h4 className="mt-2 line-clamp-2 text-xl text-white">{item.title}</h4>
                              <p className="mt-3 text-sm text-white/58">
                                {item.creatorName}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </DeferredSection>

          <DeferredSection forceRender={Boolean(revealedSections.social)} minHeight={760}>
            <Suspense fallback={<SocialSpotlightsFallback />}>
              <SocialSpotlightsSection />
            </Suspense>
          </DeferredSection>

          <DeferredSection forceRender={Boolean(revealedSections['browse-lanes'])} minHeight={1080}>
            <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="media-panel rounded-[34px] p-6 md:p-8">
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="media-kicker">Quick Start</p>
                  <h2 className="mt-3 text-4xl text-white">Start with one clear lane</h2>
                  <p className="media-copy mt-4 max-w-2xl">
                    The homepage stays focused on the strongest entry points instead of repeating the same ideas in multiple sections.
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="rounded-full border-white/10 bg-white/5 hover:bg-white/10"
                  onClick={() => scrollToSection('browse-all')}
                >
                  Open full archive
                </Button>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {quickBrowse.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      if (item.id === 'videos') onNavigate('videos');
                      else if (item.id === 'photos') onNavigate('photos');
                      else if (item.id === 'short-form') onNavigate('search', { query: 'vertical reel shorts' });
                      else onNavigate('search', { query: 'drone aerial 4k' });
                    }}
                    className="media-panel-soft rounded-[26px] p-5 text-left transition-all hover:border-cyan-300/18"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-cyan-100">
                        <item.icon className="h-5 w-5" />
                      </div>
                      <ArrowRight className="h-4 w-4 text-white/34" />
                    </div>
                    <h3 className="mt-5 text-2xl text-white">{item.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-white/58">{item.copy}</p>
                    <p className="mt-5 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-100/72">
                      {item.actionLabel}
                    </p>
                  </button>
                ))}
              </div>
              </div>
              <div id="free-assets" className="media-panel rounded-[34px] p-6 md:p-8 scroll-mt-32">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="media-kicker">Free Assets</p>
                    <h2 className="mt-3 text-4xl text-white">Try free assets first</h2>
                  </div>
                  <Button
                    className="rounded-full bg-cyan-300 text-[#041b26] hover:bg-cyan-200"
                    onClick={() => {
                      setCategory('All');
                      setSearch('');
                      scrollToSection('browse-all');
                    }}
                  >
                    View free library
                  </Button>
                </div>

                <div className="mt-6">
                  {renderAssetGrid(
                    freeItems,
                    'Free assets will appear here as the curated archive grows.',
                    'lg:grid-cols-2'
                  )}
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  {stats.slice(0, 3).map((metric) => (
                    <div
                      key={metric.label}
                      className="stat-pill"
                    >
                      <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/40">
                        {metric.label}
                      </span>
                      <span className="text-sm font-semibold text-white">{metric.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </DeferredSection>

          <DeferredSection forceRender={Boolean(revealedSections.collections)} minHeight={1180}>
            <section id="collections" className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr] scroll-mt-32">
              <div className="media-panel rounded-[34px] p-6 md:p-8">
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="media-kicker">Collections</p>
                  <h2 className="mt-3 text-4xl text-white">Pick a mood and move</h2>
                  <p className="media-copy mt-4 max-w-2xl">
                    Users should be able to choose a direction quickly, not scroll through repeated promo sections to figure out where to start.
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="rounded-full border-white/10 bg-white/5 hover:bg-white/10"
                  onClick={() => onNavigate('search', { query: 'cinematic travel city lifestyle' })}
                >
                  See more moods
                </Button>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {collectionCards.map((collection) => (
                  <button
                    key={collection.title}
                    type="button"
                    onClick={() => onNavigate('search', { query: collection.query })}
                    className="media-panel group relative overflow-hidden rounded-[28px] text-left"
                  >
                    <img
                      src={collection.image}
                      alt={collection.title}
                      className="absolute inset-0 h-full w-full object-cover opacity-[0.42] transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#061019] via-[#061019]/74 to-[#061019]/16" />
                    <div className="relative z-10 flex min-h-[220px] flex-col justify-end p-5">
                      <p className="media-kicker">Collection</p>
                      <h3 className="mt-3 text-3xl text-white">{collection.title}</h3>
                      <p className="mt-3 text-sm leading-7 text-white/62">{collection.copy}</p>
                    </div>
                  </button>
                ))}
              </div>
              </div>

              <div className="space-y-6">
                <div className="media-panel rounded-[34px] p-6 md:p-8">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="media-kicker">Trending Now</p>
                    <h2 className="mt-3 text-4xl text-white">A smaller, sharper spotlight</h2>
                    <p className="media-copy mt-4 max-w-2xl">
                      Three strong picks say more than another long rail of repeated cards.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="rounded-full border-white/10 bg-white/5 hover:bg-white/10"
                    onClick={() => scrollToSection('browse-all')}
                  >
                    Browse all assets
                  </Button>
                </div>

                <div className="mt-6">
                  {renderAssetGrid(
                    latestItems,
                    'Approved assets from the archive will appear here automatically.',
                    'lg:grid-cols-2'
                  )}
                </div>
                </div>

                <div id="pricing" className="media-panel-soft rounded-[34px] p-6 md:p-8 scroll-mt-32">
                  <div className="flex items-start gap-4">
                    <div className="rounded-2xl border border-amber-200/12 bg-amber-300/10 p-3 text-amber-100">
                      <Coins className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="media-kicker text-amber-100/72">Pricing</p>
                      <h2 className="mt-3 text-3xl text-white">Keep pricing easy to read</h2>
                      <p className="mt-3 text-sm leading-7 text-white/58">
                        Start free, unlock singles when needed, then move into packs only when the project really calls for it.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3 md:grid-cols-3">
                    {pricingCards.map((card) => (
                      <div key={card.title} className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-100/62">
                          {card.kicker}
                        </p>
                        <div className="mt-3 flex items-start justify-between gap-3">
                          <h3 className="text-xl text-white">{card.title}</h3>
                          <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-sm font-semibold text-white">
                            {card.price}
                          </span>
                        </div>
                        <div className="mt-4 space-y-2">
                          {card.features.map((feature) => (
                            <p key={feature} className="text-sm leading-6 text-white/58">
                              {feature}
                            </p>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </DeferredSection>

          <DeferredSection forceRender={Boolean(revealedSections['browse-all'])} minHeight={1080}>
            <section id="browse-all" className="scroll-mt-32">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="media-kicker">Browse All Assets</p>
                <h2 className="mt-3 text-4xl text-white">Search, filter, preview, and move on faster</h2>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  className="rounded-full border-white/10 bg-white/5 hover:bg-white/10"
                  onClick={resetFilters}
                >
                  Reset Filters
                </Button>
                <Button
                  className="rounded-full bg-cyan-300 text-[#041b26] hover:bg-cyan-200"
                  onClick={() => onNavigate('search', { query: search || (category === 'All' ? 'cinematic' : category) })}
                >
                  Open Search Results
                </Button>
              </div>
            </div>

              <section className="mt-6">
                <Suspense fallback={<FiltersFallback />}>
                  <MediaFilters
                    search={search}
                    onSearchChange={setSearch}
                    category={category}
                    onCategoryChange={setCategory}
                    resolution={resolution}
                    onResolutionChange={setResolution}
                    sort={sort}
                    onSortChange={setSort}
                    categories={MEDIA_CATEGORIES}
                    resolutions={RESOLUTION_OPTIONS}
                    sorts={SORT_OPTIONS}
                    searchPlaceholder="Search assets by mood, subject, format, scene, or #hashtag..."
                    resultCount={items.length}
                    title="Browse the full archive"
                    description="Use one clean filter bar to narrow by type, resolution, and ranking."
                    onReset={resetFilters}
                  />
                </Suspense>
              </section>

              <div className="mt-6">
                {renderAssetGrid(
                  discoverGrid,
                  'There are no assets for this combination yet. Try a broader mood, category, or hashtag.',
                  'xl:grid-cols-3'
                )}
              </div>
            </section>
          </DeferredSection>
        </main>
      </div>
    </>
  );
};

export default HomePage;
