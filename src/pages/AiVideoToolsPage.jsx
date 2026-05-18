import React from 'react';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, CheckCircle, HelpCircle, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MediaPageHeader from '@/components/media/MediaPageHeader';
import { toast } from '@/components/ui/use-toast';

const tools = [
  { name: 'Runway', overview: 'Professional suite for AI-powered video editing and generation.', pros: ['High-quality output', 'Advanced controls'], cons: ['Steeper learning curve', 'Can be expensive'], link: 'https://runwayml.com/' },
  { name: 'Pika Labs', overview: 'Expressive text-to-video workflows with strong cinematic motion.', pros: ['Highly creative', 'User-friendly'], cons: ['Limited clip length', 'Still evolving'], link: 'https://pika.art/' },
  { name: 'Synthesia', overview: 'Professional AI avatar video platform for training and presentations.', pros: ['Realistic avatars', 'Multi-language support'], cons: ['Subscription based', 'Less creative freedom'], link: 'https://www.synthesia.io/' },
  { name: 'DeepBrain AI', overview: 'Hyper-realistic presenter videos for instructional and business use cases.', pros: ['Custom avatars', 'Interactive features'], cons: ['Higher premium cost', 'Requires prepared scripts'], link: 'https://www.deepbrain.io/' },
  { name: 'Veed.io', overview: 'Fast online editor with AI tooling for creators and social media teams.', pros: ['Easy to use', 'Great for social'], cons: ['Watermark on free plan', 'Render times vary'], link: 'https://www.veed.io/' },
];

const faqs = [
  { q: 'Can AI really create full videos?', a: 'Yes. Modern text-to-video tools can generate usable clips from prompts, then you can combine them into longer edits.' },
  { q: 'Which tool is best for YouTube?', a: 'That depends on your workflow. Avatar-first channels often prefer Synthesia, while editing-heavy creators lean toward Runway or Veed.' },
  { q: 'Can I make money with AI videos?', a: 'Yes. Many creators use AI tools for faceless channels, client work, ads, explainers, and short-form content.' },
];

const AiVideoToolsPage = ({ onNavigate }) => {
  return (
    <>
      <Helmet>
        <title>AI Video Generation Tools - Lifelapss</title>
        <meta name="description" content="Explore the best AI video generation tools for 2025." />
      </Helmet>

      <div className="media-shell px-4 pb-20 pt-28 text-white lg:pt-32">
        <div className="mx-auto max-w-7xl space-y-10">
          <MediaPageHeader
            eyebrow="AI Video Tools"
            title="A cleaner guide to the current AI video tool landscape"
            description="Compare the most relevant AI video tools for prompt-based creation, editing, presentation workflows, and creator output."
            stats={[
              { label: 'Tools Listed', value: tools.length },
              { label: 'Focus', value: 'Video AI' },
              { label: 'Updated', value: 'Curated' },
              { label: 'Audience', value: 'Creators' },
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
                  onClick={() => onNavigate('blog')}
                >
                  Read Insights
                </Button>
              </>
            }
          />

          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {tools.map((tool) => (
              <article key={tool.name} className="media-panel-soft p-6">
                <h2 className="text-2xl text-white">{tool.name}</h2>
                <p className="media-copy mt-3">{tool.overview}</p>

                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-100/74">Pros</h3>
                    <ul className="mt-3 space-y-2">
                      {tool.pros.map((pro) => (
                        <li key={pro} className="flex items-start gap-2 text-sm text-white/66">
                          <CheckCircle className="mt-0.5 h-4 w-4 text-cyan-100" />
                          <span>{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-200/74">Cons</h3>
                    <ul className="mt-3 space-y-2">
                      {tool.cons.map((con) => (
                        <li key={con} className="flex items-start gap-2 text-sm text-white/66">
                          <HelpCircle className="mt-0.5 h-4 w-4 text-amber-200" />
                          <span>{con}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <a href={tool.link} target="_blank" rel="noopener noreferrer">
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-6 w-full rounded-full border-white/10 bg-white/5 hover:bg-white/10"
                  >
                    Visit Website
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </a>
              </article>
            ))}
          </section>
          <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="media-panel-soft p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-cyan-300/12 p-2 text-cyan-100">
                  <Zap className="h-5 w-5" />
                </div>
                <h2 className="text-2xl text-white">Why creators use AI video tools</h2>
              </div>
              <p className="media-copy mt-4">
                Faster concept-to-output time, lower production cost, and easier scaling across short-form, ads, explainers, and client work.
              </p>
              <p className="media-copy mt-3">
                The best choice depends on whether you care more about cinematic prompting, avatar presenters, or fast editing.
              </p>
            </div>

            <div className="media-panel-soft p-6">
              <h2 className="text-2xl text-white">Frequently Asked Questions</h2>
              <div className="mt-5 space-y-4">
                {faqs.map((faq) => (
                  <div key={faq.q} className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
                    <h3 className="font-semibold text-white">{faq.q}</h3>
                    <p className="mt-2 text-sm leading-7 text-white/62">{faq.a}</p>
                  </div>
                ))}
              </div>
              <p className="mt-5 text-sm text-white/48">
                For deeper tactical coverage, check our blog and course material.
              </p>
            </div>
          </section>

          <section className="media-panel p-8 text-center">
            <h2 className="text-4xl text-white">Start creating with better tools and better guidance</h2>
            <p className="media-copy mx-auto mt-4 max-w-3xl">
              Use the tool guide for research, then continue into courses and insights when you want structured learning.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button className="rounded-full bg-cyan-300 text-[#041b26] hover:bg-cyan-200" onClick={() => onNavigate('courses')}>
                Explore AI Tools & Tutorials
              </Button>
              <Button
                variant="outline"
                className="rounded-full border-white/10 bg-white/5 hover:bg-white/10"
                onClick={() => toast({ title: 'Guide Saved', description: 'Use the blog and course pages for deeper exploration.' })}
              >
                Save This Guide
              </Button>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default AiVideoToolsPage;
