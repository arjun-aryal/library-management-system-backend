import { withTransaction } from "config/db";
import { UserRole } from "enums/user-role";
import { StatusCodes } from "http-status-codes";
import { PoolClient } from "pg";
import {
  createAuthor,
  createBulkAuthors,
  deleteAuthorById,
  getAllAuthor,
  getAuthorById,
  updateAuthorById,
} from "repository/authorRepository";
import {
  createBulkUsers,
  createUser,
  deleteUserById,
  getUsersByEmails,
  updateUserById,
  userEmailExist,
} from "repository/userRepository";
import { RegisterInput } from "types/auth.types";
import { Author, AuthorCsv, CreateAuthorInput } from "types/author.types";
import { ListQuery } from "types/pagination.type";
import { defaultPassword } from "utils";
import { generateCsv, parseCsv } from "utils/csvutils";

export const listAllAuthorsService = async (query: ListQuery<Author>) => {
  const page = Number(query.page);
  const limit = Number(query.limit);
  const search = query.search;
  const sortBy = query.sortBy;
  const order = query.order;

  const result = await getAllAuthor({
    page,
    limit,
    search,
    sortBy,
    order,
  });

  return result;
};

export const getAuthorByIdService = async (authorId: number) => {
  const author = await getAuthorById(authorId);
  return author;
};

export const createAuthorService = async (
  data: RegisterInput & CreateAuthorInput,
) => {
  return withTransaction(async (client) => {
    const existingUser = await userEmailExist(data.email);

    if (existingUser) {
      const err: any = new Error("Email already exists");
      err.statusCode = StatusCodes.CONFLICT;
      throw err;
    }

    const hashedPassword = await defaultPassword();

    const user = await createUser(
      {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: UserRole.AUTHOR,
      },
      client,
    );

    const author = await createAuthor(
      {
        user_id: user.id,
        bio: data.bio,
        nationality: data.nationality,
      },
      client,
    );

    return {
      id: author.id,
      user_id: author.user_id,
      name: user.name,
      bio: author.bio,
      nationality: author.nationality,
      created_at: author.created_at,
      updated_at: author.updated_at,
    };
  });
};

export const updateAuthorService = async (authorId: number, body: any) => {
  return withTransaction(async (client) => {
    const existingAuthor = await getAuthorById(authorId, client);

    if (!existingAuthor) {
      return { notFound: true };
    }

    const { name, ...authorFields } = body;

    const userPayload = Object.fromEntries(
      Object.entries({ name }).filter(([_, v]) => v !== undefined),
    );

    const authorPayload = Object.fromEntries(
      Object.entries(authorFields).filter(([_, v]) => v !== undefined),
    );

    let updatedUser = null;
    let updatedAuthor = null;

    if (Object.keys(userPayload).length > 0) {
      updatedUser = await updateUserById(
        userPayload,
        existingAuthor.user_id,
        client,
      );
    }

    if (Object.keys(authorPayload).length > 0) {
      updatedAuthor = await updateAuthorById(authorPayload, authorId, client);
    }

    const user = updatedUser ?? {
      name: existingAuthor.name,
    };

    const author = updatedAuthor ?? existingAuthor;

    return {
      notFound: false,
      data: {
        id: author.id,
        user_id: author.user_id,
        name: user.name,
        email: user.email,
        bio: author.bio,
        nationality: author.nationality,
        created_at: author.created_at,
        updated_at: author.updated_at,
      },
    };
  });
};

export const deleteAuthorService = async (authorId: number) => {
  return withTransaction(async (client) => {
    const existingAuthor = await getAuthorById(authorId, client);

    if (!existingAuthor) {
      return { notFound: true };
    }

    const deletedAuthor = await deleteAuthorById(authorId, client);

    await deleteUserById(existingAuthor.user_id);

    return {
      notFound: false,
      data: {
        id: deletedAuthor.id,
        user_id: deletedAuthor.user_id,
      },
    };
  });
};
export const importAuthorsService = async (file?: Express.Multer.File) => {
  if (!file) {
    throw new Error("CSV file is required");
  }

  const authors = await parseCsv<AuthorCsv>(file.buffer);

  return withTransaction(async (client) => {
    const emails = authors.map((a) => a.email);

    const existingUsers = await getUsersByEmails(emails, client);
    const existingEmails = new Set(existingUsers.map((u) => u.email));

    const newAuthors = authors.filter((a) => !existingEmails.has(a.email));

    const hashedPassword = await defaultPassword();

    const usersToCreate: RegisterInput[] = newAuthors.map((a) => ({
      name: a.name,
      email: a.email,
      password: hashedPassword,
      role: UserRole.AUTHOR,
    }));

    const createdUsers = await createBulkUsers(usersToCreate, client);

    const authorsToCreate: CreateAuthorInput[] = createdUsers.map(
      (user, index) => ({
        user_id: user.id,
        bio: newAuthors[index].bio,
        nationality: newAuthors[index].nationality,
      }),
    );

    await createBulkAuthors(authorsToCreate, client);

    return {
      imported: createdUsers.length,
      skipped: authors.length - newAuthors.length,
    };
  });
};

export const exportAuthorsService = async () => {
  const authors = await getAllAuthor({});
  return generateCsv(authors.data);
};
