import React from "react";

type Props = {
  value: string | number | readonly string[] | undefined;
  onChange: React.ChangeEventHandler<HTMLTextAreaElement> | undefined;
  name: string;
  label: string;
};
export default function TextArea({ onChange, value, name, label }: Props) {
  return (
    <div className="flex flex-col gap-y-2  w-full text-slate-800 font-medium">
      <label className=" font-semibold"> {label} </label>
      <textarea
        value={value}
        onChange={onChange}
        name={name}
        className="py-3 px-2 rounded-lg outline-none bg-slate-50 border  border-slate-300 focus:border-amber-600 focus:ring-2 focus:ring-amber-300 ring-offset-1 hover:border-amber-500 "
      />
    </div>
  );
}
