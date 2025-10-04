'use client';
import {
  Auth, 
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
} from 'firebase/auth';

type AuthCallback = () => void;
type ErrorCallback = (error: any) => void;

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth, onError: ErrorCallback): void {
  signInAnonymously(authInstance).catch(onError);
}

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string, onError: ErrorCallback): void {
  createUserWithEmailAndPassword(authInstance, email, password).catch(onError);
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string, onError: ErrorCallback): void {
  signInWithEmailAndPassword(authInstance, email, password).catch(onError);
}

/** Initiate Google Sign-In (non-blocking). */
export function initiateGoogleSignIn(authInstance: Auth, onError: ErrorCallback): void {
  const provider = new GoogleAuthProvider();
  signInWithPopup(authInstance, provider).catch(onError);
}

/** Sends a password reset email (non-blocking). */
export function sendPasswordReset(authInstance: Auth, email: string, onSuccess: AuthCallback, onError: ErrorCallback): void {
    sendPasswordResetEmail(authInstance, email).then(onSuccess).catch(onError);
}
