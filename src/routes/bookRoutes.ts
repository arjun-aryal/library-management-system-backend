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

const router = express.Router({ mergeParams: true });

// router.use(authenticationMiddleware);

router
  .route("/")
  .get(validate(getBooksSchema), listAllBooksForAuthor)
  .post(validate(createBookSchema), createBook);

router
  .route("/:id")
  .get(validate(getBookByIdSchema), listBookForAuthorById)
  .patch(validate(updateBookSchema), updateBook)
  .delete(validate(deleteBookSchema), deleteBook);

export default router;
