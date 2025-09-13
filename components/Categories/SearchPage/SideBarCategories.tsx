"use client";

import Link from "next/link";
import { Filter } from "lucide-react";

import { CategoryModel } from "@/types/category";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

type SubcategoryItem = CategoryModel & { count?: number };

type ProductFiltersProps = {
  categorys: SubcategoryItem[];
  buildSubHref: (sub: CategoryModel) => string;
};

function SidebarContent({ categorys, buildSubHref }: ProductFiltersProps) {
  return (
    <div className="space-y-6 text-text-light dark:text-text-lightdark">
      <div>
        <h2 className="text-lg font-semibold mb-4">კატეგორიები</h2>
        <div className="space-y-2">
          {categorys.map((sub) => (
            <Link
              key={sub.id}
              prefetch
              className="flex items-center justify-between w-full p-2 text-left rounded-md
                         text-text-light dark:text-text-lightdark
                         hover:bg-brand-muted dark:hover:bg-brand-muteddark
                         transition-colors"
              href={buildSubHref(sub)}
            >
              <span className="text-sm">{sub.name}</span>
              {/* <span className="text-xs text-text-subtle dark:text-text-subtledark">({sub.count ?? 0})</span> */}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SideBarCategories(props: ProductFiltersProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside
        aria-label="Categories"
        className="hidden lg:block sticky top-6 h-fit max-h-[calc(100vh-3rem)] overflow-y-auto
                   rounded-lg border shadow-sm p-6
                   bg-brand-surface dark:bg-brand-surfacedark
                   border-brand-muted dark:border-brand-muteddark
                   text-text-light dark:text-text-lightdark"
      >
        <SidebarContent {...props} />
      </aside>

      {/* Mobile sheet */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            className="lg:hidden relative
                       border-brand-muted dark:border-brand-muteddark
                       text-text-light dark:text-text-lightdark
                       bg-brand-surface dark:bg-brand-surfacedark"
            variant="outline"
          >
            <Filter className="h-4 w-4 mr-2" />
            კატეგორიები
          </Button>
        </SheetTrigger>

        <SheetContent
          className="w-[300px] p-0
                     bg-brand-surface dark:bg-brand-surfacedark
                     text-text-light dark:text-text-lightdark
                     border-brand-muted dark:border-brand-muteddark"
          side="left"
        >
          <SheetHeader className="p-6 pb-4">
            <SheetTitle className="text-text-light dark:text-text-lightdark">
              კატეგორიები
            </SheetTitle>
          </SheetHeader>

          <div className="px-6 pb-6 overflow-y-auto max-h-[calc(100vh-80px)]">
            <SidebarContent {...props} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
