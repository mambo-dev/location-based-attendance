import { Menu } from "@headlessui/react";
import {
  EllipsisVerticalIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { Admin, Role, Student, User } from "@prisma/client";

import jwtDecode from "jwt-decode";
import { GetServerSideProps } from "next";
import Image from "next/image";

import React, { useState } from "react";
import prisma from "../../../lib/prisma";
import { DecodedToken } from "../../backend-utils/types";

import Layout from "../../components/layout/layout";
import CreateProfile from "../../components/users/create";
import Button from "../../components/utils/button";
import Modal from "../../components/utils/Modal";
import Table from "../../components/utils/table";

type Props = {
  data: Data;
};

export default function Users({ data }: Props) {
  const { token, user, users } = data;
  const [selectedUser, setSelectedUser] = useState<LoggedInUser>(null);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const headers = [
    "profile image",
    "username",
    "full name",
    "email",
    "role",
    "more",
  ];

  const isAdmin = user?.user_role === "admin";

  const isUsersProfile = user?.user_id === selectedUser?.user_id;

  return (
    <div className="w-full h-full py-10 md:px-28">
      {isAdmin && (
        <div className="w-full flex items-center mb-2 justify-end">
          <div className="w-fit">
            <Button
              onClick={() => setOpenEditModal(true)}
              text="add user"
              svg={<PlusIcon className="w-5 h-5" />}
            />
          </div>
        </div>
      )}
      <Table headers={headers}>
        {users?.map((user, index) => {
          return (
            <tr key={index} className="border-b">
              <th
                scope="row"
                className="px-2 text-left py-4 font-medium text-gray-900 whitespace-nowrap "
              >
                <div className="relative w-16 h-16 rounded-full">
                  <Image
                    src={
                      user.user_role === "admin"
                        ? `${user.Admin?.admin_profile_picture}`
                        : `${user.Student?.student_profile_picture}`
                    }
                    alt="profile image"
                    width={50}
                    height={50}
                    className="rounded-full w-full h-full"
                  />
                </div>
              </th>
              <td className="py-4 px-1">{user.user_username}</td>
              <td className="py-4 px-1">
                {user.user_role === "admin"
                  ? `${user.Admin?.admin_full_name}`
                  : `${user.Student?.student_full_name}`}
              </td>
              <td className="py-4 px-1">
                {user.user_role === "admin"
                  ? `${user.Admin?.admin_email}`
                  : `${user.Student?.student_email}`}
              </td>
              <td className="py-4 px-1">{user.user_role}</td>
              <td className="py-4 px-1 ">
                <Menu as="div" className="relative inline-block text-left">
                  <Menu.Button
                    onClick={() => setSelectedUser(user)}
                    className="w-fit py-3 px-3  border border-slate-300 rounded-md "
                  >
                    <EllipsisVerticalIcon className="w-6 h-6 font-bold" />
                  </Menu.Button>
                  <Menu.Items className="absolute z-40 right-full mr-2 mb-2 -top-full mt-1 w-56 origin-top-right divide-y divide-gray-100 rounded bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="px-1 py-1 ">
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            className={`${
                              active
                                ? "bg-gradient-to-tr from-blue-500 to-blue-600 text-white"
                                : "text-gray-900"
                            } group inline-flex w-full items-center justify-start gap-x-2 rounded px-2 py-2 text-sm`}
                          >
                            <PencilIcon className="w-4 h-4" /> edit
                          </button>
                        )}
                      </Menu.Item>

                      {isAdmin && (
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              className={`${
                                active
                                  ? "bg-gradient-to-tr from-red-500 to-red-600 text-white"
                                  : "text-gray-900"
                              } group inline-flex w-full items-center justify-start gap-x-2  rounded px-2 py-2 text-sm`}
                            >
                              <TrashIcon className="w-4 h-4" /> delete
                            </button>
                          )}
                        </Menu.Item>
                      )}
                    </div>
                  </Menu.Items>
                </Menu>
              </td>
            </tr>
          );
        })}
      </Table>
      <Modal
        span="max-w-xl"
        setIsOpen={setOpenDeleteModal}
        isOpen={openEditModal}
      >
        <CreateProfile token={token} />
      </Modal>
    </div>
  );
}

type Data = {
  token: string;
  user: LoggedInUser;
  users:
    | (User & {
        Admin: Admin | null;
        Student: Student | null;
      })[];
};

type LoggedInUser = {
  Admin: Admin | null;
  Student: Student | null;
  user_id: number;
  user_role: Role | null;
  user_username: string;
} | null;

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

  const users = await prisma.user.findMany({
    include: {
      Admin: true,
      Student: true,
    },
  });

  return {
    props: {
      data: {
        token: access_token,
        user: loggedInUser,
        users,
      },
    },
  };
};

Users.getLayout = function getLayout(page: React.ReactElement) {
  return <Layout>{page}</Layout>;
};
