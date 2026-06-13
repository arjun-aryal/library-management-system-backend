import { UserRole } from "enums/user-role";
import { getAuthorByUserId } from "repository/authorRepository";
import { createUser, userEmailExist } from "repository/userRepository";
import { RegisterInput } from "types/auth.types";
import { comparePassword, generateToken, hashPassword } from "utils";

export const registerService = async (input: RegisterInput) => {
  const { name, email, password, role } = input;

  const existingUser = await userEmailExist(email);

  if (existingUser) {
    return {
      conflict: true,
    };
  }

  const hashedPassword = await hashPassword(password);

  const dbResponse = await createUser({
    name,
    email,
    password: hashedPassword,
    role: role || UserRole.LIBRARIAN,
  });

  return {
    conflict: false,
    data: dbResponse,
  };
};

export const loginService = async (email: string, password: string) => {
  const dbUser = await userEmailExist(email);

  if (!dbUser) {
    return {
      unauthorized: true,
    };
  }

  const { password: hashedPassword, ...user } = dbUser;

  const isMatch = await comparePassword(password, hashedPassword);

  if (!isMatch) {
    return {
      unauthorized: true,
    };
  }

  let authorId: number | null = null;

  if (user.role === "author") {
    const author = await getAuthorByUserId(Number(user.id));

    authorId = author?.id ?? null;
  }

  const token = generateToken({
    userId: Number(user.id),
    name: user.name,
    role: user.role,
  });

  return {
    unauthorized: false,
    data: {
      token,
      user: {
        ...user,
        authorId,
      },
    },
  };
};
