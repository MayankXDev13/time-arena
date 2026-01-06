import { useAuth } from '@/hooks/useAuth';
import { StreakHeader } from '@/components/streak/StreakHeader';
import { Button } from '@/components/ui/button';
import { PiSignOut, PiUser } from 'react-icons/pi';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export function Header() {
  const { user, signOut } = useAuth();

  const getInitials = (email: string) => {
    return email.split('@')[0].slice(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-black/50 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-white">Timer Arena</h1>
          <StreakHeader />
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <>
              <div className="flex items-center gap-2">
                <Avatar className="w-8 h-8 bg-zinc-800">
                  <AvatarFallback className="text-xs text-zinc-400">
                    {getInitials(user.email || 'U')}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-zinc-400 hidden md:block">
                  {user.email?.split('@')[0]}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={signOut}
                className="text-zinc-400 hover:text-white"
              >
                <PiSignOut className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
