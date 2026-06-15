import { withTransaction } from "config/db";
import { UserRole } from "enums/user-role";
import { createAuthor, getAuthorByUserId } from "repository/authorRepository";
import { createUser, userEmailExist } from "repository/userRepository";
import { RegisterInput } from "types/auth.types";
import { CreateAuthorInput } from "types/author.types";
import { comparePassword, generateToken, hashPassword } from "utils";

export const registerService = async (
  input: RegisterInput & Partial<CreateAuthorInput>,
) => {
  return withTransaction(async (client) => {
    const existingUser = await userEmailExist(input.email, client);

    if (existingUser) {
      return {
        conflict: true,
        data: null,
      };
    }

    const hashedPassword = await hashPassword(input.password);

    const user = await createUser(
      {
        name: input.name,
        email: input.email,
        password: hashedPassword,
        role: input.role || UserRole.LIBRARIAN,
      },
      client,
    );

    if (user.role === UserRole.AUTHOR) {
      await createAuthor(
        {
          user_id: user.id,
          bio: input.bio ?? "",
          nationality: input.nationality ?? "",
        },
        client,
      );
    }

    return {
      conflict: false,
      data: user,
    };
  });
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
