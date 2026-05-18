import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Loader2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/useAuth';
import AuthShell from '@/components/layout/AuthShell';

const ForgotPasswordPage = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { resetPasswordForEmail } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    await resetPasswordForEmail(email);
    setLoading(false);
  };

  return (
    <>
      <Helmet>
        <title>Forgot Password - Lifelapss</title>
        <meta name="description" content="Reset your Lifelapss password." />
      </Helmet>

      <AuthShell
        onNavigate={onNavigate}
        backTarget="login"
        backLabel="Back to Login"
        eyebrow="Password Recovery"
        title="Reset access without losing your account data"
        description="We’ll send a secure reset link to your email so you can get back into your library, courses, and saved media."
        highlights={[
          'Your media library, payments, and enrolled courses stay untouched.',
          'Use the secure reset link from your inbox to choose a new password.',
        ]}
      >
        <div className="mb-8">
          <p className="media-kicker">Need Help Signing In?</p>
          <h2 className="mt-3 text-3xl text-white">Forgot your password?</h2>
          <p className="media-copy mt-3">Enter your email and we’ll send reset instructions.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white/78">Email</Label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/34" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
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
            {loading ? 'Sending Link...' : 'Send Reset Link'}
          </Button>
        </form>
      </AuthShell>
    </>
  );
};

export default ForgotPasswordPage;
