import type {
  User,
  Vehicle,
  MechanicProfile,
  ServiceRequest,
  AppNotification,
} from "@/types";

export const DEMO_USERS: User[] = [
  {
    id: "u-cust-1",
    name: "Aarav Patel",
    email: "customer@roadresq.com",
    password: "RoadResQ@123",
    role: "customer",
    phone: "+91 98250 11111",
  },
  {
    id: "u-mech-1",
    name: "Raj Auto Care",
    email: "mechanic@roadresq.com",
    password: "RoadResQ@123",
    role: "mechanic",
    phone: "+91 98250 22222",
  },
  {
    id: "u-admin-1",
    name: "Operations Admin",
    email: "admin@roadresq.com",
    password: "RoadResQ@123",
    role: "admin",
    phone: "+91 98250 33333",
  },
];

// Ahmedabad area coordinates (fallback demo location)
export const AHMEDABAD_CENTER = { lat: 23.0225, lng: 72.5714 };

export const DEMO_VEHICLES: Vehicle[] = [
  {
    id: "v-1",
    ownerId: "u-cust-1",
    type: "Car",
    brand: "Honda",
    model: "City",
    registrationNumber: "GJ01AB1234",
    fuelType: "Petrol",
    year: 2021,
    nickname: "Daily Driver",
  },
  {
    id: "v-2",
    ownerId: "u-cust-1",
    type: "SUV",
    brand: "Mahindra",
    model: "XUV700",
    registrationNumber: "GJ05XY5678",
    fuelType: "Diesel",
    year: 2022,
    nickname: "Family SUV",
  },
];

export const DEMO_MECHANICS: MechanicProfile[] = [
  {
    id: "m-1",
    name: "Raj Auto Care",
    email: "mechanic@roadresq.com",
    phone: "+91 98250 22222",
    verified: true,
    available: true,
    expertise: ["Dead Battery", "Engine Problem", "Vehicle Breakdown"],
    rating: 4.8,
    completedServices: 327,
    cancellationRate: 0.03,
    responseTimeMins: 7,
    lat: 23.0335,
    lng: 72.5852,
    serviceVehicle: "Tata Ace Service Van",
    totalEarnings: 184500,
  },
  {
    id: "m-2",
    name: "Shree Krishna Motors",
    email: "skm@roadresq.com",
    phone: "+91 98250 44444",
    verified: true,
    available: true,
    expertise: ["Flat Tyre", "Towing Required", "Vehicle Breakdown"],
    rating: 4.6,
    completedServices: 211,
    cancellationRate: 0.05,
    responseTimeMins: 9,
    lat: 23.0188,
    lng: 72.5591,
    serviceVehicle: "Force Traveller Tow Truck",
    totalEarnings: 121000,
  },
  {
    id: "m-3",
    name: "Gujarat Highway Assist",
    email: "gha@roadresq.com",
    phone: "+91 98250 55555",
    verified: true,
    available: false,
    expertise: ["Fuel Empty", "Overheating", "Engine Problem"],
    rating: 4.9,
    completedServices: 489,
    cancellationRate: 0.01,
    responseTimeMins: 6,
    lat: 23.0412,
    lng: 72.6021,
    serviceVehicle: "Mahindra Bolero Rescue",
    totalEarnings: 267800,
  },
  {
    id: "m-4",
    name: "QuickFix Roadside",
    email: "qf@roadresq.com",
    phone: "+91 98250 66666",
    verified: false,
    available: true,
    expertise: ["Lockout / Lost Key", "Dead Battery"],
    rating: 4.2,
    completedServices: 88,
    cancellationRate: 0.11,
    responseTimeMins: 14,
    lat: 23.0098,
    lng: 72.5789,
    serviceVehicle: "Bajaj Maxima",
    totalEarnings: 42300,
  },
];

export const DEMO_REQUESTS: ServiceRequest[] = [];

export const DEMO_NOTIFICATIONS: AppNotification[] = [];
