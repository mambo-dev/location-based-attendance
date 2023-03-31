import {
  Admin,
  Course,
  Role,
  Student,
  Unit as UnitType,
  UnitEnrollment,
} from "@prisma/client";

import jwtDecode from "jwt-decode";
import { GetServerSideProps } from "next";
import Link from "next/link";
import React, { useEffect, useState } from "react";

import Head from "next/head";
import prisma from "../../../../lib/prisma";
import { DecodedToken } from "../../../backend-utils/types";
import Layout from "../../../components/layout/layout";

type Props = {
  data: Data;
};

export default function UnitPage({ data }: Props) {
  const { token, user, unit, courses } = data;

  const isAdmin = user?.user_role === "admin";

  return (
    <>
      <Head>
        <title>attendance tracker | units</title>
        <meta name="description" content="take attendance the right way" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/images/logo.svg" />
      </Head>
      <div className="w-full h-full py-10  flex flex-col">
        <div className="w-3/4">.</div>
        <div className="bg-white h-full flex flex-col"></div>
      </div>
    </>
  );
}

type Data = {
  token: string;
  user: {
    Admin: Admin | null;
    user_national_id: number;
    user_id: number;
    user_role: Role | null;
    user_reg_no: string;
  } | null;
  unit: Unit;
  courses: Course[];
};

export type Unit = UnitType & {
  unit_course: Course;
  enrollments: (UnitEnrollment & {
    unit_enrollment_student: Student;
  })[];
};

//@ts-ignore
export const getServerSideProps: GetServerSideProps<{ data: Data }> = async (
  context
) => {
  const { req } = context;

  const access_token = req.cookies.access_token;
  if (!access_token || access_token.trim() === "") {
    return {
      redirect: {
        permanent: false,
        destination: "/",
      },
    };
  }

  const decodedToken: DecodedToken = jwtDecode(access_token);

  if (decodedToken.exp < Date.now() / 1000) {
    return {
      redirect: {
        permanent: false,
        destination: "/",
      },
    };
  }

  const loggedInUser = await prisma.user.findUnique({
    where: {
      user_id: decodedToken.user_id,
    },
    select: {
      Admin: true,
      Student: true,
      user_password: false,
      user_id: true,
      user_role: true,
      user_reg_no: true,
    },
  });

  const { uid } = context.query;

  const unit = await prisma.unit.findUnique({
    where: {
      unit_id: Number(uid),
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

  const courses = await prisma.course.findMany({});

  return {
    props: {
      data: {
        token: access_token,
        user: loggedInUser,
        unit,
        courses,
      },
    },
  };
};

UnitPage.getLayout = function getLayout(page: React.ReactElement) {
  return <Layout>{page}</Layout>;
};
