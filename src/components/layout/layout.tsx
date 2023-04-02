import Link from "next/link";
import React from "react";
import MenuOptions from "../utils/menu";

type Props = {
  children: any;
};
const navLink: {
  link: string;
  name: string;
}[] = [
  {
    link: "/home/users",
    name: "users",
  },
  {
    link: "/home/classes",
    name: "classes",
  },
  {
    link: "/home/reports",
    name: "reports",
  },
];

export default function Layout({ children }: Props) {
  return (
    <main className="w-full min-h-screen">
      <header className="w-full bg-white h-20 shadow pr-4 flex justify-between ">
        <div className="flex items-center justify-center px-2  hover:bg-white hover:shadow-2xl h-full">
          <Link
            href="/home/users"
            className="text-3xl tracking-wide font-bold bg-clip-text text-transparent bg-gradient-to-tr from-red-500 via-green-500 to-green-700"
          >
            Muranga University
          </Link>
        </div>
        <nav className=" w-[40%] hidden md:flex h-full">
          <ul className=" flex  items-center w-full  h-full ">
            {navLink.map((nav, index: number) => (
              <Link
                href={nav.link}
                key={index}
                className="py-2 px-10 transition-all text-lg text-slate-600 hover:text-green-500 hover:underline decoration-4 decoration-green-500 "
              >
                {nav.name}
              </Link>
            ))}
          </ul>
        </nav>
        <div className=" py-2">
          <MenuOptions profileLink="/home/profile" navLinks={navLink} />
        </div>
      </header>
      {children}
    </main>
  );
}
