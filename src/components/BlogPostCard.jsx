import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

const BlogPostCard = ({ post, onNavigate }) => {
  const title = post.title || 'Untitled Post';
  const excerpt = post.short_description || 'No description available.';
  const image = post.featured_image_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe';
  const date = post.published_at ? new Date(post.published_at).toLocaleDateString() : 'Recently';
  const readTime = `${Math.ceil((post.body?.length || 1000) / 1000)} min read`;
  const category = post.tags?.[0] || 'General';

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -8 }}
      className="media-panel group flex h-full flex-col overflow-hidden rounded-[28px]"
    >
      <div className="relative h-52 overflow-hidden">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#08111a] via-[#08111a]/16 to-transparent" />
        <div className="absolute left-4 top-4">
          <span className="media-chip border-cyan-300/20 bg-[#0b1b26]/80 text-cyan-100">
            {category}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-4 flex flex-wrap items-center gap-4 text-xs uppercase tracking-[0.22em] text-white/42">
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5" />
            <span>{date}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5" />
            <span>{readTime}</span>
          </div>
        </div>

        <h3 className="text-2xl text-white">{title}</h3>
        <p className="media-copy mt-3 line-clamp-3">{excerpt}</p>

        <Button
          type="button"
          onClick={() => onNavigate('blog', { id: post.id })}
          className="mt-6 w-full rounded-full bg-cyan-300 text-[#041b26] hover:bg-cyan-200"
        >
          Read Article
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </motion.article>
  );
};

export default BlogPostCard;
