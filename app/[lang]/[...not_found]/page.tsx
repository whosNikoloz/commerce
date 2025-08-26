"use client";

import { CategoryCarousel } from "@/components/Home/category-carousel";
import { Link } from "lucide-react";
import { usePathname } from "next/navigation";
export default function NotFound() {
  const pathname = usePathname();

  const language = pathname.split("/")[1];

  return (
    <>
      <div className="flex items-center justify-center mt-28">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-semibold">Page Not Found</h2>
          <p className="text-muted-foreground">
            The page you’re looking for doesn’t exist or was removed.
          </p>

          <div className="mx-auto max-w-5xl">
            <CategoryCarousel />
          </div>

          <div className="mt-4 flex items-center justify-center gap-3">
            <Link className="px-4 py-2 rounded-md border" href="/">
              Go home
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
