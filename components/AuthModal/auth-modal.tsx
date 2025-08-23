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
import { useState } from "react";
import { useRouter } from "next/navigation";

import { HomeIcon, ProfileIcon, SearchIcon } from "../icons";
import Cartlink from "../Cart/cart-link";
import { GoBackButton } from "../go-back-button";

import LoginModal from "./login-modal";
import RegisterModal from "./register-modal";
import ForgotPasswordModal from "./forgot-password-modal";

// Define the auth data structure
const AuthData = {
  ka: {
    regData: {
      title: "რეგისტრაცია",
      username: "სახელი",
      email: "ელ-ფოსტა",
      password: "პაროლი",
      confirmPassword: "პაროლის დადასტურება",
      button: "რეგისტრაცია",
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
    forgotData: {
      title: "პაროლის აღდგენა",
      subText: "პაროლის აღსადგენად, შეიყვანე რეგისტრირებული მეილი",
      email: "მეილი",
      button: "გაგზავნა",
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
    forgotData: {
      title: "Forgot Password",
      subText: "Enter your registered email to reset your password",
      email: "Email",
      button: "Send",
    },
  },
};

interface AuthModalProps {
  IsMobile: boolean;
}

export default function AuthModal({ IsMobile }: AuthModalProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [authMode, setAuthMode] = useState("login");
  const lng = "ka"; // This can be made dynamic if needed
  const { regData, loginData, forgotData } = AuthData[lng];
  const router = useRouter();

  const handleOAuth = async (provider: string) => {
    const callbackUrl = "/user/auth/oauth";
    // Implement OAuth login logic here
    // Example: await signIn(provider, { callbackUrl });
  };

  const handleAuthMode = (mode: string) => {
    setAuthMode(mode);
  };

  const handleCloseModal = () => {
    onClose();
    setAuthMode("login");
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
          backdrop: " backdrop-blur-sm",
          base: "rounded-t-xl",
        }}
        hideCloseButton={IsMobile}
        isOpen={isOpen}
        motionProps={{
          variants: {
            enter: {
              y: IsMobile ? 0 : 40,
              opacity: 0,
              scale: IsMobile ? 1 : 0.96,
              transition: { duration: 0 },
            },
            center: {
              y: 0,
              opacity: 1,
              scale: 1,
              transition: {
                type: "spring",
                stiffness: 400,
                damping: 32,
                mass: 0.8,
              },
            },
            exit: {
              y: IsMobile ? 0 : 40,
              opacity: 0,
              scale: IsMobile ? 1 : 0.96,
              transition: { duration: 0.18, ease: "easeIn" },
            },
          },
          initial: "enter",
          animate: "center",
          exit: "exit",
        }}
        placement={IsMobile ? "top" : "center"}
        size={IsMobile ? "full" : "sm"}
        onClose={handleCloseModal}
      >
        <ModalContent className="dark:bg-brand-muteddark bg-brand-surface">
          {() => (
            <>
              {IsMobile ? (
                <ModalHeader className="flex items-center gap-2 px-4 pt-6 mx-4 z-50">
                  <GoBackButton onClick={handleCloseModal} />
                </ModalHeader>
              ) : authMode == "forgot" ? (
                <ModalHeader className="flex items-center gap-2 px-4 pt-6 mx-4 z-50">
                  <GoBackButton onClick={() => handleAuthMode("login")} />
                </ModalHeader>
              ) : (
                <ModalHeader className="flex flex-col items-center gap-1 pb-4">
                  <h2 className="text-2xl font-bold text-white">
                    {authMode === "login"
                      ? loginData.title
                      : authMode === "register"
                        ? regData.title
                        : forgotData.title}
                  </h2>
                </ModalHeader>
              )}
              <ModalBody className="px-6 py-6 overflow-y-auto max-h-[calc(100vh-8rem)]">
                {authMode === "login" && (
                  <LoginModal
                    handleOAuth={handleOAuth}
                    lng={lng}
                    loginData={loginData}
                    onSwitchMode={handleAuthMode}
                  />
                )}

                {authMode === "register" && (
                  <RegisterModal
                    handleOAuth={handleOAuth}
                    lng={lng}
                    regData={regData}
                    onSwitchMode={handleAuthMode}
                  />
                )}

                {authMode === "forgot" && <ForgotPasswordModal forgotData={forgotData} lng={lng} />}
              </ModalBody>
              <ModalFooter>
                <div className="md:hidden fixed bottom-1 left-1/2 z-50 transform -translate-x-1/2 w-11/12 rounded-2xl bg-black text-white shadow-md">
                  <div className="flex justify-around items-center py-2">
                    <Link className="flex flex-col items-center" href={`/${lng}`}>
                      <HomeIcon className="text-green-500 w-6 h-6" />
                      <span className="text-xs">{lng === "ka" ? "Home" : "მთავარი"}</span>
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
                      <span className="text-xs">{lng === "ka" ? "Search" : "ძებნა"}</span>
                    </div>

                    <Cartlink />

                    <Link className="flex flex-col items-center" href={`/${lng}/contact`}>
                      <ProfileIcon className="w-6 h-6" />
                      <span className="text-xs">{lng === "ka" ? "Chat" : "ჩათი"}</span>
                    </Link>
                    <span className="flex flex-col items-center">
                      <ProfileIcon className="w-6 h-6" />
                      <span className="text-xs">{"en" === "en" ? "Login" : "შესვლა"}</span>
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
