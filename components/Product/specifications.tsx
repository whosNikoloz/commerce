interface Specification {
  label: string;
  value: string;
}

interface SpecificationsProps {
  specs: Specification[];
}

export function Specifications({ specs }: SpecificationsProps) {
  // Split specs into two columns
  const midpoint = Math.ceil(specs.length / 2);
  const leftColumnSpecs = specs.slice(0, midpoint);
  const rightColumnSpecs = specs.slice(midpoint);

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-6">Specifications</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          {leftColumnSpecs.map((spec, index) => (
            <div key={index} className="grid grid-cols-2 border-b pb-2">
              <span className="font-medium">{spec.label}</span>
              <span>{spec.value}</span>
            </div>
          ))}
        </div>
        <div className="space-y-3">
          {rightColumnSpecs.map((spec, index) => (
            <div key={index} className="grid grid-cols-2 border-b pb-2">
              <span className="font-medium">{spec.label}</span>
              <span>{spec.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
