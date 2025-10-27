"use client";

import { useState, useRef } from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";

import { InputLoadingBtn } from "../AuthModal/input-loading-button";

interface LoginProps {
  loginData: {
    title: string;
    email: string;
    password: string;
    button: string;
  };
  lng: string;
  onSuccess?: () => void;
}

export default function LoginModal({ loginData, lng, onSuccess }: LoginProps) {
  const loginRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loginState, setLoginState] = useState({ email: "", password: "" });

  const [loginError, setLoginError] = useState("");
  const [loginEmailError, setLoginEmailError] = useState("");
  const [loginPasswordError, setLoginPasswordError] = useState("");

  const [Logloader, setLogLoader] = useState(false);
  const [logEmailHasBlurred, setEmailLogHasBlurred] = useState(false);

  const validateEmail = (value: string) => value.match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}$/i);

  const handleLogin = async () => {
    setIsLoading(true);
    setLoginError("");

    if (loginState.email.trim() === "") {
      setLoginEmailError(lng === "ka" ? "შეავსე ელ-ფოსტის ველი" : "Please fill in the Email field");
      setIsLoading(false);

      return;
    }

    if (loginState.password.trim() === "") {
      setLoginPasswordError(
        lng === "ka" ? "შეავსე პაროლის ველი" : "Please fill in the Password field",
      );
      setIsLoading(false);

      return;
    }

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "include", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginState.email,
          password: loginState.password,
        }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || "Unauthorized");
      }
      onSuccess?.();
    } catch (err: any) {
      setLoginError(
        lng === "ka" ? "მომხმარებელი ან პაროლი არასწორია" : "Invalid email or password",
      );
    }

    setIsLoading(false);
  };

  const handleLoginEmailExists = async () => {
    setLoginEmailError("");
    const isEmailValid = validateEmail(loginState.email);

    try {
      if (loginState.email === "") {
        setLoginEmailError("");
        setEmailLogHasBlurred(false);

        return;
      }
      if (!isEmailValid) {
        setLoginEmailError(
          lng == "ka" ? "შეიყვანეთ ელ-ფოსტა სწორად" : "Please enter a valid email",
        );
        setEmailLogHasBlurred(false);

        return;
      }
      setEmailLogHasBlurred(true);
      setLogLoader(true);

      setTimeout(() => setLogLoader(false), 1000);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const onSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault(); 
    handleLogin();
  };

  const handleLoginPasswordClear = async () => {
    setLoginPasswordError("");
    setLoginState((s) => ({ ...s, password: "" }));
  };

  return (
    <form className="space-y-3" onSubmit={onSubmit}>
      <Input
        ref={loginRef}
        classNames={{
          input: ["text-[16px] text-text-light dark:text-text-lightdark"],
          inputWrapper: [
            // surface + border
            "bg-brand-surface dark:bg-brand-surfacedark shadow-sm border-2",
            "border-brand-muted dark:border-brand-muteddark",
            // focus/hover accents
            "focus-within:border-brand-primary",
            "hover:bg-brand-muted/50 dark:hover:bg-brand-muteddark/50",
            "transition-colors",
          ],
          label: ["font-medium text-text-subtle dark:text-text-subtledark"],
        }}
        endContent={
          logEmailHasBlurred ? <InputLoadingBtn loading={Logloader} success={true} /> : null
        }
        errorMessage={loginEmailError}
        isInvalid={loginEmailError !== ""}
        label={loginData.email}
        startContent={<i className="fas fa-envelope text-brand-primary" />}
        type="email"
        value={loginState.email}
        onBlur={handleLoginEmailExists}
        onChange={(e) =>
          setLoginState((s) => ({
            ...s,
            email: e.target.value,
          }))
        }
      />

      <Input
        isClearable
        classNames={{
          input: ["text-[16px] text-text-light dark:text-text-lightdark"],
          inputWrapper: [
            "bg-brand-surface dark:bg-brand-surfacedark shadow-sm border-2",
            "border-brand-muted dark:border-brand-muteddark",
            "focus-within:border-brand-primary",
            "hover:bg-brand-muted/50 dark:hover:bg-brand-muteddark/50",
            "transition-colors",
          ],
          label: ["font-medium text-text-subtle dark:text-text-subtledark"],
        }}
        errorMessage={loginPasswordError}
        isInvalid={loginPasswordError !== ""}
        label={loginData.password}
        startContent={<i className="fas fa-lock text-brand-primary" />}
        type="password"
        value={loginState.password}
        onChange={(e) =>
          setLoginState((s) => ({
            ...s,
            password: e.target.value,
          }))
        }
        onClear={handleLoginPasswordClear}
      />

      {loginError && (
        <div className="text-red-600 dark:text-red-400 text-sm text-center font-medium bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 p-2 rounded-lg">
          <i className="fas fa-exclamation-circle mr-2" />
          {loginError}
        </div>
      )}

      <Button
        className="w-full bg-brand-primary hover:bg-brand-primarydark text-white font-bold py-3 rounded-lg shadow-md transition-colors"
        isLoading={isLoading}
        startContent={<i className="fas fa-sign-in-alt mr-2" />}
        type="submit"
        onPress={handleLogin}   
      >
        {loginData.button}
      </Button>
    </form>
  );
}
