import React, { forwardRef, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { addDays, startOfDay, subDays } from "date-fns";

const todayStart = startOfDay(new Date());
const excludedInterval = {
  start: subDays(new Date(), 3),
  end: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
};

type Props = {
  setDate: React.Dispatch<React.SetStateAction<Date | null>>;
  date: Date | null;
  label: string;
  showTimeSelectOnly?: boolean;
  dateFormat?: string;
};

export default function DatePickerComponent({
  date,
  setDate,
  label,
  showTimeSelectOnly,
  dateFormat,
}: Props) {
  return (
    <div className={`flex flex-col gap-y-2  w-full text-slate-800 font-medium`}>
      <label className="font-semibold"> {label} </label>
      <DatePicker
        selected={date}
        showMonthDropdown
        showPopperArrow
        todayButton
        showTimeSelect
        minDate={todayStart}
        maxDate={todayStart}
        onChange={(date) => setDate(date)}
        dateFormat={dateFormat}
        placeholderText="select date"
        className="w-full py-2 px-2 z-50 rounded-lg outline-none bg-slate-50 border  border-slate-300 focus:border-green-600 focus:ring-2 focus:ring-green-300 ring-offset-1 hover:border-green-500 "
      />
    </div>
  );
}
