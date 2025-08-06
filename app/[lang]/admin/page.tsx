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
  const [isMobile, setIsMobile] = useState(false);
  const { lang } = useParams();
  const router = useRouter();

  useEffect(() => {
    const isAdmin = localStorage.getItem("isAdmin");
    if (isAdmin === "true") {
      setIsAuthorized(true);
    } else {
      onOpen();
    }
  }, []);

  useEffect(() => {
    const updateScreenSize = () => setIsMobile(window.innerWidth < 768);
    updateScreenSize();
    window.addEventListener("resize", updateScreenSize);
    return () => window.removeEventListener("resize", updateScreenSize);
  }, []);

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
          backdrop: "bg-gradient-to-b from-gray-900/60 to-gray-900/80 backdrop-blur-3xl",
          base: "rounded-t-xl",
        }}
        hideCloseButton={isMobile}
        isOpen={isOpen}
        motionProps={{
          variants: {
            enter: { y: 0, opacity: 1, transition: { duration: 0.2, ease: "easeOut" } },
            exit: { y: 0, opacity: 0, transition: { duration: 0.2, ease: "easeIn" } },
          },
        }}
        placement={isMobile ? "top" : "center"}
        size={isMobile ? "full" : "sm"}
        onClose={handleCloseModal}
      >
        <ModalContent>
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

  return <AdminDashboard />;
}
