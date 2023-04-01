// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../lib/prisma";
import { handleAuthorization } from "../../../backend-utils/authorization";
import { DecodedToken, HandleError } from "../../../backend-utils/types";
import { handleBodyNotEmpty } from "../../../backend-utils/validation";
import * as argon2 from "argon2";
import jwtDecode from "jwt-decode";
import {
  eachHourOfInterval,
  getTime,
  getYear,
  isWithinInterval,
  addWeeks,
  differenceInMinutes,
  addMinutes,
} from "date-fns";
import { v4 as uuidv4 } from "uuid";
import { formatNumber } from "../users/create";

type Data = {
  updated: boolean | null;
  errors: HandleError[] | [];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    if (req.method !== "POST") {
      return res.status(403).json({
        updated: false,
        errors: [
          {
            message: "invalid method",
          },
        ],
      });
    }

    if (!(await handleAuthorization(req))) {
      return res.status(401).json({
        updated: null,
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
        updated: null,
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
        updated: false,
        errors: [...noEmptyValues],
      });
    }
    const { unit_id, title, code, description } = req.body;

    const findUnit = await prisma.unit.findUnique({
      where: {
        unit_id: Number(unit_id),
      },
    });

    if (!findUnit) {
      return res.status(200).json({
        updated: false,
        errors: [
          {
            message: `error finding course requested`,
          },
        ],
      });
    }

    await prisma.unit.update({
      where: {
        unit_id: Number(unit_id),
      },
      data: {
        unit_code: code,
        unit_description: description,
        unit_title: title,
      },
    });

    return res.status(200).json({
      updated: true,
      errors: [],
    });
  } catch (error: any) {
    return res.status(500).json({
      updated: false,
      errors: [
        {
          message: error.message,
        },
      ],
    });
  }
}
