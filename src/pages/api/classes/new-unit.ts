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
    const {
      course_id,
      title,
      code,
      description,
      total_classes,
      latitude,
      longitude,
      end_time,
      start_time,
    } = req.body;

    if (total_classes > 15) {
      return res.status(200).json({
        created: false,
        errors: [
          {
            message: `cannot exceed 15 classes`,
          },
        ],
      });
    }

    const findCourse = await prisma.course.findUnique({
      where: {
        course_id: Number(course_id),
      },
      include: {
        Student: true,
      },
    });

    if (!findCourse) {
      return res.status(200).json({
        created: false,
        errors: [
          {
            message: `error finding course requested`,
          },
        ],
      });
    }

    const newUnit = await prisma.unit.create({
      data: {
        unit_code: code,
        unit_description: description,
        unit_title: title,
        unit_total_classes: Number(total_classes),
        unit_course: {
          connect: {
            course_id: findCourse.course_id,
          },
        },
      },
    });

    const students = findCourse.Student;

    for (const student of students) {
      await prisma.unitEnrollment.create({
        data: {
          unit_enrollment_student: {
            connect: {
              student_id: student.student_id,
            },
          },
          unit_enrollment_unit: {
            connect: {
              unit_id: newUnit.unit_id,
            },
          },
        },
      });
    }

    const isExpired = new Date() > new Date(`${end_time}`);

    const isUpComing = new Date() < new Date(`${start_time}`);

    const classDates = [];
    for (let i = 0; i < total_classes; i++) {
      classDates.push(addWeeks(new Date(`${start_time}`), i));
    }
    const classDuration = differenceInMinutes(
      new Date(`${end_time}`),
      new Date(`${start_time}`)
    );

    for (let i = 0; i < total_classes; i++) {
      const classStartTime = classDates[i];
      const classEndTime = addMinutes(classStartTime, classDuration);
      await prisma.class.create({
        data: {
          class_end_time: classEndTime,
          class_start_time: classStartTime,
          class_unit: {
            connect: {
              unit_id: newUnit.unit_id,
            },
          },
          class_type: isExpired
            ? "expired"
            : isUpComing
            ? "upcoming"
            : "ongoing",
          class_name: `CLASS-${formatNumber(i)}`,
          class_location_lat: Number(latitude),
          class_location_lng: Number(longitude),
        },
      });
    }

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
