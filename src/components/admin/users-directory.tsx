"use client";

import { useState } from "react";
import { type AdminUserItem } from "@/modules/admin/service";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Phone, ShoppingBag, Search } from "lucide-react";

interface UsersDirectoryProps {
  users: AdminUserItem[];
}

export function UsersDirectory({ users }: UsersDirectoryProps) {
  const [search, setSearch] = useState("");

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.phone.toLowerCase().includes(q) ||
      (u.email && u.email.toLowerCase().includes(q))
    );
  });

  const customers = filteredUsers.filter((u) => u.role === "CUSTOMER");
  const providers = filteredUsers.filter((u) => u.role === "PROVIDER");
  const admins = filteredUsers.filter((u) => u.role === "ADMIN");

  const renderUserCard = (user: AdminUserItem) => (
    <Card key={user.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
          {user.name.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-sm text-foreground">{user.name}</h4>
            <Badge
              variant={
                user.role === "ADMIN"
                  ? "default"
                  : user.role === "PROVIDER"
                  ? "success"
                  : "secondary"
              }
              className="text-[10px]"
            >
              {user.role}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-3 mt-1 font-mono">
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3 text-primary" />
              {user.phone}
            </span>
            {user.email && <span>• {user.email}</span>}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-6 text-xs text-right sm:border-l sm:pl-6 shrink-0">
        <div>
          <span className="text-[11px] text-muted-foreground block flex items-center justify-end gap-1">
            <ShoppingBag className="w-3 h-3 text-primary" />
            Bookings
          </span>
          <span className="font-bold text-foreground">{user.bookingsCount}</span>
        </div>

        <div>
          <span className="text-[11px] text-muted-foreground block">
            {user.role === "PROVIDER" ? "Net Payouts" : "Total Spent"}
          </span>
          <span className="font-bold text-emerald-600">
            {formatCurrency(user.totalSpentOrEarned)}
          </span>
        </div>

        <div className="hidden md:block text-[11px] text-muted-foreground">
          <span>Joined</span>
          <span className="block font-medium text-foreground">{formatDate(user.createdAt)}</span>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
        <Input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, phone (+91...), or email..."
          className="pl-9 text-xs"
        />
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid grid-cols-4 h-auto p-1 max-w-md">
          <TabsTrigger value="all" className="text-xs py-1.5">
            All ({filteredUsers.length})
          </TabsTrigger>
          <TabsTrigger value="customers" className="text-xs py-1.5">
            Customers ({customers.length})
          </TabsTrigger>
          <TabsTrigger value="providers" className="text-xs py-1.5">
            Partners ({providers.length})
          </TabsTrigger>
          <TabsTrigger value="admins" className="text-xs py-1.5">
            Admins ({admins.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-3">
          {filteredUsers.length === 0 ? (
            <Card className="p-6 text-center text-sm text-muted-foreground">
              No matching users found.
            </Card>
          ) : (
            filteredUsers.map(renderUserCard)
          )}
        </TabsContent>

        <TabsContent value="customers" className="space-y-3">
          {customers.length === 0 ? (
            <Card className="p-6 text-center text-sm text-muted-foreground">
              No customers found.
            </Card>
          ) : (
            customers.map(renderUserCard)
          )}
        </TabsContent>

        <TabsContent value="providers" className="space-y-3">
          {providers.length === 0 ? (
            <Card className="p-6 text-center text-sm text-muted-foreground">
              No providers found.
            </Card>
          ) : (
            providers.map(renderUserCard)
          )}
        </TabsContent>

        <TabsContent value="admins" className="space-y-3">
          {admins.length === 0 ? (
            <Card className="p-6 text-center text-sm text-muted-foreground">
              No administrators found.
            </Card>
          ) : (
            admins.map(renderUserCard)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
