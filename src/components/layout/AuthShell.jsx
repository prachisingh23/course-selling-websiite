import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AuthShell = ({
  onNavigate,
  backTarget = 'home',
  backLabel = 'Back to Home',
  eyebrow,
  title,
  description,
  highlights = [],
  children,
  footer = null,
}) => {
  return (
    <div className="auth-shell text-white">
      <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="auth-card relative hidden overflow-hidden p-8 lg:block"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(103,232,249,0.16),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.12),transparent_24%)]" />
          <div className="relative z-10 flex h-full flex-col justify-between gap-8">
            <div>
              <p className="media-kicker">{eyebrow}</p>
              <h1 className="mt-4 text-5xl leading-none text-white">{title}</h1>
              <p className="media-copy mt-5 max-w-xl">{description}</p>
            </div>

            <div className="space-y-3">
              {highlights.map((highlight) => (
                <div
                  key={highlight}
                  className="media-panel-soft flex items-start gap-3 p-4"
                >
                  <div className="rounded-full border border-cyan-300/20 bg-cyan-400/10 p-2 text-cyan-100">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <p className="text-sm leading-6 text-white/72">{highlight}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="auth-card p-6 sm:p-8"
        >
          <Button
            type="button"
            onClick={() => onNavigate(backTarget)}
            variant="ghost"
            className="mb-6 rounded-full border border-white/10 bg-white/5 px-4 text-white/74 hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {backLabel}
          </Button>

          <div className="mb-6 lg:hidden">
            <p className="media-kicker">{eyebrow}</p>
            <h1 className="mt-3 text-4xl text-white">{title}</h1>
            <p className="media-copy mt-3">{description}</p>
          </div>

          {children}
          {footer ? <div className="mt-6">{footer}</div> : null}
        </motion.section>
      </div>
    </div>
  );
};

export default AuthShell;
