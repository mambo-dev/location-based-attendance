import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { supabase } from "../../../lib/supabase";
import { HandleError } from "../../backend-utils/types";
import useForm from "../hooks/form";
import Button from "../utils/button";
import ErrorMessage from "../utils/error";
import Input from "../utils/input";
import Success from "../utils/success";
import TextArea from "../utils/textArea";
import UploadImage from "../utils/upload-image";
import { v4 as uuidv4 } from "uuid";
import { Course } from "@prisma/client";
import Radio from "../utils/radio";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { getYear } from "date-fns";

type Props = {
  token: string;
  courses: Course[];
};

export default function CreateProfile({ token, courses }: Props) {
  const [errors, setErrors] = useState<HandleError[]>([]);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [course, setCourse] = useState<{
    course_id: number;
    course_title: string;
  }>({
    course_id: 0,
    course_title: "",
  });

  const [openQuery, setOpenQuery] = useState(false);

  const filteredValue =
    query === ""
      ? courses
      : courses.filter((value) =>
          value.course_title
            .toLowerCase()
            .replace(/\s+/g, "")
            .includes(query.toLowerCase().replace(/\s+/g, ""))
        );
  const router = useRouter();
  function handleFileUploadChange(e: React.ChangeEvent<HTMLInputElement>) {
    console.log("on upload change", e);
    const selectedFile = e.target;

    if (!selectedFile.files) {
      setErrors([
        {
          message: "no files chosen",
        },
      ]);
      return;
    }
    const file = selectedFile.files[0];
    if (!file.type.startsWith("image")) {
      setErrors([
        {
          message: "please select a valid image",
        },
      ]);
      return;
    }

    setFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  const initialState = {
    role: "",
    course_id: 0,
    firstName: "",
    secondName: "",
    lastName: ".",
    description: "",
    email: "",
    password: "",
  };

  const saveProfile = async (values: any) => {
    setLoading(true);
    setErrors([]);
    if (!file) {
      setErrors([
        {
          message: "profile image is required",
        },
      ]);
      return;
    }
    try {
      const filename = `${uuidv4()}-${file.name}`;

      const { data, error } = await supabase.storage
        .from("upload-images")
        .upload(filename, file, {
          cacheControl: "3600",
          upsert: false,
        });

      const { data: signedUrl } = await supabase.storage
        .from("upload-images")
        .createSignedUrl(`${data?.path}`, 3.156e8, {
          transform: {
            width: 100,
            height: 100,
          },
        });

      console.log(signedUrl);
      if (error) {
        setLoading(false);
        setErrors([{ message: error.message }]);
        return;
      }

      const createProfile = await axios.post(
        `/api/users/create`,
        {
          ...values,
          profilePicture: signedUrl?.signedUrl,
          password:
            values.role === "student"
              ? `student${getYear(new Date())}`
              : `admin${getYear(new Date())}`,
          courseId: course.course_id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const {
        created,
        errors: profileErrors,
      }: {
        created: any | null;
        errors: HandleError[] | [];
      } = await createProfile.data;

      if (profileErrors.length > 0 || !created) {
        setLoading(false);

        setErrors([...profileErrors]);
        return;
      }
      setSuccess(true);
      setErrors([]);
      setTimeout(() => {
        setSuccess(false);
      }, 1000);

      setTimeout(() => {
        router.reload();
      }, 2000);

      setLoading(false);
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

  const { handleSubmit, handleChange, values } = useForm(
    initialState,
    saveProfile
  );

  return (
    <form
      onSubmit={handleSubmit}
      className=" w-full  mx-auto  px-4 py-2  h-fit flex flex-col gap-y-2"
    >
      <UploadImage
        handleFileUploadChange={handleFileUploadChange}
        label=" profile image"
        previewUrl={previewUrl}
      />
      <div className="grid grid-cols-1 w-full md:grid-cols-3 gap-2">
        <Input
          label="first name"
          name="firstName"
          onChange={handleChange}
          value={values.firstName}
        />
        <Input
          label="second name"
          name="secondName"
          onChange={handleChange}
          value={values.secondName}
        />
        <Input
          label="last name"
          name="lastName"
          onChange={handleChange}
          value={values.lastName}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 w-full  gap-2">
        <Input
          type="email"
          label="email"
          name="email"
          onChange={handleChange}
          value={values.email}
          colSpan="col-span-2"
        />
        <Input
          type="password"
          label="password"
          name="password"
          onChange={handleChange}
          value={values.password}
          placeholder="system generated"
          disabled
        />
      </div>
      <TextArea
        label="description"
        name="description"
        onChange={handleChange}
        value={values.description}
      />
      <div className="grid grid-cols-1 md:grid-cols-3">
        <div className="flex flex-col text-slate-800 py-1 gap-y-2 ">
          <p className="font-semibold">election status</p>
          <div className="flex gap-x-2 mt-auto mb-auto">
            <Radio
              handleChange={handleChange}
              checked={values.role === "admin"}
              value="admin"
              label="admin"
              name="role"
            />
            <Radio
              handleChange={handleChange}
              checked={values.role === "student"}
              value="student"
              label="student"
              name="role"
            />
          </div>
        </div>
        {values.role === "student" && (
          <div className="relative w-full col-span-2  ">
            <div
              className={`flex flex-col gap-y-2   w-full text-slate-800 font-medium`}
            >
              <label className="font-semibold">course</label>
              <button
                type="button"
                onClick={() => setOpenQuery(!openQuery)}
                className="w-full py-2 px-2 inline-flex items-center justify-between rounded-lg outline-none bg-slate-50 border  border-slate-300 focus:border-green-600 focus:ring-2 focus:ring-green-300 ring-offset-1 hover:border-green-500 "
              >
                {course.course_title.length > 0
                  ? course.course_title
                  : "search available course"}{" "}
                <ChevronDownIcon className="w-6 h-6" />
              </button>
            </div>

            {openQuery && (
              <div className=" bg-white px-2 w-full shadow-lg py-2 flex flex-col gap-y-2 z-10 rounded max-h-48 overflow-y-auto absolute mr-2">
                <input
                  name="query"
                  onChange={(e) => setQuery(e.target.value)}
                  value={query}
                  className="flex-1 outline-none border-b border-slate-200 py-2 focus:border-green-400"
                  placeholder="search available positions"
                />
                {filteredValue?.map((value: Course, index: number) => (
                  <span
                    className="rounded-md py-2 px-2 bg-green-200 text-green-900 font-bold"
                    key={index}
                    onClick={() => {
                      setCourse({
                        course_id: value.course_id,
                        course_title: value.course_title,
                      });
                      setQuery("");
                      setOpenQuery(false);
                    }}
                  >
                    {value.course_title}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <div className="w-32 ml-auto ">
        <Button text="save user" type="submit" loading={loading} />
      </div>
      <ErrorMessage errors={errors} />
      <Success message="succesfully created user" success={success} />
    </form>
  );
}
