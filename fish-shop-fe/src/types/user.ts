export type UserRole = "ADMIN" | "CUSTOMER";

export interface UserResponse {
  id: number;
  username: string;
  fullName: string;
  email: string;
  phone: string | null;
  address: string | null;
  role: string;
  provider: string;
  isActive: boolean;
  createdAt: string;
}

export interface UserRequest {
  username: string;
  password?: string;
  fullName: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  role?: UserRole;
  isActive?: boolean;
}
