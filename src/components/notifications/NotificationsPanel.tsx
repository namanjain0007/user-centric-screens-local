
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckIcon, ChevronLeft, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface NotificationsPanelProps {
  onClose: () => void;
}

interface NotificationItem {
  id: string;
  type: "leave" | "contract" | "meeting" | "renewal" | "team" | "submitted";
  title: string;
  date: string;
  time: string;
  user?: {
    name: string;
    avatar?: string;
  };
  isUnread: boolean;
}

const notifications: NotificationItem[] = [
  {
    id: "1",
    type: "leave",
    title: "John Doe has submitted a leave request for July 25-27, 2024",
    date: "July 16, 2024",
    time: "09:00 PM",
    user: {
      name: "John Doe",
      avatar: "/lovable-uploads/5f951dde-d045-4b18-a3a9-a23d39486e7f.png",
    },
    isUnread: true,
  },
  {
    id: "2",
    type: "contract",
    title: "Michael Brown's contract is up for renewal on July 21, 2024",
    date: "July 16, 2024",
    time: "05:10 PM",
    isUnread: true,
  },
  {
    id: "3",
    type: "meeting",
    title: "Emily Davis has set up a meeting for July 20, 2024, at 3:00 PM",
    date: "July 16, 2024",
    time: "03:47 PM",
    isUnread: true,
  },
  {
    id: "4",
    type: "meeting",
    title: "Matthew Martinez has scheduled a meeting for July 23, 2024",
    date: "July 16, 2024",
    time: "11:30 AM",
    isUnread: true,
  },
  {
    id: "5",
    type: "renewal",
    title: "Nnifer Harris's contract renewal is up for review on November 10",
    date: "July 16, 2024",
    time: "10:00 AM",
    isUnread: true,
  },
  {
    id: "6",
    type: "team",
    title: "Anthony White has been added to the team as of today",
    date: "July 15, 2024",
    time: "04:30 PM",
    user: {
      name: "Anthony White",
      avatar: "/lovable-uploads/dc809dc8-3f55-44be-b25a-718640398bf5.png",
    },
    isUnread: false,
  },
  {
    id: "7",
    type: "submitted",
    title: "Sarah Johnson's contract renewal has been submitted for review",
    date: "July 15, 2024",
    time: "01:52 PM",
    isUnread: false,
  },
];

export function NotificationsPanel({ onClose }: NotificationsPanelProps) {
  const unreadCount = notifications.filter((n) => n.isUnread).length;

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
          <Button variant="outline" className="text-sm h-8" size="sm">
            All
          </Button>
          <Button variant="ghost" className="text-sm h-8" size="sm">
            Unread ({unreadCount})
          </Button>
        </div>
        <Button variant="ghost" size="sm" className="text-sm h-8 flex gap-1">
          <CheckIcon className="w-4 h-4" /> Mark all as read
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="py-3 px-4">
          <h3 className="mb-2 text-sm font-medium text-muted-foreground">Today</h3>
          <div className="space-y-4">
            {notifications
              .filter((n) => n.date.includes("July 16"))
              .map((notification) => (
                <NotificationCard key={notification.id} notification={notification} />
              ))}
          </div>

          <h3 className="mb-2 mt-6 text-sm font-medium text-muted-foreground">
            Yesterday
          </h3>
          <div className="space-y-4">
            {notifications
              .filter((n) => n.date.includes("July 15"))
              .map((notification) => (
                <NotificationCard key={notification.id} notification={notification} />
              ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

function NotificationCard({ notification }: { notification: NotificationItem }) {
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
        <p className="mt-1 text-xs text-muted-foreground">
          {notification.date} • {notification.time}
        </p>
      </div>

      {/* Unread indicator */}
      {notification.isUnread && (
        <div className="absolute right-3 top-3 h-2 w-2 rounded-full bg-brand-red"></div>
      )}
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
