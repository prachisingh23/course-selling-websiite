import React from 'react';
import { Button } from './ui/button';
import { useAuth } from '@/contexts/useAuth';
import { Heart } from 'lucide-react';
import { getPrimaryNavigation, isNavigationItemActive } from '@/lib/navigation';

const Navbar = ({ onNavigate, currentPage }) => {
  const { user } = useAuth();
  const navItems = getPrimaryNavigation(Boolean(user));

  return (
    <nav className="hidden flex-1 items-center gap-5 md:flex">
      <button
        type="button"
        className="flex shrink-0 items-center gap-3"
        onClick={() => onNavigate('home')}
      >
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-cyan-300/16 blur-lg" />
          <img
            className="relative h-11 w-11 rounded-full border border-white/10 object-cover"
            alt="Lifelapss logo"
            src="https://horizons-cdn.hostinger.com/528a3c0e-01fd-4f14-89f9-123543f56514/825abd5a547aafaa83312712ad85799f.jpg"
            decoding="async"
          />
        </div>
        <div className="text-left">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan-100/68">
            Curated Archive
          </p>
          <span className="text-lg font-semibold text-white">Lifelapss</span>
        </div>
      </button>

      <div className="site-header-shell flex min-w-0 flex-1 items-center justify-between gap-3 px-3 py-2.5">
        <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {navItems.map((item) => (
            <Button
              key={item.id}
              onClick={() => {
                onNavigate(item.page);
              }}
              variant="ghost"
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                isNavigationItemActive(currentPage, item)
                  ? 'bg-[linear-gradient(135deg,rgba(233,252,255,0.98),rgba(255,240,204,0.96))] text-[#07141c] shadow-[0_12px_28px_rgba(125,211,252,0.2)]'
                  : 'border border-cyan-200/10 bg-[linear-gradient(180deg,rgba(11,35,49,0.96),rgba(8,22,33,0.94))] text-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_10px_22px_rgba(2,10,18,0.22)] hover:border-cyan-200/20 hover:bg-[linear-gradient(180deg,rgba(14,40,56,0.98),rgba(9,25,36,0.96))] hover:text-cyan-50'
              }`}
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.label}
            </Button>
          ))}
        </div>

        <button
          onClick={() => onNavigate('donate')}
          className="flex shrink-0 items-center gap-2 rounded-full border border-amber-200/18 bg-[linear-gradient(135deg,#9af8ff_0%,#ffd894_100%)] px-4 py-2.5 text-sm font-semibold text-[#1d1300] shadow-[0_10px_28px_rgba(245,158,11,0.16)] transition-transform duration-200 hover:-translate-y-0.5"
        >
          <Heart className="h-3.5 w-3.5 fill-current" />
          Donate
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
