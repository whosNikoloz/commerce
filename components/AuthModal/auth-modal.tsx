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

import { HomeIcon, ProfileIcon, SearchIcon } from "../icons";
import Cartlink from "../Cart/cart-link";
import { GoBackButton } from "../go-back-button";

import LoginModal from "./login-modal";
import RegisterModal from "./register-modal";
import ForgotPasswordModal from "./forgot-password-modal";

import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";

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

  useBodyScrollLock(isOpen);


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
      </div>

      <Modal
        classNames={{
          ...(IsMobile
            ? {
              wrapper: "!transform-none h-[100lvh] p-0 m-0",
              base:
                "dark:bg-brand-muteddark bg-brand-surface !rounded-none flex flex-col h-full max-h-full " +
                "pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]",
              backdrop: "bg-black/40 backdrop-blur-sm",
            }
            : {
              base:
                "dark:bg-brand-muteddark bg-brand-surface rounded-xl shadow-lg",
              backdrop: "bg-black/40",
            }),
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
                <div className="md:hidden z-50 fixed bottom-1 left-1/2 -translate-x-1/2 w-11/12 backdrop-blur-xl bg-brand-surface/80 dark:bg-brand-surfacedark/80 rounded-2xl shadow-md">
                  <div className="flex justify-around items-center py-2 space-x-3">
                    <Link className="flex flex-col items-center" href="/">
                      <HomeIcon className="w-6 h-6 text-brand-primary dark:text-brand-primarydark" />
                      <span className="text-xs text-text-subtle dark:text-text-subtledark">
                        Home
                      </span>
                    </Link>

                    <div
                      className="flex flex-col items-center bg-transparent"
                      role="button"
                      tabIndex={0}
                    >
                      <SearchIcon />
                      <span className="text-xs">ძებნა</span>
                    </div>

                    <Cartlink />

                    <Link className="flex flex-col items-center" href={`/en/contact`}>
                      <ProfileIcon className="w-6 h-6 text-text-light dark:text-text-lightdark" />
                      <span className="text-xs">Chat</span>
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
                      <ProfileIcon />
                    </div>
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
