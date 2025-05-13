// Notification type definition based on the database schema
export interface Notification {
  id: number;
  sender_id: number;
  sender_type: 'Renter' | 'Owner';
  receiver_id: number;
  receiver_type: 'Renter' | 'Owner';
  type: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

// Helper function to convert API response to Notification type
export function mapApiResponseToNotification(data: any): Notification {
  try {
    // Check if data has all required fields
    if (!data) {
      console.error('Notification data is null or undefined');
      throw new Error('Invalid notification data');
    }

    // Log the raw data for debugging
    console.log('Raw notification data:', data);

    // Check for required fields and provide defaults if missing
    if (data.id === undefined) {
      console.warn('Notification missing id field:', data);
    }
    if (data.sender_id === undefined) {
      console.warn('Notification missing sender_id field:', data);
    }
    if (data.sender_type === undefined) {
      console.warn('Notification missing sender_type field:', data);
    }
    if (data.receiver_id === undefined) {
      console.warn('Notification missing receiver_id field:', data);
    }
    if (data.receiver_type === undefined) {
      console.warn('Notification missing receiver_type field:', data);
    }
    if (data.type === undefined) {
      console.warn('Notification missing type field:', data);
    }
    if (data.message === undefined) {
      console.warn('Notification missing message field:', data);
    }
    if (data.is_read === undefined) {
      console.warn('Notification missing is_read field:', data);
    }
    if (data.created_at === undefined) {
      console.warn('Notification missing created_at field:', data);
    }

    // Map the data with fallbacks for missing fields
    return {
      id: data.id || 0,
      sender_id: data.sender_id || 0,
      sender_type: data.sender_type || 'Renter',
      receiver_id: data.receiver_id || 0,
      receiver_type: data.receiver_type || 'Renter',
      type: data.type || 'notification',
      message: data.message || 'No message',
      is_read: data.is_read || false,
      created_at: data.created_at || new Date().toISOString()
    };
  } catch (error) {
    console.error('Error mapping notification data:', error, data);
    // Return a default notification object
    return {
      id: 0,
      sender_id: 0,
      sender_type: 'Renter',
      receiver_id: 0,
      receiver_type: 'Renter',
      type: 'error',
      message: 'Error processing notification',
      is_read: false,
      created_at: new Date().toISOString()
    };
  }
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
