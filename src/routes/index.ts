import express from "express";
import authRoutes from "./authRoutes";
import userRoutes from "./userRoutes";
import authorRoutes from "./authorRoutes";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/authors", authorRoutes);

export default router;
