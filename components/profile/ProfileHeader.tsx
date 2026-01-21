"use client";

import { useRef, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatTime } from "@/lib/constants";
import { Camera, Mail, Edit2, Check, X } from "lucide-react";

interface ProfileHeaderProps {
  stats: {
    totalMinutes: number;
    totalSessions: number;
    currentStreak: number;
  };
}

export function ProfileHeader({ stats }: ProfileHeaderProps) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [displayName, setDisplayName] = useState(user?.name || "");
  const [isUploading, setIsUploading] = useState(false);

  const uploadAvatar = useMutation(api.users.updateAvatar);
  const getUploadUrl = useMutation(api.users.getUploadUrl);
  const updateName = useMutation(api.users.updateProfile);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const uploadUrl = await getUploadUrl();

      await fetch(uploadUrl, {
        method: "POST",
        body: file,
        headers: { "Content-Type": file.type },
      }).then(async (response) => {
        const data = await response.json();
        await uploadAvatar({ userId: user!.id, avatarStorageId: data.storageId });
      });
    } catch (error) {
      console.error("Failed to upload avatar:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleNameSave = async () => {
    if (!user?.id || displayName.trim() === "") return;
    await updateName({ userId: user.id });
    setIsEditingName(false);
  };

  const isOAuth = user?.email?.includes("github") || user?.email?.includes("google");

  return (
    <Card>
      <CardContent className="flex items-center gap-6 p-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center overflow-hidden">
            {user?.image ? (
              <img
                src={user.image}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-3xl font-bold text-primary-foreground">
                {user?.name?.[0]?.toUpperCase() || "?"}
              </span>
            )}
          </div>
          <Button
            size="icon"
            className="absolute bottom-0 right-0 rounded-full w-8 h-8"
            variant="secondary"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            <Camera className="w-4 h-4" />
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarUpload}
          />
        </div>

        <div className="flex-1 min-w-0">
          {isEditingName ? (
            <div className="flex items-center gap-2">
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="h-8 max-w-[200px]"
                placeholder="Your name"
              />
              <Button size="icon" className="h-8 w-8" onClick={handleNameSave}>
                <Check className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={() => {
                  setDisplayName(user?.name || "");
                  setIsEditingName(false);
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold truncate">{user?.name}</h2>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6"
                onClick={() => {
                  setDisplayName(user?.name || "");
                  setIsEditingName(true);
                }}
              >
                <Edit2 className="w-3 h-3" />
              </Button>
            </div>
          )}
          <div className="flex items-center gap-2 text-muted-foreground mt-1">
            <Mail className="w-4 h-4" />
            <span className="text-sm truncate">{user?.email}</span>
            {isOAuth && (
              <span className="text-xs px-2 py-0.5 bg-secondary rounded-full">
                {user?.email?.includes("github") ? "GitHub" : "Google"}
              </span>
            )}
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-6 text-right">
          <div>
            <div className="text-2xl font-bold">{formatTime(stats.totalMinutes)}</div>
            <div className="text-xs text-muted-foreground">Total Focus</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{stats.totalSessions}</div>
            <div className="text-xs text-muted-foreground">Sessions</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{stats.currentStreak}</div>
            <div className="text-xs text-muted-foreground">Day Streak</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
