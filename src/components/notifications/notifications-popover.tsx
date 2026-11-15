"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import {
  Bell,
  CheckCheck,
  Calendar,
  CreditCard,
  Sparkles,
  ExternalLink,
  Loader2,
} from "lucide-react";
import {
  markNotificationAsReadAction,
  markAllNotificationsAsReadAction,
} from "@/modules/notifications/actions";
import { type UserNotificationItem } from "@/modules/notifications/service";

interface NotificationsPopoverProps {
  initialNotifications: UserNotificationItem[];
  initialUnreadCount: number;
}

export function NotificationsPopover({
  initialNotifications,
  initialUnreadCount,
}: NotificationsPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<UserNotificationItem[]>(initialNotifications);
  const [unreadCount, setUnreadCount] = useState<number>(initialUnreadCount);
  const [isPending, startTransition] = useTransition();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));

    startTransition(async () => {
      const formData = new FormData();
      formData.set("notificationId", id);
      await markNotificationAsReadAction(formData);
    });
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);

    startTransition(async () => {
      await markAllNotificationsAsReadAction();
    });
  };

  const renderIcon = (type: UserNotificationItem["type"]) => {
    switch (type) {
      case "BOOKING":
        return <Calendar className="w-3.5 h-3.5 text-primary" />;
      case "PAYMENT":
        return <CreditCard className="w-3.5 h-3.5 text-emerald-600" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-amber-500" />;
    }
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Card */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border bg-card text-card-foreground shadow-2xl z-50 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-100">
          <div className="p-4 border-b bg-muted/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-foreground">Notifications</h3>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="text-[10px] py-0 px-1.5 rounded-full">
                  {unreadCount} New
                </Badge>
              )}
            </div>

            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                disabled={isPending}
                className="text-xs h-7 px-2 text-primary hover:text-primary gap-1"
              >
                {isPending ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <CheckCheck className="w-3.5 h-3.5" />
                )}
                <span>Mark all read</span>
              </Button>
            )}
          </div>

          <div className="max-h-[380px] overflow-y-auto divide-y">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="font-medium">No notifications yet.</p>
                <p className="text-[11px] mt-0.5">Booking updates and alerts will show up here.</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3.5 transition-colors flex items-start gap-3 hover:bg-muted/10 ${
                    !notif.isRead ? "bg-primary/5" : ""
                  }`}
                >
                  <div className="w-7 h-7 rounded-full bg-background border flex items-center justify-center shrink-0 mt-0.5">
                    {renderIcon(notif.type)}
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <h4
                        className={`text-xs ${
                          !notif.isRead
                            ? "font-bold text-foreground"
                            : "font-semibold text-foreground/80"
                        }`}
                      >
                        {notif.title}
                      </h4>
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1" />
                      )}
                    </div>

                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      {notif.message}
                    </p>

                    <div className="flex items-center justify-between pt-1 text-[10px] text-muted-foreground">
                      <span>{formatDate(notif.createdAt)}</span>
                      <div className="flex items-center gap-2">
                        {!notif.isRead && (
                          <button
                            type="button"
                            onClick={() => handleMarkAsRead(notif.id)}
                            className="text-primary hover:underline font-medium"
                          >
                            Mark read
                          </button>
                        )}
                        {notif.link && (
                          <Link
                            href={notif.link}
                            onClick={() => {
                              handleMarkAsRead(notif.id);
                              setIsOpen(false);
                            }}
                            className="text-primary hover:underline inline-flex items-center gap-0.5 font-medium"
                          >
                            <span>View</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
