'use client';

import { useState } from 'react';
import {
  Beaker,
  Loader2,
  Mail,
  User as UserIcon,
  Key,
} from 'lucide-react';
import {
  initiateAnonymousSignIn,
  initiateEmailSignUp,
  initiateEmailSignIn,
} from '@/firebase/non-blocking-login';
import { useAuth } from '@/firebase';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ThemeToggle } from './ThemeToggle';
import { TriangleAlert } from 'lucide-react';

export function Login() {
  const auth = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading('email-signup');
    setError(null);
    try {
      initiateEmailSignUp(auth, email, password);
    } catch (e: any) {
      setError(e.message);
      setLoading(null);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading('email-signin');
    setError(null);
    try {
      initiateEmailSignIn(auth, email, password);
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

      <Tabs defaultValue="signin" className="w-full max-w-md">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="signin">Sign In</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>
        <TabsContent value="signin">
          <Card>
            <form onSubmit={handleEmailSignIn}>
              <CardHeader>
                <CardTitle>Sign In</CardTitle>
                <CardDescription>
                  Enter your credentials to access your account.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="m@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signin-password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                {error && loading === 'email-signin' && (
                   <Alert variant="destructive">
                    <TriangleAlert className="h-4 w-4" />
                    <AlertTitle>Sign In Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading === 'email-signin'}
                >
                  {loading === 'email-signin' && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Sign In
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        <TabsContent value="signup">
          <Card>
            <form onSubmit={handleEmailSignUp}>
              <CardHeader>
                <CardTitle>Sign Up</CardTitle>
                <CardDescription>
                  Create a new account to get started.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                   <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="m@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                     <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                 {error && loading === 'email-signup' && (
                   <Alert variant="destructive">
                     <TriangleAlert className="h-4 w-4" />
                    <AlertTitle>Sign Up Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading === 'email-signup'}
                >
                  {loading === 'email-signup' && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Sign Up
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
      <div className="mt-4 text-center text-sm text-muted-foreground">
        Or continue as a guest
      </div>
      <Button
        variant="outline"
        className="mt-2 w-full max-w-md"
        onClick={handleAnonymousSignIn}
        disabled={loading === 'anonymous'}
      >
        {loading === 'anonymous' ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <UserIcon className="mr-2 h-4 w-4" />
        )}
        Sign In Anonymously
      </Button>
    </div>
  );
}
