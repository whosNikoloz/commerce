// "use client";

// import { SetStateAction, useEffect, useState } from "react";
// import Cookies from "universal-cookie";
// import Image from "next/image";
// import { QuizHub } from "@/app/components/QuizHubLogo";
// import ForgotPassword from "@/public/Forgot password.png";
// import { Button, Checkbox, Input } from "@nextui-org/react";
// import { useRouter } from "next/navigation";
// import Authentication from "@/app/api/user/auth";
// import Link from "next/link";

// interface ApiResponse {
//   success: boolean;
//   result?: string; // Adjust the type based on the actual data structure
//   error?: string;
// }

// export default function SSRFP({ lang }: { lang: string }) {
//   const authAPI = Authentication();
//   const [email, setEmail] = useState("");

//   const cookie = new Cookies();

//   const router = useRouter();

//   const [Terms, setTerms] = useState(false);

//   const [isButtonDisabled, setIsButtonDisabled] = useState(true);
//   const [EmailError, setEmailError] = useState("");

//   useEffect(() => {
//     setIsButtonDisabled(!email || !Terms || EmailError != "");
//   }, [email, Terms, EmailError]);

//   const [isLoading, setIsLoading] = useState(false);

//   const validateEmail = (value: string) =>
//     value.match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}$/i);

//   const handleEmailExists = async () => {
//     setEmailError("");
//     const isEmailValid = validateEmail(email);
//     try {
//       if (email === "") {
//         return;
//       }
//       if (!isEmailValid) {
//         setEmailError(
//           lang === "ka"
//             ? "გთხოვთ შეიყვანოთ სწორი ელ-ფოსტა"
//             : "Please enter a valid email"
//         );
//         return;
//       }
//       const response = (await authAPI.checkEmailLogin(email)) as ApiResponse;

//       if (!response.success) {
//         setEmailError(response.result || "Email already exists");
//       } else {
//         console.error("Email does not exist. Error:", response.error);
//         // You might want to handle this case accordingly, for example, show an error message.
//       }
//     } catch (error) {
//       // Handle any errors during the API call
//       console.error("Error:", error);
//       // You might want to handle this case accordingly, for example, show an error message.
//     }
//   };

//   const handleEmailClear = async () => {
//     setEmailError("");
//     setEmail("");
//   };

//   const handleForgotPassword = async () => {
//     setIsLoading(true);
//     if (!email) {
//       setEmailError(
//         lang === "ka" ? "შეიყვანეთ ელ-ფოსტა" : "Please enter your email"
//       );
//       setIsLoading(false);
//       return;
//     }

//     if (!Terms) {
//       setEmailError(
//         lang === "ka" ? "დაეთანხმეთ წესებს" : "Please accept terms"
//       );
//       setIsLoading(false);
//       return;
//     }

//     var errorMessage = await authAPI.handleForgotPassword(email);

//     if (errorMessage) {
//       setEmailError(errorMessage.toString());
//       setIsLoading(false);
//     } else {
//       cookie.set("forgetEmail", email);
//       setIsLoading(false);
//       setTimeout(() => {
//         router.push("/user/forgot-password/forgotpassword-successful");
//       }, 500);
//     }
//   };

//   return (
//     <section className="bg-gray-50 dark:bg-gray-900 flex flex-col md:flex-row h-screen">
//       <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto h-screen lg:py-0 md:w-2/3">
//         <Link
//           href={`${lang}`}
//           className="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white"
//         >
//           <div className=" mr-2">
//             <QuizHub />
//           </div>
//           QuizHub
//         </Link>
//         <div className="w-full p-6 bg-white rounded-lg h-auto shadow dark:border md:mt-0 sm:max-w-md dark:bg-gray-800 dark:border-gray-700 sm:p-8">
//           <h2 className="mb-1 text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
//             {lang === "ka" ? "პაროლის შეცვლა" : "Change Password"}
//           </h2>
//           <div className="mt-4 space-y-4 lg:mt-5 md:space-y-5">
//             <Input
//               value={email}
//               type="email"
//               label="Email"
//               variant="bordered"
//               isClearable
//               onChange={(e: { target: { value: SetStateAction<string> } }) =>
//                 setEmail(e.target.value)
//               }
//               isInvalid={EmailError !== ""}
//               onBlur={handleEmailExists}
//               onClear={handleEmailClear}
//               errorMessage={EmailError}
//             />

//             <div className="flex items-start">
//               <label
//                 htmlFor="newsletter"
//                 className="font-light text-gray-500 dark:text-gray-300"
//               >
//                 <Checkbox
//                   classNames={{
//                     label: "text-small",
//                   }}
//                   color="warning"
//                   onChange={(e) => {
//                     setTerms(e.target.checked);
//                   }}
//                 >
//                   <span className="text-yellow-500">
//                     {lang === "ka" ? "დაეთანხმე  " : "Accept  "}
//                   </span>
//                   Terms and Conditions
//                 </Checkbox>
//               </label>
//             </div>
//             <Button
//               type="submit"
//               color="warning"
//               variant="shadow"
//               className="w-full text-white"
//               onClick={handleForgotPassword}
//               isLoading={isLoading}
//               isDisabled={isButtonDisabled}
//             >
//               {lang === "ka" ? "შეცვლა" : "Change"}
//             </Button>
//           </div>
//         </div>
//       </div>
//       <div className="hidden md:flex md:w-1/2 items-center justify-center">
//         <Image
//           src={ForgotPassword}
//           alt=""
//           className="w-full h-auto max-w-full max-h-screen mr-20"
//         />
//       </div>
//     </section>
//   );
// }
