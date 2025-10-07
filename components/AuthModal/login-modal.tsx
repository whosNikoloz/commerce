"use client";

import { useState, useRef } from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

import { InputLoadingBtn } from "./input-loading-button";

import {
  checkEmailLogin,
  loginWithEmail,
  type LoginResponse,
} from "@/app/api/services/authService";
import { useUser } from "@/app/context/userContext";
import { MOCK_USERS } from "@/lib/mockAuth";

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
  handleOAuth: (provider: string) => void;
  onLoginSuccess?: () => void;
}

export default function LoginModal({ loginData, lng, onSwitchMode, handleOAuth, onLoginSuccess }: LoginProps) {
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
      const res: LoginResponse = await loginWithEmail(
        loginState.email,
        loginState.password,
      );

      login(res.token);
      // Close modal after successful login
      if (onLoginSuccess) {
        onLoginSuccess();
      }
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
      // ✅ check email existance via API
      const r = await checkEmailLogin(loginState.email);

      setEmailExists(!!r?.success);
      if (!r?.success && r?.result) {
        setLoginEmailError(r.result);
        setEmailLogHasBlurred(false);
      }
    } catch {
      setLoginEmailError(lng === "ka" ? "სერვერის შეცდომა" : "Server error");
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
      // Close modal after successful mock login
      setLoginError("");
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    }
  };

  return (
    <div className="space-y-3">
      {/* Mock Login Section - for testing */}
      {!showMockUsers ? (
        <div className="mb-4">
          <button
            className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors py-2 px-4 border border-blue-200 rounded-lg hover:bg-blue-50"
            onClick={() => setShowMockUsers(true)}
          >
            🧪 {lng === "ka" ? "ტესტ იუზერები" : "Test Login (Development)"}
          </button>
        </div>
      ) : (
        <div className="mb-4 space-y-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              {lng === "ka" ? "აირჩიე ტესტ იუზერი:" : "Select Test User:"}
            </span>
            <button
              className="text-xs text-gray-500 hover:text-gray-700"
              onClick={() => setShowMockUsers(false)}
            >
              {lng === "ka" ? "დამალვა" : "Hide"}
            </button>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {MOCK_USERS.map((mockUser) => (
              <button
                key={mockUser.userId}
                className="w-full text-left p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors"
                onClick={() => handleMockLogin(mockUser.email)}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={mockUser.picture} />
                    <AvatarFallback>{mockUser.firstName[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
                      {mockUser.firstName} {mockUser.lastName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {mockUser.email}
                    </p>
                  </div>
                  <Badge variant={mockUser.role === "Admin" ? "default" : "secondary"} className="shrink-0">
                    {mockUser.role}
                  </Badge>
                </div>
              </button>
            ))}
          </div>
          <div className="text-xs text-center text-gray-500 mt-2">
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
            "dark:bg-slate-700 bg-gray-50 shadow-sm border-2 border-gray-200 focus-within:border-blue-500 transition-colors",
            "hover:bg-gray-100 dark:hover:bg-slate-600",
          ],
          label: ["font-medium text-gray-700 dark:text-gray-200"],
        }}
        endContent={
          logEmailHasBlurred ? (
            <InputLoadingBtn loading={Logloader} success={emailExists === true} />
          ) : null
        }
        errorMessage={loginEmailError}
        isInvalid={loginEmailError !== ""}
        label={loginData.email}
        startContent={<i className="fas fa-envelope text-blue-500" />}
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
            "dark:bg-slate-700 bg-gray-50 shadow-sm border-2 border-gray-200 focus-within:border-blue-500 transition-colors",
            "hover:bg-gray-100 dark:hover:bg-slate-600",
          ],
          label: ["font-medium text-gray-700 dark:text-gray-200"],
        }}
        errorMessage={loginPasswordError}
        isInvalid={loginPasswordError !== ""}
        label={loginData.password}
        startContent={<i className="fas fa-lock text-blue-500" />}
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

      <div className="flex px-1 justify-end">
        <button
          className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
          onClick={() => onSwitchMode("forgot")}
        >
          {loginData.forgotPassword}
        </button>
      </div>

      {loginError && (
        <div className="text-red-500 text-sm text-center font-medium bg-red-50 p-2 rounded-lg">
          <i className="fas fa-exclamation-circle mr-2" />
          {loginError}
        </div>
      )}

      <Button
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-md transition-colors"
        isLoading={isLoading}
        startContent={<i className="fas fa-sign-in-alt mr-2" />}
        onPress={handleLogin}
      >
        {loginData.button}
      </Button>

      <div className="flex items-center justify-center my-4">
        <div className="flex-grow border-t border-gray-300" />
        <span className="mx-4 text-gray-500 text-sm font-medium">{loginData.or}</span>
        <div className="flex-grow border-t border-gray-300" />
      </div>

      <Button
        className="w-full bg-[#4267B2] hover:bg-[#365899] text-white font-bold py-3 rounded-lg shadow-md transition-colors mb-3"
        startContent={<i className="fab fa-facebook-f mr-2" />}
        onPress={() => handleOAuth("facebook")}
      >
        {loginData.facebookAuth}
      </Button>

      <Button
        className="w-full bg-white border border-gray-300 hover:bg-gray-100 text-gray-800 font-bold py-3 rounded-lg shadow-md transition-colors"
        startContent={<i className="fab fa-google mr-2 text-[#4285F4]" />}
        onPress={() => handleOAuth("google")}
      >
        {loginData.googleAuth}
      </Button>

      <div className="text-center mt-4">
        <button
          className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
          onClick={() => onSwitchMode("register")}
        >
          {loginData.switchMode}
        </button>
      </div>
    </div>
  );
}
