
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckIcon, ChevronLeft, X, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Notification, formatNotificationDate } from "@/types/notification";
import { getNotifications, deleteNotification } from "@/services/notificationService";
import { toast } from "@/components/ui/sonner";

interface NotificationsPanelProps {
  onClose: () => void;
}

// Interface for frontend notification display
interface NotificationItem {
  id: number;
  type: string;
  title: string;
  date: string;
  time: string;
  sender_id: number;
  sender_type: string;
  receiver_id: number;
  receiver_type: string;
  user?: {
    name: string;
    avatar?: string;
  };
  isUnread: boolean;
}

export function NotificationsPanel({ onClose }: NotificationsPanelProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread'>('all');

  // Fetch notifications from API
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        console.log('NotificationsPanel: Starting to fetch notifications');
        setIsLoading(true);

        const data = await getNotifications();
        console.log('NotificationsPanel: Received notifications data:', data);

        if (!data || data.length === 0) {
          console.log('NotificationsPanel: No notifications data received');
          setNotifications([]);
          return;
        }

        // Map API notifications to display format
        console.log('NotificationsPanel: Mapping notifications data to display format');
        const displayNotifications = data.map((notification): NotificationItem => {
          try {
            console.log('NotificationsPanel: Mapping notification:', notification);

            const { date, time } = formatNotificationDate(notification.created_at);
            console.log('NotificationsPanel: Formatted date:', date, time);

            // Extract title from message or use type as fallback
            const title = notification.type.charAt(0).toUpperCase() + notification.type.slice(1);

            // Create a display notification
            const displayNotification = {
              id: notification.id,
              type: notification.type,
              title: notification.message,
              date,
              time,
              sender_id: notification.sender_id,
              sender_type: notification.sender_type,
              receiver_id: notification.receiver_id,
              receiver_type: notification.receiver_type,
              isUnread: !notification.is_read,
              // Now we have sender info in the notification API response
              user: {
                name: `${notification.sender_type} #${notification.sender_id}`, // Placeholder, ideally fetch real name
                avatar: undefined // Placeholder, ideally fetch real avatar
              }
            };

            console.log('NotificationsPanel: Created display notification:', displayNotification);
            return displayNotification;
          } catch (err) {
            console.error('NotificationsPanel: Error mapping individual notification:', err, notification);
            // Return a default notification if mapping fails
            return {
              id: 0,
              type: 'error',
              title: 'Error processing notification',
              date: new Date().toLocaleDateString(),
              time: new Date().toLocaleTimeString(),
              sender_id: 0,
              sender_type: 'System',
              receiver_id: 0,
              receiver_type: 'System',
              isUnread: false,
              user: undefined
            };
          }
        });

        console.log('NotificationsPanel: Final display notifications:', displayNotifications);
        setNotifications(displayNotifications);
      } catch (error) {
        console.error('NotificationsPanel: Failed to fetch notifications:', error);
        toast.error('Failed to load notifications');
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  // Handle notification deletion
  const handleDeleteNotification = async (id: number) => {
    try {
      await deleteNotification(id);
      setNotifications(notifications.filter(n => n.id !== id));
      toast.success('Notification deleted successfully');
    } catch (error) {
      console.error('Failed to delete notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  // Filter notifications based on active filter
  const filteredNotifications = activeFilter === 'all'
    ? notifications
    : notifications.filter(n => n.isUnread);

  // Group notifications by date
  const today = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayFormatted = yesterday.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const todayNotifications = filteredNotifications.filter(n => n.date === today);
  const yesterdayNotifications = filteredNotifications.filter(n => n.date === yesterdayFormatted);
  const olderNotifications = filteredNotifications.filter(n =>
    n.date !== today && n.date !== yesterdayFormatted
  );

  const unreadCount = notifications.filter(n => n.isUnread).length;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b py-3 px-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onClose}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-lg font-semibold">Notifications</h2>
            <p className="text-sm text-muted-foreground">
              Stay Updated with Your Latest Notifications
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="hidden md:inline-flex"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex items-center justify-between border-b py-2 px-4">
        <div className="flex gap-2">
          <Button
            variant={activeFilter === 'all' ? "outline" : "ghost"}
            className="text-sm h-8"
            size="sm"
            onClick={() => setActiveFilter('all')}
          >
            All
          </Button>
          <Button
            variant={activeFilter === 'unread' ? "outline" : "ghost"}
            className="text-sm h-8"
            size="sm"
            onClick={() => setActiveFilter('unread')}
          >
            Unread ({unreadCount})
          </Button>
        </div>
        <Button variant="ghost" size="sm" className="text-sm h-8 flex gap-1">
          <CheckIcon className="w-4 h-4" /> Mark all as read
        </Button>
      </div>

      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No notifications found
          </div>
        ) : (
          <div className="py-3 px-4">
            {todayNotifications.length > 0 && (
              <>
                <h3 className="mb-2 text-sm font-medium text-muted-foreground">Today</h3>
                <div className="space-y-4">
                  {todayNotifications.map((notification) => (
                    <NotificationCard
                      key={notification.id}
                      notification={notification}
                      onDelete={handleDeleteNotification}
                    />
                  ))}
                </div>
              </>
            )}

            {yesterdayNotifications.length > 0 && (
              <>
                <h3 className="mb-2 mt-6 text-sm font-medium text-muted-foreground">
                  Yesterday
                </h3>
                <div className="space-y-4">
                  {yesterdayNotifications.map((notification) => (
                    <NotificationCard
                      key={notification.id}
                      notification={notification}
                      onDelete={handleDeleteNotification}
                    />
                  ))}
                </div>
              </>
            )}

            {olderNotifications.length > 0 && (
              <>
                <h3 className="mb-2 mt-6 text-sm font-medium text-muted-foreground">
                  Older
                </h3>
                <div className="space-y-4">
                  {olderNotifications.map((notification) => (
                    <NotificationCard
                      key={notification.id}
                      notification={notification}
                      onDelete={handleDeleteNotification}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

function NotificationCard({
  notification,
  onDelete
}: {
  notification: NotificationItem;
  onDelete: (id: number) => void;
}) {
  return (
    <div
      className={`relative flex gap-3 rounded-lg border p-3 transition-colors ${
        notification.isUnread ? "bg-primary/5" : ""
      }`}
    >
      {/* Icon or avatar */}
      {notification.user ? (
        <Avatar>
          <AvatarImage src={notification.user.avatar} />
          <AvatarFallback>
            {notification.user.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
      ) : (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
          <Icon type={notification.type} />
        </div>
      )}

      {/* Content */}
      <div className="flex-1">
        <p className="text-sm">{notification.title}</p>
        <div className="flex flex-wrap gap-2 mt-1">
          <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
            From: {notification.sender_type} #{notification.sender_id}
          </span>
          <span className="text-xs px-2 py-0.5 bg-green-100 text-green-800 rounded-full">
            To: {notification.receiver_type} #{notification.receiver_id}
          </span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {notification.date} • {notification.time}
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col items-center gap-2">
        {notification.isUnread && (
          <div className="h-2 w-2 rounded-full bg-brand-red"></div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground hover:text-destructive"
          onClick={() => onDelete(notification.id)}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

function Icon({ type }: { type: string }) {
  switch (type) {
    case "contract":
    case "renewal":
      return (
        <div className="h-5 w-5 rounded-full bg-blue-500 text-white flex items-center justify-center">
          i
        </div>
      );
    case "meeting":
      return <CalendarIcon className="h-5 w-5" />;
    default:
      return <Bell className="h-5 w-5" />;
  }
}

// Simple Icons for our notification types
function Bell(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

function CalendarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}
