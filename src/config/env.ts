import dotenv from "dotenv";
import { SignOptions } from "jsonwebtoken";

dotenv.config();

export const env = {
  DATABASE_URL: process.env.DATABASE_URL as string,

  PORT: process.env.PORT,
  JWT_SECRET: process.env.JWT_SECRET as string,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
  DEFAULT_PASSWORD: process.env.DEFAULT_PASSWORD as string,
};
