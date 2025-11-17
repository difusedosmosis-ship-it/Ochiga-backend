import jwt from "jsonwebtoken";
import { APP_JWT_SECRET } from "../config/env";

export type APayload = {
  sub: string; // user id
  role: string;
  email?: string;
};

export function signToken(payload: APayload, expiresIn = "7d") {
  return jwt.sign(payload, APP_JWT_SECRET, { expiresIn });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, APP_JWT_SECRET) as APayload;
  } catch (err) {
    return null;
  }
}
