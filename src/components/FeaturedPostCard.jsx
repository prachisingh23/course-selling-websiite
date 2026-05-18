import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

const FeaturedPostCard = ({ post, onNavigate }) => {
  if (!post) return null;

  const title = post.title || 'Untitled Post';
  const excerpt = post.short_description || 'No description available.';
  const image = post.featured_image_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe';
  const date = post.published_at ? new Date(post.published_at).toLocaleDateString() : 'Recently';
  const readTime = `${Math.ceil((post.body?.length || 1000) / 1000)} min read`;
  const category = post.tags?.[0] || 'Featured';

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="media-panel relative mb-12 overflow-hidden rounded-[32px] p-8 md:p-10"
    >
      <img
        src={image}
        alt={title}
        className="absolute inset-0 h-full w-full object-cover opacity-[0.24]"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#061018] via-[#061018]/90 to-[#061018]/60" />

      <div className="relative z-10 max-w-3xl">
        <span className="media-chip border-amber-200/20 bg-amber-200/10 text-amber-100">
          {category}
        </span>
        <h2 className="mt-5 text-4xl leading-none text-white md:text-5xl">{title}</h2>
        <p className="media-copy mt-4 max-w-2xl text-base">{excerpt}</p>

        <div className="mt-6 flex flex-wrap items-center gap-5 text-sm text-white/56">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-cyan-100" />
            <span>{date}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-cyan-100" />
            <span>{readTime}</span>
          </div>
        </div>

        <Button
          type="button"
          onClick={() => onNavigate('blog', { id: post.id })}
          className="mt-8 rounded-full bg-cyan-300 px-6 text-[#041b26] hover:bg-cyan-200"
        >
          Read Article
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </motion.article>
  );
};

export default FeaturedPostCard;
