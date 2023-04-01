// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import jwtDecode from "jwt-decode";
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../lib/prisma";
import { handleAuthorization } from "../../../backend-utils/authorization";
import { DecodedToken, HandleError } from "../../../backend-utils/types";
import { handleBodyNotEmpty } from "../../../backend-utils/validation";
import * as argon2 from "argon2";

type Data = {
  attended: boolean | null;
  errors: HandleError[] | [];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    if (req.method !== "GET") {
      return res.status(403).json({
        attended: null,
        errors: [
          {
            message: "invalid method",
          },
        ],
      });
    }

    const { student_id, class_id, unit_id } = req.query;

    const attend = await prisma.attendance.create({
      data: {
        attendance_status: true,
        attendane_class: {
          connect: {
            class_id: Number(class_id),
          },
        },
      },
    });

    return res.status(200).json({
      attended: true,
      errors: [],
    });
  } catch (error: any) {
    return res.status(500).json({
      attended: null,
      errors: [
        {
          message: error.message,
        },
      ],
    });
  }
}
