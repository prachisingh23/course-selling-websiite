import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { MoreHorizontal, PlusCircle, Edit, Trash2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/useAuth';
import { attachProfileNames } from '@/utils/profileLookup';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const ManageProductsPage = ({ onNavigate }) => {
    const { isAdmin } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });

        if (error) {
            toast({ variant: 'destructive', title: 'Error fetching products', description: error.message });
        } else {
            setProducts(await attachProfileNames(data || []));
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleStatusUpdate = async (productId, status) => {
        const { error } = await supabase.from('products').update({ status }).eq('id', productId);
        if (error) {
            toast({ variant: 'destructive', title: 'Error updating status', description: error.message });
        } else {
            toast({ title: 'Product status updated!' });
            fetchProducts();
        }
    };

    const handleDelete = async (productId) => {
        const { error } = await supabase.from('products').delete().eq('id', productId);
        if (error) {
            toast({ variant: 'destructive', title: 'Error deleting product', description: error.message });
        } else {
            toast({ title: 'Product Deleted' });
            fetchProducts();
        }
    };

    const StatusBadge = ({ status }) => {
        const statusMap = {
            approved: { icon: CheckCircle, color: 'text-green-500', label: 'Approved' },
            pending_approval: { icon: Clock, color: 'text-yellow-500', label: 'Pending' },
            rejected: { icon: XCircle, color: 'text-red-500', label: 'Rejected' },
        };
        const current = statusMap[status] || statusMap.pending_approval;
        return (
            <span className={`inline-flex items-center text-xs font-semibold ${current.color}`}>
                <current.icon className="w-4 h-4 mr-1" />
                {current.label}
            </span>
        );
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Manage Products</h1>
                <Button onClick={() => onNavigate('admin/products/new')}>
                    <PlusCircle className="w-4 h-4 mr-2" />
                    New Product
                </Button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase">Product</th>
                            {isAdmin && <th className="px-6 py-3 text-left text-xs font-medium uppercase">Creator</th>}
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase">Price</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase">Status</th>
                            <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {loading ? (
                            <tr><td colSpan={isAdmin ? 5 : 4} className="text-center p-8">Loading products...</td></tr>
                        ) : products.length === 0 ? (
                             <tr><td colSpan={isAdmin ? 5 : 4} className="text-center p-8">No products found.</td></tr>
                        ) : (
                            products.map(product => (
                                <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="px-6 py-4 font-medium">{product.name}</td>
                                    {isAdmin && <td className="px-6 py-4">{product.creator_name}</td>}
                                    <td className="px-6 py-4">${product.price}</td>
                                    <td className="px-6 py-4"><StatusBadge status={product.status} /></td>
                                    <td className="px-6 py-4 text-right">
                                        <AlertDialog>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => onNavigate('admin/products/edit', { id: product.id })}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                                                    {isAdmin && product.status !== 'approved' && <DropdownMenuItem onClick={() => handleStatusUpdate(product.id, 'approved')}><CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Approve</DropdownMenuItem>}
                                                    {isAdmin && product.status !== 'rejected' && <DropdownMenuItem onClick={() => handleStatusUpdate(product.id, 'rejected')}><XCircle className="mr-2 h-4 w-4 text-red-500" /> Reject</DropdownMenuItem>}
                                                    {isAdmin && <AlertDialogTrigger asChild><DropdownMenuItem className="text-red-500"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem></AlertDialogTrigger>}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                            <AlertDialogContent>
                                                <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete the product.</AlertDialogDescription></AlertDialogHeader>
                                                <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(product.id)}>Delete</AlertDialogAction></AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManageProductsPage;
