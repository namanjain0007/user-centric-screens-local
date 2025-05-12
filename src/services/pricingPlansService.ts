import { PricingPlan } from "@/types/pricingPlan";
import { getToken } from "./authService";

const API_URL = "https://rental-prime-backend.onrender.com/pricing_plans";

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

// Get all pricing plans
export const getPricingPlans = async (): Promise<PricingPlan[]> => {
  try {
    const response = await fetch(API_URL, { headers: getHeaders() });
    const data = await handleApiResponse(response, 'Failed to fetch pricing plans');
    // console.log('API response data:', data);

    return data.map((plan: any) => ({
      plan_id: plan.plan_id,
      name: plan.name,
      price: plan.price,
      duration_in_days: plan.duration_in_days,
      available_listing: plan.available_listing ,
      created_at: plan.created_at,
      updated_at: plan.updated_at
    }));
  } catch (error) {
    console.error('Error in getPricingPlans function:', error);
    throw error;
  }
};

// Add a new pricing plan
export const addPricingPlan = async (planData: {
  name: string;
  price: number;
  duration_in_days: number;
  available_listing: number;
}): Promise<PricingPlan> => {
  try {
    // console.log('Adding pricing plan with data:', planData);
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(planData),
    });
    // console.log('API response:', planData);

    const data = await handleApiResponse(response, 'Failed to create pricing plan');

    return {
      plan_id: data.plan_id,
      name: data.name,
      price: data.price,
      duration_in_days: data.duration_in_days,
      available_listing: data.available_listing ,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  } catch (error) {
    console.error('Error in addPricingPlan function:', error);

    // Check for duplicate plan error
    if (error instanceof Error &&
        (error.message.includes('duplicate') ||
         error.message.includes('already exists') ||
         error.message.includes('unique constraint'))) {
      throw new Error('A pricing plan with this name already exists');
    }

    throw error;
  }
};

// Update an existing pricing plan
export const updatePricingPlan = async (
  id: number,
  planData: {
    name: string;
    price: number;
    duration_in_days: number;
    available_listing: number;
  }
): Promise<PricingPlan> => {
  try {
    // console.log('Updating pricing plan with data:', { id, planData });
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(planData),
    });

    const data = await handleApiResponse(response, 'Failed to update pricing plan');

    return {
      plan_id: data.plan_id,
      name: data.name,
      price: data.price,
      duration_in_days: data.duration_in_days,
      available_listing: data.available_listing ,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  } catch (error) {
    console.error('Error in updatePricingPlan function:', error);

    // Check for duplicate plan error
    if (error instanceof Error &&
        (error.message.includes('duplicate') ||
         error.message.includes('already exists') ||
         error.message.includes('unique constraint'))) {
      throw new Error('A pricing plan with this name already exists');
    }

    throw error;
  }
};

// Delete a pricing plan
export const deletePricingPlan = async (id: number): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    if (response.ok) {
      return true;
    }

    await handleApiResponse(response, 'Failed to delete pricing plan');
    return true;
  } catch (error) {
    console.error('Error in deletePricingPlan function:', error);
    throw error;
  }
};
