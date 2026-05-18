import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/customSupabaseClient';
import BlogPostCard from '@/components/BlogPostCard';
import FeaturedPostCard from '@/components/FeaturedPostCard';
import BlogCategoryFilter from '@/components/BlogCategoryFilter';
import BlogSearchBar from '@/components/BlogSearchBar';
import DonateNowButton from '@/components/DonateNowButton';
import MediaPageHeader from '@/components/media/MediaPageHeader';

const BlogPage = ({ onNavigate }) => {
  const [posts, setPosts] = useState([]);
  const [featuredPost, setFeaturedPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const hardcodedPosts = [
    {
      id: 1,
      title: 'What is AI Animation? Complete Beginner’s Guide (2025)',
      short_description: 'Learn what AI animation is, how it works, and the best tools to get started with in 2025.',
      featured_image_url: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      tags: ['Tutorials'],
      published_at: new Date().toISOString(),
    },
    {
      id: 2,
      title: 'How to Create Animation from Images Using AI',
      short_description: 'Turn your static images into dynamic animations using AI tools like Lifelapss and Kaiber.',
      featured_image_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      tags: ['Tutorials'],
      published_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 3,
      title: 'Top 5 AI Animation Tools You Must Try in 2025',
      short_description: 'Discover the best AI animation tools of 2025 like Lifelapss, Runway ML, and Pika Labs.',
      featured_image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      tags: ['AI Tools'],
      published_at: new Date(Date.now() - 172800000).toISOString(),
    },
    {
      id: 4,
      title: 'The Future of AI Animation',
      short_description: 'Explore how AI is transforming the animation industry and empowering creators.',
      featured_image_url: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      tags: ['Industry News'],
      published_at: new Date(Date.now() - 259200000).toISOString(),
    },
  ];

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (!error && data && data.length > 0) {
        setFeaturedPost(data[0]);
        setPosts(data.slice(1));
      } else {
        setFeaturedPost(hardcodedPosts[0]);
        setPosts(hardcodedPosts.slice(1));
      }
      setLoading(false);
    };

    fetchPosts();
  }, []);

  const filteredPosts = useMemo(
    () =>
      posts.filter((post) => {
        const matchesCategory = activeCategory === 'All' || post.tags?.includes(activeCategory);
        const matchesSearch =
          post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.short_description?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      }),
    [activeCategory, posts, searchQuery]
  );

  const stats = [
    { label: 'Published Posts', value: posts.length + (featuredPost ? 1 : 0) },
    { label: 'Visible Results', value: filteredPosts.length },
    { label: 'Active Topic', value: activeCategory === 'All' ? 'All' : activeCategory },
    { label: 'Curated Reads', value: 'Weekly' },
  ];

  return (
    <>
      <Helmet>
        <title>Blog - Lifelapss</title>
        <meta name="description" content="Stay updated with the latest in AI video generation, tutorials, and industry insights." />
      </Helmet>

      <div className="media-shell px-4 pb-16 pt-28 text-white lg:pt-32">
        <main className="mx-auto max-w-7xl space-y-8">
          <MediaPageHeader
            eyebrow="Insights"
            title="Tutorials, analysis, and practical notes from the AI creation space"
            description="Read expert breakdowns, product thinking, and creative workflows across AI video, media, and creator tools."
            imageUrl={featuredPost?.featured_image_url}
            stats={stats}
            actions={
              <>
                <Button
                  variant="outline"
                  className="rounded-full border-white/10 bg-white/5 hover:bg-white/10"
                  onClick={() => onNavigate('home')}
                >
                  Back to Discover
                </Button>
                <DonateNowButton onClick={() => onNavigate('donate')}>
                  Support Our Writers
                </DonateNowButton>
              </>
            }
          />

          {loading ? (
            <div className="media-panel flex min-h-[280px] items-center justify-center">
              <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-cyan-200" />
            </div>
          ) : (
            <>
              {activeCategory === 'All' && !searchQuery ? (
                <FeaturedPostCard post={featuredPost} onNavigate={onNavigate} />
              ) : null}

              <BlogSearchBar onSearch={setSearchQuery} />
              <BlogCategoryFilter activeCategory={activeCategory} onCategoryChange={setActiveCategory} />

              <motion.div layout className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence>
                  {filteredPosts.map((post) => (
                    <motion.div
                      layout
                      key={post.id}
                      initial={{ opacity: 0, scale: 0.94 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.94 }}
                      transition={{ duration: 0.25 }}
                    >
                      <BlogPostCard post={post} onNavigate={onNavigate} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>

              {filteredPosts.length === 0 ? (
                <div className="media-panel flex min-h-[220px] flex-col items-center justify-center text-center">
                  <h3 className="text-2xl text-white">No posts matched that filter</h3>
                  <p className="media-copy mt-2">Clear the current search or category to widen the results.</p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setActiveCategory('All');
                      setSearchQuery('');
                    }}
                    className="mt-5 rounded-full border-white/10 bg-white/5 hover:bg-white/10"
                  >
                    Clear Filters
                  </Button>
                </div>
              ) : null}
            </>
          )}
        </main>
      </div>
    </>
  );
};

export default BlogPage;
