"use client";

import NextLink from "next/link";
import { useParams } from "next/navigation";
import { Home } from "lucide-react";
import { CategoryGrid } from "@/components/Home/category-grid";

const copy = {
  en: {
    title: "Page Not Found",
    desc: "The page you’re looking for doesn’t exist or was removed.",
    home: "Go home",
  },
  ka: {
    title: "გვერდი ვერ მოიძებნა",
    desc: "საძიებელი გვერდი არ არსებობს ან წაიშალა.",
    home: "მთავარზე დაბრუნება",
  },
};

export default function NotFound() {
  const { lang } = useParams<{ lang?: "en" | "ka" }>();
  const t = lang === "ka" ? copy.ka : copy.en;
  const homeHref = `/${lang ?? "en"}`;

  return (
    <div className="mt-28 flex items-center justify-center px-4">
      <div className="text-center space-y-6 w-full max-w-6xl">
        <h2 className="text-2xl font-semibold">{t.title}</h2>
        <p className="text-muted-foreground">{t.desc}</p>

        <div className="mx-auto max-w-5xl">
          <CategoryGrid />
        </div>

        <div className="mt-2 flex items-center justify-center">
          <NextLink
            className="inline-flex items-center gap-2 rounded-md border px-4 py-2 hover:bg-muted transition"
            href={homeHref}
          >
            <Home className="h-4 w-4" />
            {t.home}
          </NextLink>
        </div>
      </div>
    </div>
  );
}
