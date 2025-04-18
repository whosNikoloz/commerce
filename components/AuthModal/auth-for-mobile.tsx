"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/modal";
import Link from "next/link";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";

import { HomeIcon, ProfileIcon, SearchIcon } from "../icons";
import Cartlink from "../Cart/cart-link";

import { InputLoadingBtn } from "./input-loading-button";

const AuthData = {
  ka: {
    regData: {
      title: "რეგისტრაცია",
      username: "სახელი",
      email: "ელ-ფოსტა",
      password: "პაროლი",
      confirmPassword: "პაროლის დადასტურება",
      button: "რეგისტრაცია", // Fixed spelling
      or: "ან",
      facebookAuth: "Facebook-ით რეგისტრაცია",
      googleAuth: "Google-ით რეგისტრაცია",
      switchMode: "შესვლაზე გადასვლა",
    },
    loginData: {
      title: "შესვლა",
      email: "ელ-ფოსტა",
      password: "პაროლი",
      button: "შესვლა",
      forgotPassword: "პაროლი დაგავიწყდათ?",
      or: "ან",
      facebookAuth: "Facebook-ით შესვლა",
      googleAuth: "Google-ით შესვლა",
      switchMode: "რეგისტრაციაზე გადასვლა",
    },
  },
  en: {
    regData: {
      title: "Sign Up",
      username: "Username",
      email: "Email",
      password: "Password",
      confirmPassword: "Confirm Password",
      button: "Sign Up",
      or: "or",
      facebookAuth: "Sign up with Facebook",
      googleAuth: "Sign up with Google",
      switchMode: "Switch to Login",
    },
    loginData: {
      title: "Sign In",
      email: "Email",
      password: "Password",
      button: "Sign In",
      forgotPassword: "Forgot Password?",
      or: "or",
      facebookAuth: "Sign in with Facebook",
      googleAuth: "Sign in with Google",
      switchMode: "Switch to Register",
    },
  },
};

export default function AuthForMobile() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [loginMode, setLoginMode] = useState(true); // Default to login mode
  const lng = "ka";
  const { regData, loginData } = AuthData[lng];
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);

  const [registrationState, setRegistrationState] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loginState, setLoginState] = useState({
    email: "",
    password: "",
  });

  const [loginError, setLoginError] = useState("");
  const [regError, setRegError] = useState("");

  const [regUserNameError, setRegUserNameError] = useState("");
  const [regEmailError, setRegEmailError] = useState("");

  const [loginEmailError, setLoginEmailError] = useState("");
  const [loginPasswordError, setLoginPasswordError] = useState("");

  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const [regRegPasswordError, setRegPasswordError] = useState("");

  const [Logloader, setLogLoader] = useState(false);

  const [Regusernameloader, setRegusernameLoader] = useState(false);

  const [Regemailloader, setRegemailLoader] = useState(false);

  const [regUserNameHasBlurred, setRegUserNameHasBlurred] = useState(false);

  const [regEmailHasBlurred, setRegEmailHasBlurred] = useState(false);

  const [logEmailHasBlurred, setEmailLogHasBlurred] = useState(false);

  const loginRef = useRef<HTMLInputElement>(null);
  const regRef = useRef<HTMLInputElement>(null);

  //const auth = Authentication();

  const handleLogin = async () => {
    setIsLoading(true);
    if (loginState.email === "") {
      setLoginEmailError(
        lng == "ka"
          ? "შეავსე ელ-ფოსტის ველი"
          : "Please fill in the Email field",
      );
      setIsLoading(false);

      return;
    }
    if (loginState.password === "") {
      setLoginPasswordError(
        lng == "ka"
          ? "შეავსე პაროლის ველი"
          : "Please fill in the Password field",
      );
      setIsLoading(false);

      return;
    }
    // const response = (await auth.handleLogin(
    //   loginState.email,
    //   loginState.password,
    // )) as ApiResponse;

    // if (!response.success) {
    //   setLoginError(response.result || "login failed");
    //   setIsLoading(false);
    // } else {
    //   setIsLoading(false);
    //   onCloseLogin();
    // }
  };

  const handleOAuth = async (provider: string) => {
    const callbackUrl = "/user/auth/oauth";

    //await signIn(provider, { callbackUrl });
  };

  const handleRegistration = async () => {
    setIsLoading(true);
    if (registrationState.username === "") {
      setRegUserNameError(
        lng === "ka"
          ? "შეავსე სახელი ველი"
          : "Please fill in the UserName field",
      );
      setIsLoading(false);

      return;
    }
    if (registrationState.email === "") {
      setRegEmailError(
        lng == "ka" ? "შეავსე ელ-ფოსტა ველი" : "Please fill in the Email field",
      );
      setIsLoading(false);

      return;
    }
    if (registrationState.password === "") {
      setRegError(
        lng == "ka"
          ? "შეავსე პაროლის ველი"
          : "Please fill in the Password field",
      );
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

    // var errorMessage = await auth.handleRegistration(
    //   registrationState.username,
    //   registrationState.email,
    //   registrationState.password,
    //   registrationState.confirmPassword,
    // );

    // if (errorMessage) {
    //   setRegError("Registartion failed");
    //   setIsLoading(false);
    // } else {
    //   var cookie = new Cookies();

    //   cookie.set("regEmail", registrationState.email);
    //   cookie.set("regUserName", registrationState.username);
    //   router.push("/user/auth/signup-successful");
    //   setIsLoading(false);
    // }
  };

  const validateEmail = (value: string) =>
    value.match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}$/i);

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
          lng == "ka"
            ? "შეიყვანეთ ელ-ფოსტა სწორად"
            : "Please enter a valid email",
        );
        setEmailLogHasBlurred(false);

        return;
      }
      setEmailLogHasBlurred(true);
      setLogLoader(true);
      //   const response = (await auth.checkEmailLogin(
      //     loginState.email,
      //   )) as ApiResponse;

      //   if (!response.success) {
      //     setLoginEmailError(response.result || "Email doesnot exists");
      //     setEmailLogHasBlurred(false);
      //   } else {
      //     setLogLoader(false);
      //   }
    } catch (error) {
      // Handle any errors during the API call
      console.error("Error:", error);
      // You might want to handle this case accordingly, for example, show an error message.
    }
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
        setRegEmailError(
          lng == "ka"
            ? "შეიყვანეთ ელ-ფოსტა სწორად"
            : "Please enter a valid email",
        );
        setRegEmailHasBlurred(false);

        return;
      }
      setRegEmailHasBlurred(true);
      setRegemailLoader(true);
      //   const response = (await auth.checkEmailRegister(
      //     registrationState.email,
      //   )) as ApiResponse;

      //   if (!response.success) {
      //     setRegEmailError(response.result || "UserName already exists");
      //     setRegEmailHasBlurred(false);
      //   } else {
      //     setRegemailLoader(false);
      //   }
    } catch (error) {
      // Handle any errors during the API call
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
      //   const response = (await auth.checkUserNameRegister(
      //     registrationState.username,
      //   )) as ApiResponse;

      //   if (!response.success) {
      //     setRegUserNameError(response.result || "UserName already exists");
      //     setRegUserNameHasBlurred(false);
      //   } else {
      //     setRegusernameLoader(false);
      //   }
    } catch (error) {
      // Handle any errors during the API call
      console.error("Error:", error);
    }
  };
  const handleLoginPasswordClear = async () => {
    setLoginPasswordError("");
    setLoginState({ ...loginState, password: "" });
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
      setConfirmPasswordError(
        lng == "ka" ? "პარლი არემთხვევა" : "Password doesnot match",
      );
    } else {
      setConfirmPasswordError("");
    }
  };

  const handleBlurPassword = () => {
    if (registrationState.password === "") return;

    if (registrationState.password.length < 6) {
      setRegPasswordError(
        lng == "ka"
          ? "პაროლი უნდა იყოს 6 სიმბოლოზე მეტი"
          : "Passwrod must be more Then 8 Symbols",
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

  const handleLoginMode = () => {
    setLoginMode(!loginMode);
    setLoginEmailError("");
    setLoginPasswordError("");
    setLoginError("");
    setIsLoading(false);
    setEmailLogHasBlurred(false);
    setIsLoading(false);
    setEmailLogHasBlurred(false);
    setConfirmPasswordError("");
    setRegPasswordError("");
    setRegUserNameError("");
    setRegEmailError("");
    setRegUserNameHasBlurred(false);
    setRegEmailHasBlurred(false);
  };

  const handleNext = () => {
    if (loginMode) {
      handleLogin();
    } else {
      handleRegistration();
    }
  };

  return (
    <>
      <div
        className="flex flex-col items-center bg-transparent"
        role="button"
        tabIndex={0}
        onClick={() => onOpen()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            onOpen();
          }
        }}
      >
        <ProfileIcon />
        <span className="text-xs">{lng === "ka" ? "შესვლა" : "Login"}</span>
      </div>

      <Modal
        classNames={{
          backdrop:
            "bg-gradient-to-b from-gray-900/60 to-gray-900/80 backdrop-blur-sm",
          base: "rounded-t-xl",
        }}
        isOpen={isOpen}
        motionProps={{
          variants: {
            enter: {
              y: 0,
              opacity: 1,
              transition: {
                duration: 0.2,
                ease: "easeOut",
              },
            },
            exit: {
              y: 0,
              opacity: 0,
              transition: {
                duration: 0.2,
                ease: "easeIn",
              },
            },
          },
        }}
        placement="top"
        size="full"
        onClose={onClose}
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col items-center gap-1 pb-4">
                <h2 className="text-2xl font-bold text-white">
                  {loginMode ? loginData.title : regData.title}
                </h2>
              </ModalHeader>
              <ModalBody className="px-6 py-6 overflow-y-auto max-h-[calc(100vh-8rem)]">
                <div className="space-y-3">
                  {loginMode ? (
                    <>
                      <Input
                        ref={loginRef}
                        classNames={{
                          input: ["text-[16px]"],
                          inputWrapper: [
                            "dark:bg-slate-700 bg-gray-50 shadow-sm border-2 border-gray-200 focus-within:border-blue-500 transition-colors",
                            "hover:bg-gray-100 dark:hover:bg-slate-600",
                          ],
                          label: [
                            "font-medium text-gray-700 dark:text-gray-200",
                          ],
                        }}
                        endContent={
                          logEmailHasBlurred ? (
                            <InputLoadingBtn
                              loading={Logloader}
                              success={true}
                            />
                          ) : (
                            <></>
                          )
                        }
                        errorMessage={loginEmailError}
                        isInvalid={loginEmailError !== ""}
                        label={loginData.email}
                        startContent={
                          <i className="fas fa-envelope text-blue-500" />
                        }
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
                          label: [
                            "font-medium text-gray-700 dark:text-gray-200",
                          ],
                        }}
                        errorMessage={loginPasswordError}
                        isInvalid={loginPasswordError !== ""}
                        label={loginData.password}
                        startContent={
                          <i className="fas fa-lock text-blue-500" />
                        }
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
                        <Link
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                          href={`/${lng}/user/forgot-password`}
                        >
                          {loginData.forgotPassword}
                        </Link>
                      </div>
                      {loginError && (
                        <div className="text-red-500 text-sm text-center font-medium bg-red-50 p-2 rounded-lg">
                          <i className="fas fa-exclamation-circle mr-2" />
                          {loginError}
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <Input
                        ref={regRef}
                        classNames={{
                          input: ["text-[16px]"],
                          inputWrapper: [
                            "dark:bg-slate-700 bg-gray-50 shadow-sm border-2 border-gray-200 focus-within:border-blue-500 transition-colors",
                            "hover:bg-gray-100 dark:hover:bg-slate-600",
                          ],
                          label: [
                            "font-medium text-gray-700 dark:text-gray-200",
                          ],
                        }}
                        endContent={
                          regUserNameHasBlurred ? (
                            <InputLoadingBtn
                              loading={Regusernameloader}
                              success={true}
                            />
                          ) : (
                            <></>
                          )
                        }
                        errorMessage={regUserNameError}
                        isInvalid={regUserNameError !== ""}
                        label={regData.username}
                        startContent={
                          <i className="fas fa-user text-blue-500" />
                        }
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
                          label: [
                            "font-medium text-gray-700 dark:text-gray-200",
                          ],
                        }}
                        endContent={
                          regEmailHasBlurred ? (
                            <InputLoadingBtn
                              loading={Regemailloader}
                              success={true}
                            />
                          ) : (
                            <></>
                          )
                        }
                        errorMessage={regEmailError}
                        isInvalid={regEmailError !== ""}
                        label={regData.email}
                        startContent={
                          <i className="fas fa-envelope text-blue-500" />
                        }
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
                          label: [
                            "font-medium text-gray-700 dark:text-gray-200",
                          ],
                        }}
                        errorMessage={regRegPasswordError}
                        isInvalid={regRegPasswordError !== ""}
                        label={regData.password}
                        startContent={
                          <i className="fas fa-lock text-blue-500" />
                        }
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
                          label: [
                            "font-medium text-gray-700 dark:text-gray-200",
                          ],
                        }}
                        errorMessage={confirmPasswordError}
                        isInvalid={confirmPasswordError !== ""}
                        label={regData.confirmPassword}
                        startContent={
                          <i className="fas fa-lock text-blue-500" />
                        }
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
                    </>
                  )}
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-md transition-colors"
                    isLoading={isLoading}
                    startContent={
                      loginMode ? (
                        <i className="fas fa-sign-in-alt mr-2" />
                      ) : (
                        <i className="fas fa-user-plus mr-2" />
                      )
                    }
                    onClickCapture={handleNext}
                  >
                    {loginMode ? loginData.button : regData.button}
                  </Button>

                  <div className="flex items-center justify-center my-4">
                    <div className="flex-grow border-t border-gray-300" />
                    <span className="mx-4 text-gray-500 text-sm font-medium">
                      {loginMode ? loginData.or : regData.or}
                    </span>
                    <div className="flex-grow border-t border-gray-300" />
                  </div>

                  <Button
                    className="w-full bg-[#4267B2] hover:bg-[#365899] text-white font-bold py-3 rounded-lg shadow-md transition-colors mb-3"
                    startContent={<i className="fab fa-facebook-f mr-2" />}
                    onClickCapture={() => handleOAuth("facebook")}
                  >
                    {loginMode ? loginData.facebookAuth : regData.facebookAuth}
                  </Button>

                  <Button
                    className="w-full bg-white border border-gray-300 hover:bg-gray-100 text-gray-800 font-bold py-3 rounded-lg shadow-md transition-colors"
                    startContent={
                      <i className="fab fa-google mr-2 text-[#4285F4]" />
                    }
                    onClickCapture={() => handleOAuth("google")}
                  >
                    {loginMode ? loginData.googleAuth : regData.googleAuth}
                  </Button>

                  <div className="text-center mt-4">
                    <button
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                      onClick={handleLoginMode}
                    >
                      {loginMode ? regData.switchMode : loginData.switchMode}
                    </button>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <div className="md:hidden fixed bottom-1 left-1/2 z-50 transform -translate-x-1/2 w-11/12 rounded-2xl bg-black text-white shadow-md">
                  <div className="flex justify-around items-center py-2">
                    <Link
                      className="flex flex-col items-center"
                      href={`/${lng}`}
                    >
                      <HomeIcon className="text-green-500 w-6 h-6" />
                      <span className="text-xs">
                        {lng === "ka" ? "Home" : "მთავარი"}
                      </span>
                    </Link>

                    <div
                      className="flex flex-col items-center bg-transparent"
                      role="button"
                      tabIndex={0}
                      onClick={() => onClose()}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          onClose();
                        }
                      }}
                    >
                      <SearchIcon />
                      <span className="text-xs">
                        {lng === "ka" ? "Search" : "ძებნა"}
                      </span>
                    </div>

                    <Cartlink />

                    <Link
                      className="flex flex-col items-center"
                      href={`/${lng}/chat`}
                    >
                      <ProfileIcon className="w-6 h-6" />
                      <span className="text-xs">
                        {lng === "ka" ? "Chat" : "ჩათი"}
                      </span>
                    </Link>
                    <span className="flex flex-col items-center">
                      <ProfileIcon className="w-6 h-6" />
                      <span className="text-xs">
                        {"en" === "en" ? "Login" : "შესვლა"}
                      </span>
                    </span>
                  </div>
                </div>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
