import React from 'react';
import { Code2, HeartHandshake, Server, Users } from 'lucide-react';

const reasons = [
  { icon: Server, title: 'Server Infrastructure', description: 'Keep platform performance stable for daily users and future growth.' },
  { icon: Code2, title: 'Open Tools', description: 'Support more creator tooling and public-facing workflow improvements.' },
  { icon: Users, title: 'Community Education', description: 'Fund free tutorials and creator learning resources.' },
  { icon: HeartHandshake, title: 'Accessibility', description: 'Help keep valuable content reachable for more people.' },
];

const WhyDonateSection = () => {
  return (
    <section className="py-10">
      <div className="mb-8">
        <p className="media-kicker">Why Support Matters</p>
        <h2 className="mt-3 text-4xl text-white">Where support goes</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {reasons.map((reason) => (
          <article key={reason.title} className="media-panel-soft p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-300/12 text-cyan-100">
              <reason.icon className="h-6 w-6" />
            </div>
            <h3 className="mt-5 text-xl text-white">{reason.title}</h3>
            <p className="media-copy mt-3">{reason.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
};

export default WhyDonateSection;
