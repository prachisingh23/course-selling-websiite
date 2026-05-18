import React from 'react';
import { ArrowUpRight, Bookmark, Download, Lock, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MediaCard = ({
  item,
  saved = false,
  owned = false,
  onToggleSave,
  onDownload,
  onPreview,
  onTagSelect,
}) => {
  const canDownload = item.isFree || owned;
  const visibleTags = item.tags?.slice(0, 2) || [];

  return (
    <article className="group media-panel relative flex h-full flex-col overflow-hidden rounded-[32px] transition-transform duration-300 hover:-translate-y-2 [transform-style:preserve-3d]">
      <div className={`relative overflow-hidden ${item.type === 'video' ? 'aspect-[16/11]' : 'aspect-[4/5]'}`}>
        <img
          src={item.thumbnailUrl}
          alt={item.title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050c13] via-[#050c13]/15 to-transparent" />

        {item.type === 'photo' ? (
          <button
            type="button"
            onClick={() => onPreview?.(item)}
            className="absolute inset-0 z-[1] cursor-pointer"
            aria-label={`Preview ${item.title}`}
          />
        ) : null}

        <div className="absolute left-5 top-5 flex flex-wrap items-center gap-2">
          <span className="media-chip border-cyan-300/20 bg-[#0c1a24]/78 text-cyan-100">
            {item.category}
          </span>
          <span className="media-chip bg-black/35 text-white/78">
            {item.resolution}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onToggleSave?.(item)}
          className={`absolute right-5 top-5 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border backdrop-blur-md transition-all ${
            saved
              ? 'border-cyan-300/40 bg-cyan-400/20 text-cyan-100'
              : 'border-white/10 bg-black/30 text-white/80 hover:border-cyan-400/40 hover:text-cyan-200'
          }`}
          aria-label={saved ? 'Remove from favorites' : 'Save to favorites'}
        >
          <Bookmark className={`h-4 w-4 ${saved ? 'fill-current' : ''}`} />
        </button>

        {item.type === 'video' && (
          <button
            type="button"
            onClick={() => onPreview?.(item)}
            className="absolute inset-0 z-[1] flex items-center justify-center"
            aria-label={`Preview ${item.title}`}
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white shadow-[0_0_40px_rgba(34,211,238,0.18)] backdrop-blur-md transition-transform duration-300 group-hover:scale-110">
              <PlayCircle className="h-8 w-8" />
            </span>
          </button>
        )}

        <div className="absolute inset-x-0 bottom-0 z-[1] p-5">
          <div className="flex items-end justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/46">
                {item.type === 'video' ? 'Motion Asset' : 'Still Asset'}
              </p>
              <h3 className="mt-2 line-clamp-2 text-2xl text-white">{item.title}</h3>
            </div>
            <div className="hidden rounded-full border border-white/10 bg-black/25 px-3 py-1 text-xs font-semibold text-white/76 sm:block">
              {canDownload ? 'Ready' : 'Premium'}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-5 p-5">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs uppercase tracking-[0.28em] text-white/42">
              {owned ? 'Unlocked' : item.isFree ? 'Free License' : 'Premium License'}
            </p>
            <p className="text-sm font-semibold text-cyan-100">
              {owned ? 'Owned' : item.isFree ? 'Free' : `$${item.price.toFixed(2)}`}
            </p>
          </div>
          <p className="line-clamp-2 text-sm leading-6 text-white/60">
            {item.description}
          </p>
          {visibleTags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {visibleTags.map((tag) => (
                onTagSelect ? (
                  <button
                    key={`${item.id}-${tag}`}
                    type="button"
                    onClick={() => onTagSelect(tag, item)}
                    className="media-chip border-white/8 bg-white/[0.04] text-white/70 transition-all hover:-translate-y-0.5 hover:border-cyan-300/25 hover:text-cyan-100"
                  >
                    #{tag}
                  </button>
                ) : (
                  <span key={`${item.id}-${tag}`} className="media-chip border-white/8 bg-white/[0.04] text-white/70">
                    #{tag}
                  </span>
                )
              ))}
            </div>
          ) : null}
        </div>

        <div className="mt-auto flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white/82">{item.creatorName}</p>
            <p className="text-xs uppercase tracking-[0.24em] text-white/42">
              {item.type === 'video' ? 'Preview enabled' : canDownload ? 'Download ready' : 'Preview ready'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onPreview?.(item)}
              className="rounded-full border border-white/10 bg-white/5 px-4 text-white/72 hover:bg-white/10 hover:text-white"
            >
              Preview
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              onClick={() => onDownload?.(item)}
              className="rounded-full bg-cyan-300 px-4 text-[#041b26] hover:bg-cyan-200"
            >
              {canDownload ? <Download className="mr-2 h-4 w-4" /> : <Lock className="mr-2 h-4 w-4" />}
              {canDownload ? 'Download' : 'Unlock'}
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default MediaCard;
