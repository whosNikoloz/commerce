"use client";

import { usePathname } from "next/navigation";
export default function NotFound() {
  const pathname = usePathname();

  const language = pathname.split("/")[1];

  return (
    <>
      <h1>not found</h1>
    </>
  );
}
