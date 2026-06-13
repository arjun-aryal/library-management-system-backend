import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import {
  createBookService,
  deleteBookService,
  getBookByIdService,
  listAllBooksService,
  updateBookService,
} from "services/book.service";
import { errorResponse, successResponse } from "utils";

export const listAllBooksForAuthor = async (req: Request, res: Response) => {
  try {
    const { authorId } = req.params;

    const result = await listAllBooksService(Number(authorId), req.query);

    return successResponse({
      res,
      statusCode: StatusCodes.OK,
      message: "Data retrieved",
      data: result.data,
      pagination: result.meta,
    });
  } catch (error) {
    console.error(error);

    return errorResponse({
      res,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Failed to retrieve books",
    });
  }
};

export const listBookForAuthorById = async (req: Request, res: Response) => {
  try {
    const result = await getBookByIdService(
      Number(req.params.authorId),
      Number(req.params.id),
    );

    return successResponse({
      res,
      statusCode: StatusCodes.OK,
      message: "Data retrieved",
      data: result,
    });
  } catch (error: any) {
    console.error(error);

    return errorResponse({
      res,
      statusCode: error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
      message: error.message || "Failed to retrieve book",
      errors: error,
    });
  }
};

export const createBook = async (req: Request, res: Response) => {
  const authorId = Number(req.params.authorId);

  try {
    const result = await createBookService({
      author_id: authorId,
      title: req.body.title,
      isbn: req.body.isbn,
      published_year: req.body.published_year,
    });

    return successResponse({
      res,
      statusCode: StatusCodes.CREATED,
      message: "Book created successfully",
      data: result,
    });
  } catch (error) {
    console.error(error);

    return errorResponse({
      res,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Failed to create book",
    });
  }
};
export const updateBook = async (req: Request, res: Response) => {
  try {
    const result = await updateBookService(
      Number(req.params.authorId),
      Number(req.params.id),
      req.body,
    );

    if (result.notFound) {
      return errorResponse({
        res,
        statusCode: StatusCodes.NOT_FOUND,
        message: "Book not found",
      });
    }

    return successResponse({
      res,
      statusCode: StatusCodes.OK,
      message: "Book updated successfully",
      data: result.data,
    });
  } catch (error) {
    console.error(error);

    return errorResponse({
      res,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Failed to update book",
    });
  }
};

export const deleteBook = async (req: Request, res: Response) => {
  try {
    const result = await deleteBookService(
      Number(req.params.authorId),
      Number(req.params.id),
    );

    if (result.notFound) {
      return errorResponse({
        res,
        statusCode: StatusCodes.NOT_FOUND,
        message: "Book not found",
      });
    }

    return successResponse({
      res,
      statusCode: StatusCodes.OK,
      message: "Book deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return errorResponse({
      res,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Failed to delete book",
      errors: error,
    });
  }
};
