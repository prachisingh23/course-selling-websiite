import React from 'react';
import { ArrowRight, HeartHandshake } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DonationCTA = ({ onNavigate }) => {
  return (
    <div className="media-panel relative my-16 overflow-hidden p-8 md:p-12">
      <div className="absolute right-0 top-0 p-12 opacity-5">
        <HeartHandshake className="h-64 w-64 text-cyan-100" />
      </div>

      <div className="relative z-10 grid items-center gap-8 md:grid-cols-2">
        <div>
          <h2 className="text-3xl text-white md:text-4xl">
            Help us keep education free and accessible
          </h2>
          <p className="mt-4 text-lg leading-8 text-white/66">
            Your support helps fund infrastructure, public learning resources, and the ongoing work behind the platform.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              onClick={() => onNavigate('donate')}
              className="rounded-full bg-cyan-300 px-8 py-6 text-lg text-[#041b26] hover:bg-cyan-200"
            >
              Donate Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              onClick={() => onNavigate('about')}
              variant="outline"
              className="rounded-full border-white/10 bg-white/5 px-8 py-6 text-lg hover:bg-white/10"
            >
              Learn More
            </Button>
          </div>
        </div>
        <div className="hidden justify-center md:flex">
          <div className="media-panel-soft w-64 rounded-[28px] p-6">
            <div className="text-center">
              <div className="mb-2 text-4xl text-cyan-100">$10k+</div>
              <div className="text-sm text-white/48">Monthly Goal</div>
              <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-[75%] bg-[linear-gradient(90deg,#8cecff,#ffd27a)]" />
              </div>
              <div className="mt-2 text-xs text-right text-white/34">75% reached</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonationCTA;
