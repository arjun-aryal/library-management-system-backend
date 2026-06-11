import express from "express";

import validate from "../middleware/validateSchema";

import {
  createUserSchema,
  getUsersSchema,
  getUserByIdSchema,
  updateUserSchema,
  deleteUserSchema,
} from "../schema/user.schema";

import {
  createNewUser,
  listAllUser,
  listUserById,
  updateUser,
  deleteUser,
} from "controller/userController";
import authenticationMiddleware from "middleware/authentication";

const router = express.Router();

router.use(authenticationMiddleware);

router
  .route("/")
  .get(validate(getUsersSchema), listAllUser)
  .post(validate(createUserSchema), createNewUser);

router
  .route("/:id")
  .get(authenticationMiddleware, validate(getUserByIdSchema), listUserById)
  .patch(validate(updateUserSchema), updateUser)
  .delete(validate(deleteUserSchema), deleteUser);

export default router;
