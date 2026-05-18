import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
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
} from "@/components/ui/alert-dialog"
import { MoreHorizontal, PlusCircle, Search, Edit, Trash2, Eye, CheckCircle, XCircle, Clock } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu";
import { useAuth } from '@/contexts/useAuth';
import { attachProfileNames } from '@/utils/profileLookup';

const ManageArticlesPage = ({ onNavigate }) => {
    const { isAdmin } = useAuth();
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchArticles = useCallback(async () => {
        setLoading(true);
        let query = supabase.from('articles').select('*').order('created_at', { ascending: false });
        
        if (searchTerm) {
            query = query.ilike('title', `%${searchTerm}%`);
        }

        const { data, error } = await query;

        if (error) {
            toast({ variant: 'destructive', title: 'Error fetching articles', description: error.message });
        } else {
            setArticles(await attachProfileNames(data || []));
        }
        setLoading(false);
    }, [searchTerm]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchArticles();
        }, 300); // Debounce search
        return () => clearTimeout(timer);
    }, [fetchArticles]);

    const handleDelete = async (articleId) => {
        const { error } = await supabase.from('articles').delete().eq('id', articleId);
        if (error) {
            toast({ variant: 'destructive', title: 'Error deleting article', description: error.message });
        } else {
            toast({ title: 'Article Deleted', description: 'The article has been successfully deleted.' });
            fetchArticles();
        }
    };

    const handleStatusUpdate = async (articleId, status) => {
        const { error } = await supabase.from('articles').update({ status }).eq('id', articleId);
        if (error) {
            toast({ variant: 'destructive', title: 'Error updating status', description: error.message });
        } else {
            toast({ title: 'Article status updated!' });
            fetchArticles();
        }
    };

    const StatusBadge = ({ status }) => {
        const statusMap = {
            published: { icon: CheckCircle, color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', label: 'Published' },
            draft: { icon: Clock, color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300', label: 'Draft' },
            pending_approval: { icon: Clock, color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300', label: 'Pending Approval' },
            rejected: { icon: XCircle, color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', label: 'Rejected' },
        };
        const current = statusMap[status] || statusMap.draft;
        return (
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${current.color}`}>
                <current.icon className="w-3 h-3 mr-1" />
                {current.label}
            </span>
        );
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Manage Articles</h1>
                {isAdmin && (
                    <Button onClick={() => onNavigate('admin/articles/new')}>
                        <PlusCircle className="w-4 h-4 mr-2" />
                        New Article
                    </Button>
                )}
            </div>
            <div className="relative mb-6">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input 
                    placeholder="Search articles by title..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                />
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Title</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Author</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {loading ? (
                            <tr><td colSpan="5" className="text-center p-8">Loading articles...</td></tr>
                        ) : articles.length === 0 ? (
                             <tr><td colSpan="5" className="text-center p-8">No articles found.</td></tr>
                        ) : (
                            articles.map(article => (
                                <tr key={article.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="px-6 py-4 whitespace-nowrap"><div className="font-medium">{article.title}</div></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{article.creator_name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={article.status} /></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(article.created_at).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <AlertDialog>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => onNavigate('admin/articles/edit', { id: article.id })}>
                                                        <Edit className="mr-2 h-4 w-4" /> Edit
                                                    </DropdownMenuItem>
                                                    {isAdmin && article.status !== 'published' && <DropdownMenuItem onClick={() => handleStatusUpdate(article.id, 'published')}><CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Publish</DropdownMenuItem>}
                                                    {isAdmin && article.status !== 'rejected' && <DropdownMenuItem onClick={() => handleStatusUpdate(article.id, 'rejected')}><XCircle className="mr-2 h-4 w-4 text-red-500" /> Reject</DropdownMenuItem>}
                                                    {isAdmin && <AlertDialogTrigger asChild><DropdownMenuItem className="text-red-600 dark:text-red-400"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem></AlertDialogTrigger>}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>This action cannot be undone. This will permanently delete the article.</AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(article.id)}>Delete</AlertDialogAction>
                                                </AlertDialogFooter>
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

export default ManageArticlesPage;
