import { ChevronRight } from "lucide-react";
import Link from "next/link";

interface BreadcrumbProps {
  items: {
    label: string;
    href?: string;
  }[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <div className="flex items-center text-sm text-muted-foreground mb-6">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div key={index} className="flex items-center">
            {item.href ? (
              <Link
                className="hover:text-primary cursor-pointer"
                href={item.href}
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={
                  isLast
                    ? "text-foreground"
                    : "hover:text-primary cursor-pointer"
                }
              >
                {item.label}
              </span>
            )}

            {!isLast && <ChevronRight className="h-4 w-4 mx-2" />}
          </div>
        );
      })}
    </div>
  );
}
