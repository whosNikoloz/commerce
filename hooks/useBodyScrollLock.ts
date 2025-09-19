import { useEffect, useRef } from "react";

export function useBodyScrollLock(locked: boolean) {
    const scrollYRef = useRef(0);

    useEffect(() => {
        if (!locked) return;

        scrollYRef.current = window.scrollY || 0;
        const body = document.body;
        const html = document.documentElement;
        const prev = html.style.scrollBehavior;
        html.style.scrollBehavior = "auto";

        body.style.position = "fixed";
        body.style.top = `-${scrollYRef.current}px`;
        body.style.left = "0";
        body.style.right = "0";
        body.style.width = "100%";
        body.style.overflow = "hidden";
        body.style.touchAction = "none";
        body.style.overscrollBehaviorY = "contain";

        return () => {
            body.style.position = "";
            body.style.top = "";
            body.style.left = "";
            body.style.right = "";
            body.style.width = "";
            body.style.overflow = "";
            body.style.touchAction = "";
            body.style.overscrollBehaviorY = "";
            html.style.scrollBehavior = prev;
            window.scrollTo(0, scrollYRef.current);
        };
    }, [locked]);
}
