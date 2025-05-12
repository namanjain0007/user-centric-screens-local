export interface Listing {
  listing_id: number;
  owner_id: number;
  title: string;
  description: string;
  price: number;
  location: string;
  category: string;
  available_from: string; // ISO date string from API
  available_until: string; // ISO date string from API
  created_at?: string;
  updated_at?: string;
  status?: "in-stock" | "out-of-stock" | "low-stock"; // Optional status field
  image?: string; // Optional image URL
}

// Helper function to convert API response to Listing type
export function mapApiResponseToListing(data: any): Listing {
  return {
    listing_id: data.listing_id,
    owner_id: data.owner_id,
    title: data.title,
    description: data.description || "",
    price: parseFloat(data.price),
    location: data.location || "",
    category: data.category || "",
    available_from: data.available_from,
    available_until: data.available_until,
    created_at: data.created_at,
    updated_at: data.updated_at,
    status: "in-stock", // Default status
    image: data.image || "/placeholder.svg"
  };
}

// Helper function to convert form data to API request format
export function mapFormDataToApiRequest(data: {
  title: string;
  description: string;
  price: number;
  location: string;
  category: string;
  availableFrom: Date;
  availableUntil: Date;
  owner_id?: number;
}): any {
  return {
    title: data.title,
    description: data.description,
    price: data.price,
    location: data.location,
    category: data.category,
    available_from: data.availableFrom.toISOString().split('T')[0], // Format as YYYY-MM-DD
    available_until: data.availableUntil.toISOString().split('T')[0], // Format as YYYY-MM-DD
    owner_id: data.owner_id
  };
}

// Helper function to convert API date strings to Date objects for the form
export function mapApiListingToFormData(listing: Listing): {
  title: string;
  description: string;
  price: number;
  location: string;
  category: string;
  availableFrom: Date;
  availableUntil: Date;
  image?: string;
  owner_id: number;
  listing_id: number;
} {
  return {
    title: listing.title,
    description: listing.description,
    price: listing.price,
    location: listing.location,
    category: listing.category,
    availableFrom: new Date(listing.available_from),
    availableUntil: new Date(listing.available_until),
    image: listing.image,
    owner_id: listing.owner_id,
    listing_id: listing.listing_id
  };
}
