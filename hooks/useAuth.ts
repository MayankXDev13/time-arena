import { authClient } from "@/lib/auth-client";

// Better type definitions
interface User {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface Session {
  user: User;
  session: {
    id: string;
    expiresAt: Date;
    token: string;
    ipAddress?: string | null;
    userAgent?: string | null;
  };
}

interface AuthError {
  error: Error | null;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<AuthError>;
  signUp: (name: string, email: string, password: string) => Promise<AuthError>;
  signInWithGitHub: () => Promise<AuthError>;
  signInWithGoogle: () => Promise<AuthError>;
  signOut: () => Promise<void>;
}

export function useAuth(): AuthState {
  const { data: session, isPending: loading } = authClient.useSession();

  const signInWithEmail = async (email: string, password: string): Promise<AuthError> => {
    try {
      const result = await authClient.signIn.email({
        email,
        password,
      });
      
      if (result.error) {
        return { error: new Error(result.error.message) };
      }
      
      return { error: null };
    } catch (err) {
      return { 
        error: err instanceof Error ? err : new Error('Sign in failed') 
      };
    }
  };

  const signUpWithEmail = async (
    name: string, 
    email: string, 
    password: string
  ): Promise<AuthError> => {
    try {
      const result = await authClient.signUp.email({
        email,
        password,
        name,
      });
      
      if (result.error) {
        return { error: new Error(result.error.message) };
      }
      
      return { error: null };
    } catch (err) {
      return { 
        error: err instanceof Error ? err : new Error('Sign up failed') 
      };
    }
  };

  const signInWithGitHub = async (): Promise<AuthError> => {
    try {
      const result = await authClient.signIn.social({
        provider: "github",
        callbackURL: "/dashboard", // Redirect to dashboard after login
      });
      
      if (result?.error) {
        return { error: new Error(result.error.message) };
      }
      
      return { error: null };
    } catch (err) {
      return { 
        error: err instanceof Error ? err : new Error('GitHub sign in failed') 
      };
    }
  };

  const signInWithGoogle = async (): Promise<AuthError> => {
    try {
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/dashboard", // Redirect to dashboard after login
      });
      
      if (result?.error) {
        return { error: new Error(result.error.message) };
      }
      
      return { error: null };
    } catch (err) {
      return { 
        error: err instanceof Error ? err : new Error('Google sign in failed') 
      };
    }
  };

  const handleSignOut = async (): Promise<void> => {
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            // Optional: redirect to home page
            window.location.href = '/';
          }
        }
      });
    } catch (err) {
      console.error('Sign out error:', err);
      // Force redirect even if sign out fails
      window.location.href = '/';
    }
  };

  return {
    user: session?.user ?? null,
    session: session ? {
      user: session.user,
      session: session.session,
    } : null,
    loading,
    isAuthenticated: !!session?.user,
    signIn: signInWithEmail,
    signUp: signUpWithEmail,
    signInWithGitHub,
    signInWithGoogle,
    signOut: handleSignOut,
  };
}

