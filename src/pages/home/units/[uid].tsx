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
import { DecodedToken, HandleError } from "../../../backend-utils/types";
import Layout from "../../../components/layout/layout";
import DisclosureComp from "../../../components/utils/disclosure";
import { format } from "date-fns";
import Map from "../../../components/class-helpers/maps";
import ErrorMessage from "../../../components/utils/error";
import QRCodeGenerator from "../../../components/class-helpers/qr-code";
import { LoggedInUser } from "../users";
import axios from "axios";

type Props = {
  data: Data;
};

export default function UnitPage({ data }: Props) {
  const { token, user, unit, courses } = data;
  const [isWithinRegion, setIsWithinRegion] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<HandleError[]>([]);

  const isAdmin = user?.user_role === "admin";

  return (
    <>
      <Head>
        <title>attendance tracker | units</title>
        <meta name="description" content="take attendance the right way" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/images/logo.svg" />
      </Head>

      <div className="  w-full min-h-screen  flex relative overflow-hidden ">
        {errors.length > 0 && (
          <div className="absolute top-10 left-0 right-0 bottom-0">
            <ErrorMessage errors={errors} />
          </div>
        )}
        <div className="w-full min-h-screen md:w-[70%]">
          <Map
            lat={unit?.Class[0].class_location_lat}
            lng={unit?.Class[0].class_location_lng}
            setIsWithinRegion={setIsWithinRegion}
            isWithinRegion={isWithinRegion}
            setErrors={setErrors}
          />
        </div>

        <ul
          role="list"
          className="absolute right-0 top-0 bottom-0  w-50% md:w-[30%] divide-y divide-gray-200  border border-slate-300 bg-white shadow-lg"
        >
          {unit?.Class.map((classes) => {
            console.log(
              unit.unit_id,
              classes.class_id,
              user?.Student?.student_id
            );
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
                          <span className="py-1 bg-red-300 rounded-full   px-8 text-sm font-bold text-slate-800">
                            expired
                          </span>
                        ) : classes.class_type === "upcoming" ? (
                          <span className="py-1 bg-green-300 rounded-full   px-8 text-sm font-bold text-slate-800">
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
                      {format(
                        new Date(`${classes.class_end_time}`),
                        "MM/dd/yyyy mm:hh"
                      )}
                    </span>
                  </div>
                }
                panel={
                  <div className="py-2 flex flex-col">
                    <span>
                      {classes.class_type === "upcoming" ? (
                        <span className="py-2 px-2  rounded-md w-full font-bold text-green-950 bg-green-100">
                          cannot sign for an upcoming class
                        </span>
                      ) : classes.class_type === "expired" ? (
                        <span className="py-2 px-2  rounded-md w-full font-bold text-red-950 bg-red-100">
                          cannot sign for an expired class
                        </span>
                      ) : isWithinRegion ? (
                        <span className="w-full flex items-center justify-center">
                          <QRCodeGenerator
                            url={`/units/${unit.unit_id}?student_id=${user?.Student?.student_id}&class_id=${classes.class_id}&unit_id=${unit.unit_id}`}
                          />
                        </span>
                      ) : (
                        <span className="py-2 px-2  rounded-md w-full font-bold text-red-950 bg-red-100">
                          cannot sign if you arent in the class
                        </span>
                      )}
                    </span>
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
  user: LoggedInUser | null;
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
  const { student_id, class_id, uid } = context.query;
  if (student_id && class_id) {
    await axios.get(
      `/api/attendance/sign?unit_id=${uid}&&student_id=${student_id}&&class_id=${class_id}`
    );
  }

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

//work -> -0.23569117668572342, 35.73405870590982
