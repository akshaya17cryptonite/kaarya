"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Layers,
  MapPin,
  Landmark,
  FileCheck,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  UploadCloud,
  FileText,
} from "lucide-react";
import { submitOnboardingAction } from "@/modules/providers/actions";
import { ProviderVerificationStatus } from "@prisma/client";

interface CatalogServiceOption {
  id: string;
  name: string;
  categoryName: string;
  basePrice: number;
}

interface OnboardingWizardProps {
  initialData: {
    name: string;
    phone: string;
    bio: string | null;
    experienceYears: number;
    currentAddress: string;
    serviceRadiusKm: number;
    bankAccountName: string | null;
    bankAccountNumber: string | null;
    bankIfscCode: string | null;
    upiId: string | null;
    verificationStatus: ProviderVerificationStatus;
    selectedServiceIds: string[];
    aadhaarNumber?: string;
    panNumber?: string;
  };
  catalogServices: CatalogServiceOption[];
}

export function OnboardingWizard({ initialData, catalogServices }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [bio, setBio] = useState(initialData.bio || "");
  const [experienceYears, setExperienceYears] = useState(initialData.experienceYears || 5);
  const [currentAddress, setCurrentAddress] = useState(
    initialData.currentAddress || "Sector 62, Noida, Uttar Pradesh, 201309"
  );
  const [serviceRadiusKm, setServiceRadiusKm] = useState(initialData.serviceRadiusKm || 15);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>(
    initialData.selectedServiceIds.length > 0
      ? initialData.selectedServiceIds
      : catalogServices.slice(0, 3).map((s) => s.id)
  );

  // Bank details
  const [bankAccountName, setBankAccountName] = useState(
    initialData.bankAccountName || initialData.name
  );
  const [bankAccountNumber, setBankAccountNumber] = useState(
    initialData.bankAccountNumber || "918273645012"
  );
  const [bankIfscCode, setBankIfscCode] = useState(
    initialData.bankIfscCode || "HDFC0001234"
  );
  const [upiId, setUpiId] = useState(initialData.upiId || "partner@okhdfcbank");

  // KYC details
  const [aadhaarNumber, setAadhaarNumber] = useState(initialData.aadhaarNumber || "9821-4821-3912");
  const [panNumber, setPanNumber] = useState(initialData.panNumber || "ABCDE1234F");
  const aadhaarFileSimulated = true;
  const panFileSimulated = true;

  const toggleService = (id: string) => {
    setSelectedServiceIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const formData = new FormData();
      formData.set("experienceYears", experienceYears.toString());
      formData.set("bio", bio);
      formData.set("currentAddress", currentAddress);
      formData.set("serviceRadiusKm", serviceRadiusKm.toString());
      formData.set("bankAccountName", bankAccountName);
      formData.set("bankAccountNumber", bankAccountNumber);
      formData.set("bankIfscCode", bankIfscCode);
      formData.set("upiId", upiId);
      formData.set("serviceIds", JSON.stringify(selectedServiceIds));
      formData.set("aadhaarNumber", aadhaarNumber);
      formData.set("panNumber", panNumber);

      const res = await submitOnboardingAction(formData);
      if (res.success) {
        setSubmittedSuccess(true);
      } else {
        setError(res.error || "Failed to submit onboarding documents.");
      }
    });
  };

  const steps = [
    { number: 1, label: "Profile & Exp", icon: User },
    { number: 2, label: "Services", icon: Layers },
    { number: 3, label: "Coverage Area", icon: MapPin },
    { number: 4, label: "Bank Account", icon: Landmark },
    { number: 5, label: "KYC Documents", icon: FileCheck },
  ];

  return (
    <div className="space-y-6">
      {/* Verification Status Banner */}
      {initialData.verificationStatus === "VERIFIED" ? (
        <Card className="border-emerald-500/40 bg-emerald-500/10">
          <CardContent className="p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-emerald-950 dark:text-emerald-200">
                  Account Verified & Fully Active
                </h3>
                <p className="text-xs text-emerald-800 dark:text-emerald-300">
                  Your Aadhaar, PAN, and bank details have been verified by LocConnect Trust & Safety.
                </p>
              </div>
            </div>
            <Badge variant="success" className="text-xs">
              Verified Partner
            </Badge>
          </CardContent>
        </Card>
      ) : submittedSuccess || initialData.verificationStatus === "PENDING" ? (
        <Card className="border-amber-500/40 bg-amber-500/10">
          <CardContent className="p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-600 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-amber-950 dark:text-amber-200">
                  KYC Verification In Progress
                </h3>
                <p className="text-xs text-amber-800 dark:text-amber-300">
                  Your submitted documents are undergoing verification. Estimated approval time: 4-12 hours. You can still preview and update details below.
                </p>
              </div>
            </div>
            <Badge variant="warning" className="text-xs">
              Pending Review
            </Badge>
          </CardContent>
        </Card>
      ) : null}

      {/* Stepper Navigation */}
      <div className="grid grid-cols-5 gap-2 border-b pb-4">
        {steps.map((s) => {
          const Icon = s.icon;
          const isActive = currentStep === s.number;
          const isDone = currentStep > s.number;

          return (
            <button
              key={s.number}
              type="button"
              onClick={() => setCurrentStep(s.number)}
              className={`flex flex-col sm:flex-row items-center gap-2 p-2 rounded-lg text-left transition-all ${
                isActive
                  ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                  : isDone
                  ? "bg-muted text-foreground font-medium"
                  : "text-muted-foreground hover:bg-muted/50"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 ${
                  isActive
                    ? "bg-white text-primary font-bold"
                    : isDone
                    ? "bg-emerald-600 text-white"
                    : "bg-muted-foreground/20 text-muted-foreground"
                }`}
              >
                {isDone ? "✓" : s.number}
              </div>
              <span className="text-[11px] sm:text-xs truncate hidden md:inline flex items-center gap-1">
                <Icon className="w-3.5 h-3.5" />
                {s.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Multi-Step Form Container */}
      <Card className="shadow-sm">
        <form onSubmit={handleSubmit}>
          {/* STEP 1: Profile & Experience */}
          {currentStep === 1 && (
            <CardContent className="p-6 space-y-4">
              <div>
                <h3 className="text-lg font-bold">Personal Profile & Trade Experience</h3>
                <p className="text-xs text-muted-foreground">
                  This information appears on your public partner card and helps customers choose your service.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Registered Full Name</label>
                  <Input value={initialData.name} disabled className="bg-muted text-xs" />
                  <span className="text-[10px] text-muted-foreground">Linked to phone verification</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Registered Mobile Number</label>
                  <Input value={initialData.phone} disabled className="bg-muted text-xs font-mono" />
                  <span className="text-[10px] text-muted-foreground">Primary contact for customer calls</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Years of Professional Experience</label>
                  <Input
                    type="number"
                    min="1"
                    max="50"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(parseInt(e.target.value, 10) || 1)}
                    className="text-xs"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Base Address / Workshop Location</label>
                  <Input
                    type="text"
                    value={currentAddress}
                    onChange={(e) => setCurrentAddress(e.target.value)}
                    placeholder="e.g. Sector 62, Noida, Uttar Pradesh"
                    className="text-xs"
                    required
                  />
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold">Professional Bio & Specializations</label>
                  <Textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Describe your expertise, certifications, past work on residential/commercial projects..."
                    rows={3}
                    className="text-xs"
                  />
                </div>
              </div>
            </CardContent>
          )}

          {/* STEP 2: Services Offered */}
          {currentStep === 2 && (
            <CardContent className="p-6 space-y-4">
              <div>
                <h3 className="text-lg font-bold">Services & Skills</h3>
                <p className="text-xs text-muted-foreground">
                  Select which verified services you offer to customers in Noida.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {catalogServices.map((service) => {
                  const isChecked = selectedServiceIds.includes(service.id);
                  return (
                    <div
                      key={service.id}
                      onClick={() => toggleService(service.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                        isChecked
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border/60 hover:bg-muted/30 opacity-70"
                      }`}
                    >
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-primary block">
                          {service.categoryName}
                        </span>
                        <h4 className="font-bold text-xs text-foreground mt-0.5">{service.name}</h4>
                        <span className="text-[11px] text-muted-foreground">
                          Catalog Base Price: ₹{service.basePrice}
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="w-4 h-4 text-primary rounded"
                      />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          )}

          {/* STEP 3: Service Area & Radius */}
          {currentStep === 3 && (
            <CardContent className="p-6 space-y-4">
              <div>
                <h3 className="text-lg font-bold">Service Area & Travel Radius</h3>
                <p className="text-xs text-muted-foreground">
                  PostGIS uses these coordinates to match you with nearby customer searches.
                </p>
              </div>

              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold">Service Radius (km):</label>
                    <span className="font-bold text-sm text-primary">{serviceRadiusKm} km</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="30"
                    step="5"
                    value={serviceRadiusKm}
                    onChange={(e) => setServiceRadiusKm(parseInt(e.target.value, 10))}
                    className="w-full accent-primary h-2 bg-muted rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-muted-foreground">
                    <span>5 km (Local Sector)</span>
                    <span>15 km (Greater Noida / Indirapuram)</span>
                    <span>30 km (Whole NCR)</span>
                  </div>
                </div>

                <div className="bg-muted/40 p-4 rounded-xl border space-y-2">
                  <h4 className="text-xs font-bold flex items-center gap-1.5 text-foreground">
                    <MapPin className="w-4 h-4 text-primary" />
                    Covered Sectors & Localities
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    From your base location in <strong>{currentAddress}</strong>, a {serviceRadiusKm} km radius covers Sector 18, Sector 62, Sector 137, Indirapuram, Vaishali, and Noida Expressway societies.
                  </p>
                </div>
              </div>
            </CardContent>
          )}

          {/* STEP 4: Bank Account & Payout Setup */}
          {currentStep === 4 && (
            <CardContent className="p-6 space-y-4">
              <div>
                <h3 className="text-lg font-bold">Bank Account & Payout Setup</h3>
                <p className="text-xs text-muted-foreground">
                  Payouts are settled directly to your registered bank account or UPI ID every Tuesday.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Account Holder Name (as per Bank)</label>
                  <Input
                    type="text"
                    value={bankAccountName}
                    onChange={(e) => setBankAccountName(e.target.value)}
                    className="text-xs"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Bank Account Number</label>
                  <Input
                    type="text"
                    value={bankAccountNumber}
                    onChange={(e) => setBankAccountNumber(e.target.value)}
                    className="text-xs font-mono"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Bank IFSC Code</label>
                  <Input
                    type="text"
                    value={bankIfscCode}
                    onChange={(e) => setBankIfscCode(e.target.value.toUpperCase())}
                    placeholder="e.g. HDFC0001234"
                    className="text-xs font-mono uppercase"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Instant UPI ID</label>
                  <Input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g. yourname@okhdfcbank"
                    className="text-xs font-mono"
                    required
                  />
                </div>
              </div>
            </CardContent>
          )}

          {/* STEP 5: ID / KYC Document Upload */}
          {currentStep === 5 && (
            <CardContent className="p-6 space-y-5">
              <div>
                <h3 className="text-lg font-bold">Government ID & KYC Verification</h3>
                <p className="text-xs text-muted-foreground">
                  Government verification is required to grant the &ldquo;Verified Partner&rdquo; badge on LocConnect.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {/* Aadhaar Card Card */}
                <div className="p-4 rounded-xl border space-y-3 bg-muted/20">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-primary" />
                      Aadhaar Card (UIDAI)
                    </span>
                    <Badge variant="outline" className="text-[10px]">Required</Badge>
                  </div>
                  <Input
                    type="text"
                    value={aadhaarNumber}
                    onChange={(e) => setAadhaarNumber(e.target.value)}
                    placeholder="XXXX-XXXX-XXXX (12 digits)"
                    className="text-xs font-mono"
                    required
                  />
                  <div className="p-3 border-2 border-dashed rounded-lg text-center bg-background/60">
                    <UploadCloud className="w-6 h-6 mx-auto text-muted-foreground mb-1" />
                    <span className="text-[11px] font-medium text-foreground block">
                      {aadhaarFileSimulated ? "aadhaar_front_back.pdf (Attached)" : "Click to attach document"}
                    </span>
                    <span className="text-[10px] text-muted-foreground">PDF or JPG up to 5MB</span>
                  </div>
                </div>

                {/* PAN Card Card */}
                <div className="p-4 rounded-xl border space-y-3 bg-muted/20">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-primary" />
                      PAN Card (Income Tax)
                    </span>
                    <Badge variant="outline" className="text-[10px]">Required</Badge>
                  </div>
                  <Input
                    type="text"
                    value={panNumber}
                    onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                    placeholder="ABCDE1234F (10 characters)"
                    className="text-xs font-mono uppercase"
                    required
                  />
                  <div className="p-3 border-2 border-dashed rounded-lg text-center bg-background/60">
                    <UploadCloud className="w-6 h-6 mx-auto text-muted-foreground mb-1" />
                    <span className="text-[11px] font-medium text-foreground block">
                      {panFileSimulated ? "pan_card_doc.pdf (Attached)" : "Click to attach document"}
                    </span>
                    <span className="text-[10px] text-muted-foreground">PDF or JPG up to 5MB</span>
                  </div>
                </div>
              </div>

              {/* Acknowledgement Checkbox */}
              <div className="p-3 bg-muted/40 rounded-lg flex items-start gap-2.5 text-xs text-muted-foreground">
                <input type="checkbox" defaultChecked required className="mt-0.5 rounded text-primary" />
                <span>
                  I declare that the information provided above is authentic and matches official Government records. I agree to LocConnect Partner Terms and Code of Conduct.
                </span>
              </div>
            </CardContent>
          )}

          {error && (
            <div className="px-6 pb-2">
              <p className="text-xs font-semibold text-destructive">{error}</p>
            </div>
          )}

          {/* Stepper Footer Controls */}
          <div className="p-6 border-t bg-muted/10 flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
              disabled={currentStep === 1 || isPending}
              className="gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>

            {currentStep < 5 ? (
              <Button
                type="button"
                variant="brand"
                size="sm"
                onClick={() => setCurrentStep((prev) => Math.min(5, prev + 1))}
                className="gap-1.5"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                variant="brand"
                size="sm"
                disabled={isPending}
                className="gap-1.5 shadow-md"
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                <span>Submit for Verification</span>
              </Button>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
}
