"use client";

import Link from "next/link";
import { Filter } from "lucide-react";

import { CategoryModel } from "@/types/category";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useDictionary } from "@/app/context/dictionary-provider";

type SubcategoryItem = CategoryModel & { count?: number };

type ProductFiltersProps = {
  categorys: SubcategoryItem[];
  buildSubHref: (sub: CategoryModel) => string;
};

function SidebarContent({ categorys, buildSubHref }: ProductFiltersProps) {
  
  const dict = useDictionary();
  const t = dict.filters;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-lg font-bold mb-4 text-foreground flex items-center gap-2 pb-2 border-b border-border/50">
          <span className="font-primary w-1 h-5 bg-gradient-to-b from-brand-primary to-brand-primary/50 rounded-full" />
          {t.categories}
        </h2>
        <div className="space-y-1.5">
          {categorys.map((sub) => (
            <Link
              key={sub.id}
              prefetch
              className="group flex items-center justify-between w-full px-3 py-2.5 text-left rounded-xl transition-all duration-200
                         text-foreground hover:text-brand-primary
                         hover:bg-brand-primary/5 dark:hover:bg-brand-primary/10
                         border border-transparent hover:border-brand-primary/20
                         hover:shadow-md hover:shadow-brand-primary/5
                         hover:translate-x-1"
              href={buildSubHref(sub)}
            >
              <span className="font-primary text-sm font-medium group-hover:font-semibold transition-all">{sub.name}</span>
              {/* <span className="font-primary text-xs px-2 py-0.5 rounded-full bg-muted/50 text-muted-foreground group-hover:bg-brand-primary/10 group-hover:text-brand-primary transition-all">
                {sub.count ?? 0}
              </span> */}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SideBarCategories(props: ProductFiltersProps) {
   const dict = useDictionary();
  const t = dict.filters;

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        aria-label="Categories"
        className="hidden lg:block sticky top-6 h-fit max-h-[calc(100vh-3rem)] overflow-y-auto
                   border border-border/50 rounded-2xl bg-card/50 backdrop-blur-sm p-6
                   shadow-xl shadow-black/5 dark:shadow-black/20
                   hover:shadow-2xl hover:shadow-black/10 dark:hover:shadow-black/30
                   transition-shadow duration-300"
      >
        <SidebarContent {...props} />
      </aside>

      {/* Mobile sheet */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            className="lg:hidden relative border-2 border-border/50 hover:border-brand-primary/40 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
            variant="outline"
          >
            <Filter className="h-4 w-4 mr-2" />
            {t.categories}
          </Button>
        </SheetTrigger>

        <SheetContent
          className="w-[300px] p-0 bg-card/95 backdrop-blur-md border-r-2 border-border/50"
          side="left"
        >
          <SheetHeader className="p-6 pb-4 border-b border-border/50">
            <SheetTitle className="text-foreground font-bold flex items-center gap-2" />
          </SheetHeader>

          <div className="px-6 pb-6 overflow-y-auto max-h-[calc(100vh-80px)]">
            <SidebarContent {...props} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
