"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { Modal, ModalBody, ModalContent, ModalHeader, useDisclosure } from "@heroui/modal";

import AdminDashboard from "@/components/admin/admin-dashboard";
import LoginModal from "@/components/admin/login-modal";
import { GoBackButton } from "@/components/go-back-button";
import { useIsMobile } from "@/hooks/use-mobile";

export default function AdminPage() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { lang } = useParams<{ lang?: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const isMobile = useIsMobile();

  const currentLang = lang === "ka" ? "ka" : "en";
  const next = searchParams.get("next"); // <- read ?next=/en/admin/products

  useEffect(() => {
    let cancelled = false;

    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/check", { method: "GET", cache: "no-store" });
        const data = await res.json();

        if (cancelled) return;

        if (data.authorized) {
          setIsAuthorized(true);

          // If we came here due to middleware redirect, go to the target immediately
          if (next) {
            router.replace(next);
          }
        } else {
          onOpen(); // show login modal
        }
      } catch {
        if (!cancelled) onOpen();
      }
    };

    checkAuth();
    return () => void (cancelled = true);
  }, [onOpen, router, next]);

  const handleCloseModal = () => {
    onClose();
    router.push(`/${currentLang}`);
  };

  if (!isAuthorized) {
    const loginData =
      currentLang === "ka"
        ? { title: "შესვლა", email: "ელ-ფოსტა", password: "პაროლი", button: "შესვლა" }
        : { title: "Sign In", email: "Email", password: "Password", button: "Sign In" };

    return (
      <Modal
        classNames={{
          backdrop: "backdrop-blur-md",
          base: "rounded-t-xl text-text-light dark:text-text-lightdark shadow-xl",
          wrapper: isMobile ? "p-0" : "",
        }}
        hideCloseButton={isMobile}
        isOpen={isOpen}
        motionProps={{
          variants: {
            enter: { y: 40, opacity: 0, scale: 0.96, transition: { duration: 0 } },
            center: { y: 0, opacity: 1, scale: 1, transition: { type: "spring", stiffness: 400, damping: 32, mass: 0.8 } },
            exit: { y: 40, opacity: 0, scale: 0.96, transition: { duration: 0.18, ease: "easeIn" } },
          },
          initial: "enter",
          animate: "center",
          exit: "exit",
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
                  <h2 className="text-2xl font-bold text-text-light dark:text-text-lightdark">
                    {loginData.title}
                  </h2>
                </ModalHeader>
              )}

              <ModalBody className="px-6 py-6 overflow-y-auto max-h-[calc(100vh-8rem)]">
                <LoginModal
                  lng={currentLang}
                  loginData={loginData}
                  onSuccess={() => {
                    setIsAuthorized(true);
                    onClose();
                    const fallback = `/${currentLang}/admin`;
                    router.replace(next && next.startsWith(`/${currentLang}/admin`) ? next : fallback);
                  }}
                />
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    );
  }

  // If authorized and no "next", stay on the dashboard
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 dark:from-slate-100 dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-lg font-medium">
          Welcome back! Here&apos;s what&apos;s happening with your store today.
        </p>
      </div>
      <AdminDashboard />
    </div>
  );
}
