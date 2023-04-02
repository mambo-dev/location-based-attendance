import jwtDecode from "jwt-decode";
import { DecodedToken, HandleError, Report } from "../../backend-utils/types";
import Layout from "../../components/layout/layout";
import { GetServerSideProps } from "next";
import { LoggedInUser } from "./users";
import prisma from "../../../lib/prisma";
import ErrorMessage from "../../components/utils/error";
import Success from "../../components/utils/success";
import { exportToExcel } from "../../backend-utils/excel";
import Button from "../../components/utils/button";
import { useState } from "react";
import axios from "axios";

type Props = {
  data: Data;
};

export default function Reports({ data }: Props) {
  const { user, token } = data;
  const [success, setSuccess] = useState(false);
  const [generatedReports, setGeneratedReports] = useState<Report>([]);
  const [errors, setErrors] = useState<HandleError[]>([]);
  const [loading, setLoading] = useState(false);

  const generateReports = async () => {
    setLoading(true);
    setErrors([]);
    try {
      const res = await axios.get(
        `/api/reports/reports`,

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const {
        generated,
        errors: serverErrors,
      }: {
        generated: any[] | null;
        errors: HandleError[] | [];
      } = await res.data;

      if (serverErrors.length > 0 || !generated) {
        setLoading(false);

        setErrors([...serverErrors]);
        return;
      }

      setGeneratedReports(generated);
      setLoading(false);
      setSuccess(true);
      setErrors([]);
      setTimeout(() => {
        setSuccess(false);
      }, 1000);
    } catch (error: any) {
      console.log(error);
      setLoading(false);
      error.response?.data.errors && error.response.data.errors.length > 0
        ? setErrors([...error.response.data.errors])
        : setErrors([
            {
              message: "something unexpected happened try again later",
            },
          ]);
      setLoading(false);
      setTimeout(() => {
        setErrors([]);
      }, 2000);
    }
  };
  return (
    <div className="w-full  px-4 ">
      <div className="mx-auto  py-32">
        <div className="flex flex-col gap-y-2 items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-10 h-10"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z"
            />
          </svg>

          <h1 className="text-xl font-semibold">Reports</h1>
          <p className="text-slate-700 font-medium">
            reports are generated for the attendance module
          </p>

          <div className="w-fit flex items-center justify-center gap-x-2">
            <div className="w-fit">
              <Button
                text="generate reports"
                onClick={() => generateReports()}
                loading={loading}
                svg={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className={`${
                      loading && "animate-spin ease-in-out "
                    } w-6 h-6`}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4.5v15m7.5-7.5h-15"
                    />
                  </svg>
                }
              />
            </div>

            {generatedReports.length > 0 && (
              <div className="w-fit">
                <button
                  className="mt-2 disabled:bg-opacity-70  py-2 px-3 inline-flex items-center justify-center gap-x-2 w-full rounded-md  bg-gradient-to-tr from-red-600 to-red-500  text-white text-sm font-medium focus:ring-1 focus:border ring-red-400 border-red-300"
                  onClick={() => {
                    let id = 0;
                    exportToExcel({
                      Dbdata: generatedReports,
                      filename: `${user?.user_reg_no}-${
                        user?.user_role
                      }${(id += 1)}-attenance`,
                      filetype:
                        "application/vnd.openxmlfromats-officedocument.spreadsheetml.sheet;charset=UTF-8",
                      fileExtension: ".xlsx",
                    });
                  }}
                >
                  {" "}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                    />
                  </svg>
                  download
                </button>
              </div>
            )}
          </div>

          <div className="flex w-fit items-center justify-center">
            <ErrorMessage errors={errors} />
            <Success
              message="succesfully generated reports"
              success={success}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

type Data = {
  token: string;
  user: LoggedInUser | null;
};

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

Reports.getLayout = function getLayout(page: React.ReactElement) {
  return <Layout>{page}</Layout>;
};
