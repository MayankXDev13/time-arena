"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/useAuth";
import { useSidebarStore } from "@/stores/useSidebarStore";
import { useThemeSync } from "@/hooks/useThemeSync";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { AccountInfo } from "@/components/profile/AccountInfo";
import { Preferences } from "@/components/profile/Preferences";
import { FocusHeatmap } from "@/components/focus/FocusHeatmap";
import { Achievements } from "@/components/profile/Achievements";
import { ProfileSkeleton } from "@/components/profile/ProfileSkeleton";

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth();
  const { isOpen } = useSidebarStore();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  useThemeSync();

  const stats = useQuery(api.sessions.getStats, user?.id ? { userId: user.id as any } : "skip");
  const contribution = useQuery(
    api.sessions.getContributionGraph,
    user?.id ? { userId: user.id, year: selectedYear } : "skip"
  );

  if (!isAuthenticated || !user) {
    return null;
  }

  if (!stats || !contribution) {
    return (
      <div className={`min-h-screen bg-background transition-all duration-300 ${
        isOpen ? "md:pl-64" : "md:pl-0"
      }`}>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <h1 className="text-2xl font-bold text-foreground mb-8">Profile</h1>
          <ProfileSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-background transition-all duration-300 ${
      isOpen ? "md:pl-64" : "md:pl-0"
    }`}>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-2xl font-bold text-foreground mb-8">Profile</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 grid grid-cols-4 w-full max-w-md">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="preferences">Settings</TabsTrigger>
            <TabsTrigger value="achievements">Badges</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="space-y-6">
              <ProfileHeader
                stats={{
                  totalMinutes: stats.totalMinutes,
                  totalSessions: stats.totalSessions,
                  currentStreak: stats.currentStreak,
                }}
              />
              <FocusHeatmap
                data={contribution || []}
                onYearChange={setSelectedYear}
              />
            </div>
          </TabsContent>

          <TabsContent value="account">
            <AccountInfo />
          </TabsContent>

          <TabsContent value="preferences">
            <Preferences />
          </TabsContent>

          <TabsContent value="achievements">
            <Achievements
              stats={{
                totalMinutes: stats.totalMinutes,
                totalSessions: stats.totalSessions,
                currentStreak: stats.currentStreak,
                longestStreak: stats.currentStreak,
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
