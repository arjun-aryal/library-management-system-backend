import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import { env } from "../config/env.js";
import { JWTPayload, UserInfo } from "../types/auth.types.js";
import { errorResponse } from "../utils/index.js";
// import { getUserRole } from "../services/user.service.js"; 


const extractToken = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.split(" ")[1];
};

const decodeToken = (token: string): UserInfo => {
  const decoded = jwt.verify(token, env.JWT_SECRET) as JWTPayload;

  return {
    userId: Number(decoded.userId),
    name: decoded.name,
  };
};

const authenticationMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = extractToken(req);
  if (!token) {
    return errorResponse({
      res,
      statusCode: StatusCodes.UNAUTHORIZED,
      message: "Authentication Invalid",
    });
  }

  try {
    const userInfo = decodeToken(token);
    // const userRole = await getUserRole(userInfo.userId);

    req.userInfo = {
      ...userInfo,
      // role: userRole,
    };

    next();
  } catch (error) {
    return errorResponse({
      res,
      statusCode: StatusCodes.UNAUTHORIZED,
      message: "Authentication Invalid",
    });
  }
};

export default authenticationMiddleware;
