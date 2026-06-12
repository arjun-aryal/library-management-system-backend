import { StatusCodes } from "http-status-codes";
import { errorResponse } from "../utils/index.js";
import { NextFunction, Request, Response } from "express";
import { UserRole } from "enums/user-role.js";

const checkPermissionMiddleware = (
  requiredPermission: UserRole | UserRole[],
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.userInfo.role;

    const allowed = Array.isArray(requiredPermission)
      ? requiredPermission.includes(userRole)
      : userRole === requiredPermission;

    if (!allowed) {
      return errorResponse({
        res,
        statusCode: StatusCodes.FORBIDDEN,
        message: "Forbidden: insufficient permissions",
      });
    }

    next();
  };
};

export default checkPermissionMiddleware;
