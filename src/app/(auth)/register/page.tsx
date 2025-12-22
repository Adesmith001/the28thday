'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { EyeIcon, EyeOffIcon, MailIcon, UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function RegisterPage() {
  const { user, loading, signInWithGoogle, signUpWithEmail } = useAuth();
  const router = useRouter();
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [error, setError] = useState('');

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      const isOnboarded = Boolean(user.profile) || Boolean(user.onboardingCompleted);
      router.replace(isOnboarded ? '/dashboard' : '/onboarding');
    }
  }, [user, loading, router]);

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSigningUp(true);
    setError('');

    const trimmedEmail = email.trim();
    const trimmedName = fullName.trim();

    if (!trimmedName) {
      setError('Please enter your full name.');
      setIsSigningUp(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      setIsSigningUp(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setIsSigningUp(false);
      return;
    }

    try {
      await signUpWithEmail(trimmedEmail, password, trimmedName);
    } catch (err) {
      console.error('Sign-up error:', err);
      setError('Failed to create account. Please check your details and try again.');
      setIsSigningUp(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsSigningUp(true);
    setError('');

    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('Google sign-up error:', err);
      setError('Failed to sign up with Google. Please try again.');
      setIsSigningUp(false);
    }
  };

  if (loading || (user && isSigningUp)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            {user ? 'Redirecting...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-green-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 p-4">
      <Card className="w-full max-w-md rounded-3xl border bg-white/70 dark:bg-gray-900/60 backdrop-blur-sm">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto mt-2 mb-1 flex h-12 w-12 items-center justify-center rounded-full bg-green-500 shadow-sm">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M12 3c-3.6 2.1-6 5.4-6 9.3C6 16.4 8.7 20 12 21c3.3-1 6-4.6 6-8.7C18 8.4 15.6 5.1 12 3Z"
                fill="white"
                opacity="0.95"
              />
              <path
                d="M7.5 13.2c2.1-.6 3.8-.3 4.8.8 1-1.1 2.7-1.4 4.8-.8-.4 2.8-2.4 5.2-4.8 5.9-2.4-.7-4.4-3.1-4.8-5.9Z"
                fill="white"
              />
            </svg>
          </div>
          <CardTitle className="text-4xl font-bold">The 28th Day</CardTitle>
          <CardDescription className="text-base">Create Account</CardDescription>
          <p className="text-sm text-muted-foreground">Sign up to begin your PCOS health journey</p>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-md text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleEmailSignUp} className="space-y-3">
            <div className="relative">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="h-12 rounded-full pl-12"
                required
                disabled={isSigningUp}
              />
            </div>

            <div className="relative">
              <MailIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="email"
                placeholder="hello@the28thday.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 rounded-full pl-12"
                required
                disabled={isSigningUp}
              />
            </div>

            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Create password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 rounded-full pr-12"
                required
                disabled={isSigningUp}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                disabled={isSigningUp}
              >
                {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
              </button>
            </div>

            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-12 rounded-full"
                required
                disabled={isSigningUp}
              />
            </div>

            <Button
              type="submit"
              disabled={isSigningUp}
              className="w-full h-12 rounded-full bg-green-500 hover:bg-green-600 text-white"
            >
              {isSigningUp ? 'Creating account...' : 'Sign Up'}
            </Button>
          </form>

          <div className="flex items-center gap-3 pt-2">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">OR CONTINUE WITH</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleSignUp}
            disabled={isSigningUp}
            className="w-full h-12 rounded-full"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </Button>

          <p className="text-xs text-center text-muted-foreground pt-2">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>

          <p className="text-sm text-center text-muted-foreground pt-2">
            Already have an account?{' '}
            <Link href="/login" className="text-green-600 hover:underline font-medium">
              Log In
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
