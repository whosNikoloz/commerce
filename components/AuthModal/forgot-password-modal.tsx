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

  const [forgotError, setForgotError] = useState("");
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
      console.error("Error:", error);
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{forgotData.subText}</p>

      <Input
        ref={forgotRef}
        classNames={{
          input: ["text-[16px]"],
          inputWrapper: [
            "dark:bg-slate-700 bg-gray-50 shadow-sm border-2 border-gray-200 focus-within:border-blue-500 transition-colors",
            "hover:bg-gray-100 dark:hover:bg-slate-600",
          ],
          label: ["font-medium text-gray-700 dark:text-gray-200"],
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
        startContent={<i className="fas fa-envelope text-blue-500" />}
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
        <div className="text-red-500 text-sm text-center font-medium bg-red-50 p-2 rounded-lg">
          <i className="fas fa-exclamation-circle mr-2" />
          {forgotError}
        </div>
      )}

      <Button
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-md transition-colors"
        isLoading={isLoading}
        startContent={<i className="fas fa-envelope mr-2" />}
        onPress={handleForgotPassword}
      >
        {forgotData.button}
      </Button>
    </div>
  );
}
