
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCheck, Bell } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Notification {
  id: string;
  type: "leave" | "contract" | "meeting" | "renewal" | "team" | "submitted";
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

const notifications: Notification[] = [
  {
    id: "1",
    type: "leave",
    title: "Leave Request",
    message: "John Doe has submitted a leave request for July 25-27, 2024",
    date: "July 16, 2024",
    time: "09:00 PM",
    user: {
      name: "John Doe",
      avatar: "/lovable-uploads/5f951dde-d045-4b18-a3a9-a23d39486e7f.png",
    },
    read: false,
  },
  {
    id: "2",
    type: "contract",
    title: "Contract Renewal",
    message: "Michael Brown's contract is up for renewal on July 21, 2024",
    date: "July 16, 2024",
    time: "05:10 PM",
    read: false,
  },
  {
    id: "3",
    type: "meeting",
    title: "Meeting Scheduled",
    message: "Emily Davis has set up a meeting for July 20, 2024, at 3:00 PM",
    date: "July 16, 2024",
    time: "03:47 PM",
    read: false,
  },
  {
    id: "4",
    type: "meeting",
    title: "Meeting Scheduled",
    message: "Matthew Martinez has scheduled a meeting for July 23, 2024",
    date: "July 16, 2024",
    time: "11:30 AM",
    read: true,
  },
  {
    id: "5",
    type: "renewal",
    title: "Contract Review",
    message: "Nnifer Harris's contract renewal is up for review on November 10",
    date: "July 16, 2024",
    time: "10:00 AM",
    read: true,
  },
  {
    id: "6",
    type: "team",
    title: "New Team Member",
    message: "Anthony White has been added to the team as of today",
    date: "July 15, 2024",
    time: "04:30 PM",
    user: {
      name: "Anthony White",
      avatar: "/lovable-uploads/dc809dc8-3f55-44be-b25a-718640398bf5.png",
    },
    read: true,
  },
  {
    id: "7",
    type: "submitted",
    title: "Contract Submission",
    message: "Sarah Johnson's contract renewal has been submitted for review",
    date: "July 15, 2024",
    time: "01:52 PM",
    read: true,
  },
];

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState("all");
  
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
              <CardTitle>All Notifications</CardTitle>
              <CardDescription>
                View and manage your notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                        {!notification.read && (
                          <span className="h-2 w-2 rounded-full bg-brand-red"></span>
                        )}
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
