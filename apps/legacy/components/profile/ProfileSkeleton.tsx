"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function ProfileSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <Card>
        <CardContent className="flex items-center gap-6 p-6">
          <div className="w-24 h-24 rounded-full bg-muted" />
          <div className="flex-1 space-y-3">
            <div className="h-6 w-48 bg-muted rounded" />
            <div className="h-4 w-64 bg-muted rounded" />
          </div>
          <div className="hidden sm:flex gap-8">
            <div className="text-center">
              <div className="h-8 w-16 bg-muted rounded mb-1" />
              <div className="h-3 w-12 bg-muted rounded mx-auto" />
            </div>
            <div className="text-center">
              <div className="h-8 w-16 bg-muted rounded mb-1" />
              <div className="h-3 w-12 bg-muted rounded mx-auto" />
            </div>
            <div className="text-center">
              <div className="h-8 w-16 bg-muted rounded mb-1" />
              <div className="h-3 w-12 bg-muted rounded mx-auto" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="h-6 w-32 bg-muted rounded" />
            <div className="h-4 w-48 bg-muted rounded mt-1" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-muted" />
                  <div className="flex-1">
                    <div className="h-4 w-24 bg-muted rounded mb-1" />
                  </div>
                  <div className="h-4 w-12 bg-muted rounded" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="h-6 w-32 bg-muted rounded" />
            <div className="h-4 w-48 bg-muted rounded mt-1" />
          </CardHeader>
          <CardContent>
            <div className="h-[100px] bg-muted rounded" />
            <div className="flex justify-end gap-2 mt-2">
              <div className="h-3 w-12 bg-muted rounded" />
              <div className="h-3 w-3 bg-muted rounded" />
              <div className="h-3 w-3 bg-muted rounded" />
              <div className="h-3 w-3 bg-muted rounded" />
              <div className="h-3 w-3 bg-muted rounded" />
              <div className="h-3 w-3 bg-muted rounded" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
