"use client";

import { useEffect } from "react";
import { Session } from "next-auth";
import { useSession } from "next-auth/react";
import Authentication from "@/app/api/user/auth";
import { signOut } from "next-auth/react";
import Styles from "@/styles/loader.module.css";
import Image from "next/image";
import QuizHub from "@/public/QuizHubLogo.png";

interface CustomSession extends Session {
  provider?: string;
  providerId?: string;
}

interface OAuthUserModel {
  email: string;
  name: string;
  image: string;
  provider: string;
  providerId: string;
}

export default function OauthPage() {
  const { data: session } = useSession();
  const auth = Authentication();

  useEffect(() => {
    async function oauth() {
      if (session) {
        const customSession = session as CustomSession;
        const userModel: OAuthUserModel = {
          email: session.user?.email ?? "",
          name: session.user?.name ?? "",
          image: session.user?.image ?? "",
          provider: customSession.provider ?? "",
          providerId: customSession.providerId || "",
        };

        // Add a simple check to prevent duplicate registration attempts
        if (localStorage.getItem("registrationInProgress") === "true") {
          return;
        }

        localStorage.setItem("registrationInProgress", "true");

        const checkemail = await auth.CheckeOAuthExist(
          userModel.provider,
          userModel.providerId
        );

        if (checkemail) {
          const loginoauth = await auth.handleOAuthLogin(
            userModel.provider,
            userModel.providerId
          );
          if (loginoauth) {
            const redirectUrl = sessionStorage.getItem("redirect_url");
            if (redirectUrl) {
              sessionStorage.removeItem("redirect_url");
            }
            await signOut({ callbackUrl: redirectUrl ? redirectUrl : "/" });
          }
        } else {
          const registeroauth = await auth.handleoAuthRegistration(
            userModel.email,
            userModel.name,
            userModel.image,
            userModel.provider,
            userModel.providerId
          );
          if (registeroauth) {
            const loginoauth = await auth.handleOAuthLogin(
              userModel.provider,
              userModel.providerId
            );
            if (loginoauth) {
              try {
                const redirectUrl = sessionStorage.getItem("redirect_url");
                if (redirectUrl) {
                  sessionStorage.removeItem("redirect_url");
                }
                await signOut({ callbackUrl: redirectUrl ? redirectUrl : "/" });
              } catch (error) {
                console.error("Error during sign-out:", error);
              }
            }
          } else {
            console.log(registeroauth);
          }
        }

        localStorage.removeItem("registrationInProgress");
      }
    }
    oauth();
  }, [session, auth]);

  return (
    <section className="flex flex-col items-center dark:bg-slate-800 h-screen bg-white  justify-center gap-4 py-8 md:py-10 ">
      <div className={Styles.Loader}>
        <Image
          src={QuizHub}
          alt="Description of the image"
          width={100} // Specify the width of the image
          height={100}
        />
      </div>
    </section>
  );
}
