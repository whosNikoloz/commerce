'use client';

export default function ClientUADataFix() {
    try {
        const nav = typeof navigator !== 'undefined' ? (navigator as any) : null;
        const uad = nav?.userAgentData;
        if (uad && !Array.isArray(uad.brands)) {
            uad.brands = [];
        }
    } catch { }
    return null;
}
