import React from 'react';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MediaDepthScene from '@/components/media/MediaDepthScene';

const landingSceneItems = [
  {
    id: 'landing-video',
    title: 'Cinematic Motion',
    category: 'Motion',
    thumbnailUrl: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1200&q=80',
    isFree: false,
    price: 9,
    type: 'video',
  },
  {
    id: 'landing-photo',
    title: 'Editorial Portrait',
    category: 'Still',
    thumbnailUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80',
    isFree: true,
    type: 'photo',
  },
];

const landingStats = [
  { label: 'Motion', value: '4K + Vertical' },
  { label: 'Photos', value: 'Editorial-first' },
  { label: 'Workflow', value: 'Favorites + Library' },
];

const LandingPage = ({ onNavigate }) => {
  return (
    <>
      <Helmet>
        <title>Lifelapss - Premium Media and Learning</title>
        <meta
          name="description"
          content="Discover curated media, AI creator tools, and premium learning content through a richer, more immersive Lifelapss experience."
        />
      </Helmet>

      <div className="media-shell flex min-h-screen items-center px-4 pb-16 pt-28 text-white lg:pt-32">
        <main className="mx-auto max-w-7xl">
          <section className="media-panel relative overflow-hidden rounded-[40px] px-6 py-10 md:px-10 md:py-14">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(125,211,252,0.16),transparent_26%),radial-gradient(circle_at_85%_18%,rgba(251,191,36,0.12),transparent_20%)]" />

            <div className="relative z-10 grid gap-10 xl:grid-cols-[0.86fr_1.14fr] xl:items-center">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-100">
                  <Sparkles className="h-4 w-4" />
                  Curated Creator Platform
                </div>
                <h1 className="mt-6 max-w-4xl text-5xl leading-[0.92] text-white md:text-7xl">
                  A simpler, more immersive way to discover visuals.
                </h1>
                <p className="media-copy mt-5 max-w-2xl text-base">
                  Lifelapss brings royalty-free media, creator tools, and learning into one cleaner experience with stronger motion, faster discovery, and less clutter.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button
                    className="rounded-full bg-cyan-300 px-6 text-[#041b26] hover:bg-cyan-200"
                    onClick={() => onNavigate('home')}
                  >
                    Enter Discover
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-full border-white/10 bg-white/5 hover:bg-white/10"
                    onClick={() => onNavigate('courses')}
                  >
                    Explore Courses
                  </Button>
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  {landingStats.map((stat) => (
                    <div
                      key={stat.label}
                      className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-3"
                    >
                      <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/40">
                        {stat.label}
                      </span>
                      <span className="text-sm font-semibold text-white">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <MediaDepthScene items={landingSceneItems} stats={landingStats} />
            </div>
          </section>
        </main>
      </div>
    </>
  );
};

export default LandingPage;
