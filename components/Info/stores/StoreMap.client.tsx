"use client";

import dynamic from "next/dynamic";

const StoreMapInner = dynamic(() => import("./StoreMap"), {
  ssr: false,
  loading: () => (
    <div className="mb-10 h-[420px] w-full animate-pulse rounded-2xl border bg-muted" />
  ),
});

export type { StoreForMap } from "./StoreMap";

export default function StoreMapClient(props: {
  stores: import("./StoreMap").StoreForMap[];
  height?: number;
  className?: string;
}) {
  return <StoreMapInner {...props} />;
}
