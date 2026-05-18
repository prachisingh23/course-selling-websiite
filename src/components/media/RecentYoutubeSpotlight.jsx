import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, PlayCircle, Youtube } from 'lucide-react';
import {
  buildFallbackYoutubeProfile,
  buildFallbackYoutubeVideos,
  formatCompactCount,
} from '@/services/socialStatsService';

const formatYoutubeDate = (value) =>
  value
    ? new Date(value).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
    : 'Latest';

const RecentYoutubeSpotlight = ({
  profile = buildFallbackYoutubeProfile(),
  videos = buildFallbackYoutubeVideos(),
}) => {
  const [featuredVideo, ...otherVideos] = videos;

  if (!featuredVideo) {
    return null;
  }

  return (
    <section className="media-panel relative overflow-hidden rounded-[34px] p-6 md:p-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(239,68,68,0.16),transparent_28%),radial-gradient(circle_at_85%_18%,rgba(125,211,252,0.12),transparent_24%)]" />

      <div className="relative z-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="media-kicker">Recent Videos</p>
            <h2 className="mt-3 text-4xl text-white">Latest uploads from {profile.channelName}</h2>
            <p className="media-copy mt-4 max-w-2xl">
              This block refreshes from the creator YouTube feed, so new uploads can appear here automatically after they are published.
            </p>
          </div>
          <a
            href={profile.channelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/[0.1]"
          >
            Visit {profile.channelHandle}
            <ExternalLink className="ml-2 h-4 w-4" />
          </a>
        </div>

        <div className="mt-6 rounded-[30px] border border-white/10 bg-white/[0.04] p-4 md:p-5">
          <motion.a
            href={featuredVideo.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group block overflow-hidden rounded-[24px] border border-white/10 bg-black/20 transition-transform hover:-translate-y-1"
          >
            <div className="relative aspect-[16/10] overflow-hidden">
              <img
                src={featuredVideo.thumbnailUrl}
                alt={featuredVideo.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#04131a] via-transparent to-transparent" />
              <div className="absolute left-4 top-4 inline-flex items-center rounded-full bg-black/45 px-3 py-1 text-xs font-semibold text-white">
                <Youtube className="mr-2 h-3.5 w-3.5 text-red-300" />
                {featuredVideo.source === 'live' ? 'Live upload' : 'Recent upload'}
              </div>
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/58">
                  {formatYoutubeDate(featuredVideo.publishedAt)}
                </p>
                <h3 className="mt-2 max-w-2xl text-2xl leading-8 text-white">
                  {featuredVideo.title}
                </h3>
              </div>
            </div>
            <div className="flex items-center justify-between gap-3 p-4 text-sm text-white/62">
              <span>{formatCompactCount(featuredVideo.views) || 'Open video'}</span>
              <span className="inline-flex items-center font-semibold text-cyan-100">
                Watch now
                <PlayCircle className="ml-2 h-4 w-4" />
              </span>
            </div>
          </motion.a>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {otherVideos.map((video, index) => (
              <motion.a
                key={video.id}
                href={video.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                viewport={{ once: true }}
                className="group flex gap-3 rounded-[22px] border border-white/10 bg-black/20 p-3 transition-transform hover:-translate-y-1"
              >
                <div className="h-24 w-24 shrink-0 overflow-hidden rounded-[18px]">
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/38">
                    {formatYoutubeDate(video.publishedAt)}
                  </p>
                  <h3 className="mt-2 line-clamp-2 text-base leading-6 text-white">
                    {video.title}
                  </h3>
                  <div className="mt-3 flex items-center justify-between gap-3 text-xs text-white/54">
                    <span>{formatCompactCount(video.views) || 'Open video'}</span>
                    <span className="inline-flex items-center font-semibold text-cyan-100">
                      Open
                      <ExternalLink className="ml-2 h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default RecentYoutubeSpotlight;
