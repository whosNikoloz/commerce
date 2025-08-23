"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  ArrowRight,
  CreditCard,
  Truck,
  Headphones,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Input } from "@heroui/input";
import { useTheme } from "next-themes";
import { useIsSSR } from "@react-aria/ssr";
import { SunFilledIcon, MoonFilledIcon } from "@/components/icons";

export default function AnimatedFooter() {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { theme, setTheme } = useTheme();
  const isSSR = useIsSSR();

  // Check if we're in dark mode
  const isDarkMode = theme === "dark" || (!theme && !isSSR);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const handleSubscribe = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setTimeout(() => setIsSubscribed(false), 3000);
      setEmail("");
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  const socialItem = {
    hidden: { scale: 0, opacity: 0 },
    show: { scale: 1, opacity: 1 },
  };

  const paymentMethods = [
    "/placeholder.svg?height=30&width=50",
    "/placeholder.svg?height=30&width=50",
    "/placeholder.svg?height=30&width=50",
    "/placeholder.svg?height=30&width=50",
  ];

  // Dynamic styles based on theme
  const themeStyles = {
    footer: isDarkMode
      ? "bg-brand-muted dark:bg-brand-muteddark text-white"
      : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800",
    subtitle: isDarkMode ? "text-gray-300" : "text-gray-600",
    borderColor: isDarkMode ? "border-gray-700" : "border-gray-300",
    iconBg: isDarkMode ? "bg-gray-700" : "bg-gray-300",
    iconHoverBg: isDarkMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)",
    linkHover: isDarkMode ? "hover:text-white" : "hover:text-gray-900",
    linkText: isDarkMode ? "text-gray-400" : "text-gray-600",
    inputBg: isDarkMode ? "bg-gray-800" : "bg-white",
    buttonGradient: isDarkMode
      ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500"
      : "bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400",
    successBg: isDarkMode
      ? "bg-green-500/20 border-green-500/50 text-green-200"
      : "bg-green-100 border-green-300 text-green-800",
  };

  return (
    <footer className={`${themeStyles.footer} overflow-hidden md:pb-0 pb-10`}>
      <div className="container mx-auto px-4 pb-12 pt-6">
        <div className="flex justify-end mb-4">
          <motion.button
            className={`p-2 rounded-full ${themeStyles.iconBg} transition-colors hover:opacity-80`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            aria-label={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
          >
            {!isSSR && isDarkMode ? <SunFilledIcon size={18} /> : <MoonFilledIcon size={18} />}
          </motion.button>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          initial="hidden"
          variants={container}
          viewport={{ once: true }}
          whileInView="show"
        >
          {/* Company Info */}
          <motion.div className="space-y-4" variants={item}>
            <motion.div
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2"
              initial={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                className={`w-10 h-10 ${isDarkMode ? "bg-purple-600" : "bg-purple-500"} rounded-full flex items-center justify-center`}
                transition={{ duration: 0.5 }}
                whileHover={{ rotate: 360 }}
              >
                <span className="text-white font-bold text-xl">S</span>
              </motion.div>
              <span className="text-xl font-bold">ShopWave</span>
            </motion.div>
            <p className={themeStyles.subtitle}>
              Discover the latest trends and high-quality products at ShopWave. Your one-stop
              destination for all your shopping needs.
            </p>
            <motion.div
              animate="show"
              className="flex space-x-4"
              initial="hidden"
              variants={container}
            >
              {[Instagram, Facebook, Twitter, Youtube].map((Icon, index) => (
                <motion.a
                  key={index}
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${themeStyles.iconBg} transition-colors`}
                  href="#"
                  variants={socialItem}
                  whileHover={{
                    scale: 1.2,
                    backgroundColor: themeStyles.iconHoverBg,
                  }}
                >
                  <Icon size={18} />
                </motion.a>
              ))}
            </motion.div>
          </motion.div>

          <motion.div className="space-y-4" variants={item}>
            <h3 className={`text-lg font-semibold mb-4 border-b ${themeStyles.borderColor} pb-2`}>
              Quick Links
            </h3>
            <motion.ul className="space-y-2" variants={container}>
              {["Home", "Shop", "Categories", "Deals", "About Us", "Contact"].map((link, index) => (
                <motion.li key={index} variants={item}>
                  <Link
                    className={`${themeStyles.subtitle} ${themeStyles.linkHover} flex items-center group`}
                    href="#"
                  >
                    <motion.span
                      className={`h-0.5 ${isDarkMode ? "bg-white" : "bg-gray-800"} mr-2`}
                      initial={{ width: 0 }}
                      whileHover={{ width: 15 }}
                    />
                    {link}
                    <motion.span
                      className="ml-2"
                      initial={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      whileHover={{ opacity: 1, x: 0 }}
                    >
                      <ArrowRight size={14} />
                    </motion.span>
                  </Link>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>

          <motion.div className="space-y-4" variants={item}>
            <h3 className={`text-lg font-semibold mb-4 border-b ${themeStyles.borderColor} pb-2`}>
              Customer Service
            </h3>
            <motion.ul className="space-y-4" variants={container}>
              {[
                { icon: CreditCard, text: "Secure Payment" },
                { icon: Truck, text: "Free Shipping" },
                { icon: Headphones, text: "24/7 Support" },
                { icon: ShieldCheck, text: "Money-back Guarantee" },
              ].map((item, index) => (
                <motion.li
                  key={index}
                  animate={{ y: 0, opacity: 1 }}
                  className="flex items-center space-x-3"
                  initial={{ y: 20, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    className={`p-2 ${themeStyles.iconBg} rounded-full`}
                    whileHover={{
                      rotate: 15,
                      scale: 1.1,
                      backgroundColor: themeStyles.iconHoverBg,
                    }}
                  >
                    <item.icon size={16} />
                  </motion.div>
                  <span className={themeStyles.subtitle}>{item.text}</span>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>

          <motion.div className="space-y-4" variants={item}>
            <h3 className={`text-lg font-semibold mb-4 border-b ${themeStyles.borderColor} pb-2`}>
              Stay Updated
            </h3>
            <p className={themeStyles.subtitle}>
              Subscribe to our newsletter for exclusive offers and updates.
            </p>

            {isSubscribed ? (
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                className={`${themeStyles.successBg} p-3 rounded-md`}
                exit={{ opacity: 0, y: -10 }}
                initial={{ opacity: 0, y: 10 }}
              >
                <p>Thank you for subscribing!</p>
              </motion.div>
            ) : (
              <form className="mt-4 space-y-3 z-10" onSubmit={handleSubscribe}>
                <div className="relative group overflow-hidden rounded-lg transition-all duration-300 focus-within:ring-2 focus-within:ring-purple-500">
                  <Input
                    required
                    className={themeStyles.inputBg}
                    placeholder="Your email address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <motion.button
                    animate={{ opacity: 1 }}
                    className={`absolute right-1 top-[2px] -translate-y-1/2 ${themeStyles.buttonGradient} p-2 rounded-md text-white shadow-md transition-all duration-300`}
                    initial={{ opacity: 0.9 }}
                    type="submit"
                    whileHover={{ scale: 1.05, x: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{
                        repeat: Infinity,
                        repeatDelay: 3,
                        duration: 1,
                      }}
                    >
                      <ArrowRight size={18} />
                    </motion.div>
                  </motion.button>
                </div>
                <motion.p
                  animate={{ opacity: 1, y: 0 }}
                  className={`text-xs ${themeStyles.linkText} pl-1`}
                  initial={{ opacity: 0, y: -5 }}
                  transition={{ delay: 0.2 }}
                >
                  Join 5,000+ subscribers. Never spam.
                </motion.p>
              </form>
            )}

            <motion.div className="pt-4" variants={container}>
              <h4 className="text-sm font-medium mb-2">We Accept</h4>
              <div className="flex space-x-2">
                {paymentMethods.map((src, index) => (
                  <motion.div
                    key={index}
                    className="bg-white rounded-md p-1"
                    variants={item}
                    whileHover={{ y: -5 }}
                  >
                    <Image
                      alt="Payment method"
                      className="h-6 w-auto"
                      height={30}
                      src={src || "/placeholder.svg"}
                      width={50}
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className={`mt-12 pt-6 border-t ${themeStyles.borderColor} flex flex-col md:flex-row justify-between items-center`}
          initial={{ opacity: 0, y: 20 }}
          transition={{ delay: 0.5 }}
        >
          <p className={themeStyles.linkText}>
            © {new Date().getFullYear()} ShopWave. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0">
            <ul className={`flex space-x-6 text-sm ${themeStyles.linkText}`}>
              <li>
                <Link className={themeStyles.linkHover} href="#">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link className={themeStyles.linkHover} href="#">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link className={themeStyles.linkHover} href="#">
                  Cookies Settings
                </Link>
              </li>
            </ul>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
