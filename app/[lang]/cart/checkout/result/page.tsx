"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function CheckoutResultPage() {
  const sp = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");

  useEffect(() => {
    const provider = sp.get("provider"); // "bog" or "tbc"
    // if TBC redirects with ?paymentId=..., read it; otherwise use your stored lastOrderId
    const paymentId = sp.get("paymentId");
    const lastOrderId =
      typeof window !== "undefined" ? sessionStorage.getItem("lastOrderId") : null;

    // For BOG we’ll usually use the order id we created (shop_order_id / lastOrderId).
    // For TBC, prefer the `paymentId` returned by TBC if present.
    const id = provider === "tbc" ? paymentId || lastOrderId : lastOrderId;

    if (!provider || !id) {
      setStatus("failed");

      return;
    }

    fetch(`/api/payment/status?provider=${provider}&id=${encodeURIComponent(id)}`)
      .then((r) => r.json())
      .then((d) => {
        const ok = String(d?.status || "").toLowerCase();

        if (
          ok.includes("approved") ||
          ok.includes("captured") ||
          ok.includes("succeeded") ||
          ok.includes("completed")
        ) {
          setStatus("success");
        } else {
          setStatus("failed");
        }
      })
      .catch(() => setStatus("failed"));
  }, [sp]);

  if (status === "loading") return <div className="p-8">Checking payment…</div>;
  if (status === "success") return <div className="p-8">✅ Payment successful. Thank you!</div>;

  return <div className="p-8">❌ Payment failed or cancelled. Please try again.</div>;
}
