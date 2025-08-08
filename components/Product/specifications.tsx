import { ProductFacetValueResponseModel } from "@/types/facet";

interface SpecificationsProps {
  specs: ProductFacetValueResponseModel[];
}

export function Specifications({ specs }: SpecificationsProps) {
  return (
    <div className="mb-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          {specs.map((spec, index) => (
            <div key={index} className="grid grid-cols-2 border-b pb-2">
              <span className="font-medium">{spec.facetName}</span>
              <span>{spec.facetValue}</span>
            </div>
          ))}
        </div>
        {/* <div className="space-y-3">
          {rightColumnSpecs.map((spec, index) => (
            <div key={index} className="grid grid-cols-2 border-b pb-2">
              <span className="font-medium">{spec.label}</span>
              <span>{spec.value}</span>
            </div>
          ))}
        </div> */}
      </div>
    </div>
  );
}
