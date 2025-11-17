import jwt, { SignOptions } from "jsonwebtoken";
import { APP_JWT_SECRET } from "../config/env";

export type APayload = {
  sub: string; // user id
  role: string;
  email?: string;
};

export function signToken(payload: APayload, expiresIn: string = "7d") {
  const options: SignOptions = { expiresIn };
  return jwt.sign(payload, APP_JWT_SECRET as string, options);
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, APP_JWT_SECRET as string) as APayload;
  } catch (err) {
    return null;
  }
}
