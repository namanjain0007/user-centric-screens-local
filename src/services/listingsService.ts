import { Listing, mapApiResponseToListing, mapFormDataToApiRequest } from "@/types/listing";
import { getToken } from "./authService";

const API_URL = "https://rental-prime-backend.onrender.com/vendor_listing";

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

// Get all listings
export const getListings = async (): Promise<Listing[]> => {
  try {
    const response = await fetch(API_URL,{headers: getHeaders()});
    const data = await handleApiResponse(response, 'Failed to fetch listings');

    return Array.isArray(data)
      ? data.map(mapApiResponseToListing)
      : [];
  } catch (error) {
    console.error('Error in getListings function:', error);
    throw error;
  }
};

// Add a new listing
export const addListing = async (listingData: {
  title: string;
  description: string;
  price: number;
  location: string;
  category: string;
  availableFrom: Date;
  availableUntil: Date;
  owner_id?: number;
}): Promise<Listing> => {
  try {
    const apiData = mapFormDataToApiRequest(listingData);

    const response = await fetch(`${API_URL}/listing`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(apiData),
    });

    const data = await handleApiResponse(response, 'Failed to create listing');
    return mapApiResponseToListing(data);
  } catch (error) {
    console.error('Error in addListing function:', error);
    throw error;
  }
};

// Update an existing listing
export const updateListing = async (
  owner_id: number,
  listing_id: number,
  listingData: {
    title: string;
    description: string;
    price: number;
    location: string;
    category: string;
    availableFrom: Date;
    availableUntil: Date;
  }
): Promise<Listing> => {
  try {
    const apiData = mapFormDataToApiRequest({
      ...listingData,
      owner_id
    });

    console.log('Updating listing with data:', {
      endpoint: `${API_URL}/listing/${listing_id}`,
      method: 'PATCH',
      owner_id,
      listing_id,
      requestBody: apiData
    });

    // Using the correct format based on backend routes: /vendor_listing/listing/:listingId
    const response = await fetch(`${API_URL}/listing/${listing_id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(apiData),
    });

    console.log('Update response status:', response.status);

    if (!response.ok) {
      // Try to log the error response
      try {
        const errorText = await response.text();
        console.error('Error response from API:', errorText);
      } catch (e) {
        console.error('Could not parse error response');
      }
    }

    const data = await handleApiResponse(response, 'Failed to update listing');
    return mapApiResponseToListing(data);
  } catch (error) {
    console.error('Error in updateListing function:', error);
    throw error;
  }
};

// Delete a listing
export const deleteListing = async (id: number): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/listing/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    if (response.ok) {
      return true;
    }

    await handleApiResponse(response, 'Failed to delete listing');
    return true;
  } catch (error) {
    console.error('Error in deleteListing function:', error);
    throw error;
  }
};