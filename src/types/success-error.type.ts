import { Response } from "express";
import { PaginationMeta } from "./pagination.type";

export interface SuccessResponseParams<T = unknown> {
  res: Response;
  statusCode?: number;
  message?: string;
  data?: T;
  pagination?: PaginationMeta | null;
}

export interface ErrorResponseParams {
  res: Response;
  statusCode?: number;
  message?: string;
  errors?: unknown;
}
