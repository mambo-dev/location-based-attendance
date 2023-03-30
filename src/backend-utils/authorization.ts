import { NextApiRequest } from "next";
import jwt from "jsonwebtoken";

export async function handleAuthorization(req: NextApiRequest) {
  try {
    if (!req.headers.authorization) {
      return false;
    }

    const valid = jwt.verify(
      req.headers.authorization.split(" ")[1],
      `${process.env.JWT_SECRET}`
    );

    if (!valid) {
      return false;
    }

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}
