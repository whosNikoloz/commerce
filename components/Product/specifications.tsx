import { useState, useEffect, useMemo, useCallback, useRef } from "react";

interface SpecificationsProps {
  specs: { facetName: string; facetValues: string[] }[];
  value?: Record<string, string>;
  onChange?: (selected: Record<string, string>) => void;
}

export function Specifications({ specs, value, onChange }: SpecificationsProps) {
  const multiFacetNames = useMemo(() => {
    const s = new Set<string>();
    specs?.forEach(f => { if (f.facetValues.length > 1) s.add(f.facetName); });
    return s;
  }, [specs]);

  const facetMap = useMemo(() => {
    const m = new Map<string, Set<string>>();
    specs?.forEach(f => m.set(f.facetName, new Set(f.facetValues)));
    return m;
  }, [specs]);

  const defaults = useMemo(() => {
    const d: Record<string, string> = {};
    specs?.forEach(f => { if (f.facetValues.length) d[f.facetName] = f.facetValues[0]; });
    return d;
  }, [specs]);

  const [selectedValues, setSelectedValues] = useState<Record<string, string>>({});
  const touchedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const base: Record<string, string> = { ...selectedValues, ...(value ?? {}) };
    const next: Record<string, string> = {};

    specs.forEach(({ facetName, facetValues }) => {
      const allowed = new Set(facetValues);
      const candidate =
        (value && value[facetName] !== undefined ? value[facetName] : base[facetName]) ??
        defaults[facetName];

      next[facetName] = allowed.has(candidate!) ? candidate! : facetValues[0];
    });

    setSelectedValues(next);
    touchedRef.current.forEach(name => { if (!facetMap.has(name)) touchedRef.current.delete(name); });
  }, [specs, value]);

  const emitChanged = useCallback((nextValues: Record<string, string>) => {
    if (!onChange) return;
    const payload: Record<string, string> = {};
    touchedRef.current.forEach((name) => {
      if (multiFacetNames.has(name) && nextValues[name] !== undefined) {
        payload[name] = nextValues[name];
      }
    });
    onChange(payload);
  }, [onChange, multiFacetNames]);

  const handleSelect = (facetName: string, value: string) => {
    setSelectedValues(prev => {
      if (prev[facetName] === value) return prev; // no-op
      const next = { ...prev, [facetName]: value };
      touchedRef.current.add(facetName);
      emitChanged(next);
      return next;
    });
  };

  return (
    <div className="mb-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          {specs.map((spec) => {
            const isMulti = spec.facetValues.length > 1;
            const selected = selectedValues[spec.facetName];

            return (
              <div key={spec.facetName} className="grid grid-cols-2 border-b pb-2 items-center">
                <span className="font-medium">{spec.facetName}</span>
                <div className="flex-1 sm:max-w-md">
                  {isMulti ? (
                    <div className="flex gap-2 flex-wrap justify-end">
                      {spec.facetValues.map((v) => {
                        const isSelected = selected === v;
                        return (
                          <button
                            key={v}
                            type="button"
                            onClick={() => handleSelect(spec.facetName, v)}
                            aria-pressed={isSelected}
                            className={`px-3 py-1.5 text-sm font-medium rounded-full border-2 transition-all
                              ${isSelected ? "bg-blue-600 text-white border-blue-600 shadow-lg"
                                : "bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:text-blue-600"}`}
                          >
                            {v}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-right">
                      <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
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
  );
}
