"use client";

import { useState } from "react";
import { ArrowLeftRight, X, ChevronDown, ChevronUp } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";

import { useCompareStore } from "@/app/context/compareContext";
import { Button } from "@/components/ui/button";
import { cn, resolveImageUrl } from "@/lib/utils";


export default function FloatingCompareButton() {
  const { items, removeFromCompare } = useCompareStore();
  const { lang } = useParams<{ lang?: string }>();
  const router = useRouter();
  const currentLang = lang || "en";
  const [isExpanded, setIsExpanded] = useState(false);

  if (items.length === 0) return null;

  const handleCompare = () => {
    const ids = items.map((item) => item.id).join(",");

    router.push(`/${currentLang}/compare-products?ids=${encodeURIComponent(ids)}`);
  };

  return (
    <div className="fixed bottom-24 right-6 z-50 animate-fadeIn">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        {/* Header - Always visible */}
        <button
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span className="font-semibold text-sm">({items.length}/4)</span>
          </div>
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronUp className="h-4 w-4" />
          )}
        </button>

        {/* Expandable content */}
        {isExpanded && (
          <div className="border-t border-zinc-200 dark:border-zinc-800">
            {/* Product thumbnails */}
            <div className="p-3 flex gap-2">
              {items.map((item) => (
                <div key={item.id} className="relative group">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                    <Image
                      unoptimized
                      alt={item.name || "Product"}
                      className="object-cover w-full h-full"
                      height={64}
                      src={resolveImageUrl(item.images?.[0])}
                      width={64}
                    />
                  </div>
                  <button
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeFromCompare(item.id)}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}

              {/* Empty slots */}
              {[...Array(4 - items.length)].map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="w-16 h-16 rounded-lg border-2 border-dashed border-zinc-300 dark:border-zinc-700 flex items-center justify-center"
                >
                  <span className="text-zinc-400 text-xs">+</span>
                </div>
              ))}
            </div>

            {/* Compare button */}
            <div className="px-3 pb-3">
              <Button
                className={cn(
                  "w-full bg-blue-600 hover:bg-blue-700 text-white font-medium",
                  items.length < 2 && "opacity-50 cursor-not-allowed"
                )}
                disabled={items.length < 2}
                onClick={handleCompare}
              >
                <ArrowLeftRight className="h-4 w-4 mr-2" />
                შედარება
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
