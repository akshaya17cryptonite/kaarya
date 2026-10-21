import Link from "next/link";
import { siteConfig } from "@/config/site";
import { loginWithMockAccountAction } from "@/modules/auth/actions";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ShieldCheck, ArrowRight, UserCheck, ShieldAlert } from "lucide-react";

interface LoginPageProps {
  searchParams: {
    role?: "CUSTOMER" | "PROVIDER" | "ADMIN";
    redirectTo?: string;
    phone?: string;
    error?: string;
  };
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  const defaultRole = searchParams.role === "PROVIDER" ? "PROVIDER" : "CUSTOMER";
  const redirectTo = searchParams.redirectTo || "";

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
            Fast, secure login with mobile OTP verification
          </p>
        </div>

        {searchParams.error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-lg flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{searchParams.error}</span>
          </div>
        )}

        <Tabs defaultValue={defaultRole} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="CUSTOMER" className="text-xs sm:text-sm">
              Customer Login
            </TabsTrigger>
            <TabsTrigger value="PROVIDER" className="text-xs sm:text-sm">
              Partner / Provider
            </TabsTrigger>
          </TabsList>

          {/* Customer Tab */}
          <TabsContent value="CUSTOMER">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Welcome to {siteConfig.name}</CardTitle>
                <CardDescription>
                  Enter your mobile number to book verified plumbers, electricians, and cleaners in Noida.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form action="/verify-otp" method="GET" className="space-y-4">
                  <input type="hidden" name="role" value="CUSTOMER" />
                  {redirectTo && <input type="hidden" name="redirectTo" value={redirectTo} />}

                  <div className="space-y-2">
                    <Label htmlFor="phone-customer">Mobile Number</Label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm font-medium">
                        +91
                      </span>
                      <Input
                        id="phone-customer"
                        name="phone"
                        type="tel"
                        placeholder="9811122233"
                        required
                        pattern="[0-9]{10}"
                        defaultValue={searchParams.phone || "9811122233"}
                        className="rounded-l-none"
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      We will send a 6-digit OTP code to verify your phone.
                    </p>
                  </div>

                  <Button type="submit" className="w-full gap-2">
                    <span>Continue with OTP</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Provider Tab */}
          <TabsContent value="PROVIDER">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Service Partner Portal</CardTitle>
                <CardDescription>
                  Access your job requests, manage scheduled slots, and track weekly earnings.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form action="/verify-otp" method="GET" className="space-y-4">
                  <input type="hidden" name="role" value="PROVIDER" />
                  {redirectTo && <input type="hidden" name="redirectTo" value={redirectTo} />}

                  <div className="space-y-2">
                    <Label htmlFor="phone-provider">Partner Mobile Number</Label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm font-medium">
                        +91
                      </span>
                      <Input
                        id="phone-provider"
                        name="phone"
                        type="tel"
                        placeholder="9810111222"
                        required
                        pattern="[0-9]{10}"
                        defaultValue={searchParams.phone || "9810111222"}
                        className="rounded-l-none"
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Use the registered mobile number associated with your KYC document.
                    </p>
                  </div>

                  <Button type="submit" variant="brand" className="w-full gap-2">
                    <span>Continue as Partner</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 1-Click Fast Dev Test Login */}
        <div className="bg-background border rounded-xl p-4 shadow-sm space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <UserCheck className="w-4 h-4 text-primary" />
            <span>Instant Demo Logins (Pre-configured Seed Accounts)</span>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <form action={loginWithMockAccountAction.bind(null, "CUSTOMER")}>
              <Button type="submit" variant="outline" size="sm" className="w-full justify-start text-xs h-9">
                <span className="w-2 h-2 rounded-full bg-blue-500 mr-2" />
                <span className="font-medium mr-1">Customer:</span> Rohit Mehta (+91 98111 22233)
              </Button>
            </form>

            <form action={loginWithMockAccountAction.bind(null, "PROVIDER")}>
              <Button type="submit" variant="outline" size="sm" className="w-full justify-start text-xs h-9">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />
                <span className="font-medium mr-1">Provider:</span> Ramesh Verma, Plumber (+91 98101 11222)
              </Button>
            </form>

            <form action={loginWithMockAccountAction.bind(null, "ADMIN")}>
              <Button type="submit" variant="outline" size="sm" className="w-full justify-start text-xs h-9">
                <span className="w-2 h-2 rounded-full bg-purple-500 mr-2" />
                <span className="font-medium mr-1">Administrator:</span> Operations Head (+91 99999 00000)
              </Button>
            </form>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          By continuing, you agree to {siteConfig.name}&apos;s Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
