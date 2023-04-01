import React, { useState } from "react";
import useForm from "../hooks/form";
import Input from "../utils/input";
import TextArea from "../utils/textArea";
import DatePickerComponent from "../utils/date-picker";
import { HandleError } from "../../backend-utils/types";
import ErrorMessage from "../utils/error";
import Success from "../utils/success";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { Course } from "@prisma/client";
import axios from "axios";
import { useRouter } from "next/router";
import Map from "../maps/maps";

type Props = {
  token: string;
  courses: Course[];
};

export default function NewUnit({ token, courses }: Props) {
  const [startTime, setStartTime] = useState<Date | null>(new Date());
  const [endTime, setEndTime] = useState<Date | null>(new Date());
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<HandleError[]>([]);
  const [success, setSuccess] = useState(false);
  const [query, setQuery] = useState("");
  const [openDropDown, setOpenDropDown] = useState(false);
  const [course, setCourse] = useState<{
    course_id: number;
    course_title: string;
  }>({
    course_id: 0,
    course_title: "",
  });
  const router = useRouter();

  const filteredValue =
    query === ""
      ? courses
      : courses.filter((value) =>
          value.course_title
            .toLowerCase()
            .replace(/\s+/g, "")
            .includes(query.toLowerCase().replace(/\s+/g, ""))
        );
  const initialState = {
    title: "",
    code: "",
    description: "",
    total_classes: 0,
    latitude: 0,
    longitude: 0,
  };
  const handleNewUnit = async () => {
    setLoading(true);
    setErrors([]);
    try {
      const res = await axios.post(
        `/api/classes/new-unit`,
        {
          ...values,
          end_time: endTime,
          start_time: startTime,
          course_id: course.course_id,
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
        <Input
          label="total classes"
          name="total_classes"
          type="number"
          value={values.total_classes}
          onChange={handleChange}
        />
      </div>
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-x-2">
        <DatePickerComponent
          date={startTime}
          setDate={setStartTime}
          label="start time (first class only)"
          showTimeSelectOnly
          dateFormat="h:mm aa"
        />
        <DatePickerComponent
          date={endTime}
          setDate={setEndTime}
          label="end time (first class only)"
          dateFormat="h:mm aa"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-2">
        <Input
          label="latitude"
          name="latitude"
          type="number"
          value={values.latitude}
          colSpan="md:col-span-1"
          onChange={handleChange}
        />
        <Input
          label="longitude"
          name="longitude"
          type="number"
          value={values.longitude}
          onChange={handleChange}
        />
      </div>
      <TextArea
        value={values.description}
        onChange={handleChange}
        name="description"
        label="description"
      />
      <div className="relative w-full col-span-2  ">
        <div
          className={`flex flex-col gap-y-2   w-full text-slate-800 font-medium`}
        >
          <label className="font-semibold">course</label>
          <button
            type="button"
            onClick={() => setOpenDropDown(!openDropDown)}
            className="w-full py-2 px-2 inline-flex items-center justify-between rounded-lg outline-none bg-slate-50 border  border-slate-300 focus:border-green-600 focus:ring-2 focus:ring-green-300 ring-offset-1 hover:border-green-500 "
          >
            {course.course_title.length > 0
              ? course.course_title
              : "search  course"}{" "}
            <ChevronDownIcon className="w-6 h-6" />
          </button>
        </div>

        {openDropDown && (
          <div className="mt-2 border-slate-300 border bg-white px-2 w-full shadow-lg py-2 flex flex-col gap-y-2 z-10 rounded max-h-48 overflow-y-auto absolute mr-2">
            <input
              name="query"
              onChange={(e) => setQuery(e.target.value)}
              value={query}
              className="flex-1 outline-none border-b border-slate-200 py-2 focus:border-green-400"
              placeholder="search  course"
            />
            {filteredValue?.map((value: Course, index: number) => (
              <span
                className="rounded-md py-2 px-2 cursor-pointer text-slate-600 hover:bg-green-200 hover:text-green-900 hover:font-bold"
                key={index}
                onClick={() => {
                  setCourse({
                    course_id: value.course_id,
                    course_title: value.course_title,
                  });
                  setQuery("");
                  setOpenDropDown(false);
                }}
              >
                {value.course_title}
              </span>
            ))}
          </div>
        )}
      </div>
      <div></div>
      <button
        type="submit"
        className="mt-2 py-2 w-full rounded-lg  bg-gradient-to-tr from-green-600 to-green-500 focus:ring-2 focus:ring-green-300 ring-offset-1 shadow text-white text-sm font-medium  focus:border  border-green-300"
      >
        {loading ? "loading..." : "create unit"}
      </button>
      <ErrorMessage errors={errors} />
      <Success message="succesfully created unit" success={success} />
    </form>
  );
}

//-0.23504927422888872, 35.73405871731619
