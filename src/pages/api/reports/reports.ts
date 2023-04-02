// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import type { NextApiRequest, NextApiResponse } from "next";
import { format } from "date-fns";
import prisma from "../../../../lib/prisma";
import { handleAuthorization } from "../../../backend-utils/authorization";

import { HandleError, Report } from "../../../backend-utils/types";

type Data = {
  generated: Report | null;
  errors: HandleError[] | [];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    if (req.method !== "GET") {
      return res.status(403).json({
        generated: null,
        errors: [
          {
            message: "invalid method",
          },
        ],
      });
    }

    if (!(await handleAuthorization(req))) {
      return res.status(401).json({
        generated: null,
        errors: [
          {
            message: "unauthorized access please login",
          },
        ],
      });
    }

    const courses = await prisma.course.findMany({
      select: {
        course_id: true,
        course_title: true,
        Unit: {
          select: {
            unit_id: true,
            unit_code: true,
            unit_title: true,
            unit_description: false,
            Class: {
              select: {
                class_id: true,
                class_name: true,
                class_start_time: true,
                class_end_time: true,
                class_unit: false,
                Attendance: {
                  select: {
                    attendance_status: true,
                    attendane_class: false,
                    attendane_student: {
                      select: {
                        student_id: true,
                        student_full_name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        course_id: "asc",
      },
    });

    const reportData = courses.flatMap((course) =>
      course.Unit.flatMap((unit) =>
        unit.Class.flatMap((singleClass) =>
          singleClass.Attendance.map((att) => ({
            course_id: course.course_id,
            course_name: course.course_title,
            unit_id: unit.unit_id,
            unit_code: unit.unit_code,
            unit_name: unit.unit_title,
            class_id: singleClass.class_id,
            class_name: singleClass.class_name,
            class_start: format(
              new Date(`${singleClass.class_start_time}`),
              "MMMM/dd/yyyy hh:mm"
            ),
            class_end: format(
              new Date(`${singleClass.class_end_time}`),
              "MMMM/dd/yyyy hh:mm"
            ),
            student_id: att.attendane_student.student_id,
            student_name: att.attendane_student.student_full_name,
            student_attended: att.attendance_status,
          }))
        )
      )
    );

    return res.status(200).json({
      generated: reportData,
      errors: [],
    });
  } catch (error: any) {
    return res.status(500).json({
      generated: null,
      errors: [
        {
          message: error.message,
        },
      ],
    });
  }
}
