// Admin user type definition based on the database schema
export interface Admin {
  admin_id: number;
  name: string;
  email: string;
  admin_user_type: string;
  created_at?: string;
  updated_at?: string;
}

// Form data for creating or updating an admin
export interface AdminFormData {
  name: string;
  email: string;
  password: string;
  admin_user_type: string;
}

// Map API response to Admin type
export const mapApiResponseToAdmin = (data: any): Admin => {
  return {
    admin_id: data.admin_id,
    name: data.name,
    email: data.email,
    admin_user_type: data.admin_user_type,
    created_at: data.created_at,
    updated_at: data.updated_at
  };
};
