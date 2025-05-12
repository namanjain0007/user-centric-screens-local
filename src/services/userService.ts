import { User } from "@/types";
import { getToken } from "./authService";

const API_URL = "https://rental-prime-backend.onrender.com/users";

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

export async function getUsers(): Promise<User[]> {
  try {
    // console.log('Fetching users...');
    const response = await fetch(API_URL, { headers: getHeaders() });

    // Use our error handling function
    const users = await handleApiResponse(response, 'Failed to fetch users');

    // console.log(`Fetched ${users.length} users`);

    return users.map((user: Record<string, any>) => ({
      id: user.user_id, // Use user_id from the database schema
      name: user.name || '',
      email: user.email || '',
      role: user.user_type || 'Renter',
      status: "active", // Default status since it's not in the API
      lastActive: user.created_at ? new Date(user.created_at).toLocaleDateString() : new Date().toLocaleDateString(),
      avatar: "/placeholder.svg" // Default avatar since it's not in the API
    }));
  } catch (error) {
    console.error('Error in getUsers function:', error);

    // Rethrow the error to be handled by the component
    throw error;
  }
}

export async function createUser(userData: {
  name: string;
  email: string;
  password: string;
  user_type: "Owner" | "Renter";
}): Promise<User> {
  // console.log('Creating user with data:', userData);

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(userData),
    });

    // console.log('Create user response status:', response.status);

    // Use our error handling function
    const user = await handleApiResponse(response, 'Failed to create user');

    // console.log('Created user response:', user);

    // Create a user object with the response data
    const newUser: User = {
      id: user.user_id, // Use user_id from the database schema
      name: user.name || '',
      email: user.email || '',
      role: user.user_type || 'Renter',
      status: "active",
      lastActive: user.created_at ? new Date(user.created_at).toLocaleDateString() : new Date().toLocaleDateString(),
      avatar: "/placeholder.svg"
    };

    // console.log('Mapped user object:', newUser);
    return newUser;
  } catch (error) {
    console.error('Error in createUser function:', error);

    // Check for duplicate email error
    if (error instanceof Error &&
        (error.message.includes('duplicate') ||
         error.message.includes('already exists') ||
         error.message.includes('unique constraint'))) {
      throw new Error('A user with this email already exists');
    }

    // Rethrow the error to be handled by the component
    throw error;
  }
}

export async function deleteUser(id: string): Promise<void> {
  // console.log(`Deleting user with ID: ${id}`);

  try {
    // Use the correct endpoint format based on your database schema
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    console.log(`Delete response status: ${response.status}`);

    // If the first attempt fails, try with a query parameter
    if (!response.ok) {
      console.log('First attempt failed, trying with query parameter...');
      const queryResponse = await fetch(`${API_URL}?user_id=${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });

      console.log(`Delete with query parameter response status: ${queryResponse.status}`);

      // Use our error handling function for the second attempt
      if (!queryResponse.ok) {
        await handleApiResponse(queryResponse, `Failed to delete user. Status: ${queryResponse.status}`);
      }
    }

    console.log('User deleted successfully');
  } catch (error) {
    console.error('Error in deleteUser function:', error);

    // Check if it's an authentication error
    if (error instanceof AuthError) {
      throw error; // Rethrow auth errors as they are
    }

    // For other errors, provide a more user-friendly message
    if (error instanceof Error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    } else {
      throw new Error('Failed to delete user due to an unknown error');
    }
  }
}
