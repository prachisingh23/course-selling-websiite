import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Loader2, Lock, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/useAuth';
import AuthShell from '@/components/layout/AuthShell';

const LoginPage = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    if (!error) {
      onNavigate('home');
    }
    setLoading(false);
  };

  return (
    <>
      <Helmet>
        <title>Login - Lifelapss</title>
        <meta name="description" content="Login to your Lifelapss account and continue your learning journey." />
      </Helmet>

      <AuthShell
        onNavigate={onNavigate}
        eyebrow="Account Access"
        title="Welcome back to your curated workspace"
        description="Sign in to continue browsing media, access your courses, and manage everything from your personal library."
        highlights={[
          'Resume purchased media and enrolled courses from one place.',
          'Use Favorites and My Library without losing your existing payment history.',
          'Keep account, course, and media access in a single login flow.',
        ]}
      >
        <div className="mb-8 flex items-center gap-3">
          <img
            className="h-11 w-11 rounded-full border border-white/10 object-cover"
            alt="Lifelapss logo"
            src="https://horizons-cdn.hostinger.com/528a3c0e-01fd-4f14-89f9-123543f56514/825abd5a547aafaa83312712ad85799f.jpg"
          />
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-cyan-100/72">
              Sign In
            </p>
            <h2 className="text-3xl text-white">Lifelapss</h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white/78">Email</Label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/34" />
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="form-surface h-12 rounded-[18px] pl-11"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-white/78">Password</Label>
              <button
                type="button"
                onClick={() => onNavigate('forgot-password')}
                className="text-sm font-medium text-cyan-100/78 transition-colors hover:text-cyan-100"
              >
                Forgot Password?
              </button>
            </div>
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
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="h-12 w-full rounded-full bg-cyan-300 text-[#041b26] hover:bg-cyan-200"
          >
            {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
            {loading ? 'Signing In...' : 'Login'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-white/54">
          Don&apos;t have an account?{' '}
          <button
            type="button"
            onClick={() => onNavigate('signup')}
            className="font-semibold text-cyan-100/80 transition-colors hover:text-cyan-100"
          >
            Create one
          </button>
        </p>
      </AuthShell>
    </>
  );
};

export default LoginPage;
