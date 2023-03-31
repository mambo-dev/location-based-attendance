import { Menu } from "@headlessui/react";
import {
  EllipsisVerticalIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { Admin, Course, Role, Student, User } from "@prisma/client";

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
import SidePanel from "../../components/utils/sidepanel";
import UpdateProfile from "../../components/users/update";
import DeleteUser from "../../components/users/delete";

type Props = {
  data: Data;
};

export default function Users({ data }: Props) {
  const { token, user, users, courses } = data;
  const [selectedUser, setSelectedUser] = useState<SelectedUser | null>(null);
  const [openCreateSidePanel, setOpenCreateSidePanel] = useState(false);
  const [openEditSidePanel, setOpenEditSidePanel] = useState(false);

  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const headers = [
    "profile image",
    "reg no",
    "full name",
    "email",
    "course",
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
              onClick={() => setOpenCreateSidePanel(true)}
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
              <td className="py-4 px-1">{user.user_reg_no.split("-")[0]}</td>
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
              <td className="py-4 px-1">
                {user.user_role === "admin"
                  ? `n/a`
                  : `${user.Student?.student_course.course_title}`}
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
                      {(isAdmin || isUsersProfile) && (
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={() => setOpenEditSidePanel(true)}
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
                      )}

                      {isAdmin && (
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={() => setOpenDeleteModal(true)}
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
      <SidePanel
        span="max-w-xl"
        setOpen={setOpenCreateSidePanel}
        open={openCreateSidePanel}
      >
        <CreateProfile token={token} courses={courses} />
      </SidePanel>
      <SidePanel
        span="max-w-xl"
        setOpen={setOpenEditSidePanel}
        open={openEditSidePanel}
      >
        <UpdateProfile
          token={token}
          courses={courses}
          selectedUser={selectedUser}
        />
      </SidePanel>
      <Modal isOpen={openDeleteModal} setIsOpen={setOpenDeleteModal}>
        <DeleteUser
          selectedUser={selectedUser}
          setIsOpen={setOpenDeleteModal}
          token={token}
        />
      </Modal>
    </div>
  );
}

type Data = {
  token: string;
  user: LoggedInUser;
  users: (User & {
    Admin: Admin | null;
    Student:
      | (Student & {
          student_course: Course;
        })
      | null;
  })[];
  courses: Course[];
};

export type SelectedUser = User & {
  Admin: Admin | null;
  Student:
    | (Student & {
        student_course: Course;
      })
    | null;
};

export type LoggedInUser = {
  Admin: Admin | null;
  Student: Student | null;
  user_id: number;
  user_role: Role | null;
  user_reg_no: string;
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
      user_reg_no: true,
    },
  });

  const users = await prisma.user.findMany({
    include: {
      Admin: true,
      Student: {
        include: {
          student_course: true,
        },
      },
    },
  });

  const courses = await prisma.course.findMany({});

  return {
    props: {
      data: {
        token: access_token,
        user: loggedInUser,
        users,
        courses,
      },
    },
  };
};

Users.getLayout = function getLayout(page: React.ReactElement) {
  return <Layout>{page}</Layout>;
};
