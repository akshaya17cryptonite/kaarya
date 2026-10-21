import Link from "next/link";
import { siteConfig } from "@/config/site";
import { verifyOtpAction } from "@/modules/auth/actions";
import { normalizePhoneNumber, MOCK_OTP_CODE } from "@/modules/auth/service";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ShieldCheck, ArrowLeft, KeyRound, CheckCircle } from "lucide-react";

interface VerifyOtpPageProps {
  searchParams: {
    phone?: string;
    role?: "CUSTOMER" | "PROVIDER" | "ADMIN";
    redirectTo?: string;
    error?: string;
  };
}

export default function VerifyOtpPage({ searchParams }: VerifyOtpPageProps) {
  const rawPhone = searchParams.phone || "9811122233";
  const normalizedPhone = normalizePhoneNumber(rawPhone);
  const role = searchParams.role || "CUSTOMER";
  const redirectTo = searchParams.redirectTo || "";

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-muted/20">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-2xl text-primary">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <span>{siteConfig.name}</span>
          </Link>
          <p className="text-sm text-muted-foreground">
            Two-Step Mobile Number Verification
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Enter Verification Code</CardTitle>
              <Link
                href={`/login?role=${role}&phone=${encodeURIComponent(rawPhone)}`}
                className="text-xs text-primary hover:underline inline-flex items-center gap-1"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Edit Phone</span>
              </Link>
            </div>
            <CardDescription>
              We sent a 6-digit OTP code to <strong className="text-foreground">{normalizedPhone}</strong>
            </CardDescription>
          </CardHeader>

          <CardContent>
            {searchParams.error && (
              <div className="mb-4 bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-lg">
                {searchParams.error}
              </div>
            )}

            <form action={verifyOtpAction} className="space-y-4">
              <input type="hidden" name="phone" value={normalizedPhone} />
              <input type="hidden" name="role" value={role} />
              {redirectTo && <input type="hidden" name="redirectTo" value={redirectTo} />}

              <div className="space-y-2">
                <Label htmlFor="otp" className="flex items-center justify-between">
                  <span>6-Digit OTP</span>
                  <span className="text-xs text-emerald-600 font-normal flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Mock code: {MOCK_OTP_CODE}
                  </span>
                </Label>
                <Input
                  id="otp"
                  name="otp"
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  defaultValue={MOCK_OTP_CODE}
                  placeholder="123456"
                  className="text-center text-2xl tracking-widest font-mono font-bold h-12"
                />
              </div>

              {/* Optional Name for first-time registration */}
              <div className="space-y-2 pt-1">
                <Label htmlFor="name" className="text-xs text-muted-foreground">
                  Your Full Name (if registering for the first time)
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  className="h-9 text-sm"
                />
              </div>

              <Button type="submit" className="w-full gap-2 mt-2">
                <KeyRound className="w-4 h-4" />
                <span>Verify & Continue</span>
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-2 text-center text-xs text-muted-foreground border-t pt-4">
            <p>Didn&apos;t receive code?</p>
            <div className="flex gap-2 justify-center">
              <Link
                href={`/verify-otp?phone=${encodeURIComponent(rawPhone)}&role=${role}`}
                className="text-primary hover:underline font-medium"
              >
                Resend OTP
              </Link>
              <span>•</span>
              <Link href="/login" className="hover:underline">
                Use different number
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
