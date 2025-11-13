"use client";

import { useMemo } from "react";

interface FacetValue {
  value: string;
  facetValueId?: string;
  isReachable?: boolean;
  isSelected?: boolean;
}

interface SpecificationsProps {
  specs: {
    facetName: string;
    facetValues: (string | FacetValue)[];
  }[];
  value?: Record<string, string>;
  onChange?: (facetName: string, facetValue: string, facetValueId?: string) => void;
  disabled?: boolean;
}

export function Specifications({ specs = [], value, onChange, disabled = false }: SpecificationsProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _multiFacetNames = useMemo(() => {
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

  // Compute selected values directly from specs and props during render
  const computedSelectedValues = useMemo(() => {
    if (!specs.length) return {};

    const next: Record<string, string> = {};

    specs.forEach(({ facetName, facetValues }) => {
      // First, check if any value has isSelected=true
      const selectedFromData = facetValues.find(fv =>
        typeof fv === 'object' && fv.isSelected === true
      );

      if (selectedFromData && typeof selectedFromData === 'object') {
        next[facetName] = selectedFromData.value;
      } else {
        // Fallback to value prop or first value
        const allowedValues = facetValues.map(fv => typeof fv === 'string' ? fv : fv.value);
        const allowed = new Set(allowedValues);
        const candidate = value?.[facetName] ?? defaults[facetName];
        const firstValue = facetValues[0];
        const defaultValue = typeof firstValue === 'string' ? firstValue : firstValue.value;

        next[facetName] = allowed.has(String(candidate)) ? String(candidate) : defaultValue;
      }
    });

    return next;
  }, [specs, value, defaults]);

  const handleSelect = (facetName: string, val: string, facetValueId?: string) => {
    if (onChange) {
      onChange(facetName, val, facetValueId);
    }
  };

  return (
    <div className="mb-12">
      <div className="max-w-3xl">
        <div className="rounded-2xl border border-border/40 bg-gradient-to-br from-card/80 to-card backdrop-blur-sm shadow-lg overflow-hidden">
          <div className="divide-y divide-border/30">
            {specs.map((spec, index) => {
              const isMulti = spec.facetValues.length > 1;
              const selected = computedSelectedValues[spec.facetName];

              return (
                <div
                  key={spec.facetName}
                  className={`p-5 hover:bg-muted/30 ${
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
                              const facetValueId = typeof fv === 'object' ? fv.facetValueId : undefined;
                              const isReachable = typeof fv === 'object' ? fv.isReachable ?? true : true;
                              const isSelected = selected === facetValue;
                              const isDisabled = disabled || !isReachable;

                              return (
                                <button
                                  key={facetValue}
                                  aria-pressed={isSelected}
                                  className={[
                                    "flex-1 min-w-[96px] text-center px-4 py-2.5 text-sm font-medium rounded-lg border-2 transition-all duration-200 transform",
                                    isDisabled ? "opacity-50 cursor-not-allowed" : "hover:scale-[1.02] active:scale-[0.98]",
                                    isSelected
                                      ? "bg-brand-primary text-white border-brand-primary shadow-md hover:shadow-lg"
                                      : "bg-background text-foreground border-border/60 hover:border-brand-primary/60 hover:bg-brand-primary/5 hover:shadow-sm",
                                  ].join(" ")}
                                  disabled={isDisabled}
                                  type="button"
                                  onClick={() => !isDisabled && handleSelect(spec.facetName, facetValue, facetValueId)}
                                >
                                  {facetValue}
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                         <div className="inline-flex items-center text-sm text-foreground font-medium">
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
