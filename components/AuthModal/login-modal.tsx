"use client";

import { useState, useRef } from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";

import { InputLoadingBtn } from "./input-loading-button";

import { OAuthButtons } from "@/components/auth/OAuthButtons";
import { useUser } from "@/app/context/userContext";
import { validateUser } from "@/app/api/services/authService";
import { useDictionary } from "@/app/context/dictionary-provider";

interface LoginProps {
  onSwitchMode: (mode: string) => void;
  onLoginSuccess?: () => void;
}

export default function LoginModal({
  onSwitchMode,
  onLoginSuccess,
}: LoginProps) {
  const dictionary = useDictionary();
  const loginRef = useRef<HTMLInputElement>(null);
  const { login } = useUser();

  const [isLoading, setIsLoading] = useState(false);
  const [loginState, setLoginState] = useState({ email: "", password: "" });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_showMockUsers, _setShowMockUsers] = useState(false);

  const [loginError, setLoginError] = useState("");
  const [loginEmailError, setLoginEmailError] = useState("");
  const [loginPasswordError, setLoginPasswordError] = useState("");

  const [logEmailHasBlurred, setEmailLogHasBlurred] = useState(false);
  const [Logloader, setLogLoader] = useState(false);
  const [emailExists, setEmailExists] = useState<boolean | null>(null);

  const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleLogin = async () => {
    setLoginError("");
    setLoginEmailError("");
    setLoginPasswordError("");

    // basic validation
    if (!loginState.email) {
      setLoginEmailError(dictionary.auth.login.fillEmail);

      return;
    }
    if (!isValidEmail(loginState.email)) {
      setLoginEmailError(dictionary.auth.login.invalidEmail);

      return;
    }
    if (!loginState.password) {
      setLoginPasswordError(dictionary.auth.login.fillPassword);

      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/customer-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginState.email, password: loginState.password }),
        credentials: "same-origin",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));

        throw new Error(data.message || dictionary.auth.login.loginFailed);
      }

      await login();

      if (onLoginSuccess) onLoginSuccess();
    } catch (e: any) {
      setLoginError(typeof e?.message === "string" ? e.message : dictionary.auth.login.loginFailed);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginEmailExists = async () => {
    setLoginEmailError("");
    setEmailExists(null);

    if (!loginState.email) {
      setEmailLogHasBlurred(false);

      return;
    }
    if (!isValidEmail(loginState.email)) {
      setLoginEmailError(dictionary.auth.login.invalidEmail);
      setEmailLogHasBlurred(false);

      return;
    }

    setEmailLogHasBlurred(true);
    setLogLoader(true);
    try {
      // ✅ REAL PRE-CHECK: /CustomerAuth/validateUser (password is optional in DTO)
      await validateUser(loginState.email);
      setEmailExists(true);
    } catch (err: any) {
      setEmailExists(false);
      // Optionally show returned message if backend sends a clear reason
      setLoginEmailError(
        typeof err?.message === "string"
          ? err.message
          : dictionary.auth.login.userNotFound
      );
      setEmailLogHasBlurred(false);
    } finally {
      setLogLoader(false);
    }
  };

  const handleLoginPasswordClear = () => {
    setLoginPasswordError("");
    setLoginState((s) => ({ ...s, password: "" }));
  };

  return (
    <div className="space-y-4">
      <Input
        ref={loginRef}
        classNames={{
          input: ["text-[16px]"],
          inputWrapper: [
            "dark:bg-slate-800/50 bg-white shadow-sm border-2 border-gray-200 dark:border-gray-700 focus-within:!border-blue-500 dark:focus-within:!border-blue-400 transition-all duration-200",
            "hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md",
            "rounded-xl",
          ],
          label: ["font-semibold text-gray-700 dark:text-gray-200"],
        }}
        endContent={
          logEmailHasBlurred ? (
            <InputLoadingBtn loading={Logloader} success={emailExists === true} />
          ) : null
        }
        errorMessage={loginEmailError}
        isInvalid={loginEmailError !== ""}
        label={dictionary.auth.login.email}
        startContent={<i className="fas fa-envelope text-blue-500 dark:text-blue-400" />}
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
          input: ["text-[16px]"],
          inputWrapper: [
            "dark:bg-slate-800/50 bg-white shadow-sm border-2 border-gray-200 dark:border-gray-700 focus-within:!border-blue-500 dark:focus-within:!border-blue-400 transition-all duration-200",
            "hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md",
            "rounded-xl",
          ],
          label: ["font-semibold text-gray-700 dark:text-gray-200"],
        }}
        errorMessage={loginPasswordError}
        isInvalid={loginPasswordError !== ""}
        label={dictionary.auth.login.password}
        startContent={<i className="fas fa-lock text-blue-500 dark:text-blue-400" />}
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

      <div className="flex px-1 justify-end -mt-1">
        <button className="font-primary text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-semibold transition-colors hover:underline"
          onClick={() => onSwitchMode("forgot")}
        >
          {dictionary.auth.login.forgotPassword}
        </button>
      </div>

      {loginError && (
        <div className="text-red-600 dark:text-red-400 text-sm text-center font-semibold bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 p-3 rounded-xl animate-in slide-in-from-top-2 duration-300">
          <i className="fas fa-exclamation-circle mr-2" />
          {loginError}
        </div>
      )}

      <Button
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700 text-white font-bold py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        isLoading={isLoading}
        startContent={!isLoading && <i className="fas fa-sign-in-alt" />}
        onPress={handleLogin}
      >
        {dictionary.auth.login.button}
      </Button>

      <div className="flex items-center justify-center my-6">
        <div className="flex-grow h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent" />
        <span className="font-primary mx-4 text-gray-500 dark:text-gray-400 text-sm font-semibold bg-white dark:bg-slate-900 px-2">{dictionary.auth.login.or}</span>
        <div className="flex-grow h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent" />
      </div>

      <OAuthButtons variant="flat" onSuccess={onLoginSuccess} />

      <div className="text-center mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button className="font-primary text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-semibold transition-colors hover:underline"
          onClick={() => onSwitchMode("register")}
        >
          {dictionary.auth.login.switchMode}
        </button>
      </div>
    </div>
  );
}
