export interface Property {
  id?: string;
  _id?: string; // MongoDB ID
  title: string;
  description: string;
  price: number;
  location: string | { address?: string; city?: string; state?: string; zipCode?: string; country?: string; latitude?: number; longitude?: number };
  type: "house" | "apartment" | "condo" | "villa" | "land";
  bedrooms: number;
  bathrooms: number;
  area: number;
  images: string[] | { url: string; public_id?: string }[];
  featured: boolean;
  agentId?: string;
  ownerId?: string;
  createdAt: string;
  status?: "pending" | "approved" | "rejected";
  views?: number;
  approvedBy?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: "agent" | "user";
}

export const mockProperties: Property[] = [
  {
    id: "1",
    title: "Modern Downtown Apartment",
    description: "Stunning contemporary apartment in the heart of the city with panoramic views. Features high-end finishes, open concept living, and premium appliances. Walking distance to restaurants, shopping, and entertainment.",
    price: 850000,
    location: "Downtown District",
    type: "apartment",
    bedrooms: 3,
    bathrooms: 2,
    area: 1850,
    images: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
      "https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=800"
    ],
    featured: true,
    agentId: "agent1",
    createdAt: "2025-01-15"
  },
  {
    id: "2",
    title: "Luxury Family Villa",
    description: "Exquisite family villa with private pool and garden. This stunning property features spacious rooms, modern architecture, and high-quality finishes throughout. Perfect for families seeking comfort and elegance.",
    price: 1250000,
    location: "Sunset Hills",
    type: "villa",
    bedrooms: 5,
    bathrooms: 4,
    area: 3500,
    images: [
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800"
    ],
    featured: true,
    agentId: "agent1",
    createdAt: "2025-01-10"
  },
  {
    id: "3",
    title: "Cozy Suburban House",
    description: "Charming suburban home with beautiful landscaping and a welcoming atmosphere. Features updated kitchen, hardwood floors, and a spacious backyard perfect for entertaining.",
    price: 425000,
    location: "Maple Grove",
    type: "house",
    bedrooms: 3,
    bathrooms: 2,
    area: 2100,
    images: [
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800",
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800"
    ],
    featured: false,
    agentId: "agent1",
    createdAt: "2025-01-08"
  },
  {
    id: "4",
    title: "Beachfront Condo Paradise",
    description: "Wake up to ocean views every morning in this spectacular beachfront condo. Featuring floor-to-ceiling windows, modern design, and resort-style amenities including pool and fitness center.",
    price: 975000,
    location: "Coastal Bay",
    type: "condo",
    bedrooms: 2,
    bathrooms: 2,
    area: 1600,
    images: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800",
      "https://images.unsplash.com/photo-1600566753151-384129cf4e3e?w=800"
    ],
    featured: true,
    agentId: "agent1",
    createdAt: "2025-01-05"
  },
  {
    id: "5",
    title: "Prime Development Land",
    description: "Rare opportunity to own 5 acres of prime development land in a rapidly growing area. Zoned for residential or mixed-use. Utilities available at the street. Ideal for investors or developers.",
    price: 550000,
    location: "North Valley",
    type: "land",
    bedrooms: 0,
    bathrooms: 0,
    area: 217800,
    images: [
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800",
      "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800"
    ],
    featured: false,
    agentId: "agent1",
    createdAt: "2025-01-03"
  },
  {
    id: "6",
    title: "Historic Townhouse",
    description: "Beautiful historic townhouse with original character and modern updates. Features exposed brick, high ceilings, and a private patio. Located in a vibrant neighborhood with shops and cafes.",
    price: 675000,
    location: "Old Town",
    type: "house",
    bedrooms: 3,
    bathrooms: 3,
    area: 2400,
    images: [
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800",
      "https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800"
    ],
    featured: false,
    agentId: "agent1",
    createdAt: "2025-01-01"
  }
];

export const mockUsers: User[] = [
  {
    id: "agent1",
    name: "Sarah Johnson",
    email: "agent@estate.com",
    password: "password123",
    role: "agent"
  },
  {
    id: "user1",
    name: "John Doe",
    email: "user@example.com",
    password: "password123",
    role: "user"
  }
];
