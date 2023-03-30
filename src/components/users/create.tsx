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

type Props = {
  token: string;
};

export default function CreateProfile({ token }: Props) {
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

  const initialState = {
    phoneNumber: "",
    firstName: "",
    secondName: "",
    lastName: ".",
    description: "",
    email: "",
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
        `/api/profile/create`,
        {
          ...values,
          url: signedUrl,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const {
        profile,
        errors: profileErrors,
      }: {
        profile: any | null;
        errors: HandleError[] | [];
      } = await createProfile.data;

      if (profileErrors.length > 0 || !profile) {
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
      className=" w-full shadow mx-auto  px-4 py-2 rounded-lg h-fit flex flex-col gap-y-2"
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
      <div className="grid grid-cols-1 w-full  gap-2">
        <Input
          type="email"
          label="email"
          name="email"
          onChange={handleChange}
          value={values.email}
        />
      </div>
      <TextArea
        label="description"
        name="description"
        onChange={handleChange}
        value={values.description}
      />
      <div className="w-32 ml-auto ">
        <Button text="save user" type="submit" loading={loading} />
      </div>
      <ErrorMessage errors={errors} />
      <Success message="succesfully created user" success={success} />
    </form>
  );
}
