// Mock data for listings
export const mockListings = [
  {
    id: 1,
    title: "Indoor Succulent Plants",
    description: "Beautiful indoor plants that require minimal maintenance.",
    category: "Plant",
    location: "San Francisco",
    price: 46,
    availableFrom: new Date("2023-06-01"),
    availableUntil: new Date("2023-12-31"),
    vendorEmail: "green@example.com",
    status: "out-of-stock",
    owner_id: "USR001"
  },
  {
    id: 2,
    title: "Cartoon Press Pen",
    description: "Stylish cartoon pens with smooth writing experience.",
    category: "Gadget",
    location: "New York",
    price: 22,
    availableFrom: new Date("2023-05-15"),
    availableUntil: new Date("2023-11-15"),
    vendorEmail: "stationery@example.com",
    status: "in-stock",
    owner_id: "USR002"
  },
  {
    id: 3,
    title: "Tripod Camera Stand",
    category: "Electronic",
    location: "Los Angeles",
    price: 33,
    availableFrom: new Date("2023-07-01"),
    availableUntil: new Date("2023-10-31"),
    vendorEmail: "camera@example.com",
    status: "coming-soon",
    owner_id: "USR003"
  },
  {
    id: 4,
    title: "Smart Watch for Man",
    category: "Electronic",
    location: "Chicago",
    price: 225,
    availableFrom: new Date("2023-06-15"),
    availableUntil: new Date("2023-12-15"),
    vendorEmail: "watches@example.com",
    status: "out-of-stock",
    owner_id: "USR001"
  },
  {
    id: 5,
    title: "Stylish Headphone",
    category: "Electronic",
    location: "Miami",
    price: 155,
    availableFrom: new Date("2023-05-01"),
    availableUntil: new Date("2023-11-30"),
    vendorEmail: "audio@example.com",
    status: "in-stock",
    owner_id: "USR002"
  },
  {
    id: 6,
    title: "Sunglass for Men",
    category: "Gadget",
    location: "Seattle",
    price: 135,
    availableFrom: new Date("2023-06-01"),
    availableUntil: new Date("2023-09-30"),
    vendorEmail: "eyewear@example.com",
    status: "coming-soon",
    owner_id: "USR003"
  },
  {
    id: 7,
    title: "Wireless Gaming Mouse",
    category: "Electronic",
    location: "Austin",
    price: 155,
    availableFrom: new Date("2023-07-15"),
    availableUntil: new Date("2023-12-31"),
    vendorEmail: "gaming@example.com",
    status: "out-of-stock",
    owner_id: "USR001"
  },
  {
    id: 8,
    title: "WIWU Airbuds Pro 2",
    category: "Electronic",
    location: "Boston",
    price: 144,
    availableFrom: new Date("2023-06-01"),
    availableUntil: new Date("2023-11-30"),
    vendorEmail: "audio@example.com",
    status: "in-stock",
    owner_id: "USR002"
  },
];

export type Listing = typeof mockListings[0];