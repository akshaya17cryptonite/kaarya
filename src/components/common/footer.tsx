import Link from "next/link";
import { siteConfig } from "@/config/site";
import { ShieldCheck, CheckCircle2, Award, Clock } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      {/* Trust & Guarantee Banner */}
      <div className="border-b bg-background">
        <div className="container py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-full bg-primary/10 text-primary">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-sm">Verified Professionals</p>
              <p className="text-xs text-muted-foreground">Govt ID & background checked</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-full bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-sm">Transparent Fixed Pricing</p>
              <p className="text-xs text-muted-foreground">Standardized rate card, no hidden fees</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-full bg-amber-500/10 text-amber-600">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-sm">30-Day Service Guarantee</p>
              <p className="text-xs text-muted-foreground">Free rework if not fully satisfied</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-full bg-blue-500/10 text-blue-600">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-sm">On-Time Arrival</p>
              <p className="text-xs text-muted-foreground">Punctual slots or flat discount</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="container py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 font-bold text-lg text-primary mb-3">
            <ShieldCheck className="w-5 h-5" />
            <span>{siteConfig.name}</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed mb-4">
            {siteConfig.description}
          </p>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>📍 {siteConfig.contact.address}</p>
            <p>✉️ {siteConfig.contact.email}</p>
            <p>📞 {siteConfig.contact.phone}</p>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-sm mb-3">Top Services in Noida</h4>
          <ul className="text-xs space-y-2 text-muted-foreground">
            <li>
              <Link href="/services/plumber/noida" className="hover:text-foreground">
                Plumbers in Noida (Sector 18, 62, 137)
              </Link>
            </li>
            <li>
              <Link href="/services/electrician/noida" className="hover:text-foreground">
                Electricians in Noida & Indirapuram
              </Link>
            </li>
            <li>
              <Link href="/services/cleaner/noida" className="hover:text-foreground">
                Full Home Deep Cleaning Noida Expressway
              </Link>
            </li>
            <li>
              <Link href="/services/plumber/noida" className="hover:text-foreground">
                Water Tank Cleaning Services
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-sm mb-3">Service Providers</h4>
          <ul className="text-xs space-y-2 text-muted-foreground">
            <li>
              <Link href="/login?role=PROVIDER" className="hover:text-foreground">
                Register as Service Professional
              </Link>
            </li>
            <li>
              <Link href="/provider" className="hover:text-foreground">
                Partner Dashboard & Earnings
              </Link>
            </li>
            <li>
              <Link href="/login?role=PROVIDER" className="hover:text-foreground">
                Partner Guidelines & KYC
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-sm mb-3">Legal & Security</h4>
          <ul className="text-xs space-y-2 text-muted-foreground">
            <li><span>Privacy Policy</span></li>
            <li><span>Terms of Service</span></li>
            <li><span>Razorpay Escrow & Refund Policy</span></li>
            <li><span>COVID-19 & Sanitization Protocol</span></li>
          </ul>
        </div>
      </div>

      <div className="border-t py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {siteConfig.name}. All rights reserved. Built for Noida, Delhi NCR.
      </div>
    </footer>
  );
}
