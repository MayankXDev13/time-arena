
import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/auth-client";
import { qk } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

async function fetchLinkedAccounts(): Promise<{ providerId: string }[]> {
  const { data, error } = await authClient.listAccounts();
  if (error) throw new Error(error.message ?? "Failed to load linked accounts");
  return (data ?? []) as { providerId: string }[];
}

export type LinkedAccount = Awaited<ReturnType<typeof fetchLinkedAccounts>>[number];

/**
 * Linked auth accounts for the current user, via React Query.
 *
 * better-auth stores email/password under providerId "credential" and
 * social logins under their provider id ("github", "google", ...).
 * Checking the email string for provider names does not work because
 * real OAuth emails are regular addresses (e.g. user@gmail.com).
 */
export function useLinkedAccounts() {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: qk.linkedAccounts,
    queryFn: fetchLinkedAccounts,
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  const accounts = query.data ?? [];
  const oauthProvider =
    accounts.find((a) => a.providerId !== "credential")?.providerId ?? null;
  const hasPasswordAccount = accounts.some(
    (a) => a.providerId === "credential",
  );

  return {
    accounts,
    oauthProvider,
    hasPasswordAccount,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
