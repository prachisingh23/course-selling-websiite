import React from 'react';
import { motion } from 'framer-motion';

const categories = ['All', 'Technology', 'AI Tools', 'Tutorials', 'Industry News', 'Tips & Tricks'];

const BlogCategoryFilter = ({ activeCategory, onCategoryChange }) => {
  return (
    <div className="mb-8 flex flex-wrap justify-center gap-2">
      {categories.map((category) => (
        <motion.button
          key={category}
          type="button"
          onClick={() => onCategoryChange(category)}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.97 }}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
            activeCategory === category
              ? 'bg-cyan-300 text-[#041b26]'
              : 'border border-white/10 bg-white/5 text-white/62 hover:border-cyan-300/24 hover:text-white'
          }`}
        >
          {category}
        </motion.button>
      ))}
    </div>
  );
};

export default BlogCategoryFilter;
