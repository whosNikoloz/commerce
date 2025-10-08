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
import { useRouter } from "next/navigation";
import { useState } from "react";

import { HomeIcon, ProfileIcon, SearchIcon } from "../icons";
import Cartlink from "../Cart/cart-link";
import { GoBackButton } from "../go-back-button";

import LoginModal from "./login-modal";
import RegisterModal from "./register-modal";
import ForgotPasswordModal from "./forgot-password-modal";

import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { useUser } from "@/app/context/userContext";

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
  const { user } = useUser();
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [authMode, setAuthMode] = useState("login");
  const lng = "ka"; // This can be made dynamic if needed
  const { regData, loginData, forgotData } = AuthData[lng];

  useBodyScrollLock(isOpen);

  // Redirect to user page if already logged in
  const handleProfileClick = () => {
    if (user) {
      // If user is logged in, navigate to user page
      router.push(`/${lng}/user`);
    } else {
      // If not logged in, open the modal
      onOpen();
    }
  };


  const handleOAuth = async (provider: "google" | "facebook") => {
    const backTo =
      typeof window !== "undefined"
        ? window.location.pathname + window.location.search + window.location.hash
        : `/${lng}`;

    if (typeof window !== "undefined") {
      sessionStorage.setItem("redirect_url", backTo);
    }

    const { signIn } = await import("next-auth/react");

    onClose();
    await signIn(provider, { callbackUrl: backTo });
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
        onClick={handleProfileClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            handleProfileClick();
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
                "dark:bg-slate-900 bg-white !rounded-none flex flex-col h-full max-h-full " +
                "pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]",
              backdrop: "bg-black/40 backdrop-blur-sm",
            }
            : {
              base:
                "dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-800 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700",
              backdrop: "bg-black/50 backdrop-blur-sm",
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
        <ModalContent className="">
          {() => (
            <>
              {IsMobile ? (
                <ModalHeader className="relative flex items-center justify-between px-4 mb-5 pt-6 pb-2 mx-4 bg-white dark:bg-slate-900">
                  <div className="absolute left-4 top-6">
                    <GoBackButton onClick={handleCloseModal} />
                  </div>

                  <h2 className="absolute left-1/2 top-6 -translate-x-1/2 text-2xl font-bold text-gray-900 dark:text-white">
                    {authMode === "login"
                      ? loginData.title
                      : authMode === "register"
                        ? regData.title
                        : forgotData.title}
                  </h2>
                </ModalHeader>
              ) : authMode == "forgot" ? (
                <ModalHeader className="flex items-center gap-2 px-6 pt-6 pb-4 z-50 border-b border-gray-200 dark:border-gray-700">
                  <GoBackButton onClick={() => handleAuthMode("login")} />
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white ml-2">
                    {forgotData.title}
                  </h2>
                </ModalHeader>
              ) : (
                <ModalHeader className="flex flex-col items-center gap-2 pt-8 pb-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {authMode === "login"
                      ? loginData.title
                      : authMode === "register"
                        ? regData.title
                        : forgotData.title}
                  </h2>
                </ModalHeader>
              )}
              <ModalBody className="px-6 py-6 overflow-y-auto max-h-[calc(100vh-12rem)] custom-scrollbar">
                {authMode === "login" && (
                  <LoginModal
                    handleOAuth={handleOAuth}
                    lng={lng}
                    loginData={loginData}
                    onLoginSuccess={handleCloseModal}
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
                <div className="md:hidden z-50 fixed bottom-1 left-1/2 -translate-x-1/2 w-11/12 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 rounded-2xl shadow-md">
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
