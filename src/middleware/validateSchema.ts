import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { errorResponse } from "../utils/index.js";
import { ZodType, ZodError } from "zod";

const validate =
  (schema: ZodType) => (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const errors = err.issues.map((issue) => ({
          path: issue.path.slice(1).join("."),
          message: issue.message,
        }));

        console.error("Validation Error:", errors);

        return errorResponse({
          res,
          statusCode: StatusCodes.BAD_REQUEST,
          message: "Validation error",
          errors: errors,
        });
      }

      console.error("Unexpected error during validation:", err);

      return errorResponse({
        res,
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Internal server error",
        errors: null,
      });
    }
  };

export default validate;
