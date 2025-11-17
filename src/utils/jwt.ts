import * as jwt from "jsonwebtoken";
import { APP_JWT_SECRET } from "../config/env";

export type APayload = {
  sub: string; // user id
  role: string;
  email?: string;
};

export function signToken(payload: APayload, expiresIn: string | number = "7d") {
  if (!APP_JWT_SECRET) {
    throw new Error("APP_JWT_SECRET is not defined");
  }

  return jwt.sign(payload, APP_JWT_SECRET as string, {
    expiresIn,
  });
}

export function verifyToken(token: string) {
  try {
    if (!APP_JWT_SECRET) return null;

    return jwt.verify(token, APP_JWT_SECRET as string) as APayload;
  } catch {
    return null;
  }
}
