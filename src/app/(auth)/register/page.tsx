import Link from "next/link";
import { siteConfig } from "@/config/site";
import { registerWithPasswordAction } from "@/modules/auth/actions";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ShieldCheck, ArrowRight, ShieldAlert, User, Mail, Lock } from "lucide-react";

interface RegisterPageProps {
  searchParams: {
    role?: "CUSTOMER" | "PROVIDER";
    redirectTo?: string;
    error?: string;
    name?: string;
    phone?: string;
    email?: string;
  };
}

export default function RegisterPage({ searchParams }: RegisterPageProps) {
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
            Create an account to book or provide verified services in Noida
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
              Customer Registration
            </TabsTrigger>
            <TabsTrigger value="PROVIDER" className="text-xs sm:text-sm">
              Join as Service Partner
            </TabsTrigger>
          </TabsList>

          {/* Customer Tab */}
          <TabsContent value="CUSTOMER">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Join LocConnect</CardTitle>
                <CardDescription>
                  Instant access to top-rated plumbers, electricians, and home cleaners.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form action={registerWithPasswordAction} className="space-y-4">
                  <input type="hidden" name="role" value="CUSTOMER" />
                  {redirectTo && <input type="hidden" name="redirectTo" value={redirectTo} />}

                  <div className="space-y-1.5">
                    <Label htmlFor="cust-name" className="text-xs">Full Name *</Label>
                    <div className="relative">
                      <User className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
                      <Input
                        id="cust-name"
                        name="name"
                        required
                        placeholder="e.g. Rahul Sharma"
                        defaultValue={searchParams.name || ""}
                        className="pl-9 text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="cust-phone" className="text-xs">Mobile Number *</Label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm font-medium">
                        +91
                      </span>
                      <Input
                        id="cust-phone"
                        name="phone"
                        type="tel"
                        placeholder="9811122233"
                        required
                        pattern="[0-9]{10}"
                        defaultValue={searchParams.phone || ""}
                        className="rounded-l-none text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="cust-email" className="text-xs">Email Address (Optional)</Label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
                      <Input
                        id="cust-email"
                        name="email"
                        type="email"
                        placeholder="name@example.com"
                        defaultValue={searchParams.email || ""}
                        className="pl-9 text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="cust-password" className="text-xs">Password *</Label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
                      <Input
                        id="cust-password"
                        name="password"
                        type="password"
                        required
                        placeholder="At least 8 characters (1 uppercase, 1 number)"
                        className="pl-9 text-sm"
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Must contain 8+ characters, with at least 1 uppercase and 1 number.
                    </p>
                  </div>

                  <Button type="submit" className="w-full gap-2 mt-2">
                    <span>Create Customer Account</span>
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
                <CardTitle className="text-xl">Register as Service Partner</CardTitle>
                <CardDescription>
                  Start receiving bookings, manage your Noida service radius, and earn weekly payouts.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form action={registerWithPasswordAction} className="space-y-4">
                  <input type="hidden" name="role" value="PROVIDER" />
                  {redirectTo && <input type="hidden" name="redirectTo" value={redirectTo} />}

                  <div className="space-y-1.5">
                    <Label htmlFor="prov-name" className="text-xs">Professional Name / Business *</Label>
                    <div className="relative">
                      <User className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
                      <Input
                        id="prov-name"
                        name="name"
                        required
                        placeholder="e.g. Ramesh Verma"
                        defaultValue={searchParams.name || ""}
                        className="pl-9 text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="prov-phone" className="text-xs">Mobile Number (KYC linked) *</Label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm font-medium">
                        +91
                      </span>
                      <Input
                        id="prov-phone"
                        name="phone"
                        type="tel"
                        placeholder="9810111222"
                        required
                        pattern="[0-9]{10}"
                        defaultValue={searchParams.phone || ""}
                        className="rounded-l-none text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="prov-email" className="text-xs">Business Email</Label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
                      <Input
                        id="prov-email"
                        name="email"
                        type="email"
                        placeholder="partner@example.com"
                        defaultValue={searchParams.email || ""}
                        className="pl-9 text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="prov-password" className="text-xs">Password *</Label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
                      <Input
                        id="prov-password"
                        name="password"
                        type="password"
                        required
                        placeholder="At least 8 characters"
                        className="pl-9 text-sm"
                      />
                    </div>
                  </div>

                  <Button type="submit" variant="brand" className="w-full gap-2 mt-2">
                    <span>Register as Partner</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <p className="text-center text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-semibold hover:underline">
            Sign In here
          </Link>
        </p>
      </div>
    </div>
  );
}
