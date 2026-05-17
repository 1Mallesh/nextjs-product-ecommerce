"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, BellOff, CheckCheck } from "lucide-react";
import { notificationService } from "@/services/notification.service";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import type { Notification } from "@/types";

export default function CustomerNotificationsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data } = await notificationService.getAll();
      return data.data;
    },
  });

  const markReadMutation = useMutation({
    mutationFn: notificationService.markRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markAllMutation = useMutation({
    mutationFn: notificationService.markAllRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: notificationService.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const notifications: Notification[] = Array.isArray(data) ? data : [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold">Notifications</h2>
          {unreadCount > 0 && (
            <span className="h-5 w-5 rounded-full bg-brand text-white text-[10px] font-bold flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => markAllMutation.mutate()}
            loading={markAllMutation.isPending}
          >
            <CheckCheck className="h-4 w-4 mr-1" /> Mark all read
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </div>
      ) : !notifications.length ? (
        <div className="text-center py-16 text-muted-foreground">
          <BellOff className="h-12 w-12 mx-auto mb-4 opacity-40" />
          <p className="font-medium">No notifications yet</p>
          <p className="text-sm mt-1">Order updates and alerts will appear here</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`bg-card border rounded-xl p-4 flex items-start gap-3 transition-colors ${
                !n.isRead ? "border-brand/30 bg-brand/5" : ""
              }`}
            >
              <div className={`h-2 w-2 rounded-full mt-2 shrink-0 ${!n.isRead ? "bg-brand" : "bg-transparent"}`} />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{n.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                <p className="text-xs text-muted-foreground mt-1">{formatDate(n.createdAt)}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                {!n.isRead && (
                  <button
                    onClick={() => markReadMutation.mutate(n.id)}
                    className="text-xs text-brand hover:underline"
                  >
                    Mark read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
