// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../lib/prisma";
import { handleAuthorization } from "../../../backend-utils/authorization";
import { DecodedToken, HandleError } from "../../../backend-utils/types";
import { handleBodyNotEmpty } from "../../../backend-utils/validation";
import * as argon2 from "argon2";
import jwtDecode from "jwt-decode";
import { getYear } from "date-fns";
import { v4 as uuidv4 } from "uuid";

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
      role,
      description,
      password,
      firstName,
      secondName,
      lastName,
      courseId,

      email,
      profilePicture,
    } = req.body;

    const findCourse = await prisma.course.findUnique({
      where: {
        course_id: Number(courseId),
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

    const createRandomNumber = await prisma.regNo.create({});
    const randomNumber = formatNumber(createRandomNumber.reg_no_id);

    const user_reg_no =
      role === "student"
        ? `${findCourse.course_short_name.toLowerCase()}${firstName.toLowerCase()}${getYear(
            new Date()
          )}${randomNumber}`
        : `${firstName}Admin${randomNumber}`.toLowerCase();

    const usernameExists = await prisma.user.findUnique({
      where: {
        user_reg_no: user_reg_no,
      },
    });

    if (usernameExists) {
      return res.status(200).json({
        created: false,
        errors: [
          {
            message: `already have an account under this number`,
          },
        ],
      });
    }

    const hash = await argon2.hash(password, {
      hashLength: 10,
    });

    if (role === "student") {
      await prisma.user.create({
        data: {
          user_password: hash,
          user_reg_no: user_reg_no,
          user_role: role,
          Student: {
            create: {
              student_full_name: `${firstName} ${secondName} ${lastName}`,
              student_description: description,
              student_email: email,
              student_profile_picture: profilePicture,
              student_course: {
                connect: {
                  course_id: findCourse.course_id,
                },
              },
            },
          },
        },
      });
    } else {
      await prisma.user.create({
        data: {
          user_password: hash,
          user_reg_no: user_reg_no,
          user_role: role,
          Admin: {
            create: {
              admin_description: description,
              admin_email: email,
              admin_full_name: `${firstName} ${secondName} ${lastName}`,
              admin_profile_picture: profilePicture,
            },
          },
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

function formatNumber(number: number): string {
  if (number < 10) {
    return `00${number}`;
  } else if (number < 100) {
    return `0${number}`;
  } else {
    return number.toString();
  }
}
