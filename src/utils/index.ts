import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import {
  ErrorResponseParams,
  SuccessResponseParams,
} from "../types/success-error.type";
import { env } from "../config/env";
import { JWTPayload } from "../types/auth.types";

export const successResponse = <T>({
  res,
  statusCode = StatusCodes.OK,
  message = "Success",
  data = null,
  pagination = null,
}: SuccessResponseParams) => {
  const responseObject = {
    success: true,
    message,
    data,
    ...(pagination && { pagination }),
  };

  return res.status(statusCode ?? StatusCodes.OK).json(responseObject);
};

export const errorResponse = ({
  res,
  statusCode = StatusCodes.INTERNAL_SERVER_ERROR,
  message = "Error",
  errors = null,
}: ErrorResponseParams) => {
  const responseObject = {
    success: false,
    message,
    errors,
  };
  return res.status(statusCode).json(responseObject);
};

export const hashPassword = async (password: string): Promise<string> => {
  const hashedPassword = await bcrypt.hash(password, 10);

  return hashedPassword;
};
export const comparePassword = async (
  enteredPassword: string,
  encryptedPassword: string,
): Promise<boolean> => {
  const isMatch = bcrypt.compare(enteredPassword, encryptedPassword);
  return isMatch;
};

export const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
};
