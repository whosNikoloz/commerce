"use client";

import { useState, useRef } from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";

import { InputLoadingBtn } from "./input-loading-button";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";


// ✅ NEW: use real CustomerAuth API (no old authService)

import { useUser } from "@/app/context/userContext";
import { MOCK_USERS } from "@/lib/mockAuth";
import { loginCustomer, validateUser } from "@/app/api/services/authService";

interface LoginProps {
  loginData: {
    title: string;
    email: string;
    password: string;
    button: string;
    forgotPassword: string;
    or: string;
    facebookAuth: string;
    googleAuth: string;
    switchMode: string;
  };
  lng: string;
  onSwitchMode: (mode: string) => void;
  handleOAuth: (provider: "google" | "facebook") => void;
  onLoginSuccess?: () => void;
}

export default function LoginModal({
  loginData,
  lng,
  onSwitchMode,
  handleOAuth,
  onLoginSuccess,
}: LoginProps) {
  const loginRef = useRef<HTMLInputElement>(null);
  const { login, simulateLogin } = useUser();

  const [isLoading, setIsLoading] = useState(false);
  const [loginState, setLoginState] = useState({ email: "", password: "" });
  const [showMockUsers, setShowMockUsers] = useState(false);

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
      setLoginEmailError(lng === "ka" ? "შეავსე ელ-ფოსტის ველი" : "Please fill in the Email field");

      return;
    }
    if (!isValidEmail(loginState.email)) {
      setLoginEmailError(lng === "ka" ? "შეიყვანეთ ელ-ფოსტა სწორად" : "Please enter a valid email");

      return;
    }
    if (!loginState.password) {
      setLoginPasswordError(
        lng === "ka" ? "შეავსე პაროლის ველი" : "Please fill in the Password field"
      );

      return;
    }

    setIsLoading(true);
    try {
      // ✅ REAL LOGIN: /CustomerAuth/login
      const { accessToken /*, refreshToken*/ } = await loginCustomer(
        loginState.email,
        loginState.password
      );

      // If your UserContext.login expects a token, pass accessToken
      login(accessToken);

      if (onLoginSuccess) onLoginSuccess();
    } catch (e: any) {
      setLoginError(typeof e?.message === "string" ? e.message : "Login failed");
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
      setLoginEmailError(lng === "ka" ? "შეიყვანეთ ელ-ფოსტა სწორად" : "Please enter a valid email");
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
          : lng === "ka"
          ? "მომხმარებელი არ მოიძებნა"
          : "Email not found"
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

  const handleMockLogin = (userEmail: string) => {
    if (simulateLogin) {
      simulateLogin(userEmail);
      setLoginError("");
      if (onLoginSuccess) onLoginSuccess();
    }
  };

  return (
    <div className="space-y-4">
      {/* Mock Login Section - for testing */}
      {!showMockUsers ? (
        <div className="mb-4">
          <button
            className="w-full text-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold transition-all duration-200 py-2.5 px-4 border-2 border-blue-200 dark:border-blue-800 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
            onClick={() => setShowMockUsers(true)}
          >
            🧪 {lng === "ka" ? "ტესტ იუზერები" : "Test Login (Development)"}
          </button>
        </div>
      ) : (
        <div className="mb-6 space-y-3 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl border border-blue-100 dark:border-blue-900">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <span className="text-lg">👤</span>
              {lng === "ka" ? "აირჩიე ტესტ იუზერი:" : "Select Test User:"}
            </span>
            <button
              className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 font-medium px-3 py-1 rounded-lg hover:bg-white/50 dark:hover:bg-slate-700/50 transition-all"
              onClick={() => setShowMockUsers(false)}
            >
              {lng === "ka" ? "დამალვა" : "Hide"}
            </button>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
            {MOCK_USERS.map((mockUser) => (
              <button
                key={mockUser.userId}
                className="w-full text-left p-3 bg-white dark:bg-slate-800 border-2 border-gray-100 dark:border-gray-700 rounded-xl hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-lg dark:hover:shadow-blue-900/20 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] group"
                onClick={() => handleMockLogin(mockUser.email)}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-11 w-11 ring-2 ring-gray-200 dark:ring-gray-700 group-hover:ring-blue-400 dark:group-hover:ring-blue-600 transition-all">
                    <AvatarImage src={mockUser.picture} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold">{mockUser.firstName[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-gray-900 dark:text-gray-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {mockUser.firstName} {mockUser.lastName}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                      {mockUser.email}
                    </p>
                  </div>
                  <Badge
                    className="shrink-0 font-semibold"
                    variant={mockUser.role === "Admin" ? "default" : "secondary"}
                  >
                    {mockUser.role}
                  </Badge>
                </div>
              </button>
            ))}
          </div>
          <div className="text-xs text-center text-gray-600 dark:text-gray-400 mt-3 py-2 px-3 bg-white/60 dark:bg-slate-700/40 rounded-lg">
            {lng === "ka"
              ? "ტესტირებისთვის - არ არის საჭირო პაროლი"
              : "For testing - No password required"}
          </div>
        </div>
      )}

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
        label={loginData.email}
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
        label={loginData.password}
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
        <button
          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-semibold transition-colors hover:underline"
          onClick={() => onSwitchMode("forgot")}
        >
          {loginData.forgotPassword}
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
        {loginData.button}
      </Button>

      <div className="flex items-center justify-center my-6">
        <div className="flex-grow h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent" />
        <span className="mx-4 text-gray-500 dark:text-gray-400 text-sm font-semibold bg-white dark:bg-slate-900 px-2">{loginData.or}</span>
        <div className="flex-grow h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent" />
      </div>

      <Button
        className="w-full bg-[#4267B2] hover:bg-[#365899] dark:bg-[#4267B2] dark:hover:bg-[#365899] text-white font-bold py-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] mb-3"
        startContent={<i className="fab fa-facebook-f" />}
        onPress={() => handleOAuth("facebook")}
      >
        {loginData.facebookAuth}
      </Button>

      <Button
        className="w-full bg-white dark:bg-slate-800 border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-800 dark:text-gray-100 font-bold py-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        startContent={<i className="fab fa-google text-[#4285F4]" />}
        onPress={() => handleOAuth("google")}
      >
        {loginData.googleAuth}
      </Button>

      <div className="text-center mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-semibold transition-colors hover:underline"
          onClick={() => onSwitchMode("register")}
        >
          {loginData.switchMode}
        </button>
      </div>
    </div>
  );
}
