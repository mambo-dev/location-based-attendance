import React from "react";
import { Unit } from "../../pages/home/classes";
import {
  ArrowRightCircleIcon,
  ArrowUpRightIcon,
  BookOpenIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";

type Props = {
  unit: Unit;
};

export default function UnitComp({ unit }: Props) {
  const { enrollments, unit_code, unit_course, unit_description, unit_title } =
    unit;
  const remainingStudents = enrollments.slice(4, enrollments.length - 1).length;
  return (
    <div className=" group hover:shadow-lg relative flex flex-col px-2 pb-2 bg-white rounded-md shadow-md">
      <div className="py-2 mt-2 flex items-center justify-start gap-x-4 ">
        <div className="w-14 h-14 rounded-full flex items-center justify-center bg-green-500 shadow-lg">
          <BookOpenIcon className="w-6 h-6 text-white" />
        </div>
        <div className="flex flex-col items-start justify-start text-left  ">
          <h1 className="font-semibold text-slate-800">
            {unit_course.course_title}
          </h1>
          <h2 className="text-left text-sm font-medium text-slate-600">{`${unit_code} ${unit_title}`}</h2>
        </div>
      </div>
      <Link href={`/home/units/${unit.unit_id}`}>
        <span className="group-hover:visible invisible flex  items-center justify-center absolute  z-10 right-0 left-[95%] bottom-[90%]  bg-black text-white w-8 h-8 rounded-full ">
          <ArrowUpRightIcon className="w-4 h-4 font-bold" />
        </span>
      </Link>
      <div className="py-2 mt-2 flex items-center justify-start gap-x-4 ">
        <div className=" invisible w-14 h-5 rounded-full flex items-center justify-center bg-green-500 shadow-lg">
          <BookOpenIcon className="w-6 h-6" />
        </div>
        <p className="text-sm font-medium text-slate-500 first-letter:uppercase">
          {unit_description}
        </p>
      </div>
      <div className="py-2 mt-2 flex gap-x-4">
        <div className=" invisible w-14 h-5 rounded-full flex items-center justify-center bg-green-500 shadow-lg">
          <BookOpenIcon className="w-6 h-6" />
        </div>
        <div className="col-span-3 flex -space-x-2 overflow-hidden">
          {enrollments.length > 0 &&
            enrollments.slice(0, 4).map((enrollment) => {
              return (
                <div
                  key={enrollment.unit_enrollment_id}
                  className="inline-block h-6 w-6 rounded-full ring-2 ring-white"
                >
                  <Image
                    src={
                      enrollment.unit_enrollment_student.student_profile_picture
                    }
                    alt="student profile"
                    width={50}
                    height={50}
                    className="rounded-full w-full h-full object-cover"
                  />
                </div>
              );
            })}
          {remainingStudents > 0 && (
            <span className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-white shadow-lg text-slate-800 font-bold">
              +{remainingStudents}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
