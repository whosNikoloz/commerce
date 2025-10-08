"use client";
import { useSearchParams } from "next/navigation";

export default function AuthErrorPage() {
  const params = useSearchParams();
  const error = params.get("error");

  const message =
    error === "OAuthCallback"
      ? "Google login failed — please try again."
      : "Something went wrong, please try again.";

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="p-6 bg-white rounded-xl shadow-md text-center">
        <h1 className="text-2xl font-bold mb-4">Authentication Error</h1>
        <p>{message}</p>
      </div>
    </div>
  );
}
