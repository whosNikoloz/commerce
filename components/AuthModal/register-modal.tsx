"use client";

import { useState, useRef } from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";

import { InputLoadingBtn } from "./input-loading-button";

import { OAuthButtons } from "@/components/auth/OAuthButtons";
import { registerCustomer } from "@/app/api/services/authService";

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
}

export default function RegisterModal({ regData, lng, onSwitchMode }: RegisterProps) {
  const regRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
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

  // ✅ ორსაფეხურიანი რეგისტრაცია — კოდის მოთხოვნა/დადასტურება
  const [codeRequested, setCodeRequested] = useState(false);
  const [verifyCode, setVerifyCode] = useState("");

  // UI ბეჯები/ლოუდერები დატოვე სურვილისამებრ—ახლა API-ჩეკები ამოღებულია
  const [Regusernameloader] = useState(false);
  const [Regemailloader] = useState(false);
  const [regUserNameHasBlurred] = useState(false);
  const [regEmailHasBlurred] = useState(false);
  const [usernameAvailable] = useState<boolean | null>(null);
  const [emailAvailable] = useState<boolean | null>(null);

  const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleSendCode = async () => {
    setRegError("");
    setRegEmailError("");

    const { email } = registrationState;

    if (!email) {
      setRegEmailError(lng === "ka" ? "შეავსე ელ-ფოსტა ველი" : "Please fill in the Email field");

      return;
    }
    if (!isValidEmail(email)) {
      setRegEmailError(lng === "ka" ? "შეიყვანეთ ელ-ფოსტა სწორად" : "Please enter a valid email");

      return;
    }

    setIsSendingCode(true);
    try {
      // Call endpoint to send verification code
      await registerCustomer({
        firstName: registrationState.username || "User",
        lastName: "",
        email,
        password: registrationState.password || "temporary",
        verifyCode: 0, // 0 means request code
      });
      setCodeRequested(true);
    } catch (e: any) {
      setRegError(typeof e?.message === "string" ? e.message : "Failed to send code");
    } finally {
      setIsSendingCode(false);
    }
  };

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
        lng === "ka" ? "შეავსე პაროლის დადასტურების ველი" : "Please fill in the ConfirmPassword field"
      );

      return;
    }
    if (password !== confirmPassword) {
      setConfirmPasswordError(lng === "ka" ? "პაროლი არ ემთხვევა" : "Passwords do not match");

      return;
    }

    // Ensure code has been requested before allowing registration
    if (!codeRequested) {
      setRegError(lng === "ka" ? "გთხოვთ ჯერ გამოითხოვოთ კოდი" : "Please request verification code first");

      return;
    }

    if (!verifyCode) {
      setRegError(lng === "ka" ? "შეიყვანეთ დადასტურების კოდი" : "Please enter verification code");

      return;
    }

    setIsLoading(true);
    try {
      // Submit with verification code
      const tokens = await registerCustomer({
        firstName: username,
        lastName: "",
        email,
        password,
        verifyCode: Number(verifyCode) || 0,
      });

      onSwitchMode("login");
    } catch (e: any) {
      setRegError(typeof e?.message === "string" ? e.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
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

  const handleRegEmailClear = () => {
    setRegEmailError("");
    setRegistrationState((s) => ({ ...s, email: "" }));
  };

  const handleRegUserNameClear = () => {
    setRegUserNameError("");
    setRegistrationState((s) => ({ ...s, username: "" }));
  };

  return (
    <div className="space-y-4">
      <Input
        ref={regRef}
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
        endContent={
          regUserNameHasBlurred ? (
            <InputLoadingBtn loading={Regusernameloader} success={usernameAvailable === true} />
          ) : null
        }
        errorMessage={regUserNameError}
        isInvalid={regUserNameError !== ""}
        label={regData.username}
        startContent={<i className="fas fa-user text-blue-500 dark:text-blue-400" />}
        type="text"
        value={registrationState.username}
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
            "dark:bg-slate-800/50 bg-white shadow-sm border-2 border-gray-200 dark:border-gray-700 focus-within:!border-blue-500 dark:focus-within:!border-blue-400 transition-all duration-200",
            "hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md",
            "rounded-xl",
          ],
          label: ["font-semibold text-gray-700 dark:text-gray-200"],
        }}
        errorMessage={regRegPasswordError}
        isInvalid={regRegPasswordError !== ""}
        label={regData.password}
        startContent={<i className="fas fa-lock text-blue-500 dark:text-blue-400" />}
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
            "dark:bg-slate-800/50 bg-white shadow-sm border-2 border-gray-200 dark:border-gray-700 focus-within:!border-blue-500 dark:focus-within:!border-blue-400 transition-all duration-200",
            "hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md",
            "rounded-xl",
          ],
          label: ["font-semibold text-gray-700 dark:text-gray-200"],
        }}
        errorMessage={confirmPasswordError}
        isInvalid={confirmPasswordError !== ""}
        label={regData.confirmPassword}
        startContent={<i className="fas fa-lock text-blue-500 dark:text-blue-400" />}
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

      {/* Email field */}
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
        endContent={
          regEmailHasBlurred ? (
            <InputLoadingBtn loading={Regemailloader} success={emailAvailable === true} />
          ) : null
        }
        errorMessage={regEmailError}
        isInvalid={regEmailError !== ""}
        label={regData.email}
        startContent={<i className="fas fa-envelope text-blue-500 dark:text-blue-400" />}
        type="email"
        value={registrationState.email}
        onChange={(e) =>
          setRegistrationState((s) => ({
            ...s,
            email: e.target.value,
          }))
        }
        onClear={handleRegEmailClear}
      />

      {/* Verification code field with Send Code button on the right */}
      <div className="space-y-2">
        {codeRequested && (
          <div className="flex items-center gap-2 px-2">
            <i className="fas fa-check-circle text-green-600 dark:text-green-400 text-sm" />
            <p className="text-xs font-semibold text-green-800 dark:text-green-200">
              {lng === "ka" ? "კოდი გაიგზავნა თქვენს მეილზე!" : "Verification code sent to your email!"}
            </p>
          </div>
        )}
        <div className="flex gap-2">
          <Input
            isClearable
            classNames={{
              input: ["text-[16px] font-mono tracking-wider"],
              inputWrapper: [
                codeRequested
                  ? "dark:bg-slate-800/50 bg-white shadow-sm border-2 border-green-300 dark:border-green-700 focus-within:!border-green-500 dark:focus-within:!border-green-400 transition-all duration-200 hover:border-green-400 dark:hover:border-green-600 hover:shadow-md rounded-xl"
                  : "dark:bg-slate-800/50 bg-white shadow-sm border-2 border-gray-200 dark:border-gray-700 focus-within:!border-blue-500 dark:focus-within:!border-blue-400 transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md rounded-xl",
              ],
              label: ["font-semibold text-gray-700 dark:text-gray-200"],
            }}
            label={lng === "ka" ? "დადასტურების კოდი" : "Verification Code"}
            placeholder="000000"
            startContent={<i className={`fas fa-key ${codeRequested ? "text-green-500 dark:text-green-400" : "text-blue-500 dark:text-blue-400"}`} />}
            type="tel"
            value={verifyCode}
            onChange={(e) => setVerifyCode(e.target.value)}
            onClear={() => setVerifyCode("")}
          />
          {isValidEmail(registrationState.email) && !codeRequested && (
            <Button
              className="min-w-fit bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 dark:from-green-500 dark:to-green-600 dark:hover:from-green-600 dark:hover:to-green-700 text-white font-bold px-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              isLoading={isSendingCode}
              onPress={handleSendCode}
            >
              {!isSendingCode && <i className="fas fa-paper-plane" />}
            </Button>
          )}
        </div>
      </div>

      {regError && (
        <div className="text-red-600 dark:text-red-400 text-sm text-center font-semibold bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 p-3 rounded-xl animate-in slide-in-from-top-2 duration-300">
          <i className="fas fa-exclamation-circle mr-2" />
          {regError}
        </div>
      )}

      <Button
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700 text-white font-bold py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        isLoading={isLoading}
        startContent={!isLoading && <i className={codeRequested ? "fas fa-check-circle" : "fas fa-user-plus"} />}
        onPress={handleRegistration}
      >
        {!codeRequested
          ? regData.button // „რეგისტრაცია" (კოდის გაგზავნა)
          : (lng === "ka" ? "დადასტურება" : "Confirm")} {/* მეორე ეტაპი */}
      </Button>

      <div className="flex items-center justify-center my-6">
        <div className="flex-grow h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent" />
        <span className="mx-4 text-gray-500 dark:text-gray-400 text-sm font-semibold bg-white dark:bg-slate-900 px-2">{regData.or}</span>
        <div className="flex-grow h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent" />
      </div>

      <OAuthButtons onSuccess={() => onSwitchMode("login")} />

      <div className="text-center mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-semibold transition-colors hover:underline"
          onClick={() => onSwitchMode("login")}
        >
          {regData.switchMode}
        </button>
      </div>
    </div>
  );
}
