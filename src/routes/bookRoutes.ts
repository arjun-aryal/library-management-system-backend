import express from "express";

import validate from "../middleware/validateSchema";
import authenticationMiddleware from "../middleware/authentication";

import {
  createBookSchema,
  getBooksSchema,
  getBookByIdSchema,
  updateBookSchema,
  deleteBookSchema,
} from "../schema/book.schema";

import {
  createBook,
  listAllBooksForAuthor,
  listBookForAuthorById,
  updateBook,
  deleteBook,
} from "../controller/bookController";
import { UserRole } from "enums/user-role";
import checkPermissionMiddleware from "middleware/checkPermissionMiddleware";

const router = express.Router({ mergeParams: true });

router.use(authenticationMiddleware);

router
  .route("/")
  .get(
    validate(getBooksSchema),
    checkPermissionMiddleware([
      UserRole.AUTHOR,
      UserRole.LIBRARIAN,
      UserRole.SUPER_ADMIN,
    ]),
    listAllBooksForAuthor,
  )
  .post(
    validate(createBookSchema),
    checkPermissionMiddleware([UserRole.AUTHOR]),
    createBook,
  );

router
  .route("/:id")
  .get(
    validate(getBookByIdSchema),
    checkPermissionMiddleware([
      UserRole.AUTHOR,
      UserRole.LIBRARIAN,
      UserRole.SUPER_ADMIN,
    ]),
    listBookForAuthorById,
  )
  .patch(
    validate(updateBookSchema),
    checkPermissionMiddleware([UserRole.AUTHOR]),
    updateBook,
  )
  .delete(
    validate(deleteBookSchema),
    checkPermissionMiddleware([UserRole.AUTHOR]),
    deleteBook,
  );

export default router;
