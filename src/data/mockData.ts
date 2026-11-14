import {
  Flame,
  GlassWater,
  PartyPopper,
  Utensils,
} from "lucide-react";

export interface Service {
  id: string;
  name: string;
  description: string;
  icon: any;
  image: string;
}

export interface Vendor {
  id: string;
  name: string;
  serviceType: string;
  rating: number;
  reviews: number;
  priceRange: string;
  location: string;
  portfolio: string[];
  description: string;
}

export interface Stats {
  value: string;
  label: string;
}

export interface EventType {
  value: string;
  label: string;
}

export interface Location {
  value: string;
  label: string;
}

export const services: Service[] = [
  {
    id: "1",
    name: "Wedding Catering",
    description: "Premium catering services tailored for weddings, including customized menus, buffet setups, and full-service food coordination for your special day.",
    icon: Utensils,
    image: "https://images.unsplash.com/photo-1555244162-803834f70033?w=800&auto=format&fit=crop",
  },
  {
    id: "2",
    name: "Corporate Catering",
    description: "Professional catering for business meetings, conferences, office events, seminars, and corporate gatherings.",
    icon: Utensils,
    image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&auto=format&fit=crop",
  },
  {
    id: "3",
    name: "Social Event Catering",
    description: "Catering for birthdays, anniversaries, naming ceremonies, family gatherings, and other social celebrations.",
    icon: PartyPopper,
    image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&auto=format&fit=crop",
  },
  {
    id: "4",
    name: "Local & Traditional Dishes",
    description: "Authentic preparation of a variety of Nigerian local dishes, served with quality ingredients and great presentation.",
    icon: Utensils,
    image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&auto=format&fit=crop",
  },
  {
    id: "5",
    name: "International Cuisine",
    description: "A selection of continental and international meals prepared to suit diverse tastes and event styles.",
    icon: Utensils,
    image: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800&auto=format&fit=crop",
  },
  {
    id: "6",
    name: "Buffet & Small Chops Catering",
    description: "Perfectly portions of finger foods, spring rolls, samosas, and variety of small chops for all occasions.",
    icon: Utensils,
    image: "/images/small-chops.jpeg",
  },
  {
    id: "7",
    name: "Drinks Service",
    description: "Drinks e.g Cocktails, Mocktails, Zobo, Tiger Nuts, etc. Premium drink service tailored for your event.",
    icon: GlassWater,
    image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&auto=format&fit=crop",
  },
  {
    id: "8",
    name: "Barbecue Service",
    description: "Barbecue - (Different types, Hanging, sea food, etc). Expertly grilled barbecue perfect for outdoor and indoor gatherings.",
    icon: Flame,
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&auto=format&fit=crop",
  },
];

export const vendors: Vendor[] = [
  {
    id: "1",
    name: "Perfect Moments Photography",
    serviceType: "Photography",
    rating: 4.9,
    reviews: 127,
    priceRange: "$$$",
    location: "New York, NY",
    portfolio: [
      "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800",
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800",
    ],
    description:
      "Award-winning photography service specializing in weddings and corporate events.",
  },
  {
    id: "2",
    name: "Gourmet Catering Co.",
    serviceType: "Catering",
    rating: 4.8,
    reviews: 95,
    priceRange: "$$",
    location: "Los Angeles, CA",
    portfolio: [
      "https://images.unsplash.com/photo-1555244162-803834f70033?w=800",
    ],
    description:
      "Farm-to-table catering with customizable menus for any occasion.",
  },
];

export const stats: Stats[] = [
  { value: "10,000 +", label: "Verified Users" },
  { value: "50,000 +", label: "Portfolios Shared" },
  { value: "4.9/5", label: "Average Rating" },
  { value: "24/7", label: "Customer Support" },
];

export const eventTypes: EventType[] = [
  { value: "wedding", label: "Wedding" },
  { value: "corporate", label: "Corporate Event" },
  { value: "birthday", label: "Birthday Party" },
  { value: "conference", label: "Conference" },
  { value: "other", label: "Other" },
];

export const serviceTypes: EventType[] = [
  { value: "wedding-catering", label: "Wedding Catering" },
  { value: "corporate-catering", label: "Corporate Catering" },
  { value: "social-event", label: "Social Event Catering" },
  { value: "local-dishes", label: "Local & Traditional Dishes" },
  { value: "drinks", label: "Drinks & Cocktails" },
  { value: "barbecue", label: "Barbecue Services" },
  { value: "all", label: "All Services" },
];

export const locations: Location[] = [
  { value: "lagos", label: "Lagos" },
  { value: "abuja", label: "Abuja" },
  { value: "port-harcourt", label: "Port Harcourt" },
  { value: "kano", label: "Kano" },
  { value: "ibadan", label: "Ibadan" },
  { value: "benin-city", label: "Benin City" },
  { value: "kaduna", label: "Kaduna" },
  { value: "enugu", label: "Enugu" },
  { value: "abia", label: "Abia" },
  { value: "oyo", label: "Oyo" },
];

export const howItWorksSteps = [
  {
    step: 1,
    title: "Event Catering",
    description: "Professional catering services for weddings, birthdays, and special events.",
  },
  {
    step: 2,
    title: "Corporate Catering",
    description: "Delicious meals and refreshments for meetings, offices, and corporate functions.",
  },
  {
    step: 3,
    title: "Local & Continental Dishes",
    description: "A rich variety of expertly prepared local and international cuisines.",
  },
  {
    step: 4,
    title: "Buffet & Party Catering",
    description: "Perfect buffet and party food services for celebrations and large gatherings.",
  },
];
