import { Admin, Role } from "@prisma/client";
import Cookies from "js-cookie";
import jwtDecode from "jwt-decode";
import { GetServerSideProps } from "next";
import Link from "next/link";
import React, { useEffect } from "react";
import prisma from "../../../lib/prisma";
import { DecodedToken } from "../../backend-utils/types";
import { useAuth } from "../../components/hooks/auth";
import Layout from "../../components/layout/layout";
import MenuOptions from "../../components/utils/menu";
import { LoggedInUser } from "./users";
import Head from "next/head";

type Props = {
  data: Data;
};

export default function Home({ data }: Props) {
  const { token, user } = data;
  const { setImageUrl } = useAuth();
  useEffect(() => {
    setImageUrl(
      Cookies.set(
        "profile",
        `${
          user?.user_role === "admin"
            ? user?.Admin?.admin_profile_picture
            : user?.Student?.student_profile_picture
        }`
      )
    );
  });
  return (
    <>
      <Head>
        <title>attendance tracker | home</title>
        <meta name="description" content="take attendance the right way" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/images/logo.svg" />
      </Head>
      <div className="w-full h-full"></div>;
    </>
  );
}

type Data = {
  token: string;
  user: LoggedInUser | null;
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

  return {
    props: {
      data: {
        token: access_token,
        user: loggedInUser,
      },
    },
  };
};

Home.getLayout = function getLayout(page: React.ReactElement) {
  return <Layout>{page}</Layout>;
};
