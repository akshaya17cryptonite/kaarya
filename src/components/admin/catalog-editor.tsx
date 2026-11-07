"use client";

import { useState, useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/utils";
import {
  Layers,
  Plus,
  Power,
  Loader2,
  Check,
  Edit2,
  Clock,
  Sparkles,
} from "lucide-react";
import {
  updateCategoryAction,
  updateServiceAction,
  createServiceAction,
} from "@/modules/admin/actions";

interface CatalogItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconName: string;
  isActive: boolean;
  services: Array<{
    id: string;
    name: string;
    slug: string;
    description: string;
    basePrice: number;
    estimatedDurationMinutes: number;
    isActive: boolean;
  }>;
}

interface CatalogEditorProps {
  categories: CatalogItem[];
}

export function CatalogEditor({ categories }: CatalogEditorProps) {
  const [selectedCatId, setSelectedCatId] = useState<string>(categories[0]?.id || "");
  const [isPending, startTransition] = useTransition();
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editDuration, setEditDuration] = useState<number>(60);
  const [showAddService, setShowAddService] = useState(false);
  const [newServiceName, setNewServiceName] = useState("");
  const [newServiceDesc, setNewServiceDesc] = useState("");
  const [newServicePrice, setNewServicePrice] = useState(299);
  const [newServiceDuration, setNewServiceDuration] = useState(60);
  const [message, setMessage] = useState<string | null>(null);

  const selectedCategory = categories.find((c) => c.id === selectedCatId) || categories[0];

  const handleToggleCategory = (cat: CatalogItem) => {
    setMessage(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("categoryId", cat.id);
      formData.set("isActive", (!cat.isActive).toString());
      const res = await updateCategoryAction(formData);
      if (res.success) {
        setMessage(`Category "${cat.name}" updated successfully.`);
      }
    });
  };

  const handleToggleService = (srv: CatalogItem["services"][number]) => {
    setMessage(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("serviceId", srv.id);
      formData.set("isActive", (!srv.isActive).toString());
      const res = await updateServiceAction(formData);
      if (res.success) {
        setMessage(`Service "${srv.name}" status toggled.`);
      }
    });
  };

  const handleSaveServiceEdit = (serviceId: string) => {
    setMessage(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("serviceId", serviceId);
      formData.set("basePrice", editPrice.toString());
      formData.set("estimatedDurationMinutes", editDuration.toString());
      const res = await updateServiceAction(formData);
      if (res.success) {
        setMessage("Service price and duration saved.");
        setEditingServiceId(null);
      }
    });
  };

  const handleCreateService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName.trim()) return;

    setMessage(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("categoryId", selectedCategory.id);
      formData.set("name", newServiceName.trim());
      formData.set("description", newServiceDesc.trim());
      formData.set("basePrice", newServicePrice.toString());
      formData.set("estimatedDurationMinutes", newServiceDuration.toString());

      const res = await createServiceAction(formData);
      if (res.success) {
        setMessage(`Service "${newServiceName}" added to ${selectedCategory.name}!`);
        setShowAddService(false);
        setNewServiceName("");
        setNewServiceDesc("");
      }
    });
  };

  return (
    <div className="space-y-6">
      {message && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{message}</span>
        </div>
      )}

      {/* Category Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const isSelected = cat.id === selectedCategory?.id;
          return (
            <Card
              key={cat.id}
              onClick={() => setSelectedCatId(cat.id)}
              className={`p-4 cursor-pointer transition-all border ${
                isSelected
                  ? "border-primary bg-primary/5 ring-1 ring-primary/40 shadow-sm"
                  : "hover:bg-muted/30 border-border/60"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-primary" />
                    <h4 className="font-bold text-sm text-foreground">{cat.name}</h4>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                    {cat.description}
                  </p>
                  <span className="text-[11px] text-muted-foreground mt-1.5 block">
                    {cat.services.length} services configured
                  </span>
                </div>

                <Badge variant={cat.isActive ? "success" : "secondary"} className="text-[10px]">
                  {cat.isActive ? "Active" : "Hidden"}
                </Badge>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Selected Category Header & Actions */}
      {selectedCategory && (
        <Card className="border shadow-sm overflow-hidden">
          <div className="p-5 border-b bg-muted/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base">{selectedCategory.name} Services</h3>
                <Badge variant={selectedCategory.isActive ? "success" : "secondary"}>
                  {selectedCategory.isActive ? "Live in Noida" : "Disabled"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Manage service offerings, doorstep diagnostic fees, and estimated fulfillment times.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleToggleCategory(selectedCategory)}
                disabled={isPending}
                className="text-xs h-8 gap-1.5"
              >
                <Power className="w-3.5 h-3.5" />
                <span>{selectedCategory.isActive ? "Deactivate Category" : "Activate Category"}</span>
              </Button>

              <Button
                size="sm"
                variant="brand"
                onClick={() => setShowAddService(true)}
                className="text-xs h-8 gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Service</span>
              </Button>
            </div>
          </div>

          <CardContent className="p-5 space-y-4">
            {/* Add Service Modal/Form */}
            {showAddService && (
              <form
                onSubmit={handleCreateService}
                className="p-4 bg-primary/5 border border-primary/20 rounded-xl space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-primary flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    New Service in {selectedCategory.name}
                  </h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAddService(false)}
                    className="text-xs h-6 px-2"
                  >
                    Cancel
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold">Service Name</label>
                    <Input
                      type="text"
                      value={newServiceName}
                      onChange={(e) => setNewServiceName(e.target.value)}
                      placeholder="e.g. Inverter Installation & Wiring"
                      className="text-xs"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold">Base Price (₹)</label>
                      <Input
                        type="number"
                        min="99"
                        value={newServicePrice}
                        onChange={(e) => setNewServicePrice(parseFloat(e.target.value) || 99)}
                        className="text-xs font-bold"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold">Duration (Mins)</label>
                      <Input
                        type="number"
                        min="15"
                        value={newServiceDuration}
                        onChange={(e) => setNewServiceDuration(parseInt(e.target.value, 10) || 60)}
                        className="text-xs"
                        required
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-1">
                    <label className="text-xs font-semibold">Description</label>
                    <Textarea
                      value={newServiceDesc}
                      onChange={(e) => setNewServiceDesc(e.target.value)}
                      placeholder="Specify scope of work, warranty, and diagnostic inclusions..."
                      rows={2}
                      className="text-xs"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <Button
                    type="submit"
                    size="sm"
                    variant="brand"
                    disabled={isPending}
                    className="text-xs gap-1.5"
                  >
                    {isPending ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Plus className="w-3.5 h-3.5" />
                    )}
                    <span>Create & Publish Service</span>
                  </Button>
                </div>
              </form>
            )}

            {/* Services List */}
            <div className="divide-y border rounded-xl overflow-hidden bg-card">
              {selectedCategory.services.map((srv) => {
                const isEditing = editingServiceId === srv.id;

                return (
                  <div
                    key={srv.id}
                    className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-muted/10 transition-colors"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-foreground">{srv.name}</h4>
                        <Badge
                          variant={srv.isActive ? "success" : "secondary"}
                          className="text-[10px]"
                        >
                          {srv.isActive ? "Active" : "Disabled"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{srv.description}</p>
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3 text-primary" />
                        Est. Duration: {srv.estimatedDurationMinutes} mins
                      </span>
                    </div>

                    {isEditing ? (
                      <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg border">
                        <div className="space-y-0.5">
                          <span className="text-[10px] text-muted-foreground block">Rate (₹)</span>
                          <Input
                            type="number"
                            value={editPrice}
                            onChange={(e) => setEditPrice(parseFloat(e.target.value) || 0)}
                            className="w-20 h-7 text-xs font-bold"
                          />
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[10px] text-muted-foreground block">Mins</span>
                          <Input
                            type="number"
                            value={editDuration}
                            onChange={(e) => setEditDuration(parseInt(e.target.value, 10) || 30)}
                            className="w-16 h-7 text-xs"
                          />
                        </div>
                        <Button
                          size="sm"
                          variant="brand"
                          onClick={() => handleSaveServiceEdit(srv.id)}
                          disabled={isPending}
                          className="text-xs h-7 self-end"
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingServiceId(null)}
                          className="text-xs h-7 self-end"
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4 self-end md:self-center">
                        <div className="text-right">
                          <span className="text-base font-bold text-foreground block">
                            {formatCurrency(srv.basePrice)}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            15% Commission: {formatCurrency(srv.basePrice * 0.15)}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingServiceId(srv.id);
                              setEditPrice(srv.basePrice);
                              setEditDuration(srv.estimatedDurationMinutes);
                            }}
                            className="text-xs h-8 px-2.5 gap-1"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>Edit</span>
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleToggleService(srv)}
                            disabled={isPending}
                            className="text-xs h-8 px-2.5 text-muted-foreground hover:text-foreground"
                          >
                            <Power className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
