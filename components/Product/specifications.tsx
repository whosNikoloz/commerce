"use client";

import { useEffect, useMemo, useRef, useState } from "react";

interface FacetValue {
  value: string;
  productVariantId?: string;
}

interface SpecificationsProps {
  specs: {
    facetName: string;
    facetValues: (string | FacetValue)[];
  }[];
  value?: Record<string, string>;
  onChange?: (facetName: string, facetValue: string, productVariantId?: string) => void;
  disabled?: boolean;
}

const shallowEqual = (a: Record<string, string>, b: Record<string, string>) => {
  const ak = Object.keys(a),
    bk = Object.keys(b);

  if (ak.length !== bk.length) return false;
  for (const k of ak) if (a[k] !== b[k]) return false;

  return true;
};

export function Specifications({ specs = [], value, onChange, disabled = false }: SpecificationsProps) {
  const multiFacetNames = useMemo(() => {
    const s = new Set<string>();

    specs.forEach((f) => {
      if (f.facetValues.length > 1) s.add(f.facetName);
    });

    return s;
  }, [specs]);

  const defaults = useMemo(() => {
    const d: Record<string, string> = {};

    specs.forEach((f) => {
      if (f.facetValues.length) {
        const firstValue = f.facetValues[0];
        d[f.facetName] = typeof firstValue === 'string' ? firstValue : firstValue.value;
      }
    });

    return d;
  }, [specs]);

  const [selectedValues, setSelectedValues] = useState<Record<string, string>>({});
  const userActionRef = useRef(false);
  const lastEmittedRef = useRef<Record<string, string>>({});

  // Sync local state from props (no onChange here)
  useEffect(() => {
    if (!specs.length) {
      if (!shallowEqual(selectedValues, {})) setSelectedValues({});

      return;
    }
    const next: Record<string, string> = {};

    specs.forEach(({ facetName, facetValues }) => {
      const allowedValues = facetValues.map(fv => typeof fv === 'string' ? fv : fv.value);
      const allowed = new Set(allowedValues);
      const candidate =
        (value && value[facetName] !== undefined ? value[facetName] : selectedValues[facetName]) ??
        defaults[facetName];

      const firstValue = facetValues[0];
      const defaultValue = typeof firstValue === 'string' ? firstValue : firstValue.value;
      next[facetName] = allowed.has(String(candidate)) ? String(candidate) : defaultValue;
    });
    if (!shallowEqual(selectedValues, next)) setSelectedValues(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [specs, value]);

  // Remove the automatic emit - we now call onChange directly in handleSelect

  const handleSelect = (facetName: string, val: string, productVariantId?: string) => {
    setSelectedValues((prev) => {
      if (prev[facetName] === val) return prev;
      userActionRef.current = true;

      return { ...prev, [facetName]: val };
    });

    // Immediately call onChange with the variant ID
    if (onChange) {
      onChange(facetName, val, productVariantId);
    }
  };

  return (
    <div className="mb-12">
      <div className="max-w-3xl">
        <div className="rounded-2xl border border-border/40 bg-gradient-to-br from-card/80 to-card backdrop-blur-sm shadow-lg overflow-hidden">
          <div className="divide-y divide-border/30">
            {specs.map((spec, index) => {
              const isMulti = spec.facetValues.length > 1;
              const selected = selectedValues[spec.facetName];

              return (
                <div
                  key={spec.facetName}
                  className={`p-5 transition-colors duration-200 hover:bg-muted/30 ${
                    index % 2 === 0 ? 'bg-muted/10' : ''
                  }`}
                >
                 <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] lg:grid-cols-[250px_1fr]  items-center">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-brand-primary/60" />
                        <span className="font-semibold text-foreground text-sm sm:text-base">
                          {spec.facetName}
                        </span>
                      </div>

                      <div className="flex flex-col sm:items-center sm:mt-0 gap-2">
                        {isMulti ? (
                          <div className="flex flex-wrap justify-around gap-2 w-full">
                            {spec.facetValues.map((fv) => {
                              const facetValue = typeof fv === 'string' ? fv : fv.value;
                              const variantId = typeof fv === 'object' ? fv.productVariantId : undefined;
                              const isSelected = selected === facetValue;

                              return (
                                <button
                                  key={facetValue}
                                  aria-pressed={isSelected}
                                  disabled={disabled}
                                  className={[
                                    "flex-1 min-w-[96px] text-center px-4 py-2.5 text-sm font-medium rounded-lg border-2 transition-all duration-200",
                                    disabled ? "opacity-50 cursor-not-allowed" : "",
                                    isSelected
                                      ? "bg-brand-primary text-white border-brand-primary shadow-md hover:shadow-lg"
                                      : "bg-background text-foreground border-border/60 hover:border-brand-primary/60 hover:bg-brand-primary/5 hover:shadow-sm",
                                  ].join(" ")}
                                  type="button"
                                  onClick={() => handleSelect(spec.facetName, facetValue, variantId)}
                                >
                                  {facetValue}
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                         <div className="inline-flex items-center justify-center  px-4 py-2 text-sm font-semibold rounded-md border border-brand-primary text-brand-primary bg-brand-primary/5">
                            {typeof spec.facetValues[0] === 'string' ? spec.facetValues[0] : spec.facetValues[0].value}
                          </div>
                        )}
                      </div>
                    </div>

                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
