export type HandleError = {
  message: string;
};

export type DecodedToken = {
  user_reg_no: string;
  user_id: number;
  iat: number;
  exp: number;
};
