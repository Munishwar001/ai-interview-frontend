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

export interface AuthResponse {
    email: string;
    accessToken: string;
    refreshToken: string;
    accessTokenExpiration: string;
}

export interface RefreshRequest {
    accessToken: string;
    refreshToken: string;
}

export interface LocalStorage {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiration: string;
  selectedSubOrg?: number;
}

export interface AccessTokenData {
    accessToken: string;
    accessTokenExpiration: string;
}
