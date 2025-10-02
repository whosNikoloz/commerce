"use client";

import { useState, useRef } from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";

import { InputLoadingBtn } from "./input-loading-button";

import {
  checkEmailRegister,
  checkUserNameRegister,
  registerUser,
} from "@/app/api/services/authService";

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

  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);

  const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleRegistration = async () => {
    setRegError("");
    setRegUserNameError("");
    setRegEmailError("");
    setRegPasswordError("");
    setConfirmPasswordError("");

    const { username, email, password, confirmPassword } = registrationState;

    // Basic client-side validation
    if (!username) {
      setRegUserNameError(lng === "ka" ? "შეავსე სახელი ველი" : "Please fill in the UserName field");

      return;
    }
    if (!email) {
      setRegEmailError(lng === "ka" ? "შეავსე ელ-ფოსტა ველი" : "Please fill in the Email field");

      return;
    }
    if (!isValidEmail(email)) {
      setRegEmailError(lng === "ka" ? "შეიყვანეთ ელ-ფოსტა სწორად" : "Please enter a valid email");

      return;
    }
    if (!password) {
      setRegError(lng === "ka" ? "შეავსე პაროლის ველი" : "Please fill in the Password field");

      return;
    }
    if (password.length < 6) {
      setRegPasswordError(
        lng === "ka" ? "პაროლი უნდა იყოს 6 სიმბოლოზე მეტი" : "Password must be more than 6 symbols"
      );

      return;
    }
    if (!confirmPassword) {
      setConfirmPasswordError(
        lng === "ka"
          ? "შეავსე პაროლის დადასტურების ველი"
          : "Please fill in the ConfirmPassword field"
      );

      return;
    }
    if (password !== confirmPassword) {
      setConfirmPasswordError(lng === "ka" ? "პაროლი არ ემთხვევა" : "Passwords do not match");

      return;
    }

    setIsLoading(true);
    try {
      // 🔐 Register via API
      await registerUser(username, email, password, confirmPassword);

      // Success → switch to login screen (or auto-login if your API returns a token)
      onSwitchMode("login");
    } catch (e: any) {
      setRegError(typeof e?.message === "string" ? e.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterEmailExists = async () => {
    setRegEmailError("");
    setEmailAvailable(null);

    const email = registrationState.email;

    if (!email) {
      setRegEmailHasBlurred(false);

      return;
    }
    if (!isValidEmail(email)) {
      setRegEmailError(lng === "ka" ? "შეიყვანეთ ელ-ფოსტა სწორად" : "Please enter a valid email");
      setRegEmailHasBlurred(false);

      return;
    }

    setRegEmailHasBlurred(true);
    setRegemailLoader(true);
    try {
      // ✅ check availability (API returns { success: boolean } semantics)
      const r = await checkEmailRegister(email);
      const ok = !!r?.success;

      setEmailAvailable(ok);

      if (!ok && (r as any)?.result) {
        // e.g. “email already exists”
        setRegEmailError((r as any).result);
        setRegEmailHasBlurred(false);
      }
    } catch {
      setRegEmailError(lng === "ka" ? "სერვერის შეცდომა" : "Server error");
      setRegEmailHasBlurred(false);
    } finally {
      setRegemailLoader(false);
    }
  };

  const handleRegisterUsernameExists = async () => {
    setRegUserNameError("");
    setUsernameAvailable(null);

    const username = registrationState.username;

    if (!username) {
      setRegUserNameHasBlurred(false);

      return;
    }

    setRegUserNameHasBlurred(true);
    setRegusernameLoader(true);
    try {
      const r = await checkUserNameRegister(username);
      const ok = !!r?.success;

      setUsernameAvailable(ok);

      if (!ok && (r as any)?.result) {
        setRegUserNameError((r as any).result);
        setRegUserNameHasBlurred(false);
      }
    } catch {
      setRegUserNameError(lng === "ka" ? "სერვერის შეცდომა" : "Server error");
      setRegUserNameHasBlurred(false);
    } finally {
      setRegusernameLoader(false);
    }
  };

  const handleRegEmailClear = () => {
    setRegEmailError("");
    setRegistrationState((s) => ({ ...s, email: "" }));
    setRegEmailHasBlurred(false);
    setEmailAvailable(null);
  };

  const handleRegUserNameClear = () => {
    setRegUserNameError("");
    setRegistrationState((s) => ({ ...s, username: "" }));
    setRegUserNameHasBlurred(false);
    setUsernameAvailable(null);
  };

  const handleBlurConfirmPassword = () => {
    const { password, confirmPassword } = registrationState;

    if (!confirmPassword) return;
    setConfirmPasswordError(
      password !== confirmPassword
        ? lng === "ka" ? "პაროლი არ ემთხვევა" : "Passwords do not match"
        : ""
    );
  };

  const handleBlurPassword = () => {
    const { password } = registrationState;

    if (!password) return;
    setRegPasswordError(
      password.length < 6
        ? (lng === "ka"
          ? "პაროლი უნდა იყოს 6 სიმბოლოზე მეტი"
          : "Password must be more than 6 symbols")
        : ""
    );
  };

  const handleRegConfirmPasswordClear = () => {
    setConfirmPasswordError("");
    setRegistrationState((s) => ({ ...s, confirmPassword: "" }));
  };

  const handleRegPasswordClear = () => {
    setRegPasswordError("");
    setRegistrationState((s) => ({ ...s, password: "" }));
  };

  return (
    <div className="space-y-3">
      <Input
        ref={regRef}
        isClearable
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
            <InputLoadingBtn loading={Regusernameloader} success={usernameAvailable === true} />
          ) : null
        }
        errorMessage={regUserNameError}
        isInvalid={regUserNameError !== ""}
        label={regData.username}
        startContent={<i className="fas fa-user text-blue-500" />}
        type="text"
        value={registrationState.username}
        onBlur={handleRegisterUsernameExists}
        onChange={(e) =>
          setRegistrationState((s) => ({
            ...s,
            username: e.target.value,
          }))
        }
        onClear={handleRegUserNameClear}
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
        endContent={
          regEmailHasBlurred ? (
            <InputLoadingBtn loading={Regemailloader} success={emailAvailable === true} />
          ) : null
        }
        errorMessage={regEmailError}
        isInvalid={regEmailError !== ""}
        label={regData.email}
        startContent={<i className="fas fa-envelope text-blue-500" />}
        type="email"
        value={registrationState.email}
        onBlur={handleRegisterEmailExists}
        onChange={(e) =>
          setRegistrationState((s) => ({
            ...s,
            email: e.target.value,
          }))
        }
        onClear={handleRegEmailClear}
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
          setRegistrationState((s) => ({
            ...s,
            password: e.target.value,
          }))
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
          setRegistrationState((s) => ({
            ...s,
            confirmPassword: e.target.value,
          }))
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
