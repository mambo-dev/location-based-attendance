// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import type { NextApiRequest, NextApiResponse } from "next";
import { Unit } from "../../home/classes";
import { HandleError } from "../../../backend-utils/types";
import { handleAuthorization } from "../../../backend-utils/authorization";
import prisma from "../../../../lib/prisma";

type Response = {
  data: Unit[] | null;
  errors: HandleError[] | null;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response>
) {
  try {
    if (req.method !== "GET") {
      return res.status(403).json({
        data: null,
        errors: [
          {
            message: "invalid method",
          },
        ],
      });
    }

    if (!(await handleAuthorization(req))) {
      return res.status(401).json({
        data: null,
        errors: [
          {
            message: "unauthorized access please login",
          },
        ],
      });
    }

    const { query } = req.query;

    const units = await prisma.unit.findMany({
      where: {
        OR: {
          unit_course: {
            course_title: {
              search: String(query),
            },
          },
          unit_title: {
            search: String(query),
          },
        },
      },
      include: {
        enrollments: {
          include: {
            unit_enrollment_student: true,
          },
        },
        unit_course: true,
      },
    });

    return res.status(200).json({
      data: units,
      errors: null,
    });
  } catch (error: any) {
    return res.status(500).json({
      data: null,
      errors: [{ message: error.message }],
    });
  }
}
