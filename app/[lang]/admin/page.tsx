"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import AdminDashboard from "@/components/admin/admin-dashboard";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  useDisclosure,
} from "@heroui/modal";
import LoginModal from "@/components/admin/login-modal";
import { GoBackButton } from "@/components/go-back-button";
import { useIsMobile } from "@/hooks/use-mobile";

const AuthData = {
  ka: {
    loginData: {
      title: "შესვლა",
      email: "ელ-ფოსტა",
      password: "პაროლი",
      button: "შესვლა",
    },
  },
  en: {
    loginData: {
      title: "Sign In",
      email: "Email",
      password: "Password",
      button: "Sign In",
    },
  },
};

export default function AdminPage() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { lang } = useParams();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/check", { method: "GET" });
        const data = await res.json();

        if (data.authorized) {
          setIsAuthorized(true);
        } else {
          onOpen();
        }
      } catch {
        onOpen();
      }
    };

    checkAuth();
    //setIsAuthorized(true);
  }, []);

  const isMobile = useIsMobile();


  const handleCloseModal = () => {
    onClose();
    router.push(`/${lang}`);
  };

  if (!isAuthorized) {
    const currentLang = lang === "ka" ? "ka" : "en";
    const loginData = AuthData[currentLang].loginData;

    return (
      <Modal
        classNames={{
          backdrop: "backdrop-blur-3xl",
          base: "rounded-t-xl",
        }}
        hideCloseButton={isMobile}
        isOpen={isOpen}
        motionProps={{
          variants: {
            enter: {
              y: 40,
              opacity: 0,
              scale: 0.96,
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
              y: 40,
              opacity: 0,
              scale: 0.96,
              transition: { duration: 0.18, ease: "easeIn" },
            },
          },
          initial: "enter",
          animate: "center",
          exit: "exit",
        }}
        placement={isMobile ? "top" : "center"}
        size={isMobile ? "full" : "sm"}
        onClose={handleCloseModal}
      >
        <ModalContent className="bg-brand-muteddark">
          {() => (
            <>
              {isMobile ? (
                <ModalHeader className="flex items-center gap-2 px-4 pt-6 mx-4 z-50">
                  <GoBackButton onClick={handleCloseModal} />
                </ModalHeader>
              ) : (
                <ModalHeader className="flex flex-col items-center gap-1 pb-4">
                  <h2 className="text-2xl font-bold text-white">{loginData.title}</h2>
                </ModalHeader>
              )}

              <ModalBody className="px-6 py-6 overflow-y-auto max-h-[calc(100vh-8rem)]">
                <LoginModal
                  lng={currentLang}
                  loginData={loginData}
                  onSuccess={() => {
                    setIsAuthorized(true);
                    onClose();
                  }}
                />
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    );
  }

  return (
    <div className="space-y-6 ">
      <div>
        <h1 className="text-3xl font-bold tracking-tight dark:text-text-lightdark text-text-light ">Dashboard</h1>
      </div>
      <AdminDashboard />
    </div>
  )

}
