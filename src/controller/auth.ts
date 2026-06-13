import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { loginService, registerService } from "services/auth.service";
import { errorResponse, successResponse } from "utils";

export const register = async (req: Request, res: Response) => {
  try {
    const body = req.body;

    const result = await registerService(body);

    if (result.conflict) {
      return errorResponse({
        res,
        statusCode: StatusCodes.CONFLICT,
        message: "User Already Exist",
      });
    }

    return successResponse({
      res,
      statusCode: StatusCodes.CREATED,
      message: "Registration complete, Please Login",
      data: result.data,
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
    const result = await loginService(email, password);

    if (result.unauthorized) {
      return errorResponse({
        res,
        statusCode: StatusCodes.UNAUTHORIZED,
        message: "Invalid email or password",
      });
    }

    return successResponse({
      res,
      statusCode: StatusCodes.OK,
      message: "Login Successful",
      data: result.data,
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
