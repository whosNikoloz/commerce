import { useState, useEffect, useMemo, useRef } from "react";

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
  const userActionRef = useRef(false); // ✅ gate emits to user actions only
  const lastEmittedRef = useRef<Record<string, string>>({}); // avoid duplicate emits

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
    if (!shallowEqual(selectedValues, next)) {
      setSelectedValues(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [specs, value]); // intentionally ignore selectedValues/defaults to avoid loops

  // ✅ Emit AFTER commit, and only if triggered by a user click
  useEffect(() => {
    if (!onChange) return;
    if (!userActionRef.current) return;

    const payload: Record<string, string> = {};

    Object.keys(selectedValues).forEach((name) => {
      if (multiFacetNames.has(name)) payload[name] = selectedValues[name];
    });

    if (!shallowEqual(lastEmittedRef.current, payload)) {
      onChange(payload);
      lastEmittedRef.current = payload;
    }
    userActionRef.current = false; // reset
  }, [selectedValues, multiFacetNames, onChange]);

  const handleSelect = (facetName: string, val: string) => {
    setSelectedValues((prev) => {
      if (prev[facetName] === val) return prev; // no-op
      userActionRef.current = true; // mark as user-driven

      return { ...prev, [facetName]: val };
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
                            aria-pressed={isSelected}
                            className={`px-3 py-1.5 text-sm font-medium rounded-full border-2 transition-all
                              ${
                                isSelected
                                  ? "bg-blue-600 text-white border-blue-600 shadow-lg"
                                  : "bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:text-blue-600"
                              }`}
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
