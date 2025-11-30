"use client";

import { useState, useRef } from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";

import { InputLoadingBtn } from "./input-loading-button";

import { OAuthButtons } from "@/components/auth/OAuthButtons";
import { registerCustomer, sendVerificationCode } from "@/app/api/services/authService";
import { useDictionary } from "@/app/context/dictionary-provider";

interface RegisterProps {
  onSwitchMode: (mode: string) => void;
}

export default function RegisterModal({ onSwitchMode }: RegisterProps) {
  const dictionary = useDictionary();
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

  // Password validation function
  const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (password.length < 6) {
      errors.push(dictionary.auth.register.passwordRequirements.minChars);
    }
    if (!/[0-9]/.test(password)) {
      errors.push(dictionary.auth.register.passwordRequirements.digit);
    }
    if (!/[a-z]/.test(password)) {
      errors.push(dictionary.auth.register.passwordRequirements.lower);
    }
    if (!/[A-Z]/.test(password)) {
      errors.push(dictionary.auth.register.passwordRequirements.upper);
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push(dictionary.auth.register.passwordRequirements.special);
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  };

  const handleSendCode = async () => {
    setRegError("");
    setRegEmailError("");

    const { email } = registrationState;

    if (!email) {
      setRegEmailError(dictionary.auth.register.fillEmail);

      return;
    }
    if (!isValidEmail(email)) {
      setRegEmailError(dictionary.auth.register.invalidEmail);

      return;
    }

    setIsSendingCode(true);
    try {
      // Call endpoint to send verification code
      await sendVerificationCode(email);
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
      setRegUserNameError(dictionary.auth.register.fillUsername);

      return;
    }
    if (!email) {
      setRegEmailError(dictionary.auth.register.fillEmail);

      return;
    }
    if (!isValidEmail(email)) {
      setRegEmailError(dictionary.auth.register.invalidEmail);

      return;
    }
    if (!password) {
      setRegError(dictionary.auth.register.fillPassword);

      return;
    }

    // Validate password with all rules
    const passwordValidation = validatePassword(password);

    if (!passwordValidation.isValid) {
      setRegPasswordError(passwordValidation.errors.join(", "));

      return;
    }
    if (!confirmPassword) {
      setConfirmPasswordError(dictionary.auth.register.fillConfirmPassword);

      return;
    }
    if (password !== confirmPassword) {
      setConfirmPasswordError(dictionary.auth.register.passwordsDoNotMatch);

      return;
    }

    // Ensure code has been requested before allowing registration
    if (!codeRequested) {
      setRegError(dictionary.auth.register.requestCodeFirst);

      return;
    }

    if (!verifyCode) {
      setRegError(dictionary.auth.register.enterCode);

      return;
    }

    setIsLoading(true);
    try {
      // Submit with verification code
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _tokens = await registerCustomer({
        firstName: username,
        lastName: "",
        email,
        password,
        verifyCode: Number(verifyCode) || 0,
      });

      onSwitchMode("login");
    } catch (e: any) {
      setRegError(typeof e?.message === "string" ? e.message : dictionary.auth.register.registrationFailed);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBlurConfirmPassword = () => {
    const { password, confirmPassword } = registrationState;

    if (!confirmPassword) return;
    setConfirmPasswordError(
      password !== confirmPassword
        ? dictionary.auth.register.passwordsDoNotMatch
        : ""
    );
  };

  const handleBlurPassword = () => {
    const { password } = registrationState;

    if (!password) return;

    const passwordValidation = validatePassword(password);

    setRegPasswordError(
      passwordValidation.isValid ? "" : passwordValidation.errors.join(", ")
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
        label={dictionary.auth.register.username}
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

      <div className="space-y-2">
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
          label={dictionary.auth.register.password}
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
        {/* Compact password requirements */}
        {registrationState.password && (
          <div className="px-2 py-1.5 bg-gray-50/50 dark:bg-slate-800/20 rounded-lg">
            <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px]">
              <div className="flex items-center gap-1">
                <i className={`fas fa-xs ${registrationState.password.length >= 6 ? "fa-check text-green-600 dark:text-green-400" : "fa-times text-gray-400"}`} />
                <span className={registrationState.password.length >= 6 ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-500"}>
                  {dictionary.auth.register.passwordRequirements.minChars}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <i className={`fas fa-xs ${/[0-9]/.test(registrationState.password) ? "fa-check text-green-600 dark:text-green-400" : "fa-times text-gray-400"}`} />
                <span className={/[0-9]/.test(registrationState.password) ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-500"}>
                  {dictionary.auth.register.passwordRequirements.digit}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <i className={`fas fa-xs ${/[a-z]/.test(registrationState.password) ? "fa-check text-green-600 dark:text-green-400" : "fa-times text-gray-400"}`} />
                <span className={/[a-z]/.test(registrationState.password) ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-500"}>
                  {dictionary.auth.register.passwordRequirements.lower}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <i className={`fas fa-xs ${/[A-Z]/.test(registrationState.password) ? "fa-check text-green-600 dark:text-green-400" : "fa-times text-gray-400"}`} />
                <span className={/[A-Z]/.test(registrationState.password) ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-500"}>
                  {dictionary.auth.register.passwordRequirements.upper}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <i className={`fas fa-xs ${/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(registrationState.password) ? "fa-check text-green-600 dark:text-green-400" : "fa-times text-gray-400"}`} />
                <span className={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(registrationState.password) ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-500"}>
                  {dictionary.auth.register.passwordRequirements.special}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

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
        label={dictionary.auth.register.confirmPassword}
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
        label={dictionary.auth.register.email}
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
            <p className="font-primary text-xs font-semibold text-green-800 dark:text-green-200">
              {dictionary.auth.register.codeSent}
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
            label={dictionary.auth.register.verificationCode}
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
          ? dictionary.auth.register.button
          : dictionary.auth.register.confirm}
      </Button>

      <div className="flex items-center justify-center my-6">
        <div className="flex-grow h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent" />
        <span className="font-primary mx-4 text-gray-500 dark:text-gray-400 text-sm font-semibold bg-white dark:bg-slate-900 px-2">{dictionary.auth.register.or}</span>
        <div className="flex-grow h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent" />
      </div>

      <OAuthButtons onSuccess={() => onSwitchMode("login")} />

      <div className="text-center mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button className="font-primary text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-semibold transition-colors hover:underline"
          onClick={() => onSwitchMode("login")}
        >
          {dictionary.auth.register.switchMode}
        </button>
      </div>
    </div>
  );
}
