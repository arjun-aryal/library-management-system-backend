import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { loginService, registerService } from "services/auth.service";
import { errorResponse, successResponse } from "utils";

// export const register = async (req: Request, res: Response) => {
//   const { name, email, password, role } = req.body;
//   try {
//     const existingUser = await userEmailExist(email);
//     if (existingUser) {
//       return errorResponse({
//         res,
//         statusCode: StatusCodes.CONFLICT,
//         message: "User Already Exist",
//       });
//     }

//     const hashedPassword = await hashPassword(password);
//     const dbResponse = await createUser({
//       name,
//       email,
//       password: hashedPassword,
//       role: role || UserRole.AUTHOR,
//     });
//     return successResponse({
//       res,
//       statusCode: StatusCodes.CREATED,
//       message: "Registraion complete, Please Login",
//       data: dbResponse,
//     });
//   } catch (error) {
//     console.error(error);
//     return errorResponse({
//       res,
//       statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
//       message: "Failed to Register",
//     });
//   }
// };

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

// export const login = async (req: Request, res: Response) => {
//   const { email, password } = req.body;
//   try {
//     const dbResponse = await userEmailExist(email);
//     if (!dbResponse) {
//       return errorResponse({
//         res,
//         statusCode: StatusCodes.UNAUTHORIZED,
//         message: "Invalid email or password",
//       });
//     }
//     const { password: hashedPassword, ...user } = dbResponse;
//     const isMatch = await comparePassword(password, hashedPassword);
//     if (!isMatch) {
//       return errorResponse({
//         res,
//         statusCode: StatusCodes.UNAUTHORIZED,
//         message: "Invalid email or password",
//       });
//     }

//     const token = generateToken({
//       userId: Number(user.id),
//       name: user.name,
//       role: user.role,
//     });
//     return successResponse({
//       res,
//       statusCode: StatusCodes.OK,
//       message: "Login Successful",
//       data: { token, user },
//     });
//   } catch (error) {
//     console.error(error);
//     return errorResponse({
//       res,
//       statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
//       message: "Failed to Login",
//     });
//   }
// };

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
