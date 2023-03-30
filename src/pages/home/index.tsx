import { Admin, Role } from "@prisma/client";
import jwtDecode from "jwt-decode";
import { GetServerSideProps } from "next";
import Link from "next/link";
import React from "react";
import prisma from "../../../lib/prisma";
import { DecodedToken } from "../../backend-utils/types";
import MenuOptions from "../../components/utils/menu";

type Props = {
  data: Data;
};

const navLink: {
  link: string;
  name: string;
}[] = [
  {
    link: "/home",
    name: "overview",
  },
  {
    link: "/home/users",
    name: "users",
  },
  {
    link: "/home/classes",
    name: "classes",
  },
  {
    link: "/home/reports",
    name: "reports",
  },
];

export default function Home({ data }: Props) {
  const { token, user } = data;
  return (
    <main className="w-full min-h-screen">
      <header className="w-full bg-white h-20 shadow pr-4 flex justify-between ">
        <div className="flex items-center justify-center px-2  hover:bg-white hover:shadow-2xl h-full">
          <Link
            href="/home"
            className="text-3xl tracking-wide font-bold bg-clip-text text-transparent bg-gradient-to-tr from-red-500 via-green-500 to-green-700"
          >
            Muranga University
          </Link>
        </div>
        <nav className=" w-[40%]  h-full">
          <ul className="py-2 flex  items-center w-full justify-between h-full ">
            {navLink.map((nav, index: number) => (
              <Link href={nav.link} key={index}>
                {nav.name}
              </Link>
            ))}
          </ul>
        </nav>
        <div className=" py-2">
          <MenuOptions profileLink="/home/profile" />
        </div>
      </header>
    </main>
  );
}

type Data = {
  token: string;
  user: {
    Admin: Admin | null;
    user_national_id: number;
    user_id: number;
    user_role: Role | null;
    user_username: string;
  } | null;
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
      user_username: true,
    },
  });

  return {
    props: {
      data: {
        token: access_token,
        user: loggedInUser,
      },
    },
  };
};
