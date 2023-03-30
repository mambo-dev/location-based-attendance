// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../lib/prisma";
import { handleAuthorization } from "../../../backend-utils/authorization";
import { DecodedToken, HandleError } from "../../../backend-utils/types";
import { handleBodyNotEmpty } from "../../../backend-utils/validation";
import * as argon2 from "argon2";
import jwtDecode from "jwt-decode";

type Data = {
  created: boolean | null;
  errors: HandleError[] | [];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    if (req.method !== "POST") {
      return res.status(403).json({
        created: false,
        errors: [
          {
            message: "invalid method",
          },
        ],
      });
    }

    if (!(await handleAuthorization(req))) {
      return res.status(401).json({
        created: null,
        errors: [
          {
            message: "unauthorized access please login",
          },
        ],
      });
    }

    const token = req.headers.authorization?.split(" ")[1];

    const decodedToken: DecodedToken = await jwtDecode(`${token}`);

    const user = await prisma.user.findUnique({
      where: {
        user_id: decodedToken.user_id,
      },
    });

    if (user?.user_role !== "admin") {
      return res.status(401).json({
        created: null,
        errors: [
          {
            message: "only admins can create a user",
          },
        ],
      });
    }

    const noEmptyValues = handleBodyNotEmpty(req.body);

    if (noEmptyValues.length > 0) {
      return res.status(200).json({
        created: false,
        errors: [...noEmptyValues],
      });
    }
    const { role, username, password, confirmPassword } = req.body;

    const usernameExists = await prisma.user.findUnique({
      where: {
        user_username: username,
      },
    });

    if (usernameExists) {
      return res.status(200).json({
        created: false,
        errors: [
          {
            message: `already have an account under this username`,
          },
        ],
      });
    }

    if (password !== confirmPassword) {
      return res.status(200).json({
        created: false,
        errors: [
          {
            message: "passwords must match",
          },
        ],
      });
    }

    const hash = await argon2.hash(password, {
      hashLength: 10,
    });

    await prisma.user.create({
      data: {
        user_password: hash,
        user_username: username,
        user_role: role,
      },
    });

    return res.status(200).json({
      created: true,
      errors: [],
    });
  } catch (error: any) {
    return res.status(500).json({
      created: false,
      errors: [
        {
          message: error.message,
        },
      ],
    });
  }
}
