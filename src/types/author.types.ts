import { ListQuery } from "./pagination.type";

export interface Author {
  id: string;
  user_id: string;
  name: string;
  bio: string;
  nationality: string;
  created_at: Date;
  updated_at: Date;
}

export interface GetAllAuthorParams extends ListQuery<Author> {
  role?: string;
}
export type UpdateAuthor = Partial<Pick<Author, "bio" | "nationality">>;

export type AuthorCsv = Pick<Author, "name" | "bio" | "nationality"> & {
  email: string;
};
export type CreateAuthorInput = Pick<Author, "user_id" | "bio" | "nationality">;

export type AuthorResponse = {
  id: string;
  user_id: string;
  name: string;
  bio: string;
  nationality: string;
  created_at: Date;
  updated_at: Date;
};
