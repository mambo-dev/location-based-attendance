import React from "react";

type Props = {
  children: any;
  centered?: boolean;
};

export default function Container({ children, centered }: Props) {
  return (
    <main
      className={`w-full h-screen flex flex-col  items-center  ${
        centered && "justify-center"
      } `}
    >
      {children}
    </main>
  );
}
