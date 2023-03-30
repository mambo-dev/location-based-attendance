import React from "react";

type Success = {
  success: boolean;
  message: string;
};

export default function Success({ success, message }: Success) {
  return (
    <p
      className={` ${
        !success && "hidden"
      }  font-bold text-sm text-green-500 m-auto mt-2`}
    >
      {message}
    </p>
  );
}
