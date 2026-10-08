"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLinkedAccounts } from "@/hooks/useLinkedAccounts";
import { authClient } from "@/lib/auth-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Github, Key, Mail } from "lucide-react";

export function AccountInfo() {
  const { user } = useAuth();
  const { oauthProvider, hasPasswordAccount } = useLinkedAccounts();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>("");

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const result = await authClient.changePassword({
        newPassword: password,
        currentPassword: currentPassword,
      });
      if (result.error) {
        setError(result.error.message ?? "Failed to change password");
      } else {
        setShowPasswordModal(false);
        setCurrentPassword("");
        setPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      setError("Failed to change password");
    } finally {
      setIsLoading(false);
    }
  };

  const getProviderIcon = () => {
    if (oauthProvider === "github") return <Github className="w-5 h-5" />;
    return <Mail className="w-5 h-5" />;
  };

  const getProviderName = () => {
    if (oauthProvider === "github") return "GitHub";
    if (oauthProvider === "google") return "Google";
    return "Email";
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Manage your account settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              {getProviderIcon()}
              <div>
                <div className="font-medium">{getProviderName()} Account</div>
                <div className="text-sm text-muted-foreground">{user?.email}</div>
              </div>
            </div>
            <div className="px-3 py-1 bg-green-500/10 text-green-600 text-sm rounded-full">
              Connected
            </div>
          </div>

          {hasPasswordAccount && (
            <>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Password</div>
                  <div className="text-sm text-muted-foreground">
                    Change your password regularly for security
                  </div>
                </div>
                <Button variant="outline" onClick={() => setShowPasswordModal(true)}>
                  <Key className="w-4 h-4 mr-2" />
                  Change Password
                </Button>
              </div>
            </>
          )}

        </CardContent>
      </Card>

      {showPasswordModal && hasPasswordAccount && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Enter a new password for your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                {error && (
                  <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
                    {error}
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Current Password</label>
                  <Input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">New Password</label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Confirm Password</label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowPasswordModal(false);
                      setCurrentPassword("");
                      setPassword("");
                      setConfirmPassword("");
                      setError("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Changing..." : "Change Password"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

    </>
  );
}
