"use client"

import { usePathname } from "next/navigation"
import { Navbar } from "@/components/Navbar/navbar"
import AnimatedFooter from "@/components/animated-footer"

interface LayoutWrapperProps {
  children: React.ReactNode
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname()
  
  const isAdminPage = pathname?.includes("/admin")
  
  return (
    <div className= {`${isAdminPage ? "" : "relative flex flex-col  min-h-screen "}`}>
      {!isAdminPage && <Navbar />}
      <main className={`${isAdminPage ? "" : "container  mx-auto max-w-7xl px-6 flex-grow"}`}>
        {children}
      </main>
      {!isAdminPage && <AnimatedFooter />}
    </div>
  )
} 