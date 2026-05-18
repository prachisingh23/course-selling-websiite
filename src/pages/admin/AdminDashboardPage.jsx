import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FileText, Image, Video, FilePlus, Loader2, ShoppingCart, DollarSign, Users, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/useAuth';
import { supabase } from '@/lib/customSupabaseClient';
import { attachProfileNames } from '@/utils/profileLookup';

const StatCard = ({ icon, title, value, color, loading }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="admin-panel-soft flex items-center space-x-4 p-6"
    >
        <div className={`rounded-2xl p-3 ${color}`}>
            {React.createElement(icon, { className: "w-6 h-6 text-white" })}
        </div>
        <div>
            <p className="text-sm font-medium text-white/58">{title}</p>
            {loading ? <Loader2 className="mt-1 h-6 w-6 animate-spin"/> : <p className="text-2xl font-bold text-white">{value}</p>}
        </div>
    </motion.div>
);

const ActivityItem = ({ icon, text, time, color }) => (
    <div className="flex items-start space-x-3 border-b border-white/8 py-3 last:border-b-0">
        <div className={`mt-1 rounded-2xl p-2 ${color}`}>
            {React.createElement(icon, { className: "w-4 h-4 text-white" })}
        </div>
        <div className="flex-1">
            <p className="text-sm text-white/86">{text}</p>
            <p className="text-xs text-white/48">{time}</p>
        </div>
    </div>
);

const SalesChart = ({ salesData, loading }) => {
    // This is a placeholder for a chart. In a real app, use a library like Recharts or Chart.js
    if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin"/></div>;
    if (salesData.length === 0) return <div className="flex h-64 items-center justify-center text-sm text-white/52">No sales data for chart.</div>;
    
    // Create a simple bar chart representation
    const maxSale = Math.max(...salesData.map(s => s.amount), 0);
    return (
        <div className="flex h-64 items-end justify-around space-x-2 rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
            {salesData.slice(0, 10).map((sale, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                    <div 
                        className="w-full rounded-t-md bg-gradient-to-t from-cyan-400/88 to-amber-300/90"
                        style={{ height: `${(sale.amount / maxSale) * 100}%` }}
                    ></div>
                    <span className="mt-2 text-xs text-white/58">{new Date(sale.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </div>
            ))}
        </div>
    );
};


const AdminDashboardPage = ({ onNavigate }) => {
    const { user, isAdmin, profile } = useAuth();
    const [stats, setStats] = useState({ articles: 0, images: 0, videos: 0, pending: 0, totalUsers: 0, totalRevenue: 0 });
    const [loading, setLoading] = useState(true);
    const [recentActivities, setRecentActivities] = useState([]);
    const [salesData, setSalesData] = useState([]);

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);

            // Fetch counts
            const [articles, images, videos, pendingImages, pendingVideos, profiles, sales] = await Promise.all([
                supabase.from('articles').select('*', { count: 'exact', head: true }),
                supabase.from('images').select('*', { count: 'exact', head: true }),
                supabase.from('videos').select('*', { count: 'exact', head: true }),
                supabase.from('images').select('*', { count: 'exact', head: true }).eq('status', 'pending_approval'),
                supabase.from('videos').select('*', { count: 'exact', head: true }).eq('status', 'pending_approval'),
                isAdmin ? supabase.from('profiles').select('*', { count: 'exact', head: true }) : Promise.resolve({ count: 0 }),
                supabase.from('sales').select('amount, created_at')
            ]);
            
            const totalRevenue = sales.data ? sales.data.reduce((acc, sale) => acc + sale.amount, 0) : 0;
            const finalPending = (pendingImages.count || 0) + (pendingVideos.count || 0);

            setStats({
                articles: articles.count,
                images: images.count,
                videos: videos.count,
                pending: finalPending,
                totalUsers: profiles.count,
                totalRevenue: totalRevenue
            });
            if (sales.data) setSalesData(sales.data);

            // Fetch recent activities (images and videos)
            const { data: recent, error: recentError } = await supabase
                .from('images') // Could be expanded to include videos, articles etc.
                .select('title, created_at, user_id')
                .order('created_at', { ascending: false })
                .limit(5);

            if (!recentError) {
                setRecentActivities(await attachProfileNames(recent || [], { fallback: 'A user' }));
            }
            
            setLoading(false);
        };

        if (user) {
            fetchAllData();
        }
    }, [user, isAdmin]);
    
    const timeSince = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";
        return Math.floor(seconds) + " seconds ago";
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <p className="media-kicker">Admin Overview</p>
                    <h1 className="mt-3 text-4xl text-white">Welcome, {profile?.full_name || 'User'}!</h1>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-white/64">Here is the current snapshot of uploads, users, sales, and pending admin work across the platform.</p>
                </div>
                {isAdmin && (
                    <div className="flex flex-wrap gap-3">
                        <Button onClick={() => onNavigate('admin/images')} className="premium-button rounded-2xl px-5 text-sm font-semibold">
                            <Image className="w-4 h-4 mr-2" /> Add Image
                        </Button>
                        <Button onClick={() => onNavigate('admin/articles/new')} variant="ghost" className="rounded-2xl border border-white/10 bg-white/5 px-5 text-white/82 hover:bg-white/10 hover:text-white">
                            <FilePlus className="w-4 h-4 mr-2" /> New Article
                        </Button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={FileText} title="Total Articles" value={stats.articles} color="bg-blue-500" loading={loading} />
                <StatCard icon={Image} title="Total Images" value={stats.images} color="bg-green-500" loading={loading} />
                <StatCard icon={Video} title="Total Videos" value={stats.videos} color="bg-blue-500" loading={loading} />
                <StatCard icon={Clock} title="Pending Approvals" value={stats.pending} color="bg-yellow-500" loading={loading} />
                {isAdmin && <StatCard icon={DollarSign} title="Total Revenue" value={`$${stats.totalRevenue.toFixed(2)}`} color="bg-red-500" loading={loading} />}
                {isAdmin && <StatCard icon={Users} title="Total Users" value={stats.totalUsers} color="bg-teal-500" loading={loading} />}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="admin-panel-soft lg:col-span-2 p-6">
                    <h2 className="text-xl font-bold mb-4 text-white">Recent Sales</h2>
                    <SalesChart salesData={salesData} loading={loading} />
                </div>
                <div className="admin-panel-soft p-6">
                    <h2 className="text-xl font-bold mb-4 text-white">Recent Activity</h2>
                    <div className="space-y-1">
                        {loading ? (
                            <div className="text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin"/></div>
                        ) : recentActivities.length > 0 ? (
                        recentActivities.map(activity => (
                                <ActivityItem 
                                key={activity.created_at}
                                icon={Image} 
                                text={
                                    <>
                                        <span className="font-semibold">{activity.creator_name}</span> uploaded a new image: <span className="font-semibold">{activity.title}</span>
                                    </>
                                }
                                time={timeSince(activity.created_at)}
                                color="bg-green-500"
                                />
                        ))
                        ) : (
                            <p className="py-8 text-center text-sm text-white/52">No recent activities.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardPage;
