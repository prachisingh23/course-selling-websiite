import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { ArrowRight, ExternalLink, Globe, Heart, LifeBuoy, Loader2, PlayCircle, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DonateNowButton from '@/components/DonateNowButton';
import MediaPageHeader from '@/components/media/MediaPageHeader';
import {
  formatSocialUpdatedAt,
  formatCompactCount,
} from '@/services/socialStatsService';
import { useSocialPresence } from '@/hooks/useSocialPresence';

const teamMembers = [
  {
    name: 'Kapil',
    role: 'AI Tech Lead',
    img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?fit=crop&w=400&h=400',
  },
  {
    name: 'Ethan Brooks',
    role: 'Creative Director',
    img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=400&h=400',
  },
];

const formatYoutubeDate = (value) =>
  value
    ? new Date(value).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
    : 'Latest';

const AboutPage = ({ onNavigate }) => {
  const {
    socialCards,
    socialMeta,
    youtubeProfile,
    youtubeVideos,
  } = useSocialPresence();

  return (
    <>
      <Helmet>
        <title>About - Lifelapss</title>
        <meta name="description" content="Meet the team behind Lifelapss and learn about our mission." />
      </Helmet>

      <div className="media-shell px-4 pb-20 pt-28 text-white lg:pt-32">
        <div className="mx-auto max-w-7xl space-y-10">
          <MediaPageHeader
            eyebrow="About Us"
            title="A curated creator platform built around learning, media, and support"
            description="Lifelapss is evolving into a cleaner media and education product while keeping its mission intact: help creators access better tools, better workflows, and better opportunities."
            stats={[
              { label: 'Students Reached', value: '12k+' },
              { label: 'Countries', value: '45+' },
              { label: 'Core Team', value: teamMembers.length },
              { label: 'Mission', value: 'Open' },
            ]}
            actions={
              <>
                <DonateNowButton onClick={() => onNavigate('donate')}>Support Our Mission</DonateNowButton>
                <Button
                  variant="outline"
                  className="rounded-full border-white/10 bg-white/5 hover:bg-white/10"
                  onClick={() => onNavigate('courses')}
                >
                  Explore Courses
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </>
            }
          />

          <section id="social-links" className="media-panel overflow-hidden p-6 md:p-8">
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <p className="media-kicker">Community</p>
                <h2 className="mt-3 text-4xl text-white">Follow Lifelapss on Instagram, YouTube, and Facebook</h2>
                <p className="media-copy mt-4 max-w-2xl">
                  This section automatically refreshes the main Lifelapss social channels, follower counts, and creator activity so visitors can follow the brand and stay up to date across platforms.
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
                  <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-white/72">
                    {socialMeta.loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Refreshing social stats
                      </>
                    ) : socialMeta.hasLiveStats ? (
                      'Auto-updates every 2 hours'
                    ) : (
                      '2-hour refresh ready'
                    )}
                  </span>
                  <span className="text-white/50">
                    Shared update window for Home and About
                  </span>
                  {socialMeta.lastUpdated ? (
                    <span className="text-white/50">
                      Updated {formatSocialUpdatedAt(socialMeta.lastUpdated)}
                    </span>
                  ) : null}
                </div>
                {socialMeta.error ? (
                  <p className="mt-3 text-sm text-amber-200/82">
                    {socialMeta.error}
                  </p>
                ) : null}
                <div className="mt-6 flex flex-wrap gap-3">
                  <a
                    href={youtubeProfile.channelUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center rounded-full bg-cyan-300 px-5 py-3 text-sm font-semibold text-[#041b26] transition-colors hover:bg-cyan-200"
                  >
                    Open {youtubeProfile.channelHandle}
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {socialCards.map((link, index) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="media-panel-soft rounded-[24px] p-5 transition-transform hover:-translate-y-1"
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.06 }}
                      viewport={{ once: true }}
                    >
                      <link.icon className={`h-8 w-8 ${link.color}`} />
                      <h3 className="mt-4 text-xl text-white">{link.name}</h3>
                      <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/42">
                        {link.metricLabel}
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-white">{link.metricValue}</p>
                      <p className="mt-2 text-sm text-cyan-100/78">{link.detailValue}</p>
                      <p className="mt-2 text-sm text-white/50">{link.handle}</p>
                      <div className="mt-4 inline-flex items-center text-sm font-semibold text-cyan-100">
                        {link.ctaLabel}
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </div>
                      <p className="mt-3 text-xs text-white/34">
                        {link.isLive ? 'Auto-refreshes every 2 hours' : 'Profile link shown while live sync is unavailable'}
                      </p>
                    </motion.div>
                  </a>
                ))}
              </div>
            </div>
          </section>

          <section className="space-y-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="media-kicker">Creator YouTube</p>
                <h2 className="mt-3 text-4xl text-white">
                  Latest uploads from {youtubeProfile.channelName}
                </h2>
                <p className="media-copy mt-4 max-w-3xl">
                  The About page now highlights {youtubeProfile.channelHandle} directly with recent uploads, thumbnail previews, and fast links back to the creator channel.
                </p>
              </div>
              <a
                href={youtubeProfile.channelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/[0.1]"
              >
                Visit Channel
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </div>

            <div className="media-panel rounded-[32px] p-6 md:p-8">
              <div className="flex flex-col gap-4 border-b border-white/10 pb-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.28em] text-red-200/72">
                    {youtubeProfile.channelHandle}
                  </p>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-white/62">
                    {youtubeProfile.description}
                  </p>
                </div>
                <div className="rounded-[24px] border border-white/10 bg-white/[0.04] px-5 py-4 text-sm text-white/70">
                  {socialMeta.loading
                    ? 'Refreshing YouTube uploads...'
                    : `${formatCompactCount(youtubeProfile.videoCount) || youtubeVideos.length} videos on the channel`}
                </div>
              </div>

              <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
                {youtubeVideos.map((video, index) => (
                  <motion.a
                    key={video.id}
                    href={video.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    viewport={{ once: true }}
                    className="group media-panel-soft overflow-hidden rounded-[24px] transition-transform hover:-translate-y-1"
                  >
                    <div className="relative aspect-[9/16] overflow-hidden">
                      <img
                        src={video.thumbnailUrl}
                        alt={video.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#04131a] via-transparent to-transparent" />
                      <div className="absolute left-4 top-4 inline-flex items-center rounded-full bg-black/45 px-3 py-1 text-xs font-semibold text-white">
                        <PlayCircle className="mr-2 h-3.5 w-3.5" />
                        {video.source === 'live' ? 'Live from YouTube' : 'Watch on YouTube'}
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/38">
                        {formatYoutubeDate(video.publishedAt)}
                      </p>
                      <h3 className="mt-3 line-clamp-3 text-lg leading-7 text-white">
                        {video.title}
                      </h3>
                      <div className="mt-4 flex items-center justify-between text-sm text-white/54">
                        <span>{formatCompactCount(video.views) || 'Open video'}</span>
                        <span className="inline-flex items-center font-semibold text-cyan-100">
                          Open
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </span>
                      </div>
                    </div>
                  </motion.a>
                ))}
              </div>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-3">
            <div className="media-panel-soft p-6">
              <Globe className="h-8 w-8 text-cyan-100" />
              <h2 className="mt-4 text-2xl text-white">Global Reach</h2>
              <p className="media-copy mt-3">
                We build for creators across regions, with free education and practical media workflows that scale.
              </p>
            </div>
            <div className="media-panel-soft p-6">
              <Users className="h-8 w-8 text-cyan-100" />
              <h2 className="mt-4 text-2xl text-white">Creator Focus</h2>
              <p className="media-copy mt-3">
                The platform is designed around real use cases: searching media, learning skills, and unlocking useful assets.
              </p>
            </div>
            <div className="media-panel-soft p-6">
              <Heart className="h-8 w-8 text-amber-200" />
              <h2 className="mt-4 text-2xl text-white">Mission Driven</h2>
              <p className="media-copy mt-3">
                Donations and community support help keep educational content and platform improvements moving forward.
              </p>
            </div>
          </section>

          <section className="space-y-5">
            <div>
              <p className="media-kicker">Meet the Team</p>
              <h2 className="mt-3 text-4xl text-white">The people shaping the platform</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {teamMembers.map((member, index) => (
                <motion.article
                  key={member.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  viewport={{ once: true }}
                  className="media-panel-soft flex flex-col gap-5 p-6 md:flex-row md:items-center"
                >
                  <img src={member.img} alt={member.name} className="h-28 w-28 rounded-full border border-white/10 object-cover" />
                  <div>
                    <p className="media-kicker">{member.role}</p>
                    <h3 className="mt-3 text-3xl text-white">{member.name}</h3>
                    <p className="media-copy mt-3">
                      Building creator workflows that blend media discovery, storytelling, and practical AI education.
                    </p>
                  </div>
                </motion.article>
              ))}
            </div>
          </section>

          <footer className="flex flex-col gap-4 border-t border-white/10 pt-8 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2 text-white/48">
              <LifeBuoy className="h-4 w-4" />
              <button onClick={() => onNavigate('help')} className="transition-colors hover:text-white">
                Help & Support
              </button>
            </div>
            <p className="text-sm text-white/38">© {new Date().getFullYear()} Lifelapss. All rights reserved.</p>
          </footer>
        </div>
      </div>
    </>
  );
};

export default AboutPage;
