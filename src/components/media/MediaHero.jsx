import React, { Suspense, lazy, useEffect, useState } from 'react';
import { ArrowRight, Search, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { shouldEnableEnhancedVisuals } from '@/utils/performance';

const MediaDepthScene = lazy(() => import('@/components/media/MediaDepthScene'));

const HeroSceneFallback = ({ items = [], stats = [] }) => {
  const fallbackItems = items.slice(0, 3);

  return (
    <div className="grid gap-4 md:grid-cols-[1.15fr_0.85fr]">
      <div className="overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.03]">
        <div className="relative aspect-[16/11]">
          {fallbackItems[0]?.thumbnailUrl || fallbackItems[0]?.previewUrl ? (
            <img
              src={fallbackItems[0].thumbnailUrl || fallbackItems[0].previewUrl}
              alt={fallbackItems[0]?.title || 'Featured media'}
              className="h-full w-full object-cover"
              decoding="async"
            />
          ) : (
            <div className="h-full w-full bg-[radial-gradient(circle_at_top_left,rgba(125,211,252,0.20),transparent_26%),linear-gradient(145deg,rgba(8,20,30,0.96),rgba(10,25,37,0.84))]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#061019] via-[#061019]/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/44">Featured Frame</p>
            <h3 className="mt-2 text-2xl text-white">{fallbackItems[0]?.title || 'Curated media picks'}</h3>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {fallbackItems.slice(1).map((item, index) => (
          <div key={item?.id || `hero-fallback-${index}`} className="overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.03]">
            <div className="relative aspect-[16/10]">
              {item?.thumbnailUrl || item?.previewUrl ? (
                <img
                  src={item.thumbnailUrl || item.previewUrl}
                  alt={item?.title || 'Curated media'}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <div className="h-full w-full bg-[linear-gradient(145deg,rgba(8,20,30,0.96),rgba(10,25,37,0.84))]" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#061019] via-[#061019]/12 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <p className="text-sm font-semibold text-white">{item?.title || 'Curated asset'}</p>
              </div>
            </div>
          </div>
        ))}

        {stats.slice(0, 2).map((metric) => (
          <div key={metric.label} className="stat-pill py-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/40">
              {metric.label}
            </span>
            <span className="font-semibold text-white">{metric.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const MediaHero = ({
  onSearch,
  onTagClick,
  trendingTags = [],
  categories = [],
  onCategorySelect,
  activeCategory = 'All',
  metrics = [],
  spotlightItems = [],
  onPrimaryAction,
  onSecondaryAction,
  searchPlaceholder = 'Search cinematic visuals, moods, or hashtags...',
  eyebrow = 'Curated Visual Archive',
  title = 'Feel the library before you browse it.',
  description = 'Move through cinematic footage, premium stills, short-form clips, and creator-ready collections in a space built to feel editorial, fast, and alive.',
  primaryLabel = 'Open Free Assets',
  secondaryLabel = 'Browse Motion',
}) => {
  const [query, setQuery] = useState('');
  const [showDepthScene, setShowDepthScene] = useState(false);
  const visibleTags = trendingTags.slice(0, 6);
  const visibleCategories = categories.slice(0, 6);

  useEffect(() => {
    if (!shouldEnableEnhancedVisuals()) {
      return undefined;
    }

    let idleId = null;

    const enableDepthScene = () => setShowDepthScene(true);

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      idleId = window.requestIdleCallback(enableDepthScene, { timeout: 2800 });
    } else {
      idleId = window.setTimeout(enableDepthScene, 2800);
    }

    return () => {
      if (typeof window !== 'undefined' && 'cancelIdleCallback' in window && typeof idleId === 'number') {
        window.cancelIdleCallback(idleId);
        return;
      }

      window.clearTimeout(idleId);
    };
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    onSearch?.(query.trim());
  };

  return (
    <section className="media-panel relative overflow-hidden rounded-[40px] px-6 py-8 md:px-10 md:py-12 xl:px-12 xl:py-14">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(125,211,252,0.16),transparent_28%),radial-gradient(circle_at_80%_18%,rgba(251,191,36,0.14),transparent_20%),linear-gradient(145deg,rgba(7,18,28,0.08),transparent)]" />

      <div className="relative z-10 grid gap-10 xl:grid-cols-[0.88fr_1.12fr] xl:items-center">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-100/88">
            <Sparkles className="h-4 w-4" />
            {eyebrow}
          </div>

          <h1 className="mt-6 max-w-4xl text-4xl leading-[0.94] text-white md:text-6xl xl:text-[4.5rem]">
            {title}
          </h1>
          <p className="media-copy mt-5 max-w-2xl">
            {description}
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-8 flex max-w-3xl flex-col gap-3 rounded-[28px] border border-white/10 bg-[#09141d]/72 p-3 backdrop-blur-md md:flex-row"
          >
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-cyan-100/60" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={searchPlaceholder}
                className="form-surface h-14 rounded-[20px] pl-12 text-base focus-visible:ring-cyan-300/50"
              />
            </div>
            <Button
              type="submit"
              className="h-14 rounded-[20px] bg-cyan-300 px-7 text-[#041b26] hover:bg-cyan-200"
            >
              <Search className="mr-2 h-4 w-4" />
              Search Archive
            </Button>
          </form>

          <div className="mt-5 flex flex-wrap gap-3">
            <Button
              type="button"
              className="rounded-full bg-cyan-300 px-5 text-[#041b26] hover:bg-cyan-200"
              onClick={() => onPrimaryAction?.()}
            >
              {primaryLabel}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-full border-white/10 bg-white/5 px-5 text-white hover:bg-white/10"
              onClick={() => onSecondaryAction?.()}
            >
              {secondaryLabel}
            </Button>
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            {metrics.slice(0, 3).map((metric) => (
              <div key={metric.label} className="stat-pill">
                <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/40">
                  {metric.label}
                </span>
                <span className="text-sm font-semibold text-white">{metric.value}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="section-frame p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/40">
                Trending Tags
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {visibleTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => onTagClick?.(tag)}
                    className="media-chip text-white/76 transition-all hover:-translate-y-0.5 hover:border-cyan-300/30 hover:text-cyan-100"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="section-frame p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/40">
                Quick Lanes
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {visibleCategories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => onCategorySelect?.(category)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                      activeCategory === category
                        ? 'bg-white/[0.92] text-[#05131c] shadow-[0_0_24px_rgba(255,255,255,0.12)]'
                        : 'border border-white/10 bg-white/[0.04] text-white/65 hover:border-cyan-300/20 hover:text-white'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="xl:pl-4">
          <div className="section-frame p-4 md:p-5">
            {showDepthScene ? (
              <Suspense fallback={<HeroSceneFallback items={spotlightItems} stats={metrics.slice(0, 3)} />}>
                <MediaDepthScene items={spotlightItems} stats={metrics.slice(0, 3)} />
              </Suspense>
            ) : (
              <HeroSceneFallback items={spotlightItems} stats={metrics.slice(0, 3)} />
            )}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-white/62">
            <div className="stat-pill py-2">
              <ArrowRight className="h-4 w-4 text-cyan-100" />
              Cleaner entry point, faster browsing.
            </div>
            {metrics.slice(3, 4).map((metric) => (
              <div key={metric.label} className="stat-pill py-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/40">
                  {metric.label}
                </span>
                <span className="font-semibold text-white">{metric.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MediaHero;
