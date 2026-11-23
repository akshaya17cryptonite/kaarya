import Link from "next/link";
import { siteConfig } from "@/config/site";
import { forgotPasswordAction } from "@/modules/auth/actions";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ShieldCheck, ArrowRight, ArrowLeft, Mail, KeyRound, CheckCircle2 } from "lucide-react";

interface ForgotPasswordPageProps {
  searchParams: {
    message?: string;
    token?: string;
    error?: string;
  };
}

export default function ForgotPasswordPage({ searchParams }: ForgotPasswordPageProps) {
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
            Recover access to your account
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-primary" />
              <span>Forgot Password</span>
            </CardTitle>
            <CardDescription>
              Enter your registered email address or mobile number to receive a secure reset link.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {searchParams.message && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs p-3 rounded-lg flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p>{searchParams.message}</p>
                  {searchParams.token && (
                    <div className="pt-2">
                      <Link
                        href={`/reset-password?token=${encodeURIComponent(searchParams.token)}`}
                        className="inline-flex items-center gap-1 font-bold text-primary underline text-xs"
                      >
                        <span>Click here to reset your password now (Test Link)</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            {searchParams.error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive text-xs p-3 rounded-lg">
                {searchParams.error}
              </div>
            )}

            <form action={forgotPasswordAction} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="identifier" className="text-xs">
                  Email or Mobile Number
                </Label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
                  <Input
                    id="identifier"
                    name="identifier"
                    required
                    placeholder="name@example.com or 9811122233"
                    className="pl-9 text-sm"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full gap-2">
                <span>Send Reset Link</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Back to Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
