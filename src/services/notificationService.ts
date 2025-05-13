import { Notification, mapApiResponseToNotification } from "@/types/notification";
import { getToken } from "./authService";

const API_URL = "https://rental-prime-backend.onrender.com/notification";
// console.log('Notification API URL:', API_URL);

// Create headers with the token from sessionStorage
const getHeaders = () => {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    "Authorization": token ? `Bearer ${token}` : "",
  };
};

// Custom error class for authentication errors
export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

// Function to handle API response errors
const handleApiResponse = async (response: Response, errorMessage: string): Promise<any> => {
  if (response.ok) {
    return response.json();
  }

  // Handle different error status codes
  if (response.status === 401 || response.status === 403) {
    console.error('Authentication error:', response.status);
    throw new AuthError('Your session has expired or your authentication token is invalid.');
  }

  if (response.status === 404) {
    console.error('Resource not found:', response.status);
    throw new Error('The requested resource was not found.');
  }

  if (response.status === 500) {
    console.error('Server error:', response.status);
    throw new Error('A server error occurred. Please try again later.');
  }

  // Try to parse error message from response
  try {
    const errorData = await response.json();
    console.error('API error:', errorData);
    throw new Error(errorData.message || errorMessage);
  } catch (e) {
    // If we can't parse the JSON, just throw a generic error
    console.error('Error parsing API error response:', e);
    throw new Error(errorMessage);
  }
};

// Get all notifications
export const getNotifications = async (): Promise<Notification[]> => {
  try {
    // console.log('Fetching notifications from:', `${API_URL}/all`);
    // console.log('Headers:', getHeaders());

    const response = await fetch(`${API_URL}/all`, {
      headers: getHeaders()
    });

    // console.log('Response status:', response.status);
    // console.log('Response ok:', response.ok);

    const responseData = await handleApiResponse(response, 'Failed to fetch notifications');

    // console.log('Raw notification response:', responseData);

    // Check if the response has the expected structure with a notifications array
    if (responseData && responseData.notifications && Array.isArray(responseData.notifications)) {
      console.log('Found notifications array in response with count:', responseData.count);
      const notificationsArray = responseData.notifications;

      if (notificationsArray.length === 0) {
        console.log('Notifications array is empty');
        return [];
      }

      // console.log('First notification item:', notificationsArray[0]);

      const mappedData = notificationsArray.map(mapApiResponseToNotification);
      // console.log('Mapped notifications:', mappedData);

      return mappedData;
    } else if (Array.isArray(responseData)) {
      // Handle case where the API directly returns an array
      console.log('Response is directly an array of notifications');

      if (responseData.length === 0) {
        console.log('Notifications array is empty');
        return [];
      }

      const mappedData = responseData.map(mapApiResponseToNotification);
      // console.log('Mapped notifications:', mappedData);

      return mappedData;
    } else {
      console.warn('Unexpected response format:', responseData);
      return [];
    }
  } catch (error) {
    console.error('Error in getNotifications function:', error);
    throw error;
  }
};

// Delete a notification
export const deleteNotification = async (id: number): Promise<boolean> => {
  try {
    console.log(`Deleting notification with ID: ${id}`);

    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    console.log('Delete response status:', response.status);
    console.log('Delete response ok:', response.ok);

    if (response.ok) {
      console.log('Successfully deleted notification');
      return true;
    }

    const errorData = await handleApiResponse(response, 'Failed to delete notification');
    console.error('Error deleting notification:', errorData);
    return false;
  } catch (error) {
    console.error('Error in deleteNotification function:', error);
    throw error;
  }
};
