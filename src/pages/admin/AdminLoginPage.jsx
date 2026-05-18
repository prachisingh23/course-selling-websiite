import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Mail, Lock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/useAuth';
import { useToast } from '@/components/ui/use-toast';
import AuthShell from '@/components/layout/AuthShell';
import { isAllowedAdminEmail } from '@/config/adminAccess';

const AdminLoginPage = ({ onNavigate }) => {
  const [email, setEmail] = useState('vipulkumar.quant@gmail.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAllowedAdminEmail(email)) {
      toast({
        variant: 'destructive',
        title: 'Access restricted',
        description: 'Only the configured admin email can access this dashboard.',
      });
      return;
    }

    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) {
       toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: 'Please check your credentials and try again.',
      });
      setLoading(false);
    } else {
        // Successful sign-in will trigger the auth state change
        // and AdminLayout will handle the redirection based on role.
    }
  };

  return (
    <>
      <Helmet>
        <title>Admin Login - Lifelapss</title>
      </Helmet>

      <AuthShell
        onNavigate={onNavigate}
        backTarget="home"
        backLabel="Back to site"
        eyebrow="Admin Access"
        title="Run the curated media platform."
        description="Secure login for the restricted admin account that manages editorial content, sales, users, and platform settings."
        highlights={[
          'Only vipulkumar.quant@gmail.com can access this admin dashboard.',
          'Only admins can upload photos, videos, and media library files.',
          'Media, articles, and payments remain under the current live system.',
          'Use this dashboard to manage the premium catalog without opening uploads to normal users.',
        ]}
      >
        <div className="mb-8 flex items-center gap-3">
          <img className="h-12 w-12 rounded-2xl border border-white/10 object-cover" alt="Lifelaps logo" src="https://horizons-cdn.hostinger.com/528a3c0e-01fd-4f14-89f9-123543f56514/825abd5a547aafaa83312712ad85799f.jpg" />
          <div>
            <p className="media-kicker">Dashboard</p>
            <h1 className="text-3xl text-white">Secure Login</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white/82">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/38" />
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-surface h-12 rounded-2xl pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-white/82">Password</Label>
              <button
                type="button"
                onClick={() => onNavigate('forgot-password')}
                className="text-sm font-semibold text-cyan-200/82 transition hover:text-white"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/38" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-surface h-12 rounded-2xl pl-10"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            className="premium-button h-12 w-full rounded-2xl text-sm font-semibold"
            disabled={loading}
          >
             {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Login'}
          </Button>
        </form>
      </AuthShell>
    </>
  );
};

export default AdminLoginPage;
