import express from "express";
import { register, login } from "controller/auth";
import validate from "middleware/validateSchema";
import { loginSchema, registrationSchema } from "schema/auth.schema";

const router = express.Router();

router.route("/register").post(validate(registrationSchema), register);
router.route("/login").post(validate(loginSchema), login);

export default router;
