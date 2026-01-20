'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';
import { PiGithubLogo, PiGoogleLogo, PiSpinner } from 'react-icons/pi';
import { cn } from '@/lib/utils';

interface AuthFormProps {
  mode: 'login' | 'signup';
}

export function AuthForm({ mode }: AuthFormProps) {
  const { signIn, signUp, signInWithGitHub, signInWithGoogle, loading } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) {
          setError(error.message);
        } else {
          router.push('/');
          router.refresh();
        }
      } else {
        const { error } = await signUp(name, email, password);
        if (error) {
          setError(error.message);
        } else {
          setSuccessMessage('Account created successfully! Redirecting...');
          setTimeout(() => {
            router.push('/');
            router.refresh();
          }, 1500);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGitHubSignIn = async () => {
    setError(null);
    const { error } = await signInWithGitHub();
    if (error) {
      setError(error.message);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    const { error } = await signInWithGoogle();
    if (error) {
      setError(error.message);
    }
  };

  return (
    <Card className="bg-zinc-900 border-zinc-800 w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl text-white">
          {mode === 'login' ? 'Welcome back' : 'Create an account'}
        </CardTitle>
        <CardDescription className="text-zinc-400">
          {mode === 'login'
            ? 'Sign in to access your timer data'
            : 'Start tracking your time and building streaks'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          variant="outline"
          className="w-full border-zinc-700 hover:bg-zinc-800"
          onClick={handleGitHubSignIn}
          disabled={loading || isSubmitting}
        >
          <PiGithubLogo className="w-5 h-5 mr-2" />
          Continue with GitHub
        </Button>

        <Button
          variant="outline"
          className="w-full border-zinc-700 hover:bg-zinc-800"
          onClick={handleGoogleSignIn}
          disabled={loading || isSubmitting}
        >
          <PiGoogleLogo className="w-5 h-5 mr-2" />
          Continue with Google
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full bg-zinc-800" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-zinc-900 px-2 text-zinc-500">Or continue with</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div className="space-y-2">
              <Label htmlFor="name" className="text-zinc-300">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-zinc-300">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-zinc-300">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
            />
          </div>

          {error && (
            <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-md bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
              {successMessage}
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600"
            disabled={loading || isSubmitting}
          >
            {isSubmitting ? (
              <PiSpinner className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            {mode === 'login' ? 'Sign In' : 'Sign Up'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-zinc-400">
          {mode === 'login' ? (
            <>
              Don&apos;t have an account?{' '}
              <a href="/signup" className="text-orange-500 hover:underline">
                Sign up
              </a>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <a href="/login" className="text-orange-500 hover:underline">
                Sign in
              </a>
            </>
          )}
        </p>
      </CardFooter>
    </Card>
  );
}
