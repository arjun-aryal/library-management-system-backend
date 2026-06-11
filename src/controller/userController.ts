import { env } from "config/env";
import { UserRole } from "enums/user-role";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import {
  createUser,
  deleteUserById,
  getAllUsers,
  getUserById,
  updateUserById,
  userEmailExist,
} from "repository/user.service";
import { User } from "types/user.types";
import { errorResponse, hashPassword, successResponse } from "utils";

export const listAllUser = async (req: Request, res: Response) => {
  console.log("reqw");
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search as string | undefined;
    const sortBy = req.query.sortBy as keyof User;
    const order = req.query.order as string;

    const dbResponse = await getAllUsers({
      page,
      limit,
      search,
      sortBy,
      order,
    });
    return successResponse({
      res,
      statusCode: StatusCodes.OK,
      message: "Data retrived",
      data: dbResponse.data,
      pagination: dbResponse.meta,
    });
  } catch (error) {
    console.error(error);

    return errorResponse({
      res,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Failed to Retrive",
    });
  }
};

export const listUserById = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id);
    const dbResponse = await getUserById(userId);

    return successResponse({
      res,
      statusCode: StatusCodes.OK,
      message: "Data retrived",
      data: dbResponse,
    });
  } catch (error) {
    console.error(error);

    return errorResponse({
      res,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Failed to Retrive",
    });
  }
};

export const createNewUser = async (req: Request, res: Response) => {
  try {
    const { name, email, role } = req.body;
    const existingUser = await userEmailExist(email);

    if (existingUser) {
      return errorResponse({
        res,
        statusCode: StatusCodes.CONFLICT,
        message: "User Already Exist with this eamil",
      });
    }

    const hashedPassword = await hashPassword(env.DEFAULT_PASSWORD);

    const dbResponse = await createUser({
      name,
      email,
      password: hashedPassword,
      role: role || UserRole.AUTHOR,
    });
    return successResponse({
      res,
      statusCode: StatusCodes.CREATED,
      message: "Registraion complete, Please Login",
      data: dbResponse,
    });
  } catch (error) {
    console.error(error);

    return errorResponse({
      res,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Failed to Create User",
    });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id);
    const body = req.body;

    const existingUser = await getUserById(userId);
    if (!existingUser) {
      return errorResponse({
        res,
        statusCode: StatusCodes.NOT_FOUND,
        message: "User not found",
      });
    }
    const payload = Object.fromEntries(
      Object.entries(body).filter(([_, v]) => v !== undefined),
    );

    const dbResponse = await updateUserById(body, userId);
    return successResponse({
      res,
      statusCode: StatusCodes.OK,
      message: "User Updated",
      data: dbResponse,
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
    const user = await getUserById(userId);

    if (!user) {
      return errorResponse({
        res,
        statusCode: StatusCodes.NOT_FOUND,
        message: "User does not exist",
      });
    }

    const result = await deleteUserById(userId);

    return successResponse({
      res,
      statusCode: StatusCodes.OK,
      message: "User deleted successfully",
      data: result,
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
