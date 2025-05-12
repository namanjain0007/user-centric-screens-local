import { Admin, AdminFormData, mapApiResponseToAdmin } from "@/types/admin";
import { getToken } from "./authService";

const API_URL = "https://rental-prime-backend.onrender.com/admin";

// Create headers with the token from sessionStorage
const getHeaders = () => {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    "Authorization": token ? `Bearer ${token}` : "",
  };
};

// Extract current admin info from token
// This is a simple implementation - in a real app, you'd use a proper JWT library
export const getCurrentAdminInfo = () => {
  try {
    const token = getToken();
    if (!token) return null;

    // Get the payload part of the JWT (second part)
    const payload = token.split('.')[1];
    // Decode the base64 string
    const decodedPayload = atob(payload);
    // Parse the JSON
    const adminInfo = JSON.parse(decodedPayload);

    return {
      admin_id: adminInfo.admin_id,
      admin_user_type: adminInfo.admin_user_type
    };
  } catch (error) {
    console.error('Error extracting admin info from token:', error);
    return null;
  }
};

// Custom error class for authentication errors
export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

// Generic API response handler
const handleApiResponse = async (response: Response, errorMessage: string) => {
  if (response.status === 401 || response.status === 403) {
    throw new AuthError('Authentication failed. Please log in again.');
  }

  if (!response.ok) {
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
  }

  return response.json();
};

// Get all admin users
export const getAdmins = async (): Promise<Admin[]> => {
  try {
    const response = await fetch(API_URL, { headers: getHeaders() });
    const data = await handleApiResponse(response, 'Failed to fetch admin users');

    return Array.isArray(data)
      ? data.map(mapApiResponseToAdmin)
      : [];
  } catch (error) {
    console.error('Error in getAdmins function:', error);
    throw error;
  }
};

// Add a new admin user
export const addAdmin = async (adminData: AdminFormData): Promise<Admin> => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(adminData),
    });

    const data = await handleApiResponse(response, 'Failed to create admin user');
    return mapApiResponseToAdmin(data);
  } catch (error) {
    console.error('Error in addAdmin function:', error);

    // Check for duplicate email error
    if (error instanceof Error &&
        (error.message.includes('duplicate') ||
         error.message.includes('already exists') ||
         error.message.includes('unique constraint'))) {
      throw new Error('An admin with this email already exists');
    }

    throw error;
  }
};

// Update an existing admin user
export const updateAdmin = async (admin_id: number, adminData: Partial<AdminFormData>): Promise<Admin> => {
  try {
    const response = await fetch(`${API_URL}/${admin_id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(adminData),
    });

    const data = await handleApiResponse(response, 'Failed to update admin user');
    return mapApiResponseToAdmin(data);
  } catch (error) {
    console.error('Error in updateAdmin function:', error);

    // Check for duplicate email error
    if (error instanceof Error &&
        (error.message.includes('duplicate') ||
         error.message.includes('already exists') ||
         error.message.includes('unique constraint'))) {
      throw new Error('An admin with this email already exists');
    }

    throw error;
  }
};

// Delete an admin user
export const deleteAdmin = async (admin_id: number): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/${admin_id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    await handleApiResponse(response, 'Failed to delete admin user');
  } catch (error) {
    console.error('Error in deleteAdmin function:', error);
    throw error;
  }
};
