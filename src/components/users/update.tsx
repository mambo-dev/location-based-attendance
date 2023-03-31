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
import { LoggedInUser, SelectedUser } from "../../pages/home/users";

type Props = {
  token: string;
  courses: Course[];
  selectedUser: SelectedUser | null;
};

export default function UpdateProfile({ token, courses, selectedUser }: Props) {
  const [errors, setErrors] = useState<HandleError[]>([]);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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

  const isAdmin = selectedUser?.user_role === "admin";

  const initialState = {
    role: selectedUser?.user_role,
    firstName: isAdmin
      ? selectedUser.Admin?.admin_full_name.split(" ")[0]
      : selectedUser?.Student?.student_full_name.split(" ")[0],
    secondName: isAdmin
      ? selectedUser.Admin?.admin_full_name.split(" ")[1]
      : selectedUser?.Student?.student_full_name.split(" ")[1],
    lastName: isAdmin
      ? selectedUser.Admin?.admin_full_name.split(" ")[2]
      : selectedUser?.Student?.student_full_name.split(" ")[2],
    description: isAdmin
      ? selectedUser.Admin?.admin_description
      : selectedUser?.Student?.student_description,
    email: isAdmin
      ? selectedUser.Admin?.admin_email
      : selectedUser?.Student?.student_email,
    password: "",
    confirmPassword: "",
  };

  const saveProfile = async (values: any) => {
    setLoading(true);
    setErrors([]);

    try {
      let url: string | undefined = "";

      if (file) {
        const filename = `${uuidv4()}-${file.name}`;

        const { data, error } = await supabase.storage
          .from("upload-images")
          .upload(filename, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (error) {
          setLoading(false);
          setErrors([{ message: error.message }]);
          return;
        }

        const { data: signedUrl } = await supabase.storage
          .from("upload-images")
          .createSignedUrl(`${data.path}`, 3.156e8, {
            transform: {
              width: 100,
              height: 100,
            },
          });
        url = signedUrl?.signedUrl;
      }

      const createProfile = await axios.put(
        `/api/users/update?user_id=${selectedUser?.user_id}`,
        {
          ...values,
          profilePicture: url,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const {
        updated,
        errors: profileErrors,
      }: {
        updated: any | null;
        errors: HandleError[] | [];
      } = await createProfile.data;

      if (profileErrors.length > 0 || !updated) {
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

      <Input
        type="email"
        label="email"
        name="email"
        onChange={handleChange}
        value={values.email}
        colSpan="col-span-2"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 w-full  gap-2">
        <Input
          type="password"
          label="password"
          name="password"
          onChange={handleChange}
          value={values.password}
        />
        <Input
          type="password"
          label="confirm password"
          name="confirmPassword"
          onChange={handleChange}
          value={values.confirmPassword}
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
      </div>
      <div className="w-32 ml-auto ">
        <Button text="update" type="submit" loading={loading} />
      </div>
      <ErrorMessage errors={errors} />
      <Success message="succesfully updated user" success={success} />
    </form>
  );
}
