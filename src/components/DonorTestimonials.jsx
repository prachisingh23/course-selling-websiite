import React from 'react';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
import { staggerContainer, fadeIn } from '@/utils/animations';

const testimonials = [
  {
    name: "Michael R.",
    role: "Freelance Artist",
    content: "Lifelapss gave me the tools to start my own AI animation business. Donating was a no-brainer to help others get the same opportunity.",
    amount: "Donated $50"
  },
  {
    name: "Sarah K.",
    role: "Film Student",
    content: "As a student, I couldn't afford expensive courses. The free resources here are world-class. Happy to support!",
    amount: "Donated $25"
  },
  {
    name: "David Chen",
    role: "Content Creator",
    content: "The prompt engineering guide alone was worth hundreds. I donate monthly to keep this community thriving.",
    amount: "Monthly Donor"
  }
];

const DonorTestimonials = () => {
  return (
    <section className="py-20 bg-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-heading text-white">Why Our Community <span className="premium-gradient-text">Supports Us</span></h2>
          <p className="text-gray-400 max-w-2xl mx-auto">Hear from the amazing people who make our mission possible.</p>
        </div>

        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-8"
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              variants={fadeIn}
              whileHover={{ y: -10 }}
              className="bg-[#1A0F2E] border border-white/5 p-8 rounded-2xl relative shadow-lg"
            >
              <Quote className="absolute top-8 left-8 w-8 h-8 text-[#FFD700]/20" />
              <p className="text-gray-300 mb-6 italic relative z-10 leading-relaxed pl-4">"{testimonial.content}"</p>
              
              <div className="flex items-center gap-4 mt-auto pt-6 border-t border-white/5">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-white">{testimonial.name}</div>
                  <div className="text-xs text-[#FFD700]">{testimonial.amount}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default DonorTestimonials;