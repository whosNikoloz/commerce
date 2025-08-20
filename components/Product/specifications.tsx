import { useState, useEffect, useMemo, useCallback } from "react";

interface SpecificationsProps {
  specs: {
    facetName: string;
    facetValues: string[];
  }[];
  onChange?: (selected: Record<string, string>) => void;
}

export function Specifications({ specs, onChange }: SpecificationsProps) {
  const multiFacetNames = useMemo(
    () => new Set(specs.filter(s => s.facetValues.length > 1).map(s => s.facetName)),
    [specs]
  );

  const [selectedValues, setSelectedValues] = useState<Record<string, string>>({});
  const touchedRef = useMemo(() => new Set<string>(), []);

  useEffect(() => {
    if (!specs?.length) {
      setSelectedValues({});
      touchedRef.clear();
      return;
    }
    const defaults: Record<string, string> = {};
    specs.forEach((spec) => {
      if (spec.facetValues.length > 0) {
        defaults[spec.facetName] = spec.facetValues[0];
      }
    });
    setSelectedValues(defaults);
    touchedRef.clear();
  }, [specs, touchedRef]);

  const emitChanged = useCallback(
    (nextValues: Record<string, string>) => {
      if (!onChange) return;
      const payload: Record<string, string> = {};
      touchedRef.forEach((name) => {
        if (multiFacetNames.has(name) && nextValues[name] !== undefined) {
          payload[name] = nextValues[name];
        }
      });
      onChange(payload);
    },
    [onChange, multiFacetNames, touchedRef]
  );

  const handleSelect = (facetName: string, value: string) => {
    setSelectedValues((prev) => {
      if (prev[facetName] === value) return prev; // no-op

      const next = { ...prev, [facetName]: value };
      touchedRef.add(facetName); // mark as touched once user interacts
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

                <div className="flex-1 sm:max-w-md text-right">
                  {isMulti ? (
                    <div className="flex gap-2 flex-wrap justify-end">
                      {spec.facetValues.map((value) => {
                        const isSelected = selected === value;
                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() => handleSelect(spec.facetName, value)}
                            className={`px-3 py-1.5 text-sm rounded-full border-2
                              ${isSelected
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:text-blue-600"
                              }`}
                          >
                            {value}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-green-100 text-green-800 border border-green-200">
                      {spec.facetValues[0]}
                    </span>
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
