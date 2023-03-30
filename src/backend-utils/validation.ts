import { HandleError } from "./types";

export function handleBodyNotEmpty(body: any) {
  const errors: HandleError[] = [];
  Object.keys(body).forEach((values) => {
    if (body[values] === "") {
      errors.push({
        message: `${values} must not be empty`,
      });
    }
  });

  return errors;
}
