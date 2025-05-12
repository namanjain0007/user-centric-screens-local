
import { Category } from "../types/category";
import { getToken } from "./authService";

const API_URL = "https://rental-prime-backend.onrender.com/category";

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

// Get all categories
export const getCategories = async (): Promise<Category[]> => {
  try {
    const response = await fetch(API_URL);
    const data = await handleApiResponse(response, 'Failed to fetch categories');

    return data.map((category: any) => ({
      category_id: category.category_id,
      name: category.name,
      created_at: category.created_at,
      updated_at: category.updated_at
    }));
  } catch (error) {
    console.error('Error in getCategories function:', error);
    throw error;
  }
};

// Add a new category
export const addCategory = async (name: string): Promise<Category> => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ name }),
    });

    const data = await handleApiResponse(response, 'Failed to create category');

    return {
      category_id: data.category_id,
      name: data.name,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  } catch (error) {
    console.error('Error in addCategory function:', error);

    // Check for duplicate category error
    if (error instanceof Error &&
        (error.message.includes('duplicate') ||
         error.message.includes('already exists') ||
         error.message.includes('unique constraint'))) {
      throw new Error('A category with this name already exists');
    }

    throw error;
  }
};

// Update an existing category
export const updateCategory = async (id: number, name: string): Promise<Category> => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ name }),
    });

    const data = await handleApiResponse(response, 'Failed to update category');

    return {
      category_id: data.category_id,
      name: data.name,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  } catch (error) {
    console.error('Error in updateCategory function:', error);

    // Check for duplicate category error
    if (error instanceof Error &&
        (error.message.includes('duplicate') ||
         error.message.includes('already exists') ||
         error.message.includes('unique constraint'))) {
      throw new Error('A category with this name already exists');
    }

    throw error;
  }
};

// Delete a category
export const deleteCategory = async (id: number): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    if (response.ok) {
      return true;
    }

    await handleApiResponse(response, 'Failed to delete category');
    return true;
  } catch (error) {
    console.error('Error in deleteCategory function:', error);
    throw error;
  }
};
