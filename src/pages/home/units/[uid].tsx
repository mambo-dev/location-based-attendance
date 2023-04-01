import {
  Admin,
  Course,
  Role,
  Student,
  Unit as UnitType,
  UnitEnrollment,
  Class,
} from "@prisma/client";

import jwtDecode from "jwt-decode";
import { GetServerSideProps } from "next";
import Link from "next/link";
import React, { useEffect, useState } from "react";

import Head from "next/head";
import prisma from "../../../../lib/prisma";
import { DecodedToken } from "../../../backend-utils/types";
import Layout from "../../../components/layout/layout";
import DisclosureComp from "../../../components/utils/disclosure";
import { format } from "date-fns";
import Map from "../../../components/maps/maps";

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
      <div className="w-full min-h-screen  flex relative overflow-hidden ">
        <div className="w-full min-h-screen md:w-[70%]">
          <Map />
        </div>

        <ul
          role="list"
          className="absolute right-0 top-0 bottom-0  w-50% md:w-[30%] divide-y divide-gray-200  border border-slate-300 bg-white shadow-lg"
        >
          {unit?.Class.map((classes) => {
            return (
              <DisclosureComp
                key={classes.class_id}
                button={
                  <div className="w-full flex items-center justify-start gap-x-4 py-2">
                    <div className="flex-1 flex items-center gap-x-4">
                      <span>{classes.class_name}</span>
                      <span>{}</span>

                      <span>
                        {classes.class_type === "expired" ? (
                          <span className="py-1 bg-green-300 rounded-full   px-8 text-sm font-bold text-slate-800">
                            expired
                          </span>
                        ) : classes.class_type === "upcoming" ? (
                          <span className="py-1 bg-yellow-300 rounded-full   px-8 text-sm font-bold text-slate-800">
                            upcoming
                          </span>
                        ) : (
                          <span className="py-1 bg-yellow-300 rounded-full   px-8 text-sm font-bold text-slate-800">
                            ongoing
                          </span>
                        )}
                      </span>
                    </div>
                    <span className="mr-10 text-xs font-semibold rounded border-slate-300 border shadow bg-gradient-to-tr from-white to-slate-50 flex items-center justify-center py-1 px-2">
                      {format(new Date(`${classes.class_start_time}`), "MMMM")}
                    </span>
                  </div>
                }
                panel={
                  <div className="py-2 flex flex-col">
                    <span>{/**qr code goes here */}</span>
                  </div>
                }
              />
            );
          })}
        </ul>
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

type Unit =
  | (UnitType & {
      Class: Class[];
      unit_course: Course;
      enrollments: (UnitEnrollment & {
        unit_enrollment_student: Student;
      })[];
    })
  | null;

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
      Class: true,
    },
  });

  const courses = await prisma.course.findMany({});

  return {
    props: {
      data: {
        token: access_token,
        user: loggedInUser,
        unit: JSON.parse(JSON.stringify(unit)),
        courses,
      },
    },
  };
};

UnitPage.getLayout = function getLayout(page: React.ReactElement) {
  return <Layout>{page}</Layout>;
};
