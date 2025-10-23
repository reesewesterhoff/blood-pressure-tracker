import { Request } from "express";
import { IUser } from "./user";

// Extend Express Request to include our User type
declare global {
  namespace Express {
    interface User extends IUser {}
  }
}

// Request types with user
export interface AuthenticatedRequest extends Request {
  user?: IUser;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
