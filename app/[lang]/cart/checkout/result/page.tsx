"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useParams } from "next/navigation";

import { useDictionary } from "@/app/context/dictionary-provider";

export default function CheckoutResultPage() {
  const sp = useSearchParams();

  useParams<{ lang?: string; }>();
  const dictionary = useDictionary();

  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");

  useEffect(() => {
    const provider = sp.get("provider"); // "bog" or "tbc"
    const paymentId = sp.get("paymentId");

    const lastOrderId =
      typeof window !== "undefined"
        ? sessionStorage.getItem("lastOrderId")
        : null;

    // Choose identifier based on provider
    const id = provider === "tbc" ? paymentId || lastOrderId : lastOrderId;

    if (!provider || !id) {
      setStatus("failed");

      return;
    }

    const endpoint =
      provider === "tbc"
        ? `/api/payment/tbc/status/${encodeURIComponent(id)}`
        : `/api/payment/bog/status/${encodeURIComponent(id)}`;

    fetch(endpoint)
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

  if (status === "loading") {
    return <div className="p-8">{dictionary.checkout.status.loading}</div>;
  }

  if (status === "success") {
    return <div className="p-8">{dictionary.checkout.status.success}</div>;
  }

  return <div className="p-8">{dictionary.checkout.status.failed}</div>;
}
