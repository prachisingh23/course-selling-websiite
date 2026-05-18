import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Bookmark,
  Download,
  Lock,
  PlayCircle,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getFavoriteKey } from '@/services/favoritesService';

const SHUFFLE_COUNT_PREFIX = 'lifelapss_shuffle_count_';

const buildDateKey = (date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const readDailyShuffleCount = (date) => {
  if (typeof window === 'undefined') {
    return 0;
  }

  const stored = window.localStorage.getItem(`${SHUFFLE_COUNT_PREFIX}${buildDateKey(date)}`);
  return Number(stored || 0);
};

const writeDailyShuffleCount = (date, count) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(`${SHUFFLE_COUNT_PREFIX}${buildDateKey(date)}`, String(count));
};

const sampleUniqueItem = (pool, usedKeys) => {
  const candidates = pool.filter((item) => !usedKeys.has(getFavoriteKey(item.type, item.id)));
  if (candidates.length === 0) {
    return null;
  }

  return candidates[Math.floor(Math.random() * candidates.length)];
};

const createShuffleSet = (items) => {
  if (!items.length) {
    return [];
  }

  const picks = [];
  const usedKeys = new Set();
  const prioritizedPools = [
    items.filter((item) => item.type === 'video'),
    items.filter((item) => item.type === 'photo'),
    items.filter((item) => item.isFree),
  ];

  prioritizedPools.forEach((pool) => {
    const picked = sampleUniqueItem(pool, usedKeys);
    if (!picked) {
      return;
    }

    usedKeys.add(getFavoriteKey(picked.type, picked.id));
    picks.push(picked);
  });

  while (picks.length < Math.min(items.length, 3)) {
    const picked = sampleUniqueItem(items, usedKeys);
    if (!picked) {
      break;
    }

    usedKeys.add(getFavoriteKey(picked.type, picked.id));
    picks.push(picked);
  }

  return picks;
};

const buildSearchQuery = (items) => {
  const tags = items.flatMap((item) => item.tags?.slice(0, 2) || []);
  if (tags.length > 0) {
    return tags.slice(0, 4).map((tag) => `#${tag}`).join(' ');
  }

  return items.map((item) => item.category).filter(Boolean).slice(0, 3).join(' ');
};

const ShuffleSpotlight = ({
  items = [],
  favoriteSet,
  onToggleFavorite,
  onDownload,
  onOpenItem,
  onOpenSearch,
}) => {
  const [shuffleVersion, setShuffleVersion] = useState(0);
  const [dailyShuffleCount, setDailyShuffleCount] = useState(() => readDailyShuffleCount(new Date()));

  useEffect(() => {
    const timer = window.setInterval(() => {
      setDailyShuffleCount(readDailyShuffleCount(new Date()));
    }, 60000);

    return () => window.clearInterval(timer);
  }, []);

  const shuffledItems = useMemo(() => createShuffleSet(items), [items, shuffleVersion]);
  const leadItem = shuffledItems[0] || null;
  const searchQuery = useMemo(() => buildSearchQuery(shuffledItems), [shuffledItems]);
  const freeCount = shuffledItems.filter((item) => item.isFree).length;

  const handleShuffle = () => {
    const now = new Date();
    const nextCount = dailyShuffleCount + 1;
    writeDailyShuffleCount(now, nextCount);
    setDailyShuffleCount(nextCount);
    setShuffleVersion((current) => current + 1);
  };

  const canDownloadLead = leadItem ? leadItem.isFree : false;
  const leadSaved = leadItem
    ? favoriteSet.has(getFavoriteKey(leadItem.type, leadItem.id))
    : false;

  return (
    <section className="media-panel relative overflow-hidden rounded-[34px]">
      <div className="absolute inset-0">
        <img
          src={leadItem?.previewUrl || leadItem?.thumbnailUrl || 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1600&q=80'}
          alt={leadItem?.title || 'Shuffle spotlight'}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,10,16,0.18),rgba(4,10,16,0.86)),radial-gradient(circle_at_top_right,rgba(251,191,36,0.16),transparent_24%),radial-gradient(circle_at_top_left,rgba(125,211,252,0.18),transparent_28%)]" />
      </div>

      <motion.div
        key={`shuffle-${shuffleVersion}-${leadItem?.id || 'empty'}`}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="relative z-10 p-6 md:p-8"
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="max-w-2xl">
            <p className="media-kicker">Shuffle Spotlight</p>
            <h2 className="mt-3 text-4xl text-white">Let the archive surprise people.</h2>
            <p className="media-copy mt-4 max-w-2xl">
              A good “surprise me” loop keeps users clicking. Every shuffle serves a fresh small set instead of making them think too hard.
            </p>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-black/20 p-4 backdrop-blur-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/42">Today&apos;s Shuffles</p>
            <p className="mt-2 text-3xl text-white">{dailyShuffleCount}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button
            className="rounded-full bg-cyan-300 text-[#041b26] hover:bg-cyan-200"
            onClick={handleShuffle}
          >
            Shuffle 3 More
            <RefreshCw className="ml-2 h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="rounded-full border-white/10 bg-white/5 hover:bg-white/10"
            onClick={() => onOpenSearch?.(searchQuery || '#cinematic')}
          >
            Open This Mix
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <div className="rounded-[24px] border border-white/10 bg-black/20 p-4 backdrop-blur-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/42">Set Size</p>
            <p className="mt-2 text-3xl text-white">{shuffledItems.length}</p>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-black/20 p-4 backdrop-blur-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/42">Free Picks</p>
            <p className="mt-2 text-3xl text-white">{freeCount}</p>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-black/20 p-4 backdrop-blur-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/42">Search Route</p>
            <p className="mt-2 text-sm font-semibold text-white">
              {searchQuery || 'Cinematic mix'}
            </p>
          </div>
        </div>

        {leadItem ? (
          <div className="mt-6 rounded-[30px] border border-white/10 bg-black/20 p-5 backdrop-blur-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-100/72">
                  Lead Pick
                </p>
                <h3 className="mt-3 text-3xl text-white">{leadItem.title}</h3>
                <p className="mt-3 text-sm leading-7 text-white/60">{leadItem.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {(leadItem.tags?.slice(0, 3) || []).map((tag) => (
                    <button
                      key={`${leadItem.id}-${tag}`}
                      type="button"
                      onClick={() => onOpenSearch?.(`#${tag}`)}
                      className="media-chip border-cyan-300/20 bg-[#0c1a24]/72 text-cyan-100 transition-all hover:-translate-y-0.5 hover:border-cyan-300/35"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  className="rounded-full border-white/10 bg-white/5 hover:bg-white/10"
                  onClick={() => onToggleFavorite?.(leadItem)}
                >
                  <Bookmark className={`mr-2 h-4 w-4 ${leadSaved ? 'fill-current' : ''}`} />
                  {leadSaved ? 'Saved' : 'Save'}
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full border-white/10 bg-white/5 hover:bg-white/10"
                  onClick={() => onOpenItem?.(leadItem)}
                >
                  {leadItem.type === 'video' ? (
                    <PlayCircle className="mr-2 h-4 w-4" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  Open Asset
                </Button>
                <Button
                  className="rounded-full bg-cyan-300 text-[#041b26] hover:bg-cyan-200"
                  onClick={() => onDownload?.(leadItem)}
                >
                  {canDownloadLead ? <Download className="mr-2 h-4 w-4" /> : <Lock className="mr-2 h-4 w-4" />}
                  {canDownloadLead ? 'Download' : 'Unlock'}
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </motion.div>

      <div className="relative z-10 border-t border-white/10 bg-black/20 p-6 md:p-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/42">Fresh Set</p>
            <h3 className="mt-2 text-2xl text-white">Three fast exits into more discovery.</h3>
          </div>
          <Button
            variant="outline"
            className="rounded-full border-white/10 bg-white/5 hover:bg-white/10"
            onClick={() => onOpenSearch?.(searchQuery || '#cinematic')}
          >
            Explore the Route
          </Button>
        </div>

        {shuffledItems.length === 0 ? (
          <div className="mt-5 rounded-[28px] border border-white/10 bg-white/[0.03] p-6 text-white/58">
            Surprise sets will appear here as soon as the archive has media to shuffle.
          </div>
        ) : (
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {shuffledItems.map((item) => {
              const isSaved = favoriteSet.has(getFavoriteKey(item.type, item.id));

              return (
                <button
                  key={`${item.type}-${item.id}`}
                  type="button"
                  onClick={() => onOpenItem?.(item)}
                  className="overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.04] text-left transition-all hover:-translate-y-1 hover:border-cyan-300/20"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={item.previewUrl}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
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
                    <div className="absolute right-4 top-4 rounded-full border border-white/10 bg-black/35 p-2 text-white/80 backdrop-blur-sm">
                      <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-current text-cyan-100' : ''}`} />
                    </div>
                  </div>

                  <div className="p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/40">
                      {item.category}
                    </p>
                    <h4 className="mt-2 line-clamp-2 text-xl text-white">{item.title}</h4>
                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-white/58">{item.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default ShuffleSpotlight;
