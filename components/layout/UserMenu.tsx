'use client';

import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PiGithubLogo, PiSignOut, PiUser } from 'react-icons/pi';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export function UserMenu() {
  const { user, signOut, signInWithGitHub, loading } = useAuth();
  const router = useRouter();

  const handleSignIn = async () => {
    const { error } = await signInWithGitHub();
    if (!error) {
      router.refresh();
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.refresh();
  };

  const getInitials = (email: string) => {
    return email
      .split('@')[0]
      .slice(0, 2)
      .toUpperCase();
  };

  if (loading) {
    return <div className="w-8 h-8 rounded-full bg-zinc-800 animate-pulse" />;
  }

  if (!user) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={handleSignIn}
        className="text-zinc-400 hover:text-white"
      >
        <PiGithubLogo className="w-4 h-4 mr-2" />
        Sign in
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8 bg-zinc-800">
            <AvatarFallback className="bg-orange-500 text-white text-xs">
              {getInitials(user.email || 'U')}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-zinc-900 border-zinc-800" align="end">
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            <p className="font-medium text-white">{user.email?.split('@')[0]}</p>
            <p className="text-xs text-zinc-500">{user.email}</p>
          </div>
        </div>
        <DropdownMenuSeparator className="bg-zinc-800" />
        <DropdownMenuItem
          onClick={handleSignOut}
          className="text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
        >
          <PiSignOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
