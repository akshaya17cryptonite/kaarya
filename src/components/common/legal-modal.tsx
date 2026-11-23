"use client";

import { useState } from "react";
import { ShieldCheck, X, FileText, Lock, DollarSign, HeartHandshake } from "lucide-react";
import { Button } from "@/components/ui/button";

export type LegalDocumentType = "privacy" | "terms" | "refund" | "safety";

interface LegalContent {
  title: string;
  subtitle: string;
  icon: typeof FileText;
  sections: Array<{ heading: string; content: string }>;
}

const LEGAL_DOCUMENTS: Record<LegalDocumentType, LegalContent> = {
  privacy: {
    title: "Privacy Policy",
    subtitle: "How LocConnect protects and handles your personal information",
    icon: Lock,
    sections: [
      {
        heading: "1. Information We Collect",
        content:
          "We collect only the necessary information to facilitate on-demand services: your mobile number (for OTP verification), name, service delivery address in Noida/NCR, and geographic coordinates to match you with nearby service partners.",
      },
      {
        heading: "2. Payment Security",
        content:
          "All online transactions (UPI, Credit/Debit cards, Netbanking) are processed directly by Razorpay in compliance with RBI guidelines and PCI-DSS Level 1 certification. LocConnect never stores your full card number, CVV, or banking passwords.",
      },
      {
        heading: "3. Location Data & PostGIS Proximity",
        content:
          "Your location is used solely to compute distance to verified service partners within your chosen radius (5 km to 25 km). Your exact address is only shared with the assigned professional once a booking is confirmed.",
      },
      {
        heading: "4. Data Retention & Grievance Officer",
        content:
          "In compliance with the Digital Personal Data Protection Act (DPDP), users can request account deletion or data portability at any time by contacting grievance@locconnect.in.",
      },
    ],
  },
  terms: {
    title: "Terms of Service",
    subtitle: "Customer & Provider Marketplace Agreement for Noida & Delhi NCR",
    icon: FileText,
    sections: [
      {
        heading: "1. Platform Monolith Marketplace",
        content:
          "LocConnect acts as a technology platform connecting independent, verified service professionals (Plumbers, Electricians, Cleaners) with local customers. Every partner undergoes KYC verification before dispatch.",
      },
      {
        heading: "2. Fixed Pricing & Transparency",
        content:
          "Services follow a standardized rate card. The customer payable amount consists of the base service charge plus a 15% platform convenience fee and 18% GST on the fee. No additional door visit charges apply for standard bookings.",
      },
      {
        heading: "3. 30-Day Service Warranty",
        content:
          "All completed bookings come with a 30-day rework warranty. If an issue recurs within 30 days of service, LocConnect dispatches a free revisit inspection or initiates dispute resolution.",
      },
      {
        heading: "4. Cancellation & Rescheduling",
        content:
          "Customers may cancel without charge up to 2 hours before the scheduled time slot, or within 15 minutes of placing an urgent dispatch request.",
      },
    ],
  },
  refund: {
    title: "Razorpay Escrow & Refund Policy",
    subtitle: "Transparent escrow holds and automatic refunds",
    icon: DollarSign,
    sections: [
      {
        heading: "1. Escrow Protection",
        content:
          "When you pay online via Razorpay, funds are held in escrow. Payouts are only released to the service provider after the job status is marked as COMPLETED and verified.",
      },
      {
        heading: "2. Automatic Cancellation Refunds",
        content:
          "If a service partner declines a job or cancels an accepted dispatch, a 100% full refund is automatically initiated to your original payment source (UPI, Card, Netbanking).",
      },
      {
        heading: "3. Dispute Arbitrations & Turnaround",
        content:
          "If you are unsatisfied with a service, our Admin operations team reviews evidence and chat logs within 24 hours. Approved refunds are credited to your bank account within 5 to 7 business days per banking guidelines.",
      },
    ],
  },
  safety: {
    title: "Safety & Sanitization Protocol",
    subtitle: "Ensuring trust, hygiene, and safe in-home visits",
    icon: HeartHandshake,
    sections: [
      {
        heading: "1. Dual KYC Verification",
        content:
          "Every service provider must submit Govt-issued ID (Aadhaar / PAN) and proof of Police Verification before taking in-home service orders in Noida.",
      },
      {
        heading: "2. OTP Handshake at Doorstep",
        content:
          "Technicians must verify your service OTP upon arrival before commencing work, guaranteeing that only your assigned professional enters your premises.",
      },
      {
        heading: "3. Sanitization & Clean Equipment",
        content:
          "Cleaning and plumbing partners carry sterilized tools, wear protective shoe covers upon request, and dispose of replaced hardware safely.",
      },
    ],
  },
};

export function LegalModalButton({
  type,
  label,
}: {
  type: LegalDocumentType;
  label: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const doc = LEGAL_DOCUMENTS[type];
  const Icon = doc.icon;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="hover:text-foreground transition text-left text-xs text-muted-foreground hover:underline focus:outline-none"
      >
        {label}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border rounded-2xl max-w-xl w-full max-h-[85vh] flex flex-col shadow-2xl animate-in fade-in-50 zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-foreground">{doc.title}</h3>
                  <p className="text-xs text-muted-foreground">{doc.subtitle}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1.5 rounded-full hover:bg-muted transition"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs text-muted-foreground leading-relaxed">
              {doc.sections.map((section, idx) => (
                <div key={idx} className="space-y-1.5 bg-muted/20 p-3.5 rounded-xl border">
                  <h4 className="font-semibold text-foreground text-sm flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                    <span>{section.heading}</span>
                  </h4>
                  <p>{section.content}</p>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t bg-muted/10 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>LocConnect Trust & Safety • Noida, UP</span>
              <Button size="sm" onClick={() => setIsOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
