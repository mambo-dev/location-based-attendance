import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { useState } from "react";
import { HandleError } from "../backend-utils/types";
import useForm from "../components/hooks/form";
import Button from "../components/utils/button";
import ErrorMessage from "../components/utils/error";
import Input from "../components/utils/input";
import Success from "../components/utils/success";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<HandleError[]>([]);
  const [success, setSuccess] = useState(false);
  const initialState = {
    user_reg_no: "",
    password: "",
  };

  const router = useRouter();
  const submitLogin = async () => {
    setLoading(true);
    setErrors([]);
    try {
      const login = await axios.post(`api/auth/login`, {
        ...values,
      });

      const {
        loggedin,
        errors: loginErrors,
      }: {
        loggedin: boolean | null;
        errors: HandleError[] | [];
      } = await login.data;

      if (loginErrors.length > 0 || !loggedin) {
        setLoading(false);

        setErrors([...loginErrors]);
        return;
      }
      setSuccess(true);
      setErrors([]);
      setTimeout(() => {
        setSuccess(false);
      }, 1000);
      setTimeout(() => {
        router.push("/home/users");
      }, 2000);
      setLoading(false);
    } catch (error: any) {
      console.log(error);
      setLoading(false);
      error.response?.data.error && error.response.data.error.length > 0
        ? setErrors([...error.response.data.error])
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

  const { handleChange, handleSubmit, values } = useForm(
    initialState,
    submitLogin
  );
  return (
    <>
      <Head>
        <title>attendance tracker</title>
        <meta name="description" content="take attendance the right way" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/images/logo.svg" />
      </Head>
      <main className="w-full h-screen flex">
        <div className=" hidden md:flex md:w-1/2 flex-grow">
          <Image
            alt="login"
            src="/images/attendance.svg"
            width={100}
            height={100}
            className="w-full h-full "
          />
        </div>
        <div className="w-full md:w-1/2 bg-white flex flex-col px-2 md:px-32 py-36 md:py-44 gap-y-4">
          <div className="w-full text-center">
            <h1 className="font-bold text-xl text-slate-700">Welcome back</h1>
            <p className="text-sm text-slate-600 font-medium">
              attendance done the right way
            </p>
          </div>
          <form
            onSubmit={handleSubmit}
            className="w-full gap-y-6 flex flex-col"
          >
            <Input
              label="registration number"
              name="user_reg_no"
              onChange={handleChange}
              value={values.user_reg_no}
            />
            <Input
              label="password"
              name="password"
              type="password"
              onChange={handleChange}
              value={values.password}
            />
            <div className="w-full mt-1">
              <Button
                text="login"
                type="submit"
                svg={<ArrowRightOnRectangleIcon className="w-6 h-6" />}
                loading={loading}
              />
            </div>
          </form>
          <div className="w-full text-center">
            <Success
              message={`welcome back. redirecting... `}
              success={success}
            />
            <ErrorMessage errors={errors} />
          </div>
        </div>
      </main>
    </>
  );
}
