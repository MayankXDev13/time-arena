"use client";

import { useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatTime } from "@/lib/constants";
import { Camera, Mail, Edit2, Check, X, Loader2, AlertCircle } from "lucide-react";

interface ProfileHeaderProps {
  stats: {
    totalMinutes: number;
    totalSessions: number;
    currentStreak: number;
  };
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

export function ProfileHeader({ stats }: ProfileHeaderProps) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [displayName, setDisplayName] = useState(user?.name || "");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const profile = useQuery(api.users.getProfile, user?.id ? { userId: user.id } : "skip");
  const avatarUrl = useQuery(
    api.users.getAvatarUrl,
    profile?.profile?.avatarStorageId ? { storageId: profile.profile.avatarStorageId } : "skip"
  );

  const uploadAvatar = useMutation(api.users.updateAvatar);
  const getUploadUrl = useMutation(api.users.getUploadUrl);
  const updateName = useMutation(api.users.updateProfile);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setUploadSuccess(false);

    if (file.size > MAX_FILE_SIZE) {
      setUploadError("File size must be less than 5MB");
      return;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      setUploadError("Please select a valid image file (JPEG, PNG, GIF, or WebP)");
      return;
    }

    setIsUploading(true);
    try {
      const uploadUrl = await getUploadUrl();

      const response = await fetch(uploadUrl, {
        method: "POST",
        body: file,
        headers: { "Content-Type": file.type },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to upload file");
      }

      const data = await response.json();
      await uploadAvatar({ userId: user!.id, avatarStorageId: data.storageId });
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to upload avatar. Please try again.";
      setUploadError(message);
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
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={user?.name}
                className="w-full h-full object-cover"
              />
            ) : user?.image ? (
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
            onClick={() => {
              setUploadError(null);
              fileInputRef.current?.click();
            }}
            disabled={isUploading}
          >
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Camera className="w-4 h-4" />
            )}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarUpload}
          />
          {uploadError && (
            <div className="absolute -bottom-10 left-0 right-0 flex items-center gap-1 text-xs text-red-500 bg-white dark:bg-gray-900 p-1 rounded">
              <AlertCircle className="w-3 h-3 flex-shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}
          {uploadSuccess && (
            <div className="absolute -bottom-10 left-0 right-0 flex items-center gap-1 text-xs text-green-600 bg-white dark:bg-gray-900 p-1 rounded">
              <Check className="w-3 h-3 flex-shrink-0" />
              <span>Avatar uploaded!</span>
            </div>
          )}
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
