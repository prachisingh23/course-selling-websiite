import React from 'react';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const MobileBottomNav = ({ items, isMenuOpen, onToggleMenu }) => {
  const actionItems = [
    ...items,
    {
      id: 'menu',
      label: isMenuOpen ? 'Close' : 'More',
      icon: isMenuOpen ? X : Menu,
      onClick: onToggleMenu,
      active: isMenuOpen,
    },
  ];

  return (
    <nav className="fixed inset-x-4 bottom-4 z-50 md:hidden">
      <div className="site-header-shell rounded-[28px] px-2 py-2 shadow-[0_18px_56px_rgba(0,0,0,0.22)]">
        <div className="grid grid-cols-5 gap-1">
          {actionItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                type="button"
                onClick={item.onClick}
                className={cn(
                  'flex min-h-[62px] flex-col items-center justify-center gap-1 rounded-[20px] px-2 py-2 text-[11px] font-semibold transition-all',
                  item.active
                    ? 'bg-[linear-gradient(135deg,rgba(233,252,255,0.98),rgba(255,240,204,0.96))] text-[#04131c] shadow-[0_12px_28px_rgba(125,211,252,0.2)]'
                    : 'border border-cyan-200/10 bg-[linear-gradient(180deg,rgba(11,35,49,0.96),rgba(8,22,33,0.94))] text-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_10px_22px_rgba(2,10,18,0.22)] hover:border-cyan-200/20 hover:bg-[linear-gradient(180deg,rgba(14,40,56,0.98),rgba(9,25,36,0.96))] hover:text-cyan-50'
                )}
                aria-label={item.label}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default MobileBottomNav;
