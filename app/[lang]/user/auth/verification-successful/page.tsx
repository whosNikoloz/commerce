// import SSRVS from "@/app/[lang]/user/auth/verification-successful/ssrvs";
// import { Locale } from "@/i18n.config";
// import { Metadata } from "next";

// export const metadata: Metadata = {
//   title: "Verification | QuizHub",
//   description:
//     "Verify your account and gain access to QuizHub, an online learning platform",
//   keywords: ["verification", "authentication", "account", "online learning"],
// };

// export default function VerificationSuccessfulPage({
//   params: { lang },
// }: {
//   params: { lang: Locale };
// }) {
//   const Language = lang == "ka" ? "ka" : "en";
//   return (
//     <SSRVS
//       params={{
//         lang: Language,
//       }}
//     />
//   );
// }

export default function VerfPage() {
  return <div className="container px-4 py-8 md:px-6 md:py-12">test</div>;
}
