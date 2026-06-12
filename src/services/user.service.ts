import { UserRole } from "enums/user-role";
import { StatusCodes } from "http-status-codes";
import {
  createUser,
  deleteUserById,
  getAllUsers,
  getUserById,
  updateUserById,
  userEmailExist,
} from "repository/userRepository";
import { ListQuery } from "types/pagination.type";
import { GetAllUsersParams, User } from "types/user.types";
import { defaultPassword } from "utils";

export const listAllUsersService = async (query: ListQuery<User>) => {
  const page = Number(query.page);
  const limit = Number(query.limit);
  const search = query.search;
  const sortBy = query.sortBy;
  const order = query.order;

  const dbResponse = await getAllUsers({
    page,
    limit,
    search,
    sortBy,
    order,
  });

  return dbResponse;
};

export const getUserByIdService = async (userId: number) => {
  const user = await getUserById(userId);
  return user;
};

export const createUserService = async (payload: {
  name: string;
  email: string;
  role?: UserRole;
}) => {
  const { name, email, role } = payload;

  // 1. Check if user exists
  const existingUser = await userEmailExist(email);
  if (existingUser) {
    return {
      success: false,
      statusCode: StatusCodes.CONFLICT,
      message: "User already exists with this email",
    };
  }

  // 2. Generate default password
  const hashedPassword = await defaultPassword();

  // 3. Create user
  const user = await createUser({
    name,
    email,
    password: hashedPassword,
    role: role || UserRole.LIBRARIAN,
  });

  return {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: "Registration complete, please login",
    data: user,
  };
};

export const updateUserService = async (userId: number, body: any) => {
  const existingUser = await getUserById(userId);

  if (!existingUser) {
    return {
      notFound: true,
    };
  }

  const payload = Object.fromEntries(
    Object.entries(body).filter(([_, v]) => v !== undefined),
  );

  const updatedUser = await updateUserById(payload, userId);

  return {
    notFound: false,
    data: updatedUser,
  };
};

export const deleteUserService = async (userId: number) => {
  const user = await getUserById(userId);

  if (!user || !user.is_active) {
    return {
      notFound: true,
    };
  }

  await deleteUserById(userId);

  return {
    notFound: false,
  };
};
