import { UserRole } from "../shared/enums/UserRole ";

export interface UserResponse {
    email: string;
    fullName: string;
    userRole: string;
}

export interface UserState {
    email: string;
    fullName: string;
    userRole: UserRole | null; 
    isEmployerAccess: boolean;
    isJobSeekerAccess: boolean;
    loaded:boolean
}

export enum ErrorCategory {
    LOGIN_401 = 'LOGIN_401',
    TOKEN_REFRESH_401 = 'TOKEN_REFRESH_401',
    USER_DETAILS_401 = 'USER_DETAILS_401',
}