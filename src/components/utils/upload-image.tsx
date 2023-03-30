import Image from "next/image";
import React, { useState } from "react";

type Props = {
  previewUrl: string | null;
  handleFileUploadChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
};

export default function UploadImage({
  previewUrl,
  handleFileUploadChange,
  label,
}: Props) {
  return (
    <>
      <span className=" font-semibold"> {label} </span>
      <div className="flex flex-col w-48 h-48 mx-auto mb-2">
        {previewUrl ? (
          <div className="mx-auto w-full h-full relative mt-1">
            <Image
              alt="file uploader preview"
              src={previewUrl}
              sizes=""
              width={400}
              height={200}
              className="rounded-lg h-full w-full "
            />
          </div>
        ) : (
          <label className="flex rounded-lg border border-slate-300 border-dashed  items-center justify-center flex-grow h-full w-full py-3 transition-colors duration-150 cursor-pointer hover:text-gray-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="w-10 h-10 text-emerald-400"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
              />
            </svg>
            <input
              className="block w-0 h-0"
              name="file"
              type="file"
              onChange={handleFileUploadChange}
            />
          </label>
        )}
      </div>
    </>
  );
}
