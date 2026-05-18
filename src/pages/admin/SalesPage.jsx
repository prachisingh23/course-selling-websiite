import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/useAuth';
import { DollarSign, ShoppingCart, Loader2, MoreHorizontal, CheckCircle, Clock, AlertTriangle, Image, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu";

const mergeSaleMetadata = ({ sales, profiles = [], images = [], videos = [] }) => {
    const profileMap = new Map(profiles.map((profile) => [profile.id, profile.full_name]));
    const imageMap = new Map(images.map((image) => [String(image.id), image.title]));
    const videoMap = new Map(videos.map((video) => [String(video.id), video.title]));

    return sales.map((sale) => ({
        ...sale,
        creator_name: profileMap.get(sale.creator_id) || 'N/A',
        item_title:
            sale.item_type === 'image'
                ? imageMap.get(String(sale.item_id)) || `Image ID: ${sale.item_id}`
                : videoMap.get(String(sale.item_id)) || `Video ID: ${sale.item_id}`,
    }));
};

const SalesPage = () => {
    const { isAdmin, user } = useAuth();
    const [sales, setSales] = useState([]);
    const [stats, setStats] = useState({ totalRevenue: 0, totalSales: 0 });
    const [loading, setLoading] = useState(true);

    const fetchSales = useCallback(async () => {
        setLoading(true);
        let query = supabase.from('sales').select('*');
        
        if (!isAdmin) {
            query = query.eq('creator_id', user.id);
        }
        
        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) {
            toast({ variant: 'destructive', title: 'Error fetching sales data', description: error.message });
        } else {
            const salesRows = data || [];
            const creatorIds = [...new Set(salesRows.map((sale) => sale.creator_id).filter(Boolean))];
            const imageIds = [...new Set(salesRows.filter((sale) => sale.item_type === 'image').map((sale) => sale.item_id).filter(Boolean))];
            const videoIds = [...new Set(salesRows.filter((sale) => sale.item_type === 'video').map((sale) => sale.item_id).filter(Boolean))];

            const [profilesResult, imagesResult, videosResult] = await Promise.all([
                creatorIds.length
                    ? supabase.from('profiles').select('id, full_name').in('id', creatorIds)
                    : Promise.resolve({ data: [], error: null }),
                imageIds.length
                    ? supabase.from('images').select('id, title').in('id', imageIds)
                    : Promise.resolve({ data: [], error: null }),
                videoIds.length
                    ? supabase.from('videos').select('id, title').in('id', videoIds)
                    : Promise.resolve({ data: [], error: null }),
            ]);

            if (profilesResult.error) {
                console.error('Failed to fetch sale creators:', profilesResult.error);
            }
            if (imagesResult.error) {
                console.error('Failed to fetch sold image titles:', imagesResult.error);
            }
            if (videosResult.error) {
                console.error('Failed to fetch sold video titles:', videosResult.error);
            }

            const enrichedSales = mergeSaleMetadata({
                sales: salesRows,
                profiles: profilesResult.data || [],
                images: imagesResult.data || [],
                videos: videosResult.data || [],
            });

            setSales(enrichedSales);
            const totalRevenue = enrichedSales.reduce((acc, sale) => acc + parseFloat(sale.amount || 0), 0);
            setStats({ totalRevenue, totalSales: enrichedSales.length });
        }
        setLoading(false);
    }, [isAdmin, user]);

    useEffect(() => {
        if (user) {
            fetchSales();
        }
    }, [user, fetchSales]);

    const handlePayoutStatusUpdate = async (saleId, status) => {
        if (!isAdmin) {
            toast({ variant: 'destructive', title: 'Permission Denied' });
            return;
        }
        const { error } = await supabase.from('sales').update({ payout_status: status }).eq('id', saleId);
        if (error) {
            toast({ variant: 'destructive', title: 'Error Updating Payout', description: error.message });
        } else {
            toast({ title: 'Payout Status Updated!' });
            fetchSales();
        }
    };
    
    const PayoutStatusBadge = ({ status }) => {
        const statusMap = {
            paid: { icon: CheckCircle, color: 'text-green-500', label: 'Paid' },
            pending: { icon: Clock, color: 'text-yellow-500', label: 'Pending' },
            processing: { icon: Loader2, color: 'text-blue-500 animate-spin', label: 'Processing' },
            failed: { icon: AlertTriangle, color: 'text-red-500', label: 'Failed' },
        };
        const current = statusMap[status] || statusMap.pending;
        return (
            <span className={`inline-flex items-center text-xs font-semibold ${current.color}`}>
                <current.icon className="w-4 h-4 mr-1" />
                {current.label}
            </span>
        );
    };

    const ItemDetails = ({ sale }) => {
        if (sale.item_type === 'image') {
            return <><Image className="w-4 h-4 mr-2 text-gray-500"/> {sale.item_title}</>
        }
        if (sale.item_type === 'video') {
            return <><Video className="w-4 h-4 mr-2 text-gray-500"/> {sale.item_title}</>
        }
        return 'N/A';
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Sales & Payouts</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center space-x-4">
                    <div className="p-3 rounded-full bg-green-500"><DollarSign className="w-6 h-6 text-white" /></div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</p>
                        <p className="text-2xl font-bold">{loading ? <Loader2 className="w-6 h-6 animate-spin"/> : `$${stats.totalRevenue.toFixed(2)}`}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center space-x-4">
                    <div className="p-3 rounded-full bg-blue-500"><ShoppingCart className="w-6 h-6 text-white" /></div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Sales</p>
                        <p className="text-2xl font-bold">{loading ? <Loader2 className="w-6 h-6 animate-spin"/> : stats.totalSales}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase">Item</th>
                            {isAdmin && <th className="px-6 py-3 text-left text-xs font-medium uppercase">Creator</th>}
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase">Payout Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase">Date</th>
                            {isAdmin && <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {loading ? (
                            <tr><td colSpan={isAdmin ? 6 : 5} className="text-center p-8"><Loader2 className="w-6 h-6 animate-spin mx-auto"/></td></tr>
                        ) : sales.length === 0 ? (
                             <tr><td colSpan={isAdmin ? 6 : 5} className="text-center p-8">No sales yet.</td></tr>
                        ) : (
                            sales.map(sale => (
                                <tr key={sale.id}>
                                    <td className="px-6 py-4 font-medium flex items-center"><ItemDetails sale={sale} /></td>
                                    {isAdmin && <td className="px-6 py-4">{sale.creator_name}</td>}
                                    <td className="px-6 py-4 font-medium">${parseFloat(sale.amount).toFixed(2)}</td>
                                    <td className="px-6 py-4"><PayoutStatusBadge status={sale.payout_status} /></td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(sale.created_at).toLocaleDateString()}</td>
                                    {isAdmin && <td className="px-6 py-4 text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handlePayoutStatusUpdate(sale.id, 'paid')}><CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Mark as Paid</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handlePayoutStatusUpdate(sale.id, 'processing')}><Loader2 className="mr-2 h-4 w-4 text-blue-500" /> Mark as Processing</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handlePayoutStatusUpdate(sale.id, 'pending')}><Clock className="mr-2 h-4 w-4 text-yellow-500" /> Mark as Pending</DropdownMenuItem>
                                                 <DropdownMenuItem onClick={() => handlePayoutStatusUpdate(sale.id, 'failed')} className="text-red-500"><AlertTriangle className="mr-2 h-4 w-4" /> Mark as Failed</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SalesPage;
