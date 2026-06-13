import { StatusCodes } from "http-status-codes";
import {
  createBook,
  deleteBookById,
  getAllBooksforAuthor,
  getBookforAuthorById,
  updateBookById,
} from "repository/bookRepository";
import { Book, CreateBookInput, UpdateBookInput } from "types/book.types";
import { ListQuery } from "types/pagination.type";

export const listAllBooksService = async (
  author_id: number,
  query: ListQuery<Book>,
) => {
  const page = Number(query.page);
  const limit = Number(query.limit);
  const search = query.search;
  const sortBy = query.sortBy;
  const order = query.order;

  const result = await getAllBooksforAuthor({
    author_id,
    page,
    limit,
    search,
    sortBy,
    order,
  });

  return result;
};

export const getBookByIdService = async (
  authorId: number,
  bookId: number,
) => {
  const book = await getBookforAuthorById(authorId, bookId);

  if (!book) {
    const err: any = new Error("Book not found");
    err.statusCode = StatusCodes.NOT_FOUND;
    throw err;
  }

  return book;
};

export const createBookService = async (data: CreateBookInput) => {
  const book = await createBook(data);

  return {
    id: book.id,
    author_id: book.author_id,
    title: book.title,
    isbn: book.isbn,
    published_year: book.published_year,
    created_at: book.created_at,
    updated_at: book.updated_at,
  };
};

export const updateBookService = async (
  authorId: number,
  bookId: number,
  body: UpdateBookInput,
) => {
  const existingBook = await getBookforAuthorById(authorId, bookId);

  if (!existingBook) {
    return { notFound: true };
  }

  const payload = Object.fromEntries(
    Object.entries(body).filter(([_, value]) => value !== undefined),
  );

  const updatedBook =
    Object.keys(payload).length > 0
      ? await updateBookById(payload, bookId)
      : existingBook;

  return {
    notFound: false,
    data: updatedBook,
  };
};

export const deleteBookService = async (authorId: number, bookId: number) => {
  const existingBook = await getBookforAuthorById(authorId, bookId);

  if (!existingBook) {
    return { notFound: true };
  }

  await deleteBookById(bookId);

  return {
    notFound: false,
  };
};
