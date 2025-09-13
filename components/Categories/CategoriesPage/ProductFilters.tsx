"use client";

import Link from "next/link";
import { Filter } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { CategoryModel } from "@/types/category";
import { BrandModel } from "@/types/brand";
import { FacetModel, FacetValueModel } from "@/types/facet";
import { FilterModel } from "@/types/filter";
import { Condition, FacetTypeEnum, StockStatus } from "@/types/enums";

type SubcategoryItem = CategoryModel & { count?: number };

type ProductFiltersProps = {
  filter: FilterModel;
  brands: BrandModel[];
  subcategories: SubcategoryItem[];
  facets: FacetModel[];
  onBrandToggle: (brandId: string) => void;
  onConditionToggle: (cond: Condition) => void;
  onStockChange: (status?: StockStatus) => void;
  onPriceChange: (min?: number, max?: number) => void;
  onFacetToggle: (facetValueId: string) => void;
  onFacetRadioChange: (facetId: string, facetValueId: string) => void;
  clearFilters: () => void;
  activeFiltersCount: number;
  buildSubHref: (sub: CategoryModel) => string;
};

function isFacetValueSelected(filter: FilterModel, valueId?: string) {
  if (!valueId) return false;

  return (filter.facetFilters ?? []).some((f) => f.facetValueId === valueId);
}

function selectedRadioValueId(filter: FilterModel, facet: FacetModel): string | undefined {
  const ids = new Set((filter.facetFilters ?? []).map((f) => f.facetValueId));
  const hit = (facet.facetValues ?? []).find((v) => v.id && ids.has(v.id));

  return hit?.id;
}

function FacetBlock({
  facet,
  filter,
  onFacetToggle,
  onFacetRadioChange,
}: {
  facet: FacetModel;
  filter: FilterModel;
  onFacetToggle: (facetValueId: string) => void;
  onFacetRadioChange: (facetId: string, facetValueId: string) => void;
}) {
  const values = facet.facetValues ?? [];

  switch (facet.displayType) {
    case FacetTypeEnum.CheckboxList:
      return (
        <div className="space-y-3">
          {values.map((v) => (
            <div key={v.id} className="flex items-center space-x-2">
              <Checkbox
                checked={isFacetValueSelected(filter, v.id)}
                id={v.id}
                onCheckedChange={() => v.id && onFacetToggle(v.id)}
              />
              <label
                className="text-sm cursor-pointer text-text-light dark:text-text-lightdark"
                htmlFor={v.id}
              >
                {v.value}
              </label>
            </div>
          ))}
        </div>
      );

    case FacetTypeEnum.RadioButtonList: {
      const selectedId = selectedRadioValueId(filter, facet);

      return (
        <RadioGroup
          className="space-y-3"
          value={selectedId}
          onValueChange={(val) => onFacetRadioChange(facet.id, val)}
        >
          {values.map((v) => (
            <div key={v.id} className="flex items-center space-x-2">
              <RadioGroupItem id={`r-${facet.id}-${v.id}`} value={v.id!} />
              <Label
                className="text-text-light dark:text-text-lightdark"
                htmlFor={`r-${facet.id}-${v.id}`}
              >
                {v.value}
              </Label>
            </div>
          ))}
        </RadioGroup>
      );
    }

    case FacetTypeEnum.BooleanSwitch: {
      const v: FacetValueModel | undefined = values[0];
      const checked = isFacetValueSelected(filter, v?.id);

      return (
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-light dark:text-text-lightdark">
            {v?.value ?? "Enabled"}
          </span>
          <Switch checked={checked} onCheckedChange={() => v?.id && onFacetToggle(v.id)} />
        </div>
      );
    }

    default:
      return (
        <div className="space-y-3 text-xs text-text-subtle dark:text-text-subtledark">
          {values.length > 0 ? (
            values.map((v) => (
              <div key={v.id} className="flex items-center space-x-2">
                <Checkbox
                  checked={isFacetValueSelected(filter, v.id)}
                  id={v.id}
                  onCheckedChange={() => v.id && onFacetToggle(v.id)}
                />
                <label className="cursor-pointer" htmlFor={v.id}>
                  {v.value}
                </label>
              </div>
            ))
          ) : (
            <em>Server should provide values for this facet type.</em>
          )}
        </div>
      );
  }
}

function SidebarContent({
  filter,
  clearFilters,
  subcategories,
  brands,
  facets,
  onBrandToggle,
  onConditionToggle,
  onStockChange,
  onPriceChange,
  onFacetToggle,
  onFacetRadioChange,
  buildSubHref,
}: ProductFiltersProps) {
  const minPrice = typeof filter.minPrice === "number" ? filter.minPrice : 0;
  const maxPrice = typeof filter.maxPrice === "number" ? filter.maxPrice : 1000;

  return (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h2 className="text-lg font-semibold mb-4 text-text-light dark:text-text-lightdark">
          Categories
        </h2>
        <div className="space-y-2">
          {subcategories.map((sub) => (
            <Link
              key={sub.id}
              prefetch
              className="flex items-center justify-between w-full p-2 text-left rounded-md transition-colors
                         text-text-light dark:text-text-lightdark
                         hover:bg-brand-muted/50 dark:hover:bg-brand-muteddark/50
                         border border-transparent hover:border-brand-muted/70 dark:hover:border-brand-muteddark/70"
              href={buildSubHref(sub)}
            >
              <span className="text-sm">{sub.name}</span>
              <span className="text-xs text-text-subtle dark:text-text-subtledark">
                ({(sub as any).count ?? 0})
              </span>
            </Link>
          ))}
        </div>
      </div>

      <Accordion collapsible className="w-full" type="single">
        {/* Price */}
        <AccordionItem value="price">
          <AccordionTrigger className="text-text-light dark:text-text-lightdark">
            Price Range
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <Slider
                className="w-full mt-2"
                max={1000}
                min={0}
                step={10}
                value={[minPrice, maxPrice]}
                onValueChange={(v: number[]) => onPriceChange(v?.[0], v?.[1])}
              />
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-subtle dark:text-text-subtledark">₾{minPrice}</span>
                <span className="text-text-subtle dark:text-text-subtledark">₾{maxPrice}</span>
              </div>
              <div className="flex gap-2">
                <Input
                  className="w-24 bg-brand-surface dark:bg-brand-surfacedark border-brand-muted dark:border-brand-muteddark text-text-light dark:text-text-lightdark"
                  type="number"
                  value={String(minPrice)}
                  onChange={(e) => onPriceChange(Number(e.target.value) || 0, maxPrice)}
                />
                <Input
                  className="w-24 bg-brand-surface dark:bg-brand-surfacedark border-brand-muted dark:border-brand-muteddark text-text-light dark:text-text-lightdark"
                  type="number"
                  value={String(maxPrice)}
                  onChange={(e) => onPriceChange(minPrice, Number(e.target.value) || 1000)}
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Brands */}
        <AccordionItem value="brands">
          <AccordionTrigger className="text-text-light dark:text-text-lightdark">
            Brands
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3">
              {brands.map((b) => {
                const active = (filter.brandIds ?? []).includes(b.id);

                return (
                  <div key={b.id} className="flex items-center space-x-2">
                    <Checkbox
                      checked={active}
                      id={`brand-${b.id}`}
                      onCheckedChange={() => onBrandToggle(b.id)}
                    />
                    <label
                      className="text-sm cursor-pointer text-text-light dark:text-text-lightdark"
                      htmlFor={`brand-${b.id}`}
                    >
                      {b.name}
                    </label>
                  </div>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Stock */}
        <AccordionItem value="stock">
          <AccordionTrigger className="text-text-light dark:text-text-lightdark">
            Stock
          </AccordionTrigger>
          <AccordionContent>
            <RadioGroup
              className="space-y-3"
              value={filter.stockStatus === undefined ? "all" : String(filter.stockStatus)}
              onValueChange={(val) =>
                onStockChange(val === "all" ? undefined : (Number(val) as StockStatus))
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem id="stock-all" value="all" />
                <Label className="text-text-light dark:text-text-lightdark" htmlFor="stock-all">
                  All
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem id="stock-in" value={String(StockStatus.InStock)} />
                <Label className="text-text-light dark:text-text-lightdark" htmlFor="stock-in">
                  In stock
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem id="stock-out" value={String(StockStatus.OutOfStock)} />
                <Label className="text-text-light dark:text-text-lightdark" htmlFor="stock-out">
                  Out of stock
                </Label>
              </div>
            </RadioGroup>
          </AccordionContent>
        </AccordionItem>

        {/* Condition */}
        <AccordionItem value="condition">
          <AccordionTrigger className="text-text-light dark:text-text-lightdark">
            Condition
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3">
              {[
                { v: Condition.New, label: "New" },
                { v: Condition.Used, label: "Used" },
                { v: Condition.LikeNew, label: "Like new" },
              ].map((c) => {
                const active = (filter.condition ?? []).includes(c.v);

                return (
                  <div key={c.v} className="flex items-center space-x-2">
                    <Checkbox
                      checked={active}
                      id={`cond-${c.v}`}
                      onCheckedChange={() => onConditionToggle(c.v)}
                    />
                    <label
                      className="text-sm cursor-pointer text-text-light dark:text-text-lightdark"
                      htmlFor={`cond-${c.v}`}
                    >
                      {c.label}
                    </label>
                  </div>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Dynamic facets */}
        {facets.map((f) => (
          <AccordionItem key={f.id} value={`facet-${f.id}`}>
            <AccordionTrigger className="text-text-light dark:text-text-lightdark">
              {f.name}
            </AccordionTrigger>
            <AccordionContent>
              <FacetBlock
                facet={f}
                filter={filter}
                onFacetRadioChange={onFacetRadioChange}
                onFacetToggle={onFacetToggle}
              />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <Button
        className="w-full border-brand-muted dark:border-brand-muteddark text-text-light dark:text-text-lightdark hover:bg-brand-muted/50 dark:hover:bg-brand-muteddark/50"
        variant="outline"
        onClick={clearFilters}
      >
        Clear all filters
      </Button>
    </div>
  );
}

export default function ProductFilters(props: ProductFiltersProps) {
  const { activeFiltersCount } = props;

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        aria-label="Filters"
        className="hidden lg:block sticky top-6 h-fit max-h-[calc(100vh-3rem)] overflow-y-auto
                   border border-brand-muted dark:border-brand-muteddark
                   rounded-lg bg-brand-surface dark:bg-brand-surfacedark p-6 shadow-sm"
      >
        <SidebarContent {...props} />
      </aside>

      {/* Mobile sheet */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            className="lg:hidden relative bg-brand-surface dark:bg-brand-surfacedark
                       border border-brand-muted dark:border-brand-muteddark
                       text-text-light dark:text-text-lightdark"
            variant="outline"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge className="ml-2 h-5 w-5 rounded-full p-0 text-xs bg-brand-primary text-white">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>

        <SheetContent
          aria-label="Mobile filters"
          className="w-[300px] p-0 bg-brand-surface dark:bg-brand-surfacedark border-r border-brand-muted dark:border-brand-muteddark"
          side="left"
        >
          <SheetHeader className="p-6 pb-4">
            <SheetTitle className="text-text-light dark:text-text-lightdark">Filters</SheetTitle>
          </SheetHeader>
          <div className="px-6 pb-6 overflow-y-auto max-h-[calc(100vh-80px)]">
            <SidebarContent {...props} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
