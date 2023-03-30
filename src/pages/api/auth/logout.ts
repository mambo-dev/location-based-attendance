import type { NextApiRequest, NextApiResponse } from "next";

import cookie from "cookie";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  //send cookie with jwt
  res.setHeader(
    "Set-Cookie",
    cookie.serialize("access_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      maxAge: 60 * 120,
      sameSite: "strict",
      path: "/",
    })
  );

  return res.status(200).json({
    success: true,
  });
}
