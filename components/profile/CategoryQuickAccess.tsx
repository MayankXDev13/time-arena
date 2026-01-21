"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Settings2 } from "lucide-react";
import { formatTime } from "@/lib/constants";

interface CategoryStats {
  categoryId: string;
  thisWeek: number;
}

interface CategoryQuickAccessProps {
  categories: Array<{
    _id: string;
    name: string;
    color: string;
  }>;
  stats: CategoryStats[];
}

export function CategoryQuickAccess({ categories, stats }: CategoryQuickAccessProps) {
  const router = useRouter();

  const categoryStatsMap = new Map<string, number>();
  stats.forEach((stat) => {
    categoryStatsMap.set(stat.categoryId, stat.thisWeek);
  });

  const topCategories = [...categories]
    .sort((a, b) => (categoryStatsMap.get(a._id) || 0) - (categoryStatsMap.get(b._id) || 0))
    .slice(0, 5);

  const maxMinutes = Math.max(
    ...topCategories.map((cat) => categoryStatsMap.get(cat._id) || 0),
    1
  );

  if (categories.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Categories</CardTitle>
            <CardDescription>No categories yet</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            <p>Create categories to track your focus time by area</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push("/categories")}
            >
              Create Categories
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Categories</CardTitle>
          <CardDescription>Your top focus areas this week</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={() => router.push("/categories")}>
          <Settings2 className="w-4 h-4 mr-2" />
          Manage
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {topCategories.map((category) => {
          const minutes = categoryStatsMap.get(category._id) || 0;
          const percentage = (minutes / maxMinutes) * 100;

          return (
            <div key={category._id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="text-sm font-medium">{category.name}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {formatTime(minutes)}
                </span>
              </div>
              <Progress value={percentage} className="h-2" />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
