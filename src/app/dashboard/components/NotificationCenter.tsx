"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  Bell,
  BellRing,
  CheckCircle,
  AlertCircle,
  Star,
  MessageSquare,
  X,
  Settings,
} from "lucide-react";
import { NormalizedReview } from "@/lib/schemas";

interface Notification {
  id: string;
  type: "new_review" | "low_rating" | "response_needed" | "milestone";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionRequired?: boolean;
  reviewId?: number;
  priority: "low" | "medium" | "high";
}

interface NotificationCenterProps {
  reviews: NormalizedReview[];
  className?: string;
}

export function NotificationCenter({
  reviews,
  className,
}: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Generate notifications based on reviews
  useEffect(() => {
    const newNotifications = generateNotifications(reviews);
    setNotifications(newNotifications);
  }, [reviews]);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const highPriorityCount = notifications.filter(
    (n) => !n.read && n.priority === "high",
  ).length;

  const markAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)),
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const dismissNotification = (notificationId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "new_review":
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case "low_rating":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "response_needed":
        return <Bell className="h-4 w-4 text-orange-500" />;
      case "milestone":
        return <Star className="h-4 w-4 text-yellow-500" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: Notification["priority"]) => {
    switch (priority) {
      case "high":
        return "border-l-red-500 bg-red-50";
      case "medium":
        return "border-l-orange-500 bg-orange-50";
      case "low":
        return "border-l-green-500 bg-green-50";
      default:
        return "border-l-gray-500 bg-gray-50";
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Notification Bell */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        {unreadCount > 0 ? (
          <BellRing className="h-4 w-4" />
        ) : (
          <Bell className="h-4 w-4" />
        )}
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notification Panel */}
      {isOpen && (
        <Card className="absolute right-0 top-full mt-2 w-96 shadow-lg z-50 max-h-96">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Notifications</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSettings(!showSettings)}
                >
                  <Settings className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {unreadCount > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {unreadCount} unread notification
                  {unreadCount !== 1 ? "s" : ""}
                  {highPriorityCount > 0 && (
                    <span className="text-red-600 font-medium">
                      {" "}
                      ({highPriorityCount} urgent)
                    </span>
                  )}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs p-1 h-auto"
                >
                  Mark all read
                </Button>
              </div>
            )}
          </CardHeader>

          <CardContent className="p-0">
            {/* Settings Panel */}
            {showSettings && (
              <div className="p-4 border-b bg-gray-50">
                <h4 className="font-medium text-sm mb-2">
                  Notification Settings
                </h4>
                <div className="space-y-2 text-sm">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    New reviews
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    Low ratings (≤5/10)
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    Response required
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    Milestones
                  </label>
                </div>
              </div>
            )}

            {/* Notifications List */}
            <div className="h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No notifications</p>
                  <p className="text-xs">You're all caught up!</p>
                </div>
              ) : (
                <div className="divide-y">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-l-4 ${getPriorityColor(notification.priority)} ${
                        !notification.read ? "bg-blue-50" : "bg-white"
                      } hover:bg-gray-50 transition-colors`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p
                                className={`text-sm font-medium ${!notification.read ? "text-gray-900" : "text-gray-700"}`}
                              >
                                {notification.title}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {notification.message}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-xs text-muted-foreground">
                                  {formatTimeAgo(notification.timestamp)}
                                </span>
                                {notification.priority === "high" && (
                                  <Badge
                                    variant="destructive"
                                    className="text-xs"
                                  >
                                    Urgent
                                  </Badge>
                                )}
                                {notification.actionRequired && (
                                  <Badge variant="outline" className="text-xs">
                                    Action Required
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 ml-2">
                              {!notification.read && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => markAsRead(notification.id)}
                                  className="p-1 h-auto"
                                >
                                  <CheckCircle className="h-3 w-3" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  dismissNotification(notification.id)
                                }
                                className="p-1 h-auto text-gray-400 hover:text-gray-600"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Helper function to generate notifications based on reviews
function generateNotifications(reviews: NormalizedReview[]): Notification[] {
  const notifications: Notification[] = [];
  const now = new Date();

  // Recent reviews (last 7 days)
  const recentReviews = reviews.filter((review) => {
    const reviewDate = new Date(review.submittedAt);
    const daysDiff = Math.floor(
      (now.getTime() - reviewDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    return daysDiff <= 7;
  });

  // New review notifications
  recentReviews.slice(0, 5).forEach((review, index) => {
    notifications.push({
      id: `new_review_${review.id}`,
      type: "new_review",
      title: "New Review Received",
      message: `${review.guestName} left a ${review.type === "guest-to-host" ? "property" : "guest"} review`,
      timestamp: new Date(review.submittedAt),
      read: index > 2, // Mark some as read for demo
      reviewId: review.id,
      priority: "medium",
    });
  });

  // Low rating alerts
  const lowRatingReviews = reviews.filter(
    (review) => review.overallRating !== null && review.overallRating <= 5,
  );

  lowRatingReviews.slice(0, 3).forEach((review) => {
    notifications.push({
      id: `low_rating_${review.id}`,
      type: "low_rating",
      title: "Low Rating Alert",
      message: `${review.guestName} gave a ${review.overallRating}/10 rating for ${review.listingName}`,
      timestamp: new Date(review.submittedAt),
      read: false,
      actionRequired: true,
      reviewId: review.id,
      priority: "high",
    });
  });

  // Response needed notifications (host-to-guest reviews that might need follow-up)
  const hostToGuestReviews = reviews.filter(
    (review) => review.type === "host-to-guest",
  );
  hostToGuestReviews.slice(0, 2).forEach((review) => {
    notifications.push({
      id: `response_needed_${review.id}`,
      type: "response_needed",
      title: "Guest Response Recommended",
      message: `Consider following up on your review for ${review.guestName}`,
      timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000), // Random time within last 24h
      read: false,
      actionRequired: true,
      reviewId: review.id,
      priority: "medium",
    });
  });

  // Milestone notifications
  const totalReviews = reviews.length;
  if (totalReviews >= 100) {
    notifications.push({
      id: "milestone_100",
      type: "milestone",
      title: "Milestone Achieved! 🎉",
      message: `You've reached ${totalReviews} total reviews!`,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      read: false,
      priority: "low",
    });
  }

  // Sort by timestamp (newest first) and priority
  return notifications.sort((a, b) => {
    if (a.priority !== b.priority) {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    return b.timestamp.getTime() - a.timestamp.getTime();
  });
}
