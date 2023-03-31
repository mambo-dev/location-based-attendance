// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import jwtDecode from "jwt-decode";
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../lib/prisma";
import { handleAuthorization } from "../../../backend-utils/authorization";
import { DecodedToken, HandleError } from "../../../backend-utils/types";
import { handleBodyNotEmpty } from "../../../backend-utils/validation";
import * as argon2 from "argon2";

type Data = {
  deleted: boolean | null;
  errors: HandleError[] | [];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    if (req.method !== "DELETE") {
      return res.status(403).json({
        deleted: null,
        errors: [
          {
            message: "invalid method",
          },
        ],
      });
    }

    if (!(await handleAuthorization(req))) {
      return res.status(401).json({
        deleted: null,
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
      include: {
        Admin: true,
      },
    });

    const { user_id } = req.query;

    const findUserToUpdate = await prisma.user.findUnique({
      where: {
        user_id: Number(user_id),
      },
      include: {
        Admin: true,
      },
    });

    const isAdmin = user?.user_role === "admin";

    if (!isAdmin) {
      return res.status(403).json({
        deleted: null,
        errors: [
          {
            message: "not authorized to perform this action",
          },
        ],
      });
    }

    if (findUserToUpdate?.user_role === "admin") {
      return res.status(403).json({
        deleted: null,
        errors: [
          {
            message: "main admin cannot delete their profile",
          },
        ],
      });
    }

    await prisma.user.delete({
      where: {
        user_id: Number(user_id),
      },
    });

    return res.status(200).json({
      deleted: true,
      errors: [],
    });
  } catch (error: any) {
    return res.status(500).json({
      deleted: null,
      errors: [
        {
          message: error.message,
        },
      ],
    });
  }
}
