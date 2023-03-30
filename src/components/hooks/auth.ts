import { useRouter } from "next/router";
import axios from "axios";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";

export const useAuth = () => {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState<string | undefined>("");
  const logout = () => {
    axios
      .get(`/api/auth/logout`, {})
      .then((response) => {
        console.log(response);
        Cookies.remove("profile");
        router.replace("/");
      })
      .catch((error) => console.error(error));
  };

  useEffect(() => {
    setImageUrl(Cookies.get("profile"));
  }, []);

  return { logout, imageUrl };
};
