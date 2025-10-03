'use client';

import { useState } from 'react';
import {
  Beaker,
  Loader2,
  Mail,
  User as UserIcon,
  KeyRound,
} from 'lucide-react';
import {
  initiateAnonymousSignIn,
  initiateGoogleSignIn,
  initiateEmailSignIn,
  initiateEmailSignUp,
} from '@/firebase/non-blocking-login';
import { useAuth } from '@/firebase';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from './ThemeToggle';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { TriangleAlert } from 'lucide-react';

function GoogleIcon() {
  return (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2">
      <title>Google</title>
      <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.05 1.05-2.58 3.18-7.11 3.18-5.52 0-10.02-4.48-10.02-10.01s4.5-10.01 10.02-10.01c3.18 0 5.22 1.25 6.42 2.39l2.84-2.82C18.68 1.43 15.82 0 12.48 0 5.6 0 0 5.6 0 12.5S5.6 25 12.48 25c7.34 0 11.52-5.06 11.52-11.75 0-.79-.07-1.55-.19-2.33h-11.3v.01Z" />
    </svg>
  );
}

export function Login() {
  const auth = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleAuthAction = async (
    action: 'google' | 'anonymous' | 'email-signin' | 'email-signup'
  ) => {
    setLoading(action);
    setError(null);
    try {
      if (action === 'google') {
        initiateGoogleSignIn(auth);
      } else if (action === 'anonymous') {
        initiateAnonymousSignIn(auth);
      } else if (action === 'email-signin') {
        initiateEmailSignIn(auth, email, password);
      } else if (action === 'email-signup') {
        initiateEmailSignUp(auth, email, password);
      }
    } catch (e: any) {
      setError(e.message);
      setLoading(null);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
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

      <Tabs defaultValue="sign-in" className="w-full max-w-md">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sign-in">Sign In</TabsTrigger>
          <TabsTrigger value="sign-up">Sign Up</TabsTrigger>
        </TabsList>
        <TabsContent value="sign-in">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                  <div>
                      <CardTitle>Sign In</CardTitle>
                      <CardDescription>
                          Choose your preferred sign-in method below.
                      </CardDescription>
                  </div>
                  <ThemeToggle />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <TriangleAlert className="h-4 w-4" />
                  <AlertTitle>Authentication Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
               <Button
                variant="outline"
                className="w-full"
                onClick={() => handleAuthAction('google')}
                disabled={loading === 'google'}
                size="lg"
              >
                {loading === 'google' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <GoogleIcon />
                )}
                Sign In with Google
              </Button>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email-signin">Email</Label>
                <Input
                  id="email-signin"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!!loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-signin">Password</Label>
                <Input
                  id="password-signin"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={!!loading}
                />
              </div>
              <Button
                className="w-full"
                onClick={() => handleAuthAction('email-signin')}
                disabled={loading === 'email-signin'}
              >
                {loading === 'email-signin' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="mr-2 h-4 w-4" />
                )}
                Sign In with Email
              </Button>

              <Button
                variant="secondary"
                className="w-full"
                onClick={() => handleAuthAction('anonymous')}
                disabled={loading === 'anonymous'}
              >
                {loading === 'anonymous' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <UserIcon className="mr-2 h-4 w-4" />
                )}
                Continue as Guest
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="sign-up">
          <Card>
            <CardHeader>
               <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Sign Up</CardTitle>
                    <CardDescription>
                      Create a new account to save your analyses.
                    </CardDescription>
                  </div>
                  <ThemeToggle />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <TriangleAlert className="h-4 w-4" />
                  <AlertTitle>Authentication Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="email-signup">Email</Label>
                <Input
                  id="email-signup"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!!loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-signup">Password</Label>
                <Input
                  id="password-signup"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={!!loading}
                />
              </div>
              <Button
                className="w-full"
                onClick={() => handleAuthAction('email-signup')}
                disabled={loading === 'email-signup'}
              >
                {loading === 'email-signup' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="mr-2 h-4 w-4" />
                )}
                Sign Up with Email
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
