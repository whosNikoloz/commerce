"use client";

import { useState, useRef } from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";

import { InputLoadingBtn } from "./input-loading-button";

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
}

export default function LoginModal({ loginData, lng, onSwitchMode, handleOAuth }: LoginProps) {
  const loginRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loginState, setLoginState] = useState({
    email: "",
    password: "",
  });

  const [loginError, setLoginError] = useState("");
  const [loginEmailError, setLoginEmailError] = useState("");
  const [loginPasswordError, setLoginPasswordError] = useState("");

  const [Logloader, setLogLoader] = useState(false);
  const [logEmailHasBlurred, setEmailLogHasBlurred] = useState(false);

  const validateEmail = (value: string) => value.match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}$/i);

  const handleLogin = async () => {
    setIsLoading(true);
    if (loginState.email === "") {
      setLoginEmailError(lng == "ka" ? "შეავსე ელ-ფოსტის ველი" : "Please fill in the Email field");
      setIsLoading(false);

      return;
    }
    if (loginState.password === "") {
      setLoginPasswordError(
        lng == "ka" ? "შეავსე პაროლის ველი" : "Please fill in the Password field",
      );
      setIsLoading(false);

      return;
    }

    // API call for login would go here
    // For now, we'll just simulate a login delay
    setTimeout(() => {
      setIsLoading(false);
      // Handle successful login or error
    }, 1000);
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

      // API call would go here to check if email exists
      // For now, we'll just simulate a check delay
      setTimeout(() => {
        setLogLoader(false);
      }, 1000);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleLoginPasswordClear = async () => {
    setLoginPasswordError("");
    setLoginState({ ...loginState, password: "" });
  };

  return (
    <div className="space-y-3">
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
          logEmailHasBlurred ? <InputLoadingBtn loading={Logloader} success={true} /> : <></>
        }
        errorMessage={loginEmailError}
        isInvalid={loginEmailError !== ""}
        label={loginData.email}
        startContent={<i className="fas fa-envelope text-blue-500" />}
        type="email"
        value={loginState.email}
        onBlur={handleLoginEmailExists}
        onChange={(e) =>
          setLoginState({
            ...loginState,
            email: e.target.value,
          })
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
          setLoginState({
            ...loginState,
            password: e.target.value,
          })
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
