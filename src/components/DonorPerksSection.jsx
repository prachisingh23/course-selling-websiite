import React from 'react';
import { Award, Crown, Star, Zap } from 'lucide-react';

const perks = [
  { icon: Award, title: 'Donor Badge', tier: '$25+', description: 'Show support with a visible supporter badge.' },
  { icon: Star, title: 'Early Access', tier: '$50+', description: 'Preview new tools and tutorials before public release.' },
  { icon: Zap, title: 'Ad-Free Experience', tier: '$100+', description: 'Move through the platform with fewer interruptions.' },
  { icon: Crown, title: 'VIP Discord Role', tier: '$200+', description: 'Get access to more direct community support.' },
];

const DonorPerksSection = () => {
  return (
    <section className="py-10">
      <div className="mb-8 text-center">
        <p className="media-kicker">Supporter Perks</p>
        <h2 className="mt-3 text-4xl text-white">A better thank-you for meaningful support</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {perks.map((perk) => (
          <article key={perk.title} className="media-panel-soft relative overflow-hidden p-6">
            <div className="absolute right-0 top-0 rounded-bl-2xl bg-cyan-300 px-3 py-1 text-xs font-bold text-[#041b26]">
              {perk.tier}
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-300/12 text-cyan-100">
              <perk.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-5 text-xl text-white">{perk.title}</h3>
            <p className="media-copy mt-3 text-sm">{perk.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
};

export default DonorPerksSection;
