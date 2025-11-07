"use client";

import { useEffect, useMemo, useRef, useState } from "react";

interface SpecificationsProps {
  specs: { facetName: string; facetValues: string[] }[];
  value?: Record<string, string>;
  onChange?: (selected: Record<string, string>) => void;
}

const shallowEqual = (a: Record<string, string>, b: Record<string, string>) => {
  const ak = Object.keys(a),
    bk = Object.keys(b);

  if (ak.length !== bk.length) return false;
  for (const k of ak) if (a[k] !== b[k]) return false;

  return true;
};

export function Specifications({ specs = [], value, onChange }: SpecificationsProps) {
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
      if (f.facetValues.length) d[f.facetName] = f.facetValues[0];
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
      const allowed = new Set(facetValues);
      const candidate =
        (value && value[facetName] !== undefined ? value[facetName] : selectedValues[facetName]) ??
        defaults[facetName];

      next[facetName] = allowed.has(String(candidate)) ? String(candidate) : facetValues[0];
    });
    if (!shallowEqual(selectedValues, next)) setSelectedValues(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [specs, value]);

  // Emit after commit and only if user-driven
  useEffect(() => {
    if (!onChange || !userActionRef.current) return;
    const payload: Record<string, string> = {};

    Object.keys(selectedValues).forEach((name) => {
      if (multiFacetNames.has(name)) payload[name] = selectedValues[name];
    });
    if (!shallowEqual(lastEmittedRef.current, payload)) {
      onChange(payload);
      lastEmittedRef.current = payload;
    }
    userActionRef.current = false;
  }, [selectedValues, multiFacetNames, onChange]);

  const handleSelect = (facetName: string, val: string) => {
    setSelectedValues((prev) => {
      if (prev[facetName] === val) return prev;
      userActionRef.current = true;

      return { ...prev, [facetName]: val };
    });
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
                            {spec.facetValues.map((v) => {
                              const isSelected = selected === v;

                              return (
                                <button
                                  key={v}
                                  aria-pressed={isSelected}
                                  className={[
                                    "flex-1 min-w-[96px] text-center px-4 py-2.5 text-sm font-medium rounded-lg border-2 transition-all duration-200",
                                    isSelected
                                      ? "bg-brand-primary text-white border-brand-primary shadow-md hover:shadow-lg"
                                      : "bg-background text-foreground border-border/60 hover:border-brand-primary/60 hover:bg-brand-primary/5 hover:shadow-sm",
                                  ].join(" ")}
                                  type="button"
                                  onClick={() => handleSelect(spec.facetName, v)}
                                >
                                  {v}
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                         <div className="inline-flex items-center justify-center  px-4 py-2 text-sm font-semibold rounded-md border border-brand-primary text-brand-primary bg-brand-primary/5">
                            {spec.facetValues[0]}
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
