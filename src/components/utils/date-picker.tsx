import React, { forwardRef, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

type Props = {
  setDate: React.Dispatch<React.SetStateAction<Date | null>>;
  date: Date | null;
  label: string;
};

export default function DatePickerComponent({ date, setDate, label }: Props) {
  return (
    <div className={`flex flex-col gap-y-2  w-full text-slate-800 font-medium`}>
      <label className="font-semibold"> {label} </label>
      <DatePicker
        selected={date}
        showMonthDropdown
        showPopperArrow
        todayButton
        onChange={(date) => setDate(date)}
        placeholderText="select date"
        className="w-full py-3 px-2 rounded-lg outline-none bg-slate-50 border  border-slate-300 focus:border-amber-600 focus:ring-2 focus:ring-amber-300 ring-offset-1 hover:border-amber-500 "
      />
    </div>
  );
}
