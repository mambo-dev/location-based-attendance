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
  updated: boolean | null;
  errors: HandleError[] | [];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    if (req.method !== "PUT") {
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

    const { user_id } = req.query;
    const token = req.headers.authorization?.split(" ")[1];

    const decodedToken: DecodedToken = await jwtDecode(`${token}`);

    const user = await prisma.user.findUnique({
      where: {
        user_id: decodedToken.user_id,
      },
    });
    const isAdmin = user?.user_role === "admin";

    if (!isAdmin) {
      const isUsersProfile = user?.user_id === Number(user_id);
      if (!isUsersProfile) {
        return res.status(401).json({
          updated: null,
          errors: [
            {
              message: "cannot update this profile",
            },
          ],
        });
      }
    }

    const {
      role,
      description,
      password,
      confirmPassword,
      firstName,
      secondName,
      lastName,
      email,
      profilePicture,
    } = req.body;

    const userExists = await prisma.user.findUnique({
      where: {
        user_id: Number(user_id),
      },
    });

    if (!userExists) {
      return res.status(200).json({
        updated: false,
        errors: [
          {
            message: `could not find user to update`,
          },
        ],
      });
    }

    if (password === "") {
      if (userExists.user_role === "student") {
        await prisma.user.update({
          where: {
            user_id: userExists.user_id,
          },
          data: {
            user_role: role,
            Student: {
              update: {
                student_full_name: `${firstName} ${secondName} ${lastName}`,
                student_description: description,
                student_email: email,
                student_profile_picture: profilePicture,
              },
            },
          },
        });
      } else {
        await prisma.user.update({
          where: {
            user_id: userExists.user_id,
          },
          data: {
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
    }

    const hash = await argon2.hash(password, {
      hashLength: 10,
    });

    console.log(password);

    if (password !== confirmPassword) {
      return res.status(200).json({
        updated: null,
        errors: [
          {
            message: "passwords must match",
          },
        ],
      });
    }

    if (userExists.user_role === "student") {
      await prisma.user.update({
        where: {
          user_id: userExists.user_id,
        },
        data: {
          user_password: hash,

          user_role: role,
          Student: {
            update: {
              student_full_name: `${firstName} ${secondName} ${lastName}`,
              student_description: description,
              student_email: email,
              student_profile_picture: profilePicture,
            },
          },
        },
      });
    } else {
      await prisma.user.update({
        where: {
          user_id: userExists.user_id,
        },
        data: {
          user_password: hash,
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

function formatNumber(number: number): string {
  if (number < 10) {
    return `00${number}`;
  } else if (number < 100) {
    return `0${number}`;
  } else {
    return number.toString();
  }
}
