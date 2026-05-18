import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { MoreHorizontal, UserPlus, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '@/contexts/useAuth';
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

const ManageUsersPage = ({ onNavigate }) => {
    const { isAdmin, user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const getAccountLabel = (profileRecord) => {
        if (profileRecord.email) {
            return profileRecord.email;
        }

        if (currentUser?.id === profileRecord.id && currentUser?.email) {
            return currentUser.email;
        }

        return profileRecord.id;
    };

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        if (!isAdmin) {
            toast({ variant: 'destructive', title: 'Access Denied', description: 'Only admins can manage users.' });
            setLoading(false);
            return;
        }
        const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });

        if (error) {
            toast({ variant: 'destructive', title: 'Error fetching users', description: error.message });
        } else {
            setUsers(data);
        }
        setLoading(false);
    }, [isAdmin]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleRoleUpdate = async (userId, newRole) => {
        if (!isAdmin) {
            toast({ variant: 'destructive', title: 'Permission Denied', description: 'Only admins can change user roles.' });
            return;
        }
        const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
        if (error) {
            toast({ variant: 'destructive', title: 'Error updating role', description: error.message });
        } else {
            toast({ title: 'User role updated!' });
            fetchUsers();
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!isAdmin) {
            toast({ variant: 'destructive', title: 'Permission Denied', description: 'Only admins can delete users.' });
            return;
        }
        // In a real app, you'd also want to delete the user from auth.users
        // This requires a service role key or a Supabase Edge Function
        toast({ title: 'User deletion initiated', description: 'This feature requires backend logic to fully delete the user from authentication.' });
        // For now, we'll just remove their profile
        const { error } = await supabase.from('profiles').delete().eq('id', userId);
        if (error) {
            toast({ variant: 'destructive', title: 'Error deleting user profile', description: error.message });
        } else {
            toast({ title: 'User profile deleted' });
            fetchUsers();
        }
    };

    if (!isAdmin) {
        return <div className="text-center p-8 text-red-500">Access Denied: You do not have permission to view this page.</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <p className="media-kicker">Account Control</p>
                    <h1 className="mt-3 text-4xl text-white">Manage Users</h1>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-white/64">Review platform members, update roles, and keep admin access locked down.</p>
                </div>
                <Button onClick={() => toast({ title: 'This feature is not implemented yet.' })} className="premium-button rounded-2xl px-5 text-sm font-semibold">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add New User
                </Button>
            </div>

            <div className="overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.03] shadow-[0_24px_80px_rgba(0,0,0,0.18)]">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase">Account</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase">Joined</th>
                            <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {loading ? (
                            <tr><td colSpan="5" className="text-center p-8">Loading users...</td></tr>
                        ) : users.length === 0 ? (
                             <tr><td colSpan="5" className="text-center p-8">No users found.</td></tr>
                        ) : (
                            users.map(user => (
                                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="px-6 py-4 font-medium">{user.full_name || 'N/A'}</td>
                                    <td className="px-6 py-4">{getAccountLabel(user)}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            user.role === 'admin' ? 'bg-amber-300/12 text-amber-100 ring-1 ring-amber-200/20' : 'bg-cyan-300/12 text-cyan-100 ring-1 ring-cyan-200/20'
                                        }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(user.created_at).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-right">
                                        <AlertDialog>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    {user.role !== 'admin' && <DropdownMenuItem onClick={() => handleRoleUpdate(user.id, 'admin')}><CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Make Admin</DropdownMenuItem>}
                                                    {user.role !== 'creator' && <DropdownMenuItem onClick={() => handleRoleUpdate(user.id, 'creator')}><CheckCircle className="mr-2 h-4 w-4 text-blue-500" /> Make Creator</DropdownMenuItem>}
                                                    {user.role !== 'admin' && <AlertDialogTrigger asChild><DropdownMenuItem className="text-red-500"><Trash2 className="mr-2 h-4 w-4" /> Delete User</DropdownMenuItem></AlertDialogTrigger>}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                            <AlertDialogContent>
                                                <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will attempt to delete the user profile. Full user deletion requires more advanced setup.</AlertDialogDescription></AlertDialogHeader>
                                                <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteUser(user.id)}>Delete</AlertDialogAction></AlertDialogFooter>
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

export default ManageUsersPage;
