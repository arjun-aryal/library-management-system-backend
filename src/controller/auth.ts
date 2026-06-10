import { UserRole } from "enums/user-role";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { createUser, userEmailExist } from "repository/user.service";
import {
  comparePassword,
  errorResponse,
  generateToken,
  hashPassword,
  successResponse,
} from "utils";

export const register = async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;
  try {
    const existingUser = await userEmailExist(email);
    if (existingUser) {
      return errorResponse({
        res,
        statusCode: StatusCodes.CONFLICT,
        message: "User Already Exist",
      });
    }

    const hashedPassword = await hashPassword(password);
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
      message: "Failed to Register",
    });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const dbResponse = await userEmailExist(email);
    if (!dbResponse) {
      return errorResponse({
        res,
        statusCode: StatusCodes.UNAUTHORIZED,
        message: "Invalid email or password",
      });
    }
    const { password: hashedPassword, ...user } = dbResponse;
    const isMatch = await comparePassword(password, hashedPassword);
    if (!isMatch) {
      return errorResponse({
        res,
        statusCode: StatusCodes.UNAUTHORIZED,
        message: "Invalid email or password",
      });
    }

    const token = generateToken({
      userId: Number(user.id),
      name: user.name,
      role: user.role,
    });
    return successResponse({
      res,
      statusCode: StatusCodes.OK,
      message: "Login Successful",
      data: { token, user },
    });
  } catch (error) {
    console.error(error);
    return errorResponse({
      res,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Failed to Login",
    });
  }
};
