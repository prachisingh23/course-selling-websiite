import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/lib/customSupabaseClient';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReadingProgressBar from '@/components/ReadingProgressBar';
import SharePostSection from '@/components/SharePostSection';
import RelatedPostsSection from '@/components/RelatedPostsSection';
import BlogCommentSection from '@/components/BlogCommentSection';
import DonationCTA from '@/components/DonationCTA';
import PremiumBlogPostLayout from '@/components/PremiumBlogPostLayout';
import { sanitizeHtml } from '@/utils/sanitizeHtml';

const BlogPostPage = ({ onNavigate, postId }) => {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  const fallbackPost = {
    id: 999,
    title: 'What is AI Animation? Complete Beginner’s Guide (2025)',
    short_description:
      'Learn what AI animation is, how it works, and the best tools to get started with in 2025, even if you are a complete beginner.',
    body: `
      <p class="mb-6 text-lg leading-relaxed text-white/70">Artificial Intelligence is reshaping the creative industry, and animation is at the front of that shift. In this guide, we explore how AI tools are lowering the barrier to high-quality motion work for creators at every level.</p>
      <h2 class="text-3xl font-bold text-white mt-12 mb-6">The Rise of Generative Video</h2>
      <p class="mb-6 text-lg leading-relaxed text-white/70">Generative video models like Sora, Runway Gen-2, and Pika have changed the workflow. Instead of keyframing every movement, creators can describe scenes with prompts or reference images and generate motion in seconds.</p>
      <blockquote class="border-l-4 border-cyan-300 pl-6 my-10 italic text-xl text-white bg-white/5 p-6 rounded-r-xl">The barrier to entry for high-quality animation has never been lower. It is about empowering artists with more possibilities.</blockquote>
      <h2 class="text-3xl font-bold text-white mt-12 mb-6">Getting Started with AI Animation</h2>
      <p class="mb-6 text-lg leading-relaxed text-white/70">To begin, you do not need expensive hardware. Most leading tools run in the cloud. Focus on choosing a platform, learning prompt structure, and understanding post-processing.</p>
      <ul class="list-disc pl-6 mb-8 space-y-2 text-white/68">
        <li>Choose your platform</li>
        <li>Master prompt engineering</li>
        <li>Understand style consistency</li>
        <li>Learn post-processing techniques</li>
      </ul>
    `,
    featured_image_url:
      'https://images.unsplash.com/photo-1501504905252-473c47e087f8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    tags: ['AI', 'Animation', 'Guide'],
    published_at: new Date().toISOString(),
    user_id: '123',
  };

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      if (postId) {
        const { data, error } = await supabase.from('articles').select('*').eq('id', postId).single();

        if (!error && data) {
          setPost(data);
        } else if (postId === 1 || postId === '1') {
          setPost(fallbackPost);
        }
      }
      setLoading(false);
    };

    fetchPost();
  }, [postId]);

  const activePost = post || fallbackPost;
  const readTime = Math.ceil((activePost.body?.length || 1000) / 1000);
  const sanitizedBody = useMemo(() => sanitizeHtml(activePost.body), [activePost.body]);

  if (loading) {
    return (
      <div className="media-shell flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-cyan-200" />
      </div>
    );
  }

  return (
    <PremiumBlogPostLayout>
      <Helmet>
        <title>{activePost.title} - Lifelapss Blog</title>
        <meta name="description" content={activePost.short_description} />
      </Helmet>

      <ReadingProgressBar />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Button
          variant="ghost"
          onClick={() => onNavigate('blog')}
          className="mb-8 rounded-full border border-white/10 bg-white/5 pl-4 pr-5 text-white/72 hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Blog
        </Button>

        <div className="mb-6 flex flex-wrap gap-2">
          {activePost.tags?.map((tag) => (
            <span key={tag} className="media-chip border-cyan-300/20 bg-cyan-400/10 text-cyan-100">
              {tag}
            </span>
          ))}
        </div>

        <h1 className="text-4xl leading-none text-white md:text-6xl">{activePost.title}</h1>

        <div className="mt-8 flex flex-wrap items-center gap-6 border-b border-white/10 pb-8 text-white/52">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-cyan-300 to-amber-200 text-[#04131c]">
              <User className="h-5 w-5" />
            </div>
            <div>
              <span className="block text-sm font-bold text-white">Lifelapss Team</span>
              <span className="text-xs uppercase tracking-[0.22em] text-white/42">Author</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-cyan-100" />
            <span>{new Date(activePost.published_at).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-cyan-100" />
            <span>{readTime} min read</span>
          </div>
        </div>

        <div className="media-panel mt-10 overflow-hidden rounded-[30px]">
          <img src={activePost.featured_image_url} alt={activePost.title} className="max-h-[600px] w-full object-cover" />
        </div>

        <div
          className="prose prose-invert mt-12 max-w-none prose-headings:text-white prose-p:text-white/72 prose-li:text-white/70 prose-strong:text-white"
          dangerouslySetInnerHTML={{ __html: sanitizedBody }}
        />

        <DonationCTA onNavigate={onNavigate} />
        <SharePostSection title={activePost.title} />
        <BlogCommentSection />
        <RelatedPostsSection currentPostId={activePost.id} tags={activePost.tags} onNavigate={onNavigate} />
      </motion.div>
    </PremiumBlogPostLayout>
  );
};

export default BlogPostPage;
