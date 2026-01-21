"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Clock, BarChart3, User, Folder, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DarkModeToggle } from "@/components/DarkModeToggle";

export function Sidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const navItems = [
    { href: "/", label: "Timer", icon: Clock },
    { href: "/categories", label: "Categories", icon: Folder },
    { href: "/profile", label: "Profile", icon: User },
    { href: "/stats", label: "Stats", icon: BarChart3 },
  ];

  return (
    <div className="hidden md:flex h-screen w-64 flex-col bg-sidebar border-r border-sidebar-border fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-xl font-bold text-sidebar-foreground">Time Arena</h1>
      </div>

       {/* Navigation */}
       <nav className="flex-1 px-4 py-6 space-y-2">
         {navItems.map(({ href, label, icon: Icon }) => (
           <Link key={href} href={href}>
             <Button
               variant={pathname === href ? "secondary" : "ghost"}
               className="w-full justify-start"
             >
               <Icon className="mr-2 h-4 w-4" />
               {label}
             </Button>
           </Link>
         ))}
       </nav>

       {/* Bottom Actions */}
       <div className="px-4 py-4 space-y-2 border-t border-sidebar-border">
         <DarkModeToggle />
         <Button
           variant="ghost"
           className="w-full justify-center"
           onClick={() => signOut()}
         >
           <LogOut className="mr-2 h-4 w-4" />
           Logout
         </Button>
       </div>
     </div>
  );
}
