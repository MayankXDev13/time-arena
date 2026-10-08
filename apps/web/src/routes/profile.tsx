
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useContributions, useStats } from "@/hooks/useStats";
import { useSidebarStore } from "@/stores/useSidebarStore";
import { useThemeSync } from "@/hooks/useThemeSync";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PageHeader } from "@/components/layout/PageHeader";
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

  const statsQuery = useStats();
  const contribQuery = useContributions(selectedYear);
  const stats = statsQuery.data;
  const contribution = contribQuery.data;

  if (!isAuthenticated || !user) {
    return null;
  }

  if (statsQuery.isError || contribQuery.isError) {
    return (
      <div className={`min-h-screen bg-background transition-all duration-300 ${
        isOpen ? "md:pl-64" : "md:pl-0"
      }`}>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <h1 className="text-2xl font-bold text-foreground mb-8">Profile</h1>
          <p className="text-sm text-muted-foreground">
            Couldn&apos;t load your record. Check your connection and try again.
          </p>
          <button
            type="button"
            className="mt-4 rounded-lg border border-border px-4 py-2 text-sm font-medium"
            onClick={() => {
              void statsQuery.refetch();
              void contribQuery.refetch();
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
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
        <PageHeader
          eyebrow="Fighter card"
          title="Profile"
          description="Your record, year of training, settings, and badges."
          className="mb-8"
        />

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
