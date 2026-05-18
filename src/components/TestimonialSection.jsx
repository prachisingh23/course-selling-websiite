import React from 'react';
import { motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah Jenkins',
    role: 'Student',
    quote: "The free tutorials here changed my career path. I'm now a full-time video editor thanks to Lifelapss.",
    rating: 5,
  },
  {
    name: 'Michael Chen',
    role: 'Content Creator',
    quote: 'Donating was a no-brainer. The value provided for free is unmatched in the industry.',
    rating: 5,
  },
  {
    name: 'Emma Wilson',
    role: 'Digital Artist',
    quote: 'I love the community here. Happy to support the mission of accessible education for everyone.',
    rating: 5,
  },
];

const TestimonialSection = () => {
  return (
    <div className="py-16">
      <div className="mb-12 text-center">
        <p className="media-kicker">Voices of Support</p>
        <h2 className="mt-3 text-4xl text-white">What supporters are saying</h2>
      </div>

      <div className="flex flex-col justify-center gap-6 md:flex-row">
        {testimonials.map((testimonial, index) => (
          <motion.article
            key={testimonial.name}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            className="media-panel-soft relative w-full p-6 md:w-[350px]"
          >
            <Quote className="absolute right-4 top-4 h-8 w-8 text-white/10" />
            <div className="mb-4 flex items-center gap-1 text-amber-200">
              {[...Array(testimonial.rating)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <p className="mb-6 italic leading-7 text-white/68">"{testimonial.quote}"</p>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-300 to-amber-200 text-sm font-bold text-[#04131c]">
                {testimonial.name.split(' ').map((part) => part[0]).join('')}
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{testimonial.name}</h4>
                <p className="text-xs text-white/44">{testimonial.role}</p>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  );
};

export default TestimonialSection;
