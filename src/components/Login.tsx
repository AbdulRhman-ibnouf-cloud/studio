'use client';

import { useState } from 'react';
import {
  Beaker,
  Loader2,
  User as UserIcon,
} from 'lucide-react';
import {
  initiateAnonymousSignIn,
} from '@/firebase/non-blocking-login';
import { useAuth } from '@/firebase';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './ThemeToggle';

export function Login() {
  const auth = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnonymousSignIn = async () => {
    setLoading('anonymous');
    setError(null);
    try {
      initiateAnonymousSignIn(auth);
    } catch (e: any) {
      setError(e.message);
      setLoading(null);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-3">
          <Beaker className="h-10 w-10 text-primary" />
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            ABG Insights
          </h1>
        </div>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Sign in to access your AI-powered assistant for rapid Arterial Blood
          Gas analysis.
        </p>
      </div>

      <div className="w-full max-w-md space-y-4">
        <Button
          variant="outline"
          className="w-full"
          onClick={handleAnonymousSignIn}
          disabled={loading === 'anonymous'}
          size="lg"
        >
          {loading === 'anonymous' ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <UserIcon className="mr-2 h-4 w-4" />
          )}
          Continue as Guest
        </Button>
      </div>
    </div>
  );
}
