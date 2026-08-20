export type UserRole = "customer" | "mechanic" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
}

export type VehicleType = "Car" | "Bike" | "SUV" | "Truck" | "Other";
export type FuelType = "Petrol" | "Diesel" | "CNG" | "Electric" | "Hybrid";

export interface Vehicle {
  id: string;
  ownerId: string;
  type: VehicleType;
  brand: string;
  model: string;
  registrationNumber: string;
  fuelType: FuelType;
  year: number;
  nickname?: string;
}

export interface MechanicProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  verified: boolean;
  available: boolean;
  busy?: boolean;
  expertise: IssueType[];
  rating: number;
  completedServices: number;
  cancellationRate: number;
  responseTimeMins: number;
  lat: number;
  lng: number;
  serviceVehicle: string;
  totalEarnings: number;
}

export type IssueType =
  | "Vehicle Breakdown"
  | "Flat Tyre"
  | "Dead Battery"
  | "Fuel Empty"
  | "Engine Problem"
  | "Overheating"
  | "Towing Required"
  | "Accident / Emergency"
  | "Lockout / Lost Key"
  | "Other";

export type Priority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type RequestStatus =
  | "NEW"
  | "SEARCHING"
  | "MECHANIC_ASSIGNED"
  | "MECHANIC_ACCEPTED"
  | "ON_THE_WAY"
  | "ARRIVED"
  | "SERVICE_STARTED"
  | "SERVICE_COMPLETED"
  | "PAYMENT_PENDING"
  | "PAID"
  | "RATED"
  | "CANCELLED"
  | "REJECTED";

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface ServiceItem {
  id: string;
  description: string;
  amount: number;
}

export interface Invoice {
  items: ServiceItem[];
  total: number;
  generatedAt: string;
}

export interface Payment {
  method: "UPI" | "Card" | "Net Banking";
  amount: number;
  paidAt: string;
  transactionId: string;
}

export interface Rating {
  overall: number;
  serviceQuality: number;
  punctuality: number;
  communication: number;
  review: string;
  ratedAt: string;
}

export interface ServiceRequest {
  requestId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  vehicle: Vehicle;
  issueType: IssueType;
  description: string;
  priority: Priority;
  notes?: string;
  location: GeoPoint;
  address: string;
  mechanicId?: string;
  attemptedMechanicIds?: string[];
  dispatchExpiresAt?: string;
  mechanicLocation?: GeoPoint;
  distanceKm?: number;
  etaMins?: number;
  status: RequestStatus;
  createdAt: string;
  acceptedAt?: string;
  arrivedAt?: string;
  serviceStartedAt?: string;
  completedAt?: string;
  paidAt?: string;
  ratedAt?: string;
  serviceItems: ServiceItem[];
  invoice?: Invoice;
  payment?: Payment;
  rating?: Rating;
  matchReason?: string[];
  movementPath?: GeoPoint[];
  currentPathIndex?: number;
}

export interface AppNotification {
  id: string;
  role: UserRole;
  message: string;
  requestId?: string;
  read: boolean;
  createdAt: string;
}
