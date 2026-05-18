"use client";

// Shows unread notifications as toasts after a student logs in.
import { useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/toast/Toastprovider";

type Notification = {
  notification_id: number;
  title: string;
  message: string;
};

export default function NotificationToasts() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const lastUserId = useRef<number | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      lastUserId.current = null;
      return;
    }
    if (user.role !== "student") return;
    if (lastUserId.current === user.userId) return;

    lastUserId.current = user.userId;

    async function showUnreadNotifications() {
      const res = await fetch("/api/notifications", {
        cache: "no-store",
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok || !data?.success) return;

      const notifications = (data.notifications ?? []) as Notification[];
      notifications.forEach((notification) => {
        toast(`${notification.title}: ${notification.message}`, "success", 10000);
      });

      if (notifications.length > 0) {
        await fetch("/api/notifications", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            notificationIds: notifications.map((n) => n.notification_id),
          }),
        });
      }
    }

    showUnreadNotifications().catch(() => {});
  }, [loading, toast, user]);

  return null;
}
