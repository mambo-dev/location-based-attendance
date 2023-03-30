import React from "react";
import { HandleError } from "../../backend-utils/types";

type ErrorProps = {
  errors: HandleError[];
};

export default function ErrorMessage({ errors }: ErrorProps) {
  return (
    <ul
      className={`${
        errors.length < 0 && "hidden"
      }  w-fit px-1 m-auto mt-2 h-fit flex flex-col items-start justify-start list-disc gap-y-2  `}
    >
      {errors.map((error: HandleError, index: number) => {
        return (
          <li key={index} className={`font-bold text-sm text-red-500  `}>
            {error.message}
          </li>
        );
      })}
    </ul>
  );
}
