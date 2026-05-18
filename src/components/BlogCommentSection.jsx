import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Star } from 'lucide-react';

const comments = [
  {
    id: 1,
    name: 'Alex Thompson',
    role: 'AI Artist',
    content: 'This article completely changed my workflow. The section about prompt engineering was particularly enlightening!',
    rating: 5,
    date: '2 days ago',
  },
  {
    id: 2,
    name: 'Sarah Chen',
    role: 'Filmmaker',
    content: "Great breakdown of the current tools. I've been using Pika mostly but might give Runway another shot after reading this.",
    rating: 5,
    date: '1 week ago',
  },
];

const BlogCommentSection = () => {
  return (
    <div className="mt-16">
      <div className="mb-8 flex items-center gap-3">
        <MessageCircle className="h-6 w-6 text-cyan-100" />
        <h3 className="text-2xl text-white">Discussion</h3>
      </div>

      <div className="space-y-6">
        {comments.map((comment) => (
          <motion.div
            key={comment.id}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="media-panel-soft p-6"
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-300 to-amber-200 font-bold text-[#04131c]">
                  {comment.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-white">{comment.name}</h4>
                  <p className="text-xs uppercase tracking-[0.22em] text-white/42">{comment.role}</p>
                </div>
              </div>
              <div className="flex text-amber-200">
                {[...Array(comment.rating)].map((_, index) => (
                  <Star key={index} className="h-3 w-3 fill-current" />
                ))}
              </div>
            </div>
            <p className="text-sm leading-7 text-white/66">{comment.content}</p>
            <p className="mt-3 text-xs text-white/38">{comment.date}</p>
          </motion.div>
        ))}

        <div className="media-panel-soft p-6 text-center">
          <p className="mb-4 text-white/54">Join the conversation</p>
          <button className="rounded-full border border-white/10 bg-white/5 px-6 py-2 text-sm font-medium text-white/72 transition-colors hover:bg-white/10 hover:text-white">
            Sign in to comment
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlogCommentSection;
