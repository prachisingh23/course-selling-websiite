import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import BlogPostCard from './BlogPostCard';
import { motion } from 'framer-motion';

const RelatedPostsSection = ({ currentPostId, tags, onNavigate }) => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchRelated = async () => {
      let query = supabase
        .from('articles')
        .select('*')
        .neq('id', currentPostId)
        .eq('status', 'published')
        .limit(3);

      if (tags && tags.length > 0) {
        query = query.overlaps('tags', tags);
      }

      const { data, error } = await query;
      
      if (!error && data) {
        // If not enough related posts, fetch latest
        if (data.length < 3) {
            const { data: latest } = await supabase
                .from('articles')
                .select('*')
                .neq('id', currentPostId)
                .eq('status', 'published')
                .limit(3 - data.length);
            
            if (latest) {
                setPosts([...data, ...latest]);
            } else {
                setPosts(data);
            }
        } else {
             setPosts(data);
        }
      }
    };

    fetchRelated();
  }, [currentPostId, tags]);

  if (posts.length === 0) return null;

  return (
    <div className="mt-16 pt-16 border-t border-white/10">
      <h3 className="text-3xl font-bold font-heading text-white mb-8">Related Articles</h3>
      <div className="grid md:grid-cols-3 gap-8">
        {posts.map((post, i) => (
            <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
            >
                <BlogPostCard post={post} onNavigate={onNavigate} />
            </motion.div>
        ))}
      </div>
    </div>
  );
};

export default RelatedPostsSection;