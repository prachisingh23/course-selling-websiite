import React from 'react';
import MediaDepthScene from '@/components/media/MediaDepthScene';

const MediaPageHeader = ({
  eyebrow,
  title,
  description,
  stats = [],
  actions = null,
  imageUrl = '',
}) => {
  const visibleStats = stats.slice(0, 4);
  const sceneItems = imageUrl ? [{
    id: 'header-hero',
    title,
    category: eyebrow,
    thumbnailUrl: imageUrl,
    previewUrl: imageUrl,
    isFree: true,
    type: 'photo',
  }] : [];

  return (
    <section className="media-panel relative overflow-hidden rounded-[38px] px-6 py-8 md:px-8 md:py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(125,211,252,0.14),transparent_24%),radial-gradient(circle_at_80%_20%,rgba(251,191,36,0.12),transparent_20%)]" />

      <div className="relative grid gap-8 xl:grid-cols-[0.86fr_1.14fr] xl:items-center">
        <div className="max-w-2xl">
          <p className="media-kicker">{eyebrow}</p>
          <h1 className="mt-4 text-4xl leading-[0.94] text-white md:text-5xl xl:text-6xl">
            {title}
          </h1>
          <p className="media-copy mt-4 max-w-2xl">{description}</p>
          {actions ? <div className="mt-8 flex flex-wrap gap-3">{actions}</div> : null}

          {visibleStats.length > 0 ? (
            <div className="mt-6 flex flex-wrap gap-3">
              {visibleStats.map((stat) => (
                <div
                  key={stat.label}
                  className="stat-pill"
                >
                  <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/40">
                    {stat.label}
                  </span>
                  <span className="text-sm font-semibold text-white">{stat.value}</span>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="xl:pl-4">
          <div className="section-frame p-4 md:p-5">
            <MediaDepthScene items={sceneItems} stats={visibleStats.slice(0, 2)} compact />
          </div>
        </div>
      </div>
    </section>
  );
};

export default MediaPageHeader;
