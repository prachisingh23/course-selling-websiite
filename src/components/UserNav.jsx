import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@radix-ui/react-avatar';
import { useAuth } from '@/contexts/useAuth';

export function UserNav({ onNavigate }) {
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    onNavigate('home');
  };

  const getInitials = (email) => {
    if (!email) return 'U';

    const name = user.user_metadata?.full_name;
    if (name) {
      const nameParts = name.split(' ');
      if (nameParts.length > 1) {
        return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
      }
      return name[0].toUpperCase();
    }

    return email[0].toUpperCase();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="transition-transform duration-200 hover:scale-[1.04]">
          <Button
            variant="ghost"
            className="site-header-shell relative h-12 w-12 rounded-full hover:bg-white/[0.06]"
          >
            <Avatar className="flex h-10 w-10 items-center justify-center rounded-full">
              <AvatarFallback className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-300 to-amber-200 text-base font-bold text-[#04131c]">
                {getInitials(user?.email)}
              </AvatarFallback>
            </Avatar>
          </Button>
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="relative isolate w-72 overflow-hidden rounded-[22px] border border-white/12 bg-[linear-gradient(180deg,rgba(7,12,18,0.98),rgba(4,8,12,0.98))] p-2 text-white shadow-[0_22px_64px_rgba(0,0,0,0.32)]"
        align="end"
        forceMount
      >
        <DropdownMenuLabel className="font-normal p-3">
          <div className="flex flex-col gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-cyan-100/72">
              Signed In
            </p>
            <p className="text-lg font-semibold text-white">
              {user?.user_metadata?.full_name || 'User'}
            </p>
            <p className="text-xs leading-none text-white/48">{user?.email}</p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-white/8" />
        <DropdownMenuItem onClick={() => onNavigate('library')} className="cursor-pointer rounded-2xl px-3 py-3 text-white/80 focus:bg-white/8 focus:text-white">
          My Library
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onNavigate('favorites')} className="cursor-pointer rounded-2xl px-3 py-3 text-white/80 focus:bg-white/8 focus:text-white">
          Favorites
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onNavigate('enrolled-courses')} className="cursor-pointer rounded-2xl px-3 py-3 text-white/80 focus:bg-white/8 focus:text-white">
          My Courses
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onNavigate('change-password')} className="cursor-pointer rounded-2xl px-3 py-3 text-white/80 focus:bg-white/8 focus:text-white">
          Change Password
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onNavigate('help')} className="cursor-pointer rounded-2xl px-3 py-3 text-white/80 focus:bg-white/8 focus:text-white">
          Help & Support
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-white/8" />
        <DropdownMenuItem
          onClick={handleLogout}
          className="cursor-pointer rounded-2xl px-3 py-3 text-red-300 focus:bg-red-500/14 focus:text-red-200"
        >
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
