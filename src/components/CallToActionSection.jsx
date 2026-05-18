import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from './ui/button';

const CallToActionSection = () => {
  const handleScroll = () => {
    const element = document.getElementById('donation-form-anchor');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="py-12">
      <div className="media-panel relative overflow-hidden p-8 text-center md:p-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(103,232,249,0.12),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.12),transparent_26%)]" />
        <div className="relative z-10">
          <div className="mb-6 inline-flex rounded-full bg-white/8 p-3">
            <Sparkles className="h-6 w-6 text-cyan-100" />
          </div>
          <h2 className="text-3xl text-white md:text-4xl">Ready to make a real difference?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/64">
            Your support helps maintain the platform, fund free content, and keep education more accessible.
          </p>
          <Button
            onClick={handleScroll}
            className="mt-8 rounded-full bg-cyan-300 px-8 py-6 text-lg text-[#041b26] hover:bg-cyan-200"
          >
            Donate Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CallToActionSection;
