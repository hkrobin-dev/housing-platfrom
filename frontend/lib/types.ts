export type Role = "ADMIN" | "OWNER" | "MANAGER" | "TENANT";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string | null;
  avatarUrl?: string | null;
  isVerified?: boolean;
  isBanned?: boolean;
  createdAt?: string;
}

export interface Property {
  id: string;
  ownerId: string;
  managerId?: string | null;
  title: string;
  description?: string | null;
  address: string;
  city?: string | null;
  type: "APARTMENT" | "HOUSE" | "HOSTEL" | "STUDIO";
  status: "ACTIVE" | "INACTIVE";
  images: string[];
  amenities: string[];
  rooms?: Room[];
  createdAt?: string;
}

export interface Availability {
  id: string;
  roomId: string;
  availableFrom: string;
  availableTo?: string | null;
  seatsLeft: number;
}

export interface Room {
  id: string;
  propertyId: string;
  roomNo: string;
  rentAmount: number | string;
  capacity: number;
  roomType: "SINGLE" | "SHARED";
  status: "AVAILABLE" | "RESERVED" | "OCCUPIED" | "MAINTENANCE";
  availability?: Availability[];
  property?: Property;
}

export interface RoommateProfile {
  id: string;
  userId: string;
  budgetMin: number;
  budgetMax: number;
  gender?: string | null;
  occupation?: string | null;
  lifestyleTags: string[];
  preferredLocation?: string | null;
  moveInDate?: string | null;
  bio?: string | null;
}

export interface ViewingRequest {
  id: string;
  tenantId: string;
  propertyId: string;
  roomId: string;
  requestedDate: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED";
  room?: Room;
  property?: Property;
  tenant?: User;
}

export interface Application {
  id: string;
  tenantId: string;
  roomId: string;
  status: "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";
  message?: string | null;
  appliedAt: string;
  room?: Room;
  tenant?: User;
  lease?: Lease | null;
}

export interface Lease {
  id: string;
  tenantId: string;
  roomId: string;
  startDate: string;
  endDate?: string | null;
  rentAmount: number | string;
  depositAmount: number | string;
  status: "ACTIVE" | "ENDED" | "TERMINATED";
  room?: Room;
  tenant?: User;
  rentPayments?: RentPayment[];
}

export interface RentPayment {
  id: string;
  leaseId: string;
  month: string;
  amount: number | string;
  dueDate: string;
  status: "PENDING" | "PAID" | "OVERDUE";
}

export interface UtilityBill {
  id: string;
  propertyId: string;
  billType: "ELECTRICITY" | "WATER" | "GAS" | "INTERNET" | "OTHER";
  totalAmount: number | string;
  month: string;
  splits?: UtilityBillSplit[];
  property?: { title: string; address: string };
}

export interface UtilityBillSplit {
  id: string;
  utilityBillId: string;
  tenantId: string;
  shareAmount: number | string;
  status: "PENDING" | "PAID";
  utilityBill?: UtilityBill;
}

export interface MaintenanceRequest {
  id: string;
  tenantId: string;
  roomId: string;
  title: string;
  description: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  room?: Room;
  tenant?: User;
}

export interface DocumentItem {
  id: string;
  userId: string;
  type: "NID" | "LEASE_AGREEMENT" | "OTHER";
  fileUrl: string;
  fileName?: string | null;
  createdAt: string;
}

export interface Notification {
  id: string;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: unknown[];
}
