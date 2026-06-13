import { ListQuery } from "./pagination.type";

export interface Book {
  id: number;
  title: string;
  isbn: string;
  published_year: number;
  author_id: string;
  created_at: Date;
  updated_at: Date;
}
export interface GetAllBookParams extends ListQuery<Book> {
  author_id: number;
}
export interface CreateBookInput {
  title: string;
  isbn: string;
  published_year: number;
  author_id: number;
}

export type UpdateBookInput = Partial<
  Pick<Book, "title" | "isbn" | "published_year">
>;
