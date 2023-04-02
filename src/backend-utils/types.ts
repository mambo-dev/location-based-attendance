export type HandleError = {
  message: string;
};

export type DecodedToken = {
  user_reg_no: string;
  user_id: number;
  iat: number;
  exp: number;
};

export type Report = {
  course_id: number;
  course_name: string;
  unit_id: number;
  unit_code: string;
  unit_name: string;
  class_id: number;
  class_name: string;
  class_start: string;
  class_end: string;
  student_id: number;
  student_name: string;
  student_attended: boolean;
}[];
