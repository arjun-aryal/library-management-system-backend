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
import checkPermissionMiddleware from "middleware/checkPermissionMiddleware";
import { UserRole } from "enums/user-role";

const router = express.Router();

router.use(authenticationMiddleware);

router
  .route("/")
  .get(
    validate(getUsersSchema),
    checkPermissionMiddleware([UserRole.SUPER_ADMIN]),
    listAllUser,
  )
  .post(
    validate(createUserSchema),
    checkPermissionMiddleware([UserRole.SUPER_ADMIN]),
    createNewUser,
  );

router
  .route("/:id")
  .get(
    authenticationMiddleware,
    validate(getUserByIdSchema),
    checkPermissionMiddleware([UserRole.SUPER_ADMIN]),
    listUserById,
  )
  .patch(
    validate(updateUserSchema),
    checkPermissionMiddleware([UserRole.SUPER_ADMIN]),
    updateUser,
  )
  .delete(
    validate(deleteUserSchema),
    checkPermissionMiddleware([UserRole.SUPER_ADMIN]),
    deleteUser,
  );

export default router;
