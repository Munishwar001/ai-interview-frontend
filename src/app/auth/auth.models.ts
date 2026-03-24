import { UserRole } from "../shared/enums/UserRole ";

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}