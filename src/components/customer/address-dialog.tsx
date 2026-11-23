"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  MapPin,
  Plus,
  Trash2,
  Check,
  Loader2,
  X,
  Home,
  Briefcase,
  Building,
} from "lucide-react";
import {
  addAddressAction,
  deleteAddressAction,
  setDefaultAddressAction,
} from "@/modules/users/actions";

interface AddressDialogProps {
  onSuccess?: () => void;
}

export function AddAddressButton({ onSuccess }: AddressDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [label, setLabel] = useState("Home");
  const [streetAddress, setStreetAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [postalCode, setPostalCode] = useState("201301");
  const [isDefault, setIsDefault] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const formData = new FormData();
      formData.set("label", label);
      formData.set("streetAddress", streetAddress);
      formData.set("landmark", landmark);
      formData.set("city", "Noida");
      formData.set("state", "Uttar Pradesh");
      formData.set("postalCode", postalCode);
      formData.set("isDefault", isDefault ? "true" : "false");

      const res = await addAddressAction(formData);
      if (res.success) {
        setIsOpen(false);
        setStreetAddress("");
        setLandmark("");
        onSuccess?.();
      } else {
        setError(res.error || "Failed to save address. Please try again.");
      }
    });
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-1.5 text-xs h-8 border-dashed"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>Add New Address</span>
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in-50 zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-base text-foreground">Add Noida Service Address</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive text-xs p-3 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Label selector */}
              <div className="space-y-1.5">
                <Label className="text-xs">Address Type</Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "Home", icon: Home },
                    { id: "Office", icon: Briefcase },
                    { id: "Other", icon: Building },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setLabel(item.id)}
                        className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border text-xs font-medium transition ${
                          label === item.id
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-muted/30 hover:bg-muted text-foreground"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{item.id}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Street address */}
              <div className="space-y-1.5">
                <Label htmlFor="street" className="text-xs">
                  Flat / House No. / Building & Sector *
                </Label>
                <Input
                  id="street"
                  required
                  placeholder="e.g. Flat 602, Tower 5, Sector 137"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  className="text-sm"
                />
              </div>

              {/* Landmark */}
              <div className="space-y-1.5">
                <Label htmlFor="landmark" className="text-xs">
                  Landmark (Optional)
                </Label>
                <Input
                  id="landmark"
                  placeholder="e.g. Near Metro Station / Apex Mall"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  className="text-sm"
                />
              </div>

              {/* City and PIN code */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">City</Label>
                  <Input value="Noida, UP" disabled className="text-sm bg-muted text-muted-foreground" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="pin" className="text-xs">
                    PIN Code *
                  </Label>
                  <Input
                    id="pin"
                    required
                    pattern="[0-9]{6}"
                    placeholder="201301"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="text-sm"
                  />
                </div>
              </div>

              {/* Default checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="w-4 h-4 rounded text-primary focus:ring-primary"
                />
                <Label htmlFor="isDefault" className="text-xs cursor-pointer font-normal text-muted-foreground">
                  Set as default address for future bookings
                </Label>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={isPending} className="gap-2">
                  {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Address</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export function AddressActions({
  addressId,
  isDefault,
}: {
  addressId: string;
  isDefault: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  const handleSetDefault = () => {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("addressId", addressId);
      await setDefaultAddressAction(formData);
    });
  };

  const handleDelete = () => {
    if (!window.confirm("Are you sure you want to delete this saved address?")) return;
    startTransition(async () => {
      const formData = new FormData();
      formData.set("addressId", addressId);
      await deleteAddressAction(formData);
    });
  };

  return (
    <div className="flex items-center gap-2 pt-1">
      {!isDefault && (
        <button
          type="button"
          onClick={handleSetDefault}
          disabled={isPending}
          className="text-[11px] text-primary hover:underline flex items-center gap-1 font-medium disabled:opacity-50"
        >
          <Check className="w-3 h-3" />
          <span>Set Default</span>
        </button>
      )}

      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        className="text-[11px] text-muted-foreground hover:text-destructive flex items-center gap-1 ml-auto disabled:opacity-50"
        title="Delete Address"
      >
        <Trash2 className="w-3 h-3" />
        <span>Delete</span>
      </button>
    </div>
  );
}
