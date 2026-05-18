import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';

const BlogSearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(query);
    }, 500);
    return () => clearTimeout(timer);
  }, [query, onSearch]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative mx-auto mb-10 max-w-xl"
    >
      <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/34" />
      <input
        type="text"
        placeholder="Search articles..."
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        className="form-surface h-[54px] w-full rounded-full py-3 pl-12 pr-4"
      />
    </motion.div>
  );
};

export default BlogSearchBar;
