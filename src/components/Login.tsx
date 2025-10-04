'use client';

import { useState } from 'react';
import {
  Beaker,
  Loader2,
  Mail,
  User as UserIcon,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  initiateAnonymousSignIn,
  initiateGoogleSignIn,
  initiateEmailSignIn,
  initiateEmailSignUp,
  sendPasswordReset,
} from '@/firebase/auth-actions';
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
import { ThemeToggleSwitch } from './ThemeToggleSwitch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { TriangleAlert } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';


function GoogleIcon() {
  return (
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-5 w-5 mr-3">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
      <path fill="none" d="M0 0h48v48H0z"></path>
    </svg>
  );
}

export function Login() {
  const auth = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { toast } = useToast();

  const handleAuthAction = async (
    action: 'google' | 'anonymous' | 'email-signin' | 'email-signup'
  ) => {
    setLoading(action);
    setError(null);
    setShowForgotPassword(false);
    
    if (action === 'email-signin' || action === 'email-signup') {
      if (!email && !password) {
        setError("Please enter your email and password.");
        setLoading(null);
        return;
      }
      if (!email) {
        setError("Please enter your email.");
        setLoading(null);
        return;
      }
      if (!password) {
        setError("Please enter your password.");
        setLoading(null);
        return;
      }
    }
    
    const onError = (e: any) => {
      let message = 'An unexpected error occurred. Please try again.';
      if (e.code === 'auth/weak-password') {
        message = 'Password should be at least 6 characters.';
      } else if (e.code === 'auth/invalid-credential' || e.code === 'auth/wrong-password') {
        message = 'Invalid credentials. Please check your email and password and try again.';
        setShowForgotPassword(true);
      } else if (e.code === 'auth/user-not-found') {
        message = 'No account found with this email address.';
      } else if (e.code === 'auth/email-already-in-use') {
        message = 'This email address is already in use by another account.';
      }
      setError(message);
      setLoading(null);
    }
    
    if (action === 'google') {
      initiateGoogleSignIn(auth, onError);
    } else if (action === 'anonymous') {
      initiateAnonymousSignIn(auth, onError);
    } else if (action === 'email-signin') {
      initiateEmailSignIn(auth, email, password, onError);
    } else if (action === 'email-signup') {
      initiateEmailSignUp(auth, email, password, onError);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setError("Please enter your email address to reset your password.");
      return;
    }
    setLoading('reset-password');
    setError(null);

    const onSuccess = () => {
        toast({
            title: "Password Reset Email Sent",
            description: `An email has been sent to ${email} with instructions to reset your password.`,
        });
        setLoading(null);
    };

    const onError = (e: any) => {
        let message = "Failed to send password reset email. Please try again.";
        if(e.code === 'auth/user-not-found') {
            message = "No account found with this email address."
        }
        setError(message);
        setLoading(null);
    }

    sendPasswordReset(auth, email, onSuccess, onError);
  };
  
  const handleTabChange = (value: string) => {
    setError(null);
    setShowPassword(false);
    setShowForgotPassword(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
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

      <Tabs defaultValue="sign-in" className="w-full max-w-md" onValueChange={handleTabChange}>
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
                className="w-full text-foreground hover:bg-muted"
                onClick={() => handleAuthAction('google')}
                disabled={loading === 'google'}
                size="lg"
              >
                {loading === 'google' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <GoogleIcon />
                )}
                Continue with Google
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
                 <div className="flex items-center justify-between">
                    <Label htmlFor="password-signin">Password</Label>
                    {showForgotPassword && (
                         <Button
                            variant="link"
                            className="p-0 h-auto text-sm"
                            onClick={handlePasswordReset}
                            disabled={loading === 'reset-password'}
                        >
                            {loading === 'reset-password' ? (
                                <>
                                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                 Sending...
                                </>
                            ) : "Forgot Password?"}
                         </Button>
                    )}
                </div>
                <div className="relative">
                  <Input
                    id="password-signin"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={!!loading}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
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
                <div className="relative">
                  <Input
                    id="password-signup"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={!!loading}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
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
      <div className="mt-8">
        <ThemeToggleSwitch />
      </div>
    </div>
  );
}
