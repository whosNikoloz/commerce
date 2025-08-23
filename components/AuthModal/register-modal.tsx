"use client";

import { useState, useRef } from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";

import { InputLoadingBtn } from "./input-loading-button";

interface RegisterProps {
  regData: {
    title: string;
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    button: string;
    or: string;
    facebookAuth: string;
    googleAuth: string;
    switchMode: string;
  };
  lng: string;
  onSwitchMode: (mode: string) => void;
  handleOAuth: (provider: string) => void;
}

export default function RegisterModal({ regData, lng, onSwitchMode, handleOAuth }: RegisterProps) {
  const regRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [registrationState, setRegistrationState] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [regError, setRegError] = useState("");
  const [regUserNameError, setRegUserNameError] = useState("");
  const [regEmailError, setRegEmailError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [regRegPasswordError, setRegPasswordError] = useState("");

  const [Regusernameloader, setRegusernameLoader] = useState(false);
  const [Regemailloader, setRegemailLoader] = useState(false);

  const [regUserNameHasBlurred, setRegUserNameHasBlurred] = useState(false);
  const [regEmailHasBlurred, setRegEmailHasBlurred] = useState(false);

  const validateEmail = (value: string) => value.match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}$/i);

  const handleRegistration = async () => {
    setIsLoading(true);
    if (registrationState.username === "") {
      setRegUserNameError(
        lng === "ka" ? "შეავსე სახელი ველი" : "Please fill in the UserName field",
      );
      setIsLoading(false);

      return;
    }
    if (registrationState.email === "") {
      setRegEmailError(lng == "ka" ? "შეავსე ელ-ფოსტა ველი" : "Please fill in the Email field");
      setIsLoading(false);

      return;
    }
    if (registrationState.password === "") {
      setRegError(lng == "ka" ? "შეავსე პაროლის ველი" : "Please fill in the Password field");
      setIsLoading(false);

      return;
    }
    if (registrationState.confirmPassword === "") {
      setConfirmPasswordError(
        lng == "ka"
          ? "შეავსე პაროლის დადასტურების ველი"
          : "Please fill in the ConfirmPassword field",
      );
      setIsLoading(false);

      return;
    }

    // API call for registration would go here
    // For now, we'll just simulate a registration delay
    setTimeout(() => {
      setIsLoading(false);
      // Handle successful registration or error
    }, 1000);
  };

  const handleRegisterEmailExists = async () => {
    setRegEmailError("");
    const isEmailValid = validateEmail(registrationState.email);

    try {
      if (registrationState.email === "") {
        setRegEmailError("");
        setRegEmailHasBlurred(false);

        return;
      }
      if (!isEmailValid) {
        setRegEmailError(lng == "ka" ? "შეიყვანეთ ელ-ფოსტა სწორად" : "Please enter a valid email");
        setRegEmailHasBlurred(false);

        return;
      }
      setRegEmailHasBlurred(true);
      setRegemailLoader(true);

      // API call would go here to check if email exists
      // For now, we'll just simulate a check delay
      setTimeout(() => {
        setRegemailLoader(false);
      }, 1000);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleRegisterUsernameExists = async () => {
    setRegUserNameError("");
    try {
      if (registrationState.username === "") {
        setRegUserNameError("");
        setRegUserNameHasBlurred(false);

        return;
      }

      setRegUserNameHasBlurred(true);
      setRegusernameLoader(true);

      // API call would go here to check if username exists
      // For now, we'll just simulate a check delay
      setTimeout(() => {
        setRegusernameLoader(false);
      }, 1000);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleRegEmailClear = async () => {
    setRegEmailError("");
    setRegistrationState({ ...registrationState, email: "" });
  };

  const handleRegUserNameClear = async () => {
    setRegUserNameError("");
    setRegistrationState({ ...registrationState, username: "" });
  };

  const handleBlurConfirmPassword = () => {
    if (registrationState.confirmPassword === "") return;

    if (registrationState.password !== registrationState.confirmPassword) {
      setConfirmPasswordError(lng == "ka" ? "პარლი არემთხვევა" : "Password doesnot match");
    } else {
      setConfirmPasswordError("");
    }
  };

  const handleBlurPassword = () => {
    if (registrationState.password === "") return;

    if (registrationState.password.length < 6) {
      setRegPasswordError(
        lng == "ka" ? "პაროლი უნდა იყოს 6 სიმბოლოზე მეტი" : "Password must be more than 6 symbols",
      );
    } else {
      setRegPasswordError("");
    }
  };

  const handleRegConfirmPasswordClear = async () => {
    setConfirmPasswordError("");
    setRegistrationState({ ...registrationState, confirmPassword: "" });
  };

  const handleRegPasswordClear = async () => {
    setRegPasswordError("");
    setRegistrationState({ ...registrationState, password: "" });
  };

  return (
    <div className="space-y-3">
      <Input
        ref={regRef}
        classNames={{
          input: ["text-[16px]"],
          inputWrapper: [
            "dark:bg-slate-700 bg-gray-50 shadow-sm border-2 border-gray-200 focus-within:border-blue-500 transition-colors",
            "hover:bg-gray-100 dark:hover:bg-slate-600",
          ],
          label: ["font-medium text-gray-700 dark:text-gray-200"],
        }}
        endContent={
          regUserNameHasBlurred ? (
            <InputLoadingBtn loading={Regusernameloader} success={true} />
          ) : (
            <></>
          )
        }
        errorMessage={regUserNameError}
        isInvalid={regUserNameError !== ""}
        label={regData.username}
        startContent={<i className="fas fa-user text-blue-500" />}
        type="text"
        value={registrationState.username}
        onBlur={handleRegisterUsernameExists}
        onChange={(e) =>
          setRegistrationState({
            ...registrationState,
            username: e.target.value,
          })
        }
      />
      <Input
        classNames={{
          input: ["text-[16px]"],
          inputWrapper: [
            "dark:bg-slate-700 bg-gray-50 shadow-sm border-2 border-gray-200 focus-within:border-blue-500 transition-colors",
            "hover:bg-gray-100 dark:hover:bg-slate-600",
          ],
          label: ["font-medium text-gray-700 dark:text-gray-200"],
        }}
        endContent={
          regEmailHasBlurred ? <InputLoadingBtn loading={Regemailloader} success={true} /> : <></>
        }
        errorMessage={regEmailError}
        isInvalid={regEmailError !== ""}
        label={regData.email}
        startContent={<i className="fas fa-envelope text-blue-500" />}
        type="email"
        value={registrationState.email}
        onBlur={handleRegisterEmailExists}
        onChange={(e) =>
          setRegistrationState({
            ...registrationState,
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
        errorMessage={regRegPasswordError}
        isInvalid={regRegPasswordError !== ""}
        label={regData.password}
        startContent={<i className="fas fa-lock text-blue-500" />}
        type="password"
        value={registrationState.password}
        onBlur={handleBlurPassword}
        onChange={(e) =>
          setRegistrationState({
            ...registrationState,
            password: e.target.value,
          })
        }
        onClear={handleRegPasswordClear}
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
        errorMessage={confirmPasswordError}
        isInvalid={confirmPasswordError !== ""}
        label={regData.confirmPassword}
        startContent={<i className="fas fa-lock text-blue-500" />}
        type="password"
        value={registrationState.confirmPassword}
        onBlur={handleBlurConfirmPassword}
        onChange={(e) =>
          setRegistrationState({
            ...registrationState,
            confirmPassword: e.target.value,
          })
        }
        onClear={handleRegConfirmPasswordClear}
      />

      {regError && (
        <div className="text-red-500 text-sm text-center font-medium bg-red-50 p-2 rounded-lg">
          <i className="fas fa-exclamation-circle mr-2" />
          {regError}
        </div>
      )}

      <Button
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-md transition-colors"
        isLoading={isLoading}
        startContent={<i className="fas fa-user-plus mr-2" />}
        onPress={handleRegistration}
      >
        {regData.button}
      </Button>

      <div className="flex items-center justify-center my-4">
        <div className="flex-grow border-t border-gray-300" />
        <span className="mx-4 text-gray-500 text-sm font-medium">{regData.or}</span>
        <div className="flex-grow border-t border-gray-300" />
      </div>

      <Button
        className="w-full bg-[#4267B2] hover:bg-[#365899] text-white font-bold py-3 rounded-lg shadow-md transition-colors mb-3"
        startContent={<i className="fab fa-facebook-f mr-2" />}
        onPress={() => handleOAuth("facebook")}
      >
        {regData.facebookAuth}
      </Button>

      <Button
        className="w-full bg-white border border-gray-300 hover:bg-gray-100 text-gray-800 font-bold py-3 rounded-lg shadow-md transition-colors"
        startContent={<i className="fab fa-google mr-2 text-[#4285F4]" />}
        onPress={() => handleOAuth("google")}
      >
        {regData.googleAuth}
      </Button>

      <div className="text-center mt-4">
        <button
          className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
          onClick={() => onSwitchMode("login")}
        >
          {regData.switchMode}
        </button>
      </div>
    </div>
  );
}
