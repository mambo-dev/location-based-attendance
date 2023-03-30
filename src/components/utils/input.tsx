import React from "react";

type Props = {
  value: string | number | readonly string[] | undefined;
  onChange: React.ChangeEventHandler<HTMLInputElement> | undefined;
  name: string;
  label: string;
  type?: string;
  colSpan?: string;
};

export default function Input({
  onChange,
  value,
  name,
  label,
  type,
  colSpan,
}: Props) {
  return (
    <div
      className={`flex flex-col gap-y-2 ${colSpan}  w-full text-slate-800 font-medium`}
    >
      <label className="font-semibold"> {label} </label>
      <input
        value={value}
        onChange={onChange}
        name={name}
        type={type}
        className="py-3 px-2 rounded-lg outline-none bg-slate-50 border  border-slate-300 focus:border-amber-600 focus:ring-2 focus:ring-amber-300 ring-offset-1 hover:border-amber-500 "
      />
    </div>
  );
}
