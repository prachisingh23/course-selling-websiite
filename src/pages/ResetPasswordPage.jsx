import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Loader2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/useAuth';
import { useToast } from '@/components/ui/use-toast';
import AuthShell from '@/components/layout/AuthShell';

const ResetPasswordPage = ({ onNavigate }) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { updateUserPassword, user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (event) => {
    event.preventDefault();
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
        <title>Reset Password - Lifelapss</title>
        <meta name="description" content="Set a new password for your Lifelapss account." />
      </Helmet>

      <AuthShell
        onNavigate={onNavigate}
        backTarget={user ? 'home' : 'forgot-password'}
        backLabel={user ? 'Back to Home' : 'Request New Link'}
        eyebrow="Set New Password"
        title="Choose a new password and get back in quickly"
        description="Once the reset link is verified, you can choose a new password and return to your account immediately."
        highlights={[
          'Use at least 6 characters for your new password.',
          'If the link has expired, request a fresh recovery email.',
        ]}
      >
        <div className="mb-8">
          <p className="media-kicker">Secure Reset</p>
          <h2 className="mt-3 text-3xl text-white">
            {user ? 'Set your new password' : 'Reset link needed'}
          </h2>
          <p className="media-copy mt-3">
            {user
              ? 'Enter a new password below to finish recovery.'
              : 'The password reset link seems invalid or expired. Request a new one to continue.'}
          </p>
        </div>

        {user ? (
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
        ) : (
          <Button
            type="button"
            onClick={() => onNavigate('forgot-password')}
            className="h-12 w-full rounded-full bg-cyan-300 text-[#041b26] hover:bg-cyan-200"
          >
            Request a New Link
          </Button>
        )}
      </AuthShell>
    </>
  );
};

export default ResetPasswordPage;
