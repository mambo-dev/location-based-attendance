import React, { useState } from "react";
import useForm from "../hooks/form";
import Input from "../utils/input";
import TextArea from "../utils/textArea";
import { HandleError } from "../../backend-utils/types";
import ErrorMessage from "../utils/error";
import Success from "../utils/success";
import axios from "axios";
import { useRouter } from "next/router";

import { Unit } from "../../pages/home/classes";

type Props = {
  token: string;
  unit: Unit;
};

export default function NewUnit({ token, unit }: Props) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<HandleError[]>([]);
  const [success, setSuccess] = useState(false);

  const router = useRouter();

  const initialState = {
    title: unit.unit_title,
    code: unit.unit_code,
    description: unit.unit_description,
  };
  const handleNewUnit = async () => {
    setLoading(true);
    setErrors([]);
    try {
      const res = await axios.post(
        `/api/classes/update-unit`,
        {
          ...values,
          unit_id: unit.unit_id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const {
        created,
        errors: serverErrors,
      }: {
        created: boolean | null;
        errors: HandleError[] | [];
      } = await res.data;

      if (serverErrors.length > 0 || !created) {
        setLoading(false);

        setErrors([...serverErrors]);
        return;
      }
      setLoading(false);
      setSuccess(true);
      setErrors([]);
      setTimeout(() => {
        setSuccess(false);
      }, 1000);
      setTimeout(() => {
        router.reload();
      }, 2000);
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
  const { handleChange, handleSubmit, values } = useForm(
    initialState,
    handleNewUnit
  );
  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-y-3">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-x-2">
        <Input
          label="title"
          name="title"
          value={values.title}
          colSpan="md:col-span-2"
          onChange={handleChange}
        />
        <Input
          label="code"
          name="code"
          value={values.code}
          onChange={handleChange}
        />
      </div>

      <TextArea
        value={values.description}
        onChange={handleChange}
        name="description"
        label="description"
      />

      <button
        type="submit"
        className="mt-2 py-2 w-full rounded-lg  bg-gradient-to-tr from-green-600 to-green-500 focus:ring-2 focus:ring-green-300 ring-offset-1 shadow text-white text-sm font-medium  focus:border  border-green-300"
      >
        {loading ? "loading..." : "update unit"}
      </button>
      <ErrorMessage errors={errors} />
      <Success message="succesfully updated unit" success={success} />
    </form>
  );
}

//-0.23504927422888872, 35.73405871731619
