import { PaginationOptions, PaginationResult } from "types/pagination.type";

export const buildPagination = ({
  page = 1,
  limit = 10,
  startIndex,
  paginate = true,
}: PaginationOptions): PaginationResult => {
  if (!paginate) {
    return {
      clause: "",
      params: [],
    };
  }

  const offset = (page - 1) * limit;

  return {
    clause: `LIMIT $${startIndex + 1} OFFSET $${startIndex + 2}`,
    params: [limit, offset],
  };
};
