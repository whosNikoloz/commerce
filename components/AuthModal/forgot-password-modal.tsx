"use client";

import { useState, useRef } from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";

import { InputLoadingBtn } from "./input-loading-button";

interface ForgotPasswordProps {
  forgotData: {
    title: string;
    subText: string;
    email: string;
    button: string;
  };
  lng: string;
}

export default function ForgotPasswordModal({ forgotData, lng }: ForgotPasswordProps) {
  const forgotRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [forgotState, setForgotState] = useState({
    email: "",
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [forgotError, _setForgotError] = useState("");
  const [forgotEmailError, setForgotEmailError] = useState("");
  const [forgotEmailLoader, setForgotEmailLoader] = useState(false);
  const [forgotEmailHasBlurred, setEmailForgotHasBlurred] = useState(false);

  const validateEmail = (value: string) => value.match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}$/i);

  const handleForgotPassword = async () => {
    setIsLoading(true);
    if (forgotState.email === "") {
      setForgotEmailError(lng == "ka" ? "შეავსე ელ-ფოსტის ველი" : "Please fill in the Email field");
      setIsLoading(false);

      return;
    }

    // API call for forgot password would go here
    // For now, we'll just simulate a delay
    setTimeout(() => {
      setIsLoading(false);
      // Handle success or error
    }, 1000);
  };

  const handleForgotEmailExists = async () => {
    setForgotEmailError("");
    const isEmailValid = validateEmail(forgotState.email);

    try {
      if (forgotState.email === "") {
        setForgotEmailError("");
        setEmailForgotHasBlurred(false);

        return;
      }
      if (!isEmailValid) {
        setForgotEmailError(
          lng == "ka" ? "შეიყვანეთ ელ-ფოსტა სწორად" : "Please enter a valid email",
        );
        setEmailForgotHasBlurred(false);

        return;
      }
      setEmailForgotHasBlurred(true);
      setForgotEmailLoader(true);

      // API call would go here to check if email exists
      // For now, we'll just simulate a check delay
      setTimeout(() => {
        setForgotEmailLoader(false);
      }, 1000);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error:", error);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
        <i className="fas fa-info-circle text-blue-600 dark:text-blue-400 text-xl mt-0.5" />
        <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{forgotData.subText}</p>
      </div>

      <Input
        ref={forgotRef}
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
          forgotEmailHasBlurred ? (
            <InputLoadingBtn loading={forgotEmailLoader} success={true} />
          ) : (
            <></>
          )
        }
        errorMessage={forgotEmailError}
        isInvalid={forgotEmailError !== ""}
        label={forgotData.email}
        startContent={<i className="fas fa-envelope text-blue-500 dark:text-blue-400" />}
        type="email"
        value={forgotState.email}
        onBlur={handleForgotEmailExists}
        onChange={(e) =>
          setForgotState({
            ...forgotState,
            email: e.target.value,
          })
        }
      />

      {forgotError && (
        <div className="text-red-600 dark:text-red-400 text-sm text-center font-semibold bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 p-3 rounded-xl animate-in slide-in-from-top-2 duration-300">
          <i className="fas fa-exclamation-circle mr-2" />
          {forgotError}
        </div>
      )}

      <Button
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700 text-white font-bold py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        isLoading={isLoading}
        startContent={!isLoading && <i className="fas fa-paper-plane" />}
        onPress={handleForgotPassword}
      >
        {forgotData.button}
      </Button>
    </div>
  );
}
