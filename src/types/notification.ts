// Notification type definition based on the database schema
export interface Notification {
  id: number;
  user_id: number;
  user_type: 'Renter' | 'Owner';
  type: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

// Helper function to convert API response to Notification type
export function mapApiResponseToNotification(data: any): Notification {
  return {
    id: data.id,
    user_id: data.user_id,
    user_type: data.user_type,
    type: data.type,
    message: data.message,
    is_read: data.is_read,
    created_at: data.created_at
  };
}

// Helper function to format the notification date for display
export function formatNotificationDate(dateString: string): { date: string, time: string } {
  const date = new Date(dateString);
  
  // Format date (e.g., "July 16, 2024")
  const formattedDate = date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
  
  // Format time (e.g., "09:00 PM")
  const formattedTime = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
  
  return {
    date: formattedDate,
    time: formattedTime
  };
}
