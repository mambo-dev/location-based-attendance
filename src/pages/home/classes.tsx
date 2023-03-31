import {
  Admin,
  Course,
  Role,
  Student,
  Unit as UnitType,
  UnitEnrollment,
} from "@prisma/client";
import Cookies from "js-cookie";
import jwtDecode from "jwt-decode";
import { GetServerSideProps } from "next";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import prisma from "../../../lib/prisma";
import { DecodedToken } from "../../backend-utils/types";
import { useAuth } from "../../components/hooks/auth";
import Layout from "../../components/layout/layout";
import MenuOptions from "../../components/utils/menu";
import Head from "next/head";
import Button from "../../components/utils/button";
import { MagnifyingGlassIcon, PlusIcon } from "@heroicons/react/24/outline";
import SidePanel from "../../components/utils/sidepanel";
import NewUnit from "../../components/classes/new-unit";
import UnitComp from "../../components/classes/unit";

type Props = {
  data: Data;
};

export default function Class({ data }: Props) {
  const { token, user, units, courses } = data;
  const [openCreateSidePanel, setOpenCreateSidePanel] = useState(false);
  const [openEditSidePanel, setOpenEditSidePanel] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [clientUnits, setClientUnits] = useState<Unit[]>([]);
  const [query, setQuery] = useState("");
  const isAdmin = user?.user_role === "admin";

  useEffect(() => {
    setClientUnits(units);
  }, [units]);

  return (
    <>
      <Head>
        <title>attendance tracker | home</title>
        <meta name="description" content="take attendance the right way" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/images/logo.svg" />
      </Head>
      <div className="w-full h-full py-10 px-4 md:px-24 flex flex-col">
        <div className="w-full  grid grid-cols-5 md:grid-cols-10 gap-2">
          <div className=" relative w-full col-span-4 md:col-span-9 bg-white shadow rounded-md">
            <input
              className="w-full h-full py-2 px-10 rounded-md outline-none disabled:bg-slate-100  border  border-slate-200 focus:border-green-600 focus:ring-2 focus:ring-green-300 ring-offset-1 hover:border-green-500 "
              onChange={(e) => setQuery(e.target.value)}
              value={query}
              placeholder="Search "
            />
            <div className="absolute top-0 right-0 left-0 bottom-0 w-10 h-full flex  items-center justify-center">
              <MagnifyingGlassIcon className="w-5 h-5 text-slate-600 font-seminbold" />
            </div>
          </div>
          {isAdmin && (
            <div className="w-full h-full flex items-center mb-2 justify-end">
              <div className="w-full md:w-36 h-full">
                <button
                  onClick={() => setOpenCreateSidePanel(true)}
                  className="h-full disabled:bg-opacity-70  py-2 px-3 inline-flex items-center justify-center gap-x-2 w-full rounded-md  bg-gradient-to-tr from-green-600 to-green-500  text-white text-sm font-medium focus:ring-1 focus:border ring-green-400 border-green-300"
                >
                  <PlusIcon className="w-5 h-5" />
                  <p className="hidden md:flex">add unit</p>
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="w-full grid grid-cols-1 md:grid-cols-3 mt-2 gap-4 py-4">
          {clientUnits.map((unit) => {
            return <UnitComp key={unit.unit_id} unit={unit} />;
          })}
        </div>
      </div>

      <SidePanel
        span="max-w-2xl"
        open={openCreateSidePanel}
        setOpen={setOpenCreateSidePanel}
      >
        <NewUnit token={token} courses={courses} />
      </SidePanel>
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
  units: Unit[];
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

  const units = await prisma.unit.findMany({
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
        units,
        courses,
      },
    },
  };
};

Class.getLayout = function getLayout(page: React.ReactElement) {
  return <Layout>{page}</Layout>;
};
