import { Notification, mapApiResponseToNotification } from "@/types/notification";
import { getToken } from "./authService";

const API_URL = "https://rental-prime-backend.onrender.com/notification";

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
    const response = await fetch(`${API_URL}/all`, {
      headers: getHeaders()
    });
    
    const data = await handleApiResponse(response, 'Failed to fetch notifications');
    
    return Array.isArray(data)
      ? data.map(mapApiResponseToNotification)
      : [];
  } catch (error) {
    console.error('Error in getNotifications function:', error);
    throw error;
  }
};

// Delete a notification
export const deleteNotification = async (id: number): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    if (response.ok) {
      return true;
    }

    await handleApiResponse(response, 'Failed to delete notification');
    return true;
  } catch (error) {
    console.error('Error in deleteNotification function:', error);
    throw error;
  }
};
