import { authClient } from "@/lib/auth-client";

interface AuthState {
  user: any | null;
  session: any | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (name: string, email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGitHub: () => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

export function useAuth(): AuthState {
  const { data: session, isPending: loading } = authClient.useSession();

  const signInWithEmail = async (email: string, password: string) => {
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
      return { error: err as Error };
    }
  };

  const signUpWithEmail = async (name: string, email: string, password: string) => {
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
      return { error: err as Error };
    }
  };

  const signInWithGitHub = async () => {
    try {
      await authClient.signIn.social({
        provider: "github",
        callbackURL: "/",
      });
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signInWithGoogle = async () => {
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      });
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const handleSignOut = async () => {
    await authClient.signOut();
  };

  return {
    user: session?.user ?? null,
    session: session ?? null,
    loading,
    signIn: signInWithEmail,
    signUp: signUpWithEmail,
    signInWithGitHub,
    signInWithGoogle,
    signOut: handleSignOut,
  };
}
