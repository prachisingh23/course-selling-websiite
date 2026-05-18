import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Layers3, PlayCircle, Sparkles } from 'lucide-react';

const fallbackCards = [
  {
    id: 'scene-1',
    title: 'Cinematic Motion',
    category: 'Video',
    image: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1200&q=80',
    meta: '4K motion',
  },
  {
    id: 'scene-2',
    title: 'Editorial Portraits',
    category: 'Photo',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80',
    meta: 'Portrait set',
  },
  {
    id: 'scene-3',
    title: 'Neon City Layers',
    category: 'Collection',
    image: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1200&q=80',
    meta: 'Night textures',
  },
];

const MediaDepthScene = ({
  items = [],
  stats = [],
  compact = false,
}) => {
  const sceneCards = Array.from({ length: 3 }, (_, index) => {
    const item = items[index] || fallbackCards[index];

    return {
      id: item?.id || `scene-${index}`,
      title: item?.title || fallbackCards[index]?.title || 'Curated asset',
      category: item?.category || fallbackCards[index]?.category || 'Media',
      image: item?.thumbnailUrl || item?.previewUrl || item?.image || fallbackCards[index]?.image,
      meta: item?.isFree
        ? 'Free unlock'
        : item?.price
          ? `$${Number(item.price).toFixed(2)}`
          : fallbackCards[index]?.meta || 'Premium',
      type: item?.type || (index === 0 ? 'video' : 'photo'),
    };
  });

  const metricPills = stats.slice(0, compact ? 2 : 3);

  return (
    <div className={`relative mx-auto w-full ${compact ? 'max-w-[460px]' : 'max-w-[560px]'}`}>
      <div className="absolute inset-0 rounded-[40px] bg-[radial-gradient(circle_at_center,rgba(125,211,252,0.28),transparent_42%),radial-gradient(circle_at_80%_20%,rgba(251,191,36,0.22),transparent_28%)] blur-3xl" />

      <div className={`relative ${compact ? 'aspect-[1/1.02]' : 'aspect-[1.04/1]'} [perspective:2200px]`}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, ease: 'linear', duration: compact ? 22 : 28 }}
          className="absolute inset-[9%] rounded-[42px] border border-cyan-200/15"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, ease: 'linear', duration: compact ? 18 : 22 }}
          className="absolute inset-[20%] rounded-[36px] border border-amber-200/12"
        />

        <motion.div
          animate={{ y: [0, -14, 0], x: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
          className="absolute left-[4%] top-[10%] h-20 w-20 rounded-full border border-white/10 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.92),rgba(125,211,252,0.55)_28%,rgba(8,24,35,0.08)_72%)] blur-[1px]"
        />
        <motion.div
          animate={{ y: [0, 12, 0], x: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 9, ease: 'easeInOut' }}
          className="absolute bottom-[12%] right-[6%] h-16 w-16 rounded-full border border-white/10 bg-[radial-gradient(circle_at_35%_35%,rgba(255,255,255,0.86),rgba(251,191,36,0.52)_30%,rgba(7,17,27,0.08)_72%)]"
        />

        <div className="absolute inset-x-[14%] bottom-[11%] h-[18%] rounded-[999px] bg-[radial-gradient(circle,rgba(125,211,252,0.22),rgba(8,24,35,0)_72%)] blur-2xl" />
        <div className="absolute inset-x-[18%] bottom-[8%] h-[15%] rounded-[999px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.01))] opacity-60 [transform:perspective(900px)_rotateX(72deg)]" />

        <motion.div
          initial={{ opacity: 0, y: 16, rotateX: 6, rotateY: -10 }}
          animate={{ opacity: 1, y: 0, rotateX: 6, rotateY: -10 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="absolute left-[17%] top-[12%] z-20 w-[56%] overflow-hidden rounded-[30px] border border-white/12 bg-[#0a1822]/88 shadow-[0_42px_100px_rgba(1,6,11,0.42)] [transform-style:preserve-3d]"
        >
          <div className="relative aspect-[4/5]">
            <img
              src={sceneCards[0].image}
              alt={sceneCards[0].title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#061019] via-[#061019]/18 to-transparent" />
            <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/10 bg-black/25 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-cyan-100/88 backdrop-blur-md">
              {sceneCards[0].type === 'video' ? <PlayCircle className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
              {sceneCards[0].category}
            </div>
            <div className="absolute inset-x-0 bottom-0 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/48">
                Featured Frame
              </p>
              <div className="mt-2 flex items-end justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="line-clamp-2 text-2xl text-white">{sceneCards[0].title}</h3>
                  <p className="mt-1 text-xs uppercase tracking-[0.22em] text-white/54">{sceneCards[0].meta}</p>
                </div>
                <div className="rounded-full border border-white/10 bg-black/25 p-3 text-cyan-100">
                  <ArrowUpRight className="h-4 w-4" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 12, y: 18, rotateX: 10, rotateY: 18 }}
          animate={{ opacity: 1, x: 0, y: 0, rotateX: 10, rotateY: 18 }}
          transition={{ duration: 0.7, delay: 0.12, ease: 'easeOut' }}
          className="absolute right-[8%] top-[20%] z-10 w-[32%] overflow-hidden rounded-[26px] border border-white/10 bg-[#0a1822]/82 shadow-[0_26px_80px_rgba(1,6,11,0.34)]"
        >
          <div className="relative aspect-[4/5]">
            <img
              src={sceneCards[1].image}
              alt={sceneCards[1].title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#061019] via-[#061019]/22 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4">
              <p className="truncate text-sm font-semibold text-white">{sceneCards[1].title}</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-white/52">{sceneCards[1].meta}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -10, y: 16, rotateX: -6, rotateY: -16 }}
          animate={{ opacity: 1, x: 0, y: 0, rotateX: -6, rotateY: -16 }}
          transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
          className="absolute bottom-[10%] left-[6%] z-30 w-[40%] rounded-[26px] border border-white/10 bg-[#0a1822]/86 p-4 shadow-[0_28px_90px_rgba(1,6,11,0.38)]"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="rounded-full border border-white/10 bg-white/6 p-3 text-amber-100">
              <Layers3 className="h-4 w-4" />
            </div>
            <span className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/62">
              Stack
            </span>
          </div>
          <h3 className="mt-4 text-lg text-white">{sceneCards[2].title}</h3>
          <p className="mt-1 text-xs uppercase tracking-[0.22em] text-white/46">{sceneCards[2].category}</p>
          <p className="mt-3 text-sm leading-6 text-white/62">
            Layered visuals, clean depth, and a faster sense of discovery in one glance.
          </p>
        </motion.div>

        {metricPills.length > 0 ? (
          <div className="absolute bottom-[8%] right-[8%] z-30 flex flex-col gap-2">
            {metricPills.map((metric) => (
              <div
                key={metric.label}
                className="rounded-full border border-white/10 bg-[#081520]/84 px-4 py-2 text-right shadow-[0_14px_42px_rgba(1,6,11,0.3)] backdrop-blur-md"
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/42">{metric.label}</p>
                <p className="mt-1 text-sm font-semibold text-white">{metric.value}</p>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default MediaDepthScene;
