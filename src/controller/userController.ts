import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import {
  createUserService,
  deleteUserService,
  getUserByIdService,
  listAllUsersService,
  updateUserService,
} from "services/user.service";
import { errorResponse, successResponse } from "utils";

export const listAllUser = async (req: Request, res: Response) => {
  try {
    const query = req.query;

    const result = await listAllUsersService(query);

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
      message: "Failed to retrieve users",
    });
  }
};

export const listUserById = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id);

    const user = await getUserByIdService(userId);

    if (!user) {
      return errorResponse({
        res,
        statusCode: StatusCodes.NOT_FOUND,
        message: "User not found",
      });
    }

    return successResponse({
      res,
      statusCode: StatusCodes.OK,
      message: "Data retrieved",
      data: user,
    });
  } catch (error) {
    console.error(error);

    return errorResponse({
      res,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Failed to retrieve user",
    });
  }
};

export const createNewUser = async (req: Request, res: Response) => {
  try {
    const result = await createUserService(req.body);

    if (!result.success) {
      return errorResponse({
        res,
        statusCode: result.statusCode,
        message: result.message,
      });
    }

    return successResponse({
      res,
      statusCode: result.statusCode,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    console.error(error);

    return errorResponse({
      res,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Failed to create user",
    });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id);

    const result = await updateUserService(userId, req.body);

    if (result.notFound) {
      return errorResponse({
        res,
        statusCode: StatusCodes.NOT_FOUND,
        message: "User not found",
      });
    }

    return successResponse({
      res,
      statusCode: StatusCodes.OK,
      message: "User Updated",
      data: result.data,
    });
  } catch (error) {
    console.error(error);
    return errorResponse({
      res,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Failed to Update User",
    });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id);

    const result = await deleteUserService(userId);

    if (result.notFound) {
      return errorResponse({
        res,
        statusCode: StatusCodes.NOT_FOUND,
        message: "User does not exist",
      });
    }

    return successResponse({
      res,
      statusCode: StatusCodes.OK,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return errorResponse({
      res,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Failed to delete user",
    });
  }
};
