// Authentication service for handling login, logout, and token management

// Custom error classes for specific authentication errors
export class UserNotFoundError extends Error {
  constructor(message: string = "User not found") {
    super(message);
    this.name = 'UserNotFoundError';
  }
}

export class IncorrectPasswordError extends Error {
  constructor(message: string = "Incorrect password") {
    super(message);
    this.name = 'IncorrectPasswordError';
  }
}

export class UnauthorizedUserTypeError extends Error {
  constructor(message: string = "Only super_admin users are allowed to log in") {
    super(message);
    this.name = 'UnauthorizedUserTypeError';
  }
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

// Interface for login credentials
export interface LoginCredentials {
  email: string;
  password: string;
}

// Interface for login response
export interface LoginResponse {
  token: string;
  user: {
    admin_id: number;
    name: string;
    email: string;
    admin_user_type: string;
  };
}

// Real API URL for admin login
const API_URL = "https://rental-prime-backend.onrender.com/auth/admin/login";

/**
 * Login function that authenticates a user
 * @param credentials User credentials (email and password)
 * @returns Promise with login response containing token and user info
 */
export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  try {
    // Create an AbortController to set a timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    console.time('login-request'); // Add timing for debugging

    // Make the actual API call to the backend with timeout
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
      signal: controller.signal,
      // Add cache control to prevent caching
      cache: 'no-store',
    }).finally(() => {
      clearTimeout(timeoutId); // Clear the timeout
      console.timeEnd('login-request'); // End timing
    });

    // For any error status codes, try to parse the response for more details
    if (!response.ok) {
      try {
        const errorData = await response.json();
        console.log('API error response:', errorData);

        // Check for specific error messages in the response
        const errorMessage = errorData.message || errorData.error || '';

        if (errorMessage.toLowerCase().includes('user not found') ||
            errorMessage.toLowerCase().includes('no user') ||
            response.status === 404) {
          throw new UserNotFoundError();
        }

        if (errorMessage.toLowerCase().includes('password') ||
            errorMessage.toLowerCase().includes('incorrect') ||
            errorMessage.toLowerCase().includes('invalid credentials') ||
            response.status === 401) {
          throw new IncorrectPasswordError();
        }

        // If we couldn't determine a specific error, throw a generic one
        throw new AuthError(errorMessage || 'An error occurred during login');
      } catch (parseError) {
        // If we couldn't parse the JSON or another error occurred
        if (parseError instanceof UserNotFoundError) {
          throw parseError;
        }
        if (parseError instanceof IncorrectPasswordError) {
          throw parseError;
        }

        // Default error handling based on status code
        if (response.status === 404) {
          throw new UserNotFoundError();
        }
        if (response.status === 401) {
          throw new IncorrectPasswordError();
        }

        throw new AuthError('An error occurred during login');
      }
    }

    // Parse the successful response
    const data = await response.json();

    // Extract user info from token
    let userInfo = { admin_id: 0, name: 'Admin User', email: credentials.email, admin_user_type: '' };

    try {
      // Get the token payload (second part of JWT)
      const token = data.token;
      const tokenParts = token.split('.');
      if (tokenParts.length >= 2) {
        const base64Payload = tokenParts[1].replace(/-/g, '+').replace(/_/g, '/');
        const decodedPayload = atob(base64Payload);
        const payload = JSON.parse(decodedPayload);

        // Extract user info from token payload
        userInfo = {
          admin_id: payload.admin_id || 0,
          name: payload.name || 'Admin User',
          email: payload.email || credentials.email,
          admin_user_type: payload.admin_user_type || ''
        };
      }
    } catch (e) {
      console.error('Error parsing token:', e);
    }

    // Create a standardized response object
    const loginResponse: LoginResponse = {
      token: data.token,
      user: userInfo
    };

    // console.log('Extracted user info:', userInfo);

    // Check if the user is a super_admin
    const userType = userInfo.admin_user_type;
    // console.log('User type from token:', userType);

    if (userType !== "super_admin") {
      console.error('Unauthorized user type:', userType);
      throw new UnauthorizedUserTypeError();
    }

    // Store token in sessionStorage
    sessionStorage.setItem("token", loginResponse.token);

    return loginResponse;
  } catch (error) {
    // Re-throw custom errors
    if (error instanceof UserNotFoundError ||
        error instanceof IncorrectPasswordError ||
        error instanceof UnauthorizedUserTypeError) {
      throw error;
    }

    // Handle timeout errors
    if (error instanceof DOMException && error.name === 'AbortError') {
      console.error("Login request timed out:", error);
      throw new AuthError("Login request timed out. The server is taking too long to respond. Please try again later.");
    }

    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error("Network error during login:", error);
      throw new AuthError("Network error. Please check your internet connection and try again.");
    }

    // Handle other errors
    console.error("Login error:", error);
    if (error instanceof AuthError) {
      throw error;
    }

    throw new AuthError("An error occurred during login. Please try again.");
  }
};

/**
 * Logout function that clears user session
 */
export const logout = (): void => {
  sessionStorage.removeItem("token");
};

/**
 * Check if user is authenticated
 * @returns boolean indicating if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!sessionStorage.getItem("token");
};

/**
 * Get authentication token
 * @returns The authentication token or null if not authenticated
 */
export const getToken = (): string | null => {
  return sessionStorage.getItem("token");
};
