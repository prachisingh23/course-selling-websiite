import React from 'react';
import { Helmet } from 'react-helmet-async';
import { LifeBuoy, Mail } from 'lucide-react';
import MediaPageHeader from '@/components/media/MediaPageHeader';

const HelpPage = () => {
  const contactEmail = 'studio@lifelapss.com';

  return (
    <>
      <Helmet>
        <title>Help & Support - Lifelapss</title>
        <meta name="description" content="Get help and support for your Lifelapss account and courses." />
      </Helmet>

      <div className="media-shell px-4 pb-20 pt-28 text-white lg:pt-32">
        <main className="mx-auto max-w-5xl space-y-8">
          <MediaPageHeader
            eyebrow="Support"
            title="Help for accounts, billing, courses, and platform access"
            description="If something is unclear or not working as expected, contact the team and we’ll help you resolve it."
            stats={[
              { label: 'Response Window', value: '24-48h' },
              { label: 'Support Type', value: 'Email' },
              { label: 'Coverage', value: 'Account + Billing' },
              { label: 'Status', value: 'Active' },
            ]}
          />

          <section className="media-panel p-8 text-center">
            <LifeBuoy className="mx-auto h-14 w-14 text-cyan-100" />
            <h2 className="mt-5 text-3xl text-white">Contact Us</h2>
            <p className="media-copy mx-auto mt-4 max-w-2xl">
              For support, billing, course access, or general questions, send us a message and we’ll get back to you as quickly as possible.
            </p>

            <div className="mx-auto mt-8 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-5 py-3">
              <Mail className="h-5 w-5 text-cyan-100" />
              <a href={`mailto:${contactEmail}`} className="text-lg font-semibold text-white transition-colors hover:text-cyan-100">
                {contactEmail}
              </a>
            </div>
          </section>
        </main>
      </div>
    </>
  );
};

export default HelpPage;
