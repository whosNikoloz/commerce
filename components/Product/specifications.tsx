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
      <div className="p-6 rounded-2xl border-2 border-border/50 bg-gradient-to-br from-card to-card/90 shadow-xl shadow-black/5 dark:shadow-black/20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            {specs.map((spec) => {
              const isMulti = spec.facetValues.length > 1;
              const selected = selectedValues[spec.facetName];

              return (
                <div
                  key={spec.facetName}
                  className="grid grid-cols-2 gap-4 border-b border-border/30 pb-4 last:border-0 items-center"
                >
                  <span className="font-semibold text-foreground">{spec.facetName}</span>
                  <div className="flex-1 sm:max-w-md">
                    {isMulti ? (
                      <div className="flex gap-2 flex-wrap justify-end">
                        {spec.facetValues.map((v) => {
                          const isSelected = selected === v;

                          return (
                            <button
                              key={v}
                              aria-pressed={isSelected}
                              className={[
                                "px-4 py-2 text-sm font-semibold rounded-xl border-2 transition-all duration-300 shadow-md",
                                isSelected
                                  ? "bg-gradient-to-r from-brand-primary to-brand-primary/90 text-white border-brand-primary shadow-lg shadow-brand-primary/30 scale-105"
                                  : "bg-card text-foreground border-border/50 hover:border-brand-primary/50 hover:bg-brand-primary/5 hover:scale-105",
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
                      <div className="text-right">
                        <span
                          className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold
                                     bg-gradient-to-r from-brand-primary/10 to-brand-primary/5 text-brand-primary border-2 border-brand-primary/30 shadow-md"
                        >
                          {spec.facetValues[0]}
                        </span>
                      </div>
                    )}
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
