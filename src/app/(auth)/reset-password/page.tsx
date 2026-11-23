import Link from "next/link";
import { siteConfig } from "@/config/site";
import { resetPasswordAction } from "@/modules/auth/actions";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ShieldCheck, ArrowRight, Lock, ShieldAlert } from "lucide-react";

interface ResetPasswordPageProps {
  searchParams: {
    token?: string;
    error?: string;
  };
}

export default function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const token = searchParams.token || "";

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-muted/20">
      <div className="w-full max-w-md space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-2xl text-primary">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <span>{siteConfig.name}</span>
          </Link>
          <p className="text-sm text-muted-foreground">
            Choose a new, secure password
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Set New Password</CardTitle>
            <CardDescription>
              Your new password must be at least 8 characters with 1 uppercase letter and 1 number.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {searchParams.error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-lg flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{searchParams.error}</span>
              </div>
            )}

            {!token ? (
              <div className="space-y-3 text-center py-4">
                <p className="text-xs text-muted-foreground">
                  Invalid or missing password reset token.
                </p>
                <Link href="/forgot-password">
                  <Button variant="outline" size="sm">
                    Request New Link
                  </Button>
                </Link>
              </div>
            ) : (
              <form action={resetPasswordAction} className="space-y-4">
                <input type="hidden" name="token" value={token} />

                <div className="space-y-1.5">
                  <Label htmlFor="new-pass" className="text-xs">
                    New Password *
                  </Label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
                    <Input
                      id="new-pass"
                      name="newPassword"
                      type="password"
                      required
                      placeholder="At least 8 characters"
                      className="pl-9 text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="conf-pass" className="text-xs">
                    Confirm New Password *
                  </Label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
                    <Input
                      id="conf-pass"
                      name="confirmPassword"
                      type="password"
                      required
                      placeholder="Re-enter new password"
                      className="pl-9 text-sm"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full gap-2">
                  <span>Update Password & Log In</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
