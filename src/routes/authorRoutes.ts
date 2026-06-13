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

const router = express.Router();

// router.use(authenticationMiddleware);
router.use("/:authorId/books", bookRoutes);

router
  .route("/")
  .get(validate(getAuthorsSchema), listAllAuthor)
  .post(validate(createAuthorSchema), createAuthor);

router.route("/import").post(uploadCsvFile.single("file"), importAuthor);
router.route("/export").get(exportAuthor);

router
  .route("/:id")
  .get(validate(getAuthorByIdSchema), listAuthorById)
  .patch(validate(updateAuthorSchema), updateAuthor)
  .delete(validate(deleteAuthorSchema), deleteAuthor);

export default router;
