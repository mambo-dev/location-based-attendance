import { XMarkIcon } from "@heroicons/react/24/outline";
import React, { useState } from "react";
import Input from "./input";

type Props = {
  positions: string[];
  setPositions: React.Dispatch<React.SetStateAction<string[]>>;
};

export default function Positions({ positions, setPositions }: Props) {
  const [position, setPosition] = useState("");
  const handleDelete = (index: number) => {
    let newPositions = [...positions];

    newPositions.splice(index, 1);
    setPositions(newPositions);
  };
  return (
    <div className=" py-2  ">
      <div className="flex items-center justify-between gap-x-2">
        <input
          name="position"
          onChange={(e) => setPosition(e.target.value)}
          value={position}
          className="flex-1 outline-none border-b border-amber-200 py-2 focus:border-amber-400"
          placeholder="enter election positions"
        />
        <button
          disabled={position.length <= 0}
          type="button"
          onClick={() => {
            setPositions([...positions, position]);
            setPosition("");
          }}
          className="bg-amber-100 w-10 h-10 rounded-full shadow inline-flex items-center justify-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6 text-amber-800"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-2">
        {positions.map((positions: string, index: number) => {
          return (
            <span
              key={index}
              className="rounded-lg shadow cursor-context-menu bg-amber-500 hover:bg-amber-600 text-white font-medium py-2 px-2 w-full flex items-center justify-center"
            >
              {positions}
              <button
                type="button"
                onClick={() => handleDelete(index)}
                className="bg-amber-100 w-6 h-6 rounded-full shadow inline-flex items-center justify-center ml-auto"
              >
                <XMarkIcon className="w-3 h-3 text-amber-800" />
              </button>
            </span>
          );
        })}
      </div>
    </div>
  );
}
