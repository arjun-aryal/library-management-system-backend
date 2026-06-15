import express from "express";

import validate from "../middleware/validateSchema";
import authenticationMiddleware from "../middleware/authentication";
import bookRoutes from "./bookRoutes";

import {
  createAuthorSchema,
  getAuthorsSchema,
  getAuthorByIdSchema,
  updateAuthorSchema,
  deleteAuthorSchema,
} from "../schema/author.schema";

import {
  createAuthor,
  listAllAuthor,
  listAuthorById,
  updateAuthor,
  deleteAuthor,
  exportAuthor,
  importAuthor,
} from "../controller/authorController";
import { uploadCsvFile } from "config/multer";
import checkPermissionMiddleware from "middleware/checkPermissionMiddleware";
import { UserRole } from "enums/user-role";

const router = express.Router();

router.use(authenticationMiddleware);
router.use("/:authorId/books", bookRoutes);

router
  .route("/")
  .get(
    validate(getAuthorsSchema),
    checkPermissionMiddleware([UserRole.LIBRARIAN, UserRole.SUPER_ADMIN]),
    listAllAuthor,
  )
  .post(
    validate(createAuthorSchema),
    checkPermissionMiddleware([UserRole.LIBRARIAN]),
    createAuthor,
  );

router
  .route("/import")
  .post(
    uploadCsvFile.single("file"),
    checkPermissionMiddleware([UserRole.LIBRARIAN]),
    importAuthor,
  );
router
  .route("/export")
  .get(checkPermissionMiddleware([UserRole.LIBRARIAN]), exportAuthor);

router
  .route("/:id")
  .get(
    validate(getAuthorByIdSchema),
    checkPermissionMiddleware([
      UserRole.SUPER_ADMIN,
      UserRole.LIBRARIAN,
      UserRole.AUTHOR,
    ]),
    listAuthorById,
  )
  .patch(
    validate(updateAuthorSchema),
    checkPermissionMiddleware([UserRole.LIBRARIAN]),
    updateAuthor,
  )
  .delete(
    validate(deleteAuthorSchema),
    checkPermissionMiddleware([UserRole.LIBRARIAN]),
    deleteAuthor,
  );

export default router;
