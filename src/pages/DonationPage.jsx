import React from 'react';
import { Helmet } from 'react-helmet-async';
import PremiumDonationLayout from '@/components/PremiumDonationLayout';
import DonationGoalTracker from '@/components/DonationGoalTracker';
import WhyDonateSection from '@/components/WhyDonateSection';
import DonationForm from '@/components/DonationForm';
import DonorPerksSection from '@/components/DonorPerksSection';
import SupporterAvatarsSection from '@/components/SupporterAvatarsSection';
import CallToActionSection from '@/components/CallToActionSection';
import TestimonialSection from '@/components/TestimonialSection';
import { motion } from 'framer-motion';

const DonationPage = () => {
  return (
    <PremiumDonationLayout>
      <Helmet>
        <title>Support Us - Make a Difference | Lifelapss</title>
        <meta name="description" content="Support our mission to empower creators. Join our premium supporter community." />
      </Helmet>

      {/* Section 1: Goal & Impact */}
      <div className="grid lg:grid-cols-12 gap-12 mb-20">
        <div className="lg:col-span-8">
          <DonationGoalTracker />
          <WhyDonateSection />
        </div>
        
        {/* Sticky Donation Form */}
        <div className="lg:col-span-4">
          <div id="donation-form-anchor" className="sticky top-24">
             <DonationForm />
          </div>
        </div>
      </div>

      {/* Section 2: Perks & Community */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <DonorPerksSection />
        <SupporterAvatarsSection />
      </motion.div>
      
      {/* Section 3: Social Proof */}
      <div className="py-12 border-t border-white/5">
         <TestimonialSection />
      </div>

      <CallToActionSection />
    </PremiumDonationLayout>
  );
};

export default DonationPage;
