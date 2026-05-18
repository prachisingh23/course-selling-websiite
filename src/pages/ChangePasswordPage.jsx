import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Loader2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/useAuth';
import { useToast } from '@/components/ui/use-toast';
import AuthShell from '@/components/layout/AuthShell';

const ChangePasswordPage = ({ onNavigate }) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { updateUserPassword } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (password.length < 6) {
      toast({
        variant: 'destructive',
        title: 'Password too short',
        description: 'Please enter a password with at least 6 characters.',
      });
      return;
    }

    setLoading(true);
    const { error } = await updateUserPassword(password);
    setLoading(false);
    if (!error) {
      toast({
        title: 'Password Updated',
        description: 'Your password has been changed successfully.',
      });
      onNavigate('home');
    }
  };

  return (
    <>
      <Helmet>
        <title>Change Password - Lifelapss</title>
        <meta name="description" content="Change your Lifelapss account password." />
      </Helmet>

      <AuthShell
        onNavigate={onNavigate}
        eyebrow="Account Security"
        title="Update your password and keep access secure"
        description="Change your password anytime from your account settings without affecting your library, purchases, or course access."
        highlights={[
          'Use a stronger password to protect your media and course account.',
          'Your saved assets and payment history remain unchanged.',
        ]}
      >
        <div className="mb-8">
          <p className="media-kicker">Security Settings</p>
          <h2 className="mt-3 text-3xl text-white">Change your password</h2>
          <p className="media-copy mt-3">Enter a new password below.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-white/78">New Password</Label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/34" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="form-surface h-12 rounded-[18px] pl-11"
                required
                minLength={6}
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="h-12 w-full rounded-full bg-cyan-300 text-[#041b26] hover:bg-cyan-200"
          >
            {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
            {loading ? 'Updating Password...' : 'Update Password'}
          </Button>
        </form>
      </AuthShell>
    </>
  );
};

export default ChangePasswordPage;
