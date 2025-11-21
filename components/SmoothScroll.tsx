"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { usePathname } from "next/navigation";

export default function SmoothScroll({
    children,
    enabled = false,
}: {
    children: React.ReactNode;
    enabled?: boolean;
}) {
    const pathname = usePathname();
    const isAdmin = pathname?.includes("/admin");
    const shouldEnable = enabled && !isAdmin;

    useEffect(() => {
        if (!shouldEnable) return;

        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: "vertical",
            gestureOrientation: "vertical",
            smoothWheel: true,
            touchMultiplier: 2,
        });

        function raf(time: number) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);

        return () => {
            lenis.destroy();
        };
    }, [shouldEnable]);

    return <>{children}</>;
}
