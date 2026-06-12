import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import {
  createAuthorService,
  deleteAuthorService,
  exportAuthorsService,
  getAuthorByIdService,
  importAuthorsService,
  listAllAuthorsService,
  updateAuthorService,
} from "services/author.service";
import { errorResponse, successResponse } from "utils";

export const listAllAuthor = async (req: Request, res: Response) => {
  try {
    const result = await listAllAuthorsService(req.query);

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
      message: "Failed to retrieve authors",
    });
  }
};

export const listAuthorById = async (req: Request, res: Response) => {
  try {
    const authorId = Number(req.params.id);

    const dbResponse = await getAuthorByIdService(authorId);

    if (!dbResponse) {
      return errorResponse({
        res,
        statusCode: StatusCodes.NOT_FOUND,
        message: "Author not found",
      });
    }

    return successResponse({
      res,
      statusCode: StatusCodes.OK,
      message: "Data retrieved",
      data: dbResponse,
    });
  } catch (error) {
    console.error(error);

    return errorResponse({
      res,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Failed to retrieve",
    });
  }
};

export const createAuthor = async (req: Request, res: Response) => {
  try {
    const dbResponse = await createAuthorService(req.body);
    return successResponse({
      res,
      statusCode: StatusCodes.OK,
      message: "Data retrived",
      data: dbResponse,
    });
  } catch (error: any) {
    console.error(error);

    return errorResponse({
      res,
      statusCode: error?.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
      message: error?.message || "Failed to create Author",
    });
  }
};

export const updateAuthor = async (req: Request, res: Response) => {
  try {
    const authorId = Number(req.params.id);

    const result = await updateAuthorService(authorId, req.body);

    if (result.notFound) {
      return errorResponse({
        res,
        statusCode: StatusCodes.NOT_FOUND,
        message: "Author not found",
      });
    }

    return successResponse({
      res,
      statusCode: StatusCodes.OK,
      message: "Author updated successfully",
      data: result.data,
    });
  } catch (error) {
    console.error("updateAuthorController error:", error);

    return errorResponse({
      res,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Failed to update author",
    });
  }
};

export const deleteAuthor = async (req: Request, res: Response) => {
  try {
    const authorId = Number(req.params.id);

    const result = await deleteAuthorService(authorId);

    if (result.notFound) {
      return errorResponse({
        res,
        statusCode: StatusCodes.NOT_FOUND,
        message: "Author not found",
      });
    }

    return successResponse({
      res,
      statusCode: StatusCodes.OK,
      message: "Author deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return errorResponse({
      res,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Failed to delete author",
    });
  }
};

export const importAuthor = async (req: Request, res: Response) => {
  try {
    const file = req.file;

    const result = await importAuthorsService(file);

    return successResponse({
      res,
      statusCode: StatusCodes.CREATED,
      message: "Authors imported successfully",
      data: result,
    });
  } catch (error) {
    console.error(error);

    return errorResponse({
      res,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Failed to import authors",
    });
  }
};

export const exportAuthor = async (req: Request, res: Response) => {
  try {
    const csv = await exportAuthorsService();

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="authors.csv"');

    return res.send(csv);
  } catch (error) {
    console.error(error);

    return errorResponse({
      res,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Failed to export authors",
    });
  }
};
