"use client";

import { useSearchParams, useParams } from "next/navigation";

import { useDictionary } from "@/app/context/dictionary-provider";

export default function AuthErrorPage() {
  const params = useSearchParams();
  const { lang } = useParams<{ lang?: string }>();
  const currentLang = lang || "en";

  const dict = useDictionary();
  const t = dict.auth.errorPage;

  const error = params.get("error");

  const message =
    error === "OAuthCallback"
      ? t.googleFailed
      : t.genericFailed;

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-surface dark:bg-brand-surfacedark">
      <div className="p-6 bg-white dark:bg-slate-900 rounded-xl shadow-md text-center text-text-light dark:text-text-lightdark">
        <h1 className="text-2xl font-bold mb-4">{t.title}</h1>
        <p className="mb-4">{message}</p>

        <a
          className="inline-block mt-2 px-4 py-2 rounded-md bg-brand-primary text-white hover:opacity-90 transition"
          href={`/${currentLang}`}
        >
          {t.goHome}
        </a>
      </div>
    </div>
  );
}
