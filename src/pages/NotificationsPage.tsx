
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
        setIsLoading(true);
        const data = await getNotifications();

        // Map API notifications to display format
        const displayNotifications = data.map((notification): NotificationDisplay => {
          const { date, time } = formatNotificationDate(notification.created_at);

          // Extract title from message or use type as fallback
          // In a real app, you might want to have a more sophisticated way to determine the title
          const title = notification.type.charAt(0).toUpperCase() + notification.type.slice(1);

          return {
            id: notification.id,
            type: notification.type,
            title: title,
            message: notification.message,
            date,
            time,
            read: notification.is_read,
            // We don't have user info in the notification API response
            // In a real app, you might want to fetch user info separately
            user: undefined
          };
        });

        setNotifications(displayNotifications);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
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
