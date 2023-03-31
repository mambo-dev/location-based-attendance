import React from "react";
import { Unit } from "../../pages/home/classes";

type Props = {
  unit: Unit;
};

export default function Unit({ unit }: Props) {
  const { enrollments, unit_code, unit_course, unit_description, unit_title } =
    unit;
  return <div className=""></div>;
}
