import React from 'react';
import { LayoutDashboard, FileText, Image, Bot, Settings, LogOut, ShoppingCart, DollarSign, Users, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/useAuth';

const AdminSidebar = ({ onNavigate, currentPage }) => {
    const { signOut } = useAuth();

    const navItems = [
        { name: 'Dashboard', page: 'dashboard', icon: LayoutDashboard },
        { name: 'Articles', page: 'articles', icon: FileText },
        { name: 'Images', page: 'images', icon: Image },
        { name: 'Videos', page: 'videos', icon: Video },
        { name: 'Products', page: 'products', icon: ShoppingCart },
        { name: 'Sales', page: 'sales', icon: DollarSign },
        { name: 'Media Library', page: 'media', icon: Image },
        { name: 'AI Generator', page: 'ai-generator', icon: Bot },
        { name: 'Manage Users', page: 'users', icon: Users },
        { name: 'Settings', page: 'settings', icon: Settings },
    ];

    return (
        <aside className="admin-sidebar flex flex-col gap-6 p-5 lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] lg:w-[288px] lg:self-start">
            <div className="space-y-6">
                <div className="media-panel-soft flex items-center gap-3 p-4">
                    <img className="h-11 w-11 rounded-2xl border border-white/10 object-cover" alt="Lifelaps logo" src="https://horizons-cdn.hostinger.com/528a3c0e-01fd-4f14-89f9-123543f56514/825abd5a547aafaa83312712ad85799f.jpg" />
                    <div>
                        <p className="media-kicker">Admin Studio</p>
                        <span className="block text-lg font-semibold text-white">Curated Media Control</span>
                    </div>
                </div>

                <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-100/60">Access</p>
                    <p className="mt-2 text-sm leading-6 text-white/70">
                        Photo, video, and media uploads stay restricted to the admin team only.
                    </p>
                </div>

                <nav className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                    {navItems.map(item => (
                        <Button
                            key={item.page}
                            variant="ghost"
                            className={`h-12 justify-start rounded-2xl border px-4 text-sm font-semibold transition-all ${
                                currentPage === item.page
                                    ? 'border-cyan-300/20 bg-cyan-300/12 text-white shadow-[0_18px_40px_rgba(34,211,238,0.12)]'
                                    : 'border-white/8 bg-white/[0.03] text-white/70 hover:bg-white/8 hover:text-white'
                            }`}
                            onClick={() => onNavigate(`admin/${item.page}`)}
                        >
                            <item.icon className="w-4 h-4 mr-3" />
                            {item.name}
                        </Button>
                    ))}
                </nav>
            </div>
            <Button
                variant="ghost"
                className="h-12 justify-start rounded-2xl border border-red-400/20 bg-red-500/10 text-red-100 hover:bg-red-500/16 hover:text-white"
                onClick={signOut}
            >
                <LogOut className="w-4 h-4 mr-3" />
                Logout
            </Button>
        </aside>
    );
};

export default AdminSidebar;
