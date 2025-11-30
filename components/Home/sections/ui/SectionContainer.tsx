import { ReactNode } from "react";
import { AlertCircle } from "lucide-react";

interface SectionContainerProps {
  children: ReactNode;
  className?: string;
  isLoading?: boolean;
  error?: Error | null;
  isEmpty?: boolean;
  emptyMessage?: string;
  loadingSkeleton?: ReactNode;
}

export function SectionContainer({
  children,
  className = "",
  isLoading,
  error,
  isEmpty,
  emptyMessage = "No items found",
  loadingSkeleton,
}: SectionContainerProps) {
  if (error) {
    return (
      <section className={`py-12 ${className}`}>
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h3 className="font-heading text-lg font-semibold text-foreground mb-2">
              Something went wrong
            </h3>
            <p className="font-primary text-muted-foreground text-sm max-w-md">
              {error.message || "Failed to load content"}
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (isLoading && loadingSkeleton) {
    return (
      <section className={className}>
        {loadingSkeleton}
      </section>
    );
  }

  if (isEmpty) {
    return (
      <section className={`py-12 ${className}`}>
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="font-primary text-muted-foreground">{emptyMessage}</p>
          </div>
        </div>
      </section>
    );
  }

  return <section className={className}>{children}</section>;
}
