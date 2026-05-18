import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Loader2, Lock, Mail, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/useAuth';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import AuthShell from '@/components/layout/AuthShell';

const SignupPage = ({ onNavigate }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { signUp } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    const { error } = await signUp(email, password, {
      fullName: name,
    });
    setLoading(false);

    if (error) {
      if (error.message.includes('User already registered')) {
        setErrorMessage('You already have an account. Please log in with your registered email.');
      } else {
        setErrorMessage(error.message);
      }
      setShowErrorDialog(true);
    } else {
      setShowSuccessDialog(true);
    }
  };

  const handleDialogContinue = () => {
    setShowSuccessDialog(false);
    onNavigate('courses');
  };

  const handleErrorDialogClose = () => {
    setShowErrorDialog(false);
    if (errorMessage.includes('log in')) {
      onNavigate('login');
    }
  };

  return (
    <>
      <Helmet>
        <title>Sign Up - Lifelapss</title>
        <meta name="description" content="Create your Lifelapss account and start learning today." />
      </Helmet>

      <AuthShell
        onNavigate={onNavigate}
        eyebrow="Create Account"
        title="Join the platform with one account for everything"
        description="Create your account to access courses, save favorites, manage purchases, and return to your library from any device."
        highlights={[
          'Keep learning content and purchased media under one profile.',
          'Use a single account for Favorites, My Library, and checkout.',
          'Stay ready for premium unlocks and future media releases.',
        ]}
      >
        <div className="mb-8">
          <p className="media-kicker">Get Started</p>
          <h2 className="mt-3 text-3xl text-white">Create your account</h2>
          <p className="media-copy mt-3">Start with a few details and you’ll be ready to browse, learn, and save.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-white/78">Full Name</Label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/34" />
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="form-surface h-12 rounded-[18px] pl-11"
                required
              />
            </div>
          </div>

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
            <Label htmlFor="password" className="text-white/78">Password</Label>
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
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-white/54">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => onNavigate('login')}
            className="font-semibold text-cyan-100/80 transition-colors hover:text-cyan-100"
          >
            Login
          </button>
        </p>
      </AuthShell>

      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent className="auth-card border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl text-white">Welcome to Lifelapss</AlertDialogTitle>
            <AlertDialogDescription className="text-white/62">
              Your account has been created. Check your email to verify access and continue to the courses page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={handleDialogContinue}
              className="rounded-full bg-cyan-300 text-[#041b26] hover:bg-cyan-200"
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showErrorDialog} onOpenChange={handleErrorDialogClose}>
        <AlertDialogContent className="auth-card border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl text-white">Sign Up Failed</AlertDialogTitle>
            <AlertDialogDescription className="text-white/62">
              {errorMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={handleErrorDialogClose}
              className="rounded-full bg-cyan-300 text-[#041b26] hover:bg-cyan-200"
            >
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default SignupPage;
