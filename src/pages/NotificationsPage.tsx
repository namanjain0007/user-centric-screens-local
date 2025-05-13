
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCheck, Bell, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Notification } from "@/types/notification";
import { getNotifications, deleteNotification } from "@/services/notificationService";
import { formatNotificationDate } from "@/types/notification";
import { toast } from "@/components/ui/sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Interface for frontend notification display
interface NotificationDisplay {
  id: number;
  type: string;
  title: string;
  message: string;
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
  read: boolean;
}

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [notifications, setNotifications] = useState<NotificationDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState<number | null>(null);

  // Fetch notifications from API
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // console.log('NotificationsPage: Starting to fetch notifications');
        setIsLoading(true);

        const data = await getNotifications();
        // console.log('NotificationsPage: Received notifications data:', data);

        if (!data || data.length === 0) {
          // console.log('NotificationsPage: No notifications data received');
          setNotifications([]);
          return;
        }

        // Map API notifications to display format
        // console.log('NotificationsPage: Mapping notifications data to display format');
        const displayNotifications = data.map((notification): NotificationDisplay => {
          try {
            // console.log('NotificationsPage: Mapping notification:', notification);

            const { date, time } = formatNotificationDate(notification.created_at);
            // console.log('NotificationsPage: Formatted date:', date, time);

            // Extract title from message or use type as fallback
            // In a real app, you might want to have a more sophisticated way to determine the title
            const title = notification.type.charAt(0).toUpperCase() + notification.type.slice(1);

            // Create a display notification
            const displayNotification = {
              id: notification.id,
              type: notification.type,
              title: title,
              message: notification.message,
              date,
              time,
              sender_id: notification.sender_id,
              sender_type: notification.sender_type,
              receiver_id: notification.receiver_id,
              receiver_type: notification.receiver_type,
              read: notification.is_read,
              // Now we have sender info in the notification API response
              // You could fetch more details about the sender if needed
              user: {
                name: `${notification.sender_type} #${notification.sender_id}`, // Placeholder, ideally fetch real name
                avatar: undefined // Placeholder, ideally fetch real avatar
              }
            };

            // console.log('NotificationsPage: Created display notification:', displayNotification);
            return displayNotification;
          } catch (err) {
            console.error('NotificationsPage: Error mapping individual notification:', err, notification);
            // Return a default notification if mapping fails
            return {
              id: 0,
              type: 'error',
              title: 'Error',
              message: 'Error processing notification',
              date: new Date().toLocaleDateString(),
              time: new Date().toLocaleTimeString(),
              sender_id: 0,
              sender_type: 'System',
              receiver_id: 0,
              receiver_type: 'System',
              read: false,
              user: undefined
            };
          }
        });

        // console.log('NotificationsPage: Final display notifications:', displayNotifications);
        setNotifications(displayNotifications);
      } catch (error) {
        console.error('NotificationsPage: Failed to fetch notifications:', error);
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
    } finally {
      setDeleteDialogOpen(false);
      setNotificationToDelete(null);
    }
  };

  // Open delete confirmation dialog
  const openDeleteDialog = (id: number) => {
    setNotificationToDelete(id);
    setDeleteDialogOpen(true);
  };

  const filteredNotifications = activeTab === "all"
    ? notifications
    : notifications.filter(n => n.read === (activeTab === "read"));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1 w-fit"
        >
          <CheckCheck className="h-4 w-4" />
          Mark all as read
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">
            All Notifications
          </TabsTrigger>
          <TabsTrigger value="unread">
            Unread
          </TabsTrigger>
          <TabsTrigger value="read">
            Read
          </TabsTrigger>
        </TabsList>
        <TabsContent value={activeTab}>
          <Card>
            <CardHeader>
              <CardTitle>
                {activeTab === "all"
                  ? "All Notifications"
                  : activeTab === "unread"
                    ? "Unread Notifications"
                    : "Read Notifications"}
              </CardTitle>
              <CardDescription>
                View and manage your notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No notifications found
                </div>
              ) : (
                <div className="space-y-5">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`flex gap-4 p-4 border rounded-lg ${
                        !notification.read ? "bg-primary/5" : ""
                      }`}
                    >
                      {notification.user ? (
                        <Avatar>
                          <AvatarImage src={notification.user.avatar} alt={notification.user.name} />
                          <AvatarFallback>
                            {notification.user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <Bell className="h-5 w-5" />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">{notification.title}</h3>
                          <div className="flex items-center gap-2">
                            {!notification.read && (
                              <span className="h-2 w-2 rounded-full bg-brand-red"></span>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => openDeleteDialog(notification.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                            From: {notification.sender_type} #{notification.sender_id}
                          </span>
                          <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                            To: {notification.receiver_type} #{notification.receiver_id}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          {notification.date} • {notification.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the notification. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => notificationToDelete && handleDeleteNotification(notificationToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
