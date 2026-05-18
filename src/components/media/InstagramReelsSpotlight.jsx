import React from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  ExternalLink,
  Instagram,
  PlayCircle,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { buildFallbackInstagramProfile } from '@/services/socialStatsService';

const formatInstagramDate = (value) =>
  value
    ? new Date(value).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
    : 'Instagram';

const InstagramReelsSpotlight = ({
  profile = buildFallbackInstagramProfile(),
  videos = [],
}) => {
  const hasVideoCards = videos.length > 0;
  return (
    <section className="media-panel relative overflow-hidden rounded-[34px]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(236,72,153,0.18),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(249,115,22,0.16),transparent_24%),linear-gradient(180deg,rgba(5,10,16,0.9),rgba(5,10,16,0.96))]" />

      <div className="relative z-10 p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="max-w-2xl">
            <p className="media-kicker">Instagram Videos</p>
            <h2 className="mt-3 text-4xl text-white">Watch {profile.handle} on Instagram</h2>
            <p className="media-copy mt-4 max-w-2xl">
              This block refreshes from Instagram profile data, so follower counts and the creator profile section can update without manual edits.
            </p>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-black/20 p-4 backdrop-blur-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/42">Public Profile</p>
            <p className="mt-2 text-2xl text-white">{profile.followers}</p>
            <p className="mt-1 text-sm text-white/54">Followers on {profile.statsCapturedOn}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button
            className="rounded-full bg-cyan-300 text-[#041b26] hover:bg-cyan-200"
            onClick={() => window.open(profile.reelsUrl, '_blank', 'noopener,noreferrer')}
          >
            Open Reels
            <PlayCircle className="ml-2 h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="rounded-full border-white/10 bg-white/5 hover:bg-white/10"
            onClick={() => window.open(profile.profileUrl, '_blank', 'noopener,noreferrer')}
          >
            Open Instagram
            <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <div className="rounded-[24px] border border-white/10 bg-black/20 p-4 backdrop-blur-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/42">Followers</p>
            <p className="mt-2 text-3xl text-white">{profile.followers}</p>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-black/20 p-4 backdrop-blur-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/42">Posts</p>
            <p className="mt-2 text-3xl text-white">{profile.posts}</p>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-black/20 p-4 backdrop-blur-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/42">Following</p>
            <p className="mt-2 text-3xl text-white">{profile.following}</p>
          </div>
        </div>

        <div className="mt-6 rounded-[30px] border border-white/10 bg-black/20 p-5 backdrop-blur-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-pink-100/74">
                Instagram Spotlight
              </p>
              <h3 className="mt-3 text-3xl text-white">{profile.name}</h3>
              <p className="mt-3 text-sm leading-7 text-white/62">{profile.bio}</p>
            </div>
            <a
              href={profile.profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/[0.1]"
            >
              Visit {profile.handle}
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </div>
        </div>
      </div>

      <div className="relative z-10 border-t border-white/10 bg-black/20 p-6 md:p-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/42">
              {hasVideoCards ? 'Recent Instagram Videos' : 'Instagram Entry Points'}
            </p>
            <h3 className="mt-2 text-2xl text-white">
              {hasVideoCards
                ? 'Latest Instagram media can refresh here automatically.'
                : 'Move people from the homepage into the Instagram video funnel.'}
            </h3>
          </div>
          <a
            href={profile.reelsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            Open reel feed
            <ExternalLink className="ml-2 h-4 w-4" />
          </a>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {videos.map((item, index) => (
            <motion.a
              key={item.id}
              href={item.permalink}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              viewport={{ once: true }}
              className="overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.04] transition-all hover:-translate-y-1 hover:border-pink-300/22"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <img
                  src={item.thumbnailUrl || profile.profileImageUrl}
                  alt={item.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#040b11] via-transparent to-transparent" />
                <div className="absolute left-4 top-4 flex items-center gap-2">
                  <span className="media-chip border-white/10 bg-black/35 text-white/78">
                    {item.source === 'live' ? 'Live Media' : 'Profile Link'}
                  </span>
                </div>
              </div>
              <div className="p-5 text-left">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/40">
                  {formatInstagramDate(item.publishedAt)}
                </p>
                <h4 className="mt-2 line-clamp-2 text-xl text-white">{item.title}</h4>
                <p className="mt-3 line-clamp-2 text-sm leading-6 text-white/58">{item.description}</p>
                <div className="mt-4 inline-flex items-center text-sm font-semibold text-cyan-100">
                  Open
                  <ExternalLink className="ml-2 h-4 w-4" />
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InstagramReelsSpotlight;
