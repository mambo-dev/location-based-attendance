import { useState } from "react";

export default function useForm(
  initialValues: any,
  axiosRequest: any,
  type?: string
) {
  const [values, setValues] = useState(initialValues);

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) {
    setValues({
      ...values,
      [e.target.name]: e.target.value,
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    //@ts-ignore
    if (type?.length > 0) {
      axiosRequest({
        data: {
          ...values,
        },
        type: type,
      });
    } else {
      axiosRequest(values);
    }
  }

  return {
    values,

    handleChange,
    handleSubmit,
  };
}
