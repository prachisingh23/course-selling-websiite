import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/useAuth';
import { Loader2, Save } from 'lucide-react';

const AdminSettingsPage = () => {
    const { user, profile, ensureAdminProfileAccess, updateUserPassword } = useAuth();
    const { toast } = useToast();
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);
    const [fullName, setFullName] = useState('');
    const [newPassword, setNewPassword] = useState('');

    useEffect(() => {
        setFullName(profile?.full_name || user?.user_metadata?.full_name || '');
    }, [profile?.full_name, user?.user_metadata?.full_name]);

    const handleProfileUpdate = async () => {
        if (!user) {
            toast({ variant: 'destructive', title: 'Session expired', description: 'Please sign in again to update your profile.' });
            return;
        }

        const trimmedName = fullName.trim();
        if (!trimmedName) {
            toast({ variant: 'destructive', title: 'Full name required', description: 'Enter a valid name before saving.' });
            return;
        }

        setSavingProfile(true);

        const repairResult = await ensureAdminProfileAccess({ force: true });
        const role = repairResult.data?.role || profile?.role || 'admin';

        const { error: authError } = await supabase.auth.updateUser({
            data: {
                ...(user.user_metadata || {}),
                full_name: trimmedName,
            },
        });

        if (authError) {
            toast({ variant: 'destructive', title: 'Failed to update auth profile', description: authError.message });
            setSavingProfile(false);
            return;
        }

        const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
                id: user.id,
                full_name: trimmedName,
                role,
            })
            .select()
            .maybeSingle();

        if (profileError) {
            toast({ variant: 'destructive', title: 'Failed to update profile', description: profileError.message });
            setSavingProfile(false);
            return;
        }

        await ensureAdminProfileAccess({ force: true });
        toast({ title: 'Profile updated', description: 'Your admin display name has been saved.' });
        setSavingProfile(false);
    };

    const handlePasswordUpdate = async () => {
        if (newPassword.length < 6) {
            toast({ variant: 'destructive', title: 'Password too short', description: 'Password must be at least 6 characters.' });
            return;
        }
        setSavingPassword(true);
        const { error } = await updateUserPassword(newPassword);
        if (!error) {
            toast({ title: 'Password Updated Successfully!' });
            setNewPassword('');
        }
        setSavingPassword(false);
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Admin Settings</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md space-y-6">
                    <h2 className="text-xl font-bold">Profile Information</h2>
                     <div>
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input 
                            id="fullName" 
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                        />
                    </div>
                     <div>
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" value={user?.email || ''} disabled />
                    </div>
                     <Button onClick={handleProfileUpdate} disabled={savingProfile || !fullName.trim()}> 
                        {savingProfile ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Save className="w-4 h-4 mr-2"/>}
                        Save Profile
                    </Button>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md space-y-6">
                     <h2 className="text-xl font-bold">Change Password</h2>
                     <div>
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input 
                            id="newPassword" 
                            type="password"
                            placeholder="Enter new password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                    </div>
                     <Button onClick={handlePasswordUpdate} disabled={savingPassword}>
                        {savingPassword ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Save className="w-4 h-4 mr-2"/>}
                        Update Password
                    </Button>
                </div>
            </div>
             <div className="mt-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                 <h2 className="text-xl font-bold mb-4">Dashboard Appearance</h2>
                 <p className="text-gray-500 dark:text-gray-400">Light/Dark mode switching is coming soon!</p>
            </div>
        </div>
    );
};

export default AdminSettingsPage;
