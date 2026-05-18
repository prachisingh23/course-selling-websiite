import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Cloud, Edit, Film, Image, Music, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MediaPageHeader from '@/components/media/MediaPageHeader';

const features = [
  { icon: Film, title: 'AI Animation Made Easy', description: 'Turn concepts into animated scenes with less setup and cleaner workflows.' },
  { icon: Image, title: 'Image to Video Motion', description: 'Transform still frames into moving scenes with cinematic direction.' },
  { icon: Edit, title: 'Smart Editing Tools', description: 'Refine clips, pacing, and output with creator-friendly editing steps.' },
  { icon: Cloud, title: 'Cloud Access', description: 'Keep projects and workflows accessible across devices.' },
  { icon: Zap, title: 'Fast Results', description: 'Move from prompt to usable output faster with AI-assisted generation.' },
  { icon: Music, title: 'Audio Integration', description: 'Blend music, voice, and final polish into the workflow.' },
];

const FeaturePage = ({ onNavigate }) => {
  return (
    <>
      <Helmet>
        <title>Features - Lifelapss</title>
        <meta name="description" content="Discover the platform features behind Lifelapss." />
      </Helmet>

      <div className="media-shell px-4 pb-20 pt-28 text-white lg:pt-32">
        <div className="mx-auto max-w-7xl space-y-10">
          <MediaPageHeader
            eyebrow="Platform Features"
            title="Creator tools and learning features in one clearer system"
            description="From AI-driven animation workflows to curated learning content, the platform is being shaped around practical creator needs."
            stats={[
              { label: 'Feature Areas', value: features.length },
              { label: 'Use Case', value: 'Creators' },
              { label: 'Experience', value: 'Modern' },
              { label: 'Access', value: 'Web' },
            ]}
            actions={
              <>
                <Button
                  className="rounded-full bg-cyan-300 text-[#041b26] hover:bg-cyan-200"
                  onClick={() => onNavigate('courses')}
                >
                  Explore Courses
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full border-white/10 bg-white/5 hover:bg-white/10"
                  onClick={() => onNavigate('ai-video-generation-tools')}
                >
                  AI Video Tools
                </Button>
              </>
            }
          />

          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {features.map((feature) => (
              <article key={feature.title} className="media-panel-soft p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-300/12 text-cyan-100">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h2 className="mt-5 text-2xl text-white">{feature.title}</h2>
                <p className="media-copy mt-3">{feature.description}</p>
              </article>
            ))}
          </section>

          <section className="media-panel p-8 text-center">
            <h2 className="text-4xl text-white">Built for modern creative workflows</h2>
            <p className="media-copy mx-auto mt-4 max-w-3xl">
              The redesign brings the same cleaner, darker, cinematic language across discovery, courses, blog, and support areas so the entire product feels consistent.
            </p>
          </section>
        </div>
      </div>
    </>
  );
};

export default FeaturePage;
