import React from 'react';
import { useSocialPresence } from '@/hooks/useSocialPresence';
import RecentYoutubeSpotlight from '@/components/media/RecentYoutubeSpotlight';
import InstagramReelsSpotlight from '@/components/media/InstagramReelsSpotlight';

const SocialSpotlightsSection = () => {
  const {
    youtubeProfile,
    youtubeVideos,
    instagramProfile,
    instagramVideos,
  } = useSocialPresence();

  return (
    <section className="grid gap-6 lg:grid-cols-[0.94fr_1.06fr]">
      <RecentYoutubeSpotlight profile={youtubeProfile} videos={youtubeVideos} />
      <InstagramReelsSpotlight profile={instagramProfile} videos={instagramVideos} />
    </section>
  );
};

export default SocialSpotlightsSection;
