import { useState, useEffect } from "react";

interface SpecificationsProps {
  specs: {
    facetName: string;
    facetValues: string[];
  }[];
}

export function Specifications({ specs }: SpecificationsProps) {
  const [selectedValues, setSelectedValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (specs?.length) {
      const defaults: Record<string, string> = {};
      specs.forEach((spec) => {
        if (spec.facetValues.length > 0) {
          defaults[spec.facetName] = spec.facetValues[0];
        }
      });
      setSelectedValues(defaults);
    }
  }, [specs]);

  const handleSelect = (facetName: string, value: string) => {
    setSelectedValues((prev) => ({ ...prev, [facetName]: value }));
  };

  return (
    <div className="mb-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          {specs.map((spec, index) => (
            <div key={index} className="grid grid-cols-2 border-b pb-2 items-center">
              <span className="font-medium">{spec.facetName}</span>
              <div className="flex gap-2 flex-wrap">
                <div className="flex-1 sm:max-w-md">
                  {spec.facetValues.length > 1 ? (
                    <div className="flex gap-2 flex-wrap justify-end">
                      {spec.facetValues.map((value) => (
                        <button
                          key={value}
                          onClick={() => handleSelect(spec.facetName, value)}
                          className={`
                            px-3 py-1.5 text-sm font-medium rounded-full border-2 transition-all duration-200 
                            ${selectedValues[spec.facetName] === value
                              ? "bg-blue-600 text-white border-blue-600 shadow-lg "
                              : "bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:text-blue-600 "
                            }
                          `}
                        >
                          {value}
                        </button>
                      ))}
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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
