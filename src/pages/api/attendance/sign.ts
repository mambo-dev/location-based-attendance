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

    console.log("we hit");

    const { student_id, class_id, unit_id } = req.query;

    const findClass = await prisma.class.findUnique({
      where: {
        class_id: Number(class_id),
      },
    });

    const findStudent = await prisma.student.findUnique({
      where: {
        student_id: Number(student_id),
      },
    });

    if (!findStudent || !findClass) {
      return res.status(404).json({
        attended: null,
        errors: [
          {
            message: "could not find requested resource",
          },
        ],
      });
    }
    const isStudentSigned = await prisma.attendance.findFirst({
      where: {
        AND: {
          attendane_student: {
            is: {
              student_id: findStudent.student_id,
            },
          },
          attendane_class: {
            is: {
              class_id: findClass.class_id,
            },
          },
        },
      },
    });

    console.log(isStudentSigned);

    if (isStudentSigned) {
      return res.status(404).json({
        attended: null,
        errors: [
          {
            message: "you are already signed in",
          },
        ],
      });
    }

    await prisma.attendance.create({
      data: {
        attendance_status: true,
        attendane_class: {
          connect: {
            class_id: findClass.class_id,
          },
        },
        attendane_student: {
          connect: {
            student_id: findStudent.student_id,
          },
        },
      },
    });

    return res.status(200).json({
      attended: true,
      errors: [],
    });
  } catch (error: any) {
    console.log(error);
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
