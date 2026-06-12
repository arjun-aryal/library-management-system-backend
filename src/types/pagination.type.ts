export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalRecords: number;
  totalPages?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface PaginationOptions extends PaginationQuery {
  startIndex: number;
  paginate?: boolean;
}

export interface PaginationResult {
  clause: string;
  params: number[];
}

export interface ListQuery<T = unknown> extends PaginationQuery {
  search?: string;
  sortBy?: keyof T;
  order?: "asc" | "desc";
}
