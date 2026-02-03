
import { useState, useEffect } from "react";
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
import { FacetModel } from "@/types/facet";
import { FilterModel } from "@/types/filter";
import { Condition, FacetTypeEnum, StockStatus } from "@/types/enums";
import { useDictionary } from "@/app/context/dictionary-provider";

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
  onFacetToggle: (facetId: string, facetValueId: string) => void;
  onFacetRadioChange: (facetId: string, facetValueId: string) => void;

  onFacetRangeChange?: (facetId: string, min?: number, max?: number) => void;
  onFacetNumericChange?: (facetId: string, value?: number) => void;
  onFacetSearchChange?: (facetId: string, text: string) => void;
  onFacetDateRangeChange?: (facetId: string, from?: string, to?: string) => void;

  clearFilters: () => void;
  activeFiltersCount: number;
  buildSubHref: (sub: CategoryModel) => string;
  priceMin?: number;
  priceMax?: number;
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
  onFacetRangeChange,
  onFacetNumericChange,
  onFacetSearchChange,
  onFacetDateRangeChange,
}: {
  facet: FacetModel;
  filter: FilterModel;
  onFacetToggle: (facetId: string, facetValueId: string) => void;
  onFacetRadioChange: (facetId: string, facetValueId: string) => void;
  onFacetRangeChange?: (facetId: string, min?: number, max?: number) => void;
  onFacetNumericChange?: (facetId: string, value?: number) => void;
  onFacetSearchChange?: (facetId: string, text: string) => void;
  onFacetDateRangeChange?: (facetId: string, from?: string, to?: string) => void;
}) {
  const values = facet.facetValues ?? [];

  const selectedId = selectedRadioValueId(filter, facet);
  const firstVal = values[0];

  switch (facet.displayType) {
    case FacetTypeEnum.CheckboxList:
      return (
        <div className="space-y-3">
          {values.map((v) => (
            <div key={v.id} className="flex items-center space-x-2">
              <Checkbox
                checked={isFacetValueSelected(filter, v.id)}
                id={v.id}
                onCheckedChange={() => v.id && onFacetToggle(facet.id, v.id)}
              />
              <label className="font-primary text-sm cursor-pointer text-text-light dark:text-text-lightdark" htmlFor={v.id}>
                {v.value}
              </label>
            </div>
          ))}
        </div>
      );

    case FacetTypeEnum.RadioButtonList:
      return (
        <RadioGroup
          className="space-y-3"
          value={selectedId}
          onValueChange={(val) => onFacetRadioChange(facet.id, val)}
        >
          {values.map((v) => (
            <div key={v.id} className="flex items-center space-x-2">
              <RadioGroupItem id={`r-${facet.id}-${v.id}`} value={v.id!} />
              <Label className="text-text-light dark:text-text-lightdark" htmlFor={`r-${facet.id}-${v.id}`}>
                {v.value}
              </Label>
            </div>
          ))}
        </RadioGroup>
      );

    case FacetTypeEnum.RangeSlider: {
      const disabled = !onFacetRangeChange;
      const min = 0, max = 1000, step = 10;

      return (
        <div className="space-y-3 opacity-100">
          <Slider
            className="w-full"
            defaultValue={[min, max]}
            disabled={disabled}
            max={max}
            min={min}
            step={step}
            onValueChange={(v: number[]) => onFacetRangeChange?.(facet.id, v?.[0], v?.[1])}
          />
          <div className="flex gap-2">
            <Input
              className="w-24"
              disabled={disabled}
              placeholder={`${min}`}
              type="number"
              onBlur={(e) => onFacetRangeChange?.(facet.id, Number(e.target.value) || min, undefined)}
            />
            <Input
              className="w-24"
              disabled={disabled}
              placeholder={`${max}`}
              type="number"
              onBlur={(e) => onFacetRangeChange?.(facet.id, undefined, Number(e.target.value) || max)}
            />
          </div>
        </div>
      );
    }

    case FacetTypeEnum.NumericInput: {
      const disabled = !onFacetNumericChange;

      return (
        <div className="flex items-center gap-2">
          <Input
            className="w-32"
            disabled={disabled}
            placeholder={firstVal?.value ?? "Enter value"}
            type="number"
            onBlur={(e) => onFacetNumericChange?.(facet.id, e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>
      );
    }

    case FacetTypeEnum.BooleanSwitch: {
      const checked = isFacetValueSelected(filter, firstVal?.id);

      return (
        <div className="flex items-center justify-between">
          <span className="font-primary text-sm text-text-light dark:text-text-lightdark">
            {firstVal?.value ?? "Enabled"}
          </span>
          <Switch checked={checked} onCheckedChange={() => firstVal?.id && onFacetToggle(facet.id, firstVal.id)} />
        </div>
      );
    }

    case FacetTypeEnum.SearchBox: {
      const disabled = !onFacetSearchChange;

      return (
        <Input
          disabled={disabled}
          placeholder={firstVal?.value ?? "Search..."}
          onChange={(e) => onFacetSearchChange?.(facet.id, e.target.value)}
        />
      );
    }

    case FacetTypeEnum.DateRangePicker: {
      const disabled = !onFacetDateRangeChange;

      return (
        <div className="flex items-center gap-2">
          <Input
            className="w-40"
            disabled={disabled}
            type="date"
            onChange={(e) => onFacetDateRangeChange?.(facet.id, e.target.value || undefined, undefined)}
          />
          <span className="font-primary text-xs text-muted-foreground">to</span>
          <Input
            className="w-40"
            disabled={disabled}
            type="date"
            onChange={(e) => onFacetDateRangeChange?.(facet.id, undefined, e.target.value || undefined)}
          />
        </div>
      );
    }

    default:
      // fallback = checkbox list behavior
      return (
        <div className="space-y-3 text-xs text-text-subtle dark:text-text-subtledark">
          {values.length > 0 ? (
            values.map((v) => (
              <div key={v.id} className="flex items-center space-x-2">
                <Checkbox
                  checked={isFacetValueSelected(filter, v.id)}
                  id={v.id}
                  onCheckedChange={() => v.id && onFacetToggle(facet.id, v.id)}
                />
                <label className="font-primary cursor-pointer" htmlFor={v.id}>
                  {v.value}
                </label>
              </div>
            ))
          ) : (
            <em>No values</em>
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
  onFacetRangeChange,
  onFacetNumericChange,
  onFacetSearchChange,
  onFacetDateRangeChange,
  buildSubHref,
  priceMin = 0,
  priceMax = 1000,
}: ProductFiltersProps) {
  const dict = useDictionary();

  // Local state for debouncing slider/input
  const minPrice = typeof filter.minPrice === "number" ? filter.minPrice : priceMin;
  const maxPrice = typeof filter.maxPrice === "number" ? filter.maxPrice : priceMax;
  const [localPriceRange, setLocalPriceRange] = useState([minPrice, maxPrice]);

  // Sync local state when props change (e.g. initial load or URL update from other source)
  useEffect(() => {
    setLocalPriceRange([minPrice, maxPrice]);
  }, [minPrice, maxPrice]);

  return (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h2 className="font-heading text-lg font-bold mb-4 text-foreground flex items-center gap-2 pb-2 border-b border-border/50">
          <span className="font-primary w-1 h-5 bg-gradient-to-b from-brand-primary to-brand-primary/50 rounded-full" />
          {dict?.filters?.categories}
        </h2>
        <div className="space-y-1.5">
          {subcategories.map((sub) => (
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
              <span className="font-primary text-xs px-2 py-0.5 rounded-full bg-muted/50 text-muted-foreground group-hover:bg-brand-primary/10 group-hover:text-brand-primary transition-all">
                {(sub as any).count ?? 0}
              </span>
            </Link>
          ))}
        </div>
      </div>

      <Accordion collapsible className="w-full" type="single">
        {/* Price */}
        <AccordionItem className="border-b border-border/50" value="price">
          <AccordionTrigger className="text-foreground font-semibold hover:text-brand-primary transition-colors px-2 hover:no-underline">
            <span className="font-primary flex items-center gap-2">
              {dict?.filters?.priceRange}
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <Slider
                className="w-full mt-2"
                max={priceMax}
                min={priceMin}
                step={10}
                value={[localPriceRange[0], localPriceRange[1]]}
                onValueChange={(v) => {
                  setLocalPriceRange([v[0], v[1]]);
                }}
                onValueCommit={(v) => {
                  onPriceChange(v[0], v[1]);
                }}
              />
              <div className="flex items-center justify-between text-sm">
                <span className="font-primary text-text-subtle dark:text-text-subtledark">₾{localPriceRange[0]}</span>
                <span className="font-primary text-text-subtle dark:text-text-subtledark">₾{localPriceRange[1]}</span>
              </div>
              <div className="flex gap-2">
                <Input
                  className="w-24 bg-brand-surface dark:bg-brand-surfacedark border-brand-muted dark:border-brand-muteddark text-text-light dark:text-text-lightdark"
                  type="number"
                  value={String(localPriceRange[0])}
                  onBlur={() => onPriceChange(localPriceRange[0], localPriceRange[1])}
                  onChange={(e) => {
                    const val = Number(e.target.value);

                    setLocalPriceRange([val, localPriceRange[1]]);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      onPriceChange(localPriceRange[0], localPriceRange[1]);
                    }
                  }}
                />
                <Input
                  className="w-24 bg-brand-surface dark:bg-brand-surfacedark border-brand-muted dark:border-brand-muteddark text-text-light dark:text-text-lightdark"
                  type="number"
                  value={String(localPriceRange[1])}
                  onBlur={() => onPriceChange(localPriceRange[0], localPriceRange[1])}
                  onChange={(e) => {
                    const val = Number(e.target.value);

                    setLocalPriceRange([localPriceRange[0], val]);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      onPriceChange(localPriceRange[0], localPriceRange[1]);
                    }
                  }}
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Brands */}
        <AccordionItem className="border-b border-border/50" value="brands">
          <AccordionTrigger className="text-foreground font-semibold hover:text-brand-primary transition-colors px-2 hover:no-underline">
            <span className="font-primary flex items-center gap-2">
              {dict?.filters?.brands}
            </span>
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
                    <label className="font-primary text-sm cursor-pointer text-text-light dark:text-text-lightdark"
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
        <AccordionItem className="border-b border-border/50" value="stock">
          <AccordionTrigger className="text-foreground font-semibold hover:text-brand-primary transition-colors px-2 hover:no-underline">
            <span className="font-primary flex items-center gap-2">
              {dict?.filters?.stock}
            </span>
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
                  {dict?.filters?.all}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem id="stock-in" value={String(StockStatus.InStock)} />
                <Label className="text-text-light dark:text-text-lightdark" htmlFor="stock-in">
                  {dict?.filters?.inStock}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem id="stock-out" value={String(StockStatus.OutOfStock)} />
                <Label className="text-text-light dark:text-text-lightdark" htmlFor="stock-out">
                  {dict?.filters?.outOfStock}
                </Label>
              </div>
            </RadioGroup>
          </AccordionContent>
        </AccordionItem>

        {/* Condition */}
        <AccordionItem className="border-b border-border/50" value="condition">
          <AccordionTrigger className="text-foreground font-semibold hover:text-brand-primary transition-colors px-2 hover:no-underline">
            <span className="font-primary flex items-center gap-2">
              {dict?.filters?.condition}
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3">
              {[
                { v: Condition.New, label: dict?.filters?.new },
                { v: Condition.Used, label: dict?.filters?.used },
                { v: Condition.LikeNew, label: dict?.filters?.likeNew },
              ].map((c) => {
                const active = (filter.condition ?? []).includes(c.v);

                return (
                  <div key={c.v} className="flex items-center space-x-2">
                    <Checkbox
                      checked={active}
                      id={`cond-${c.v}`}
                      onCheckedChange={() => onConditionToggle(c.v)}
                    />
                    <label className="font-primary text-sm cursor-pointer text-text-light dark:text-text-lightdark"
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
          <AccordionItem key={f.id} className="border-b border-border/50" value={`facet-${f.id}`}>
            <AccordionTrigger className="text-foreground font-semibold hover:text-brand-primary transition-colors px-2 hover:no-underline">
              <span className="font-primary flex items-center gap-2">
                {f.name}
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <FacetBlock
                facet={f}
                filter={filter}
                onFacetDateRangeChange={onFacetDateRangeChange}
                onFacetNumericChange={onFacetNumericChange}
                onFacetRadioChange={onFacetRadioChange}
                onFacetRangeChange={onFacetRangeChange}
                onFacetSearchChange={onFacetSearchChange}
                onFacetToggle={onFacetToggle}
              />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <Button
        className="w-full border-2 border-brand-primary/30 text-brand-primary hover:bg-brand-primary hover:text-white rounded-xl font-semibold shadow-md hover:shadow-lg hover:shadow-brand-primary/20 transition-all duration-300 hover:scale-[1.02]"
        variant="outline"
        onClick={clearFilters}
      >
        {dict?.filters?.clearAllFilters}
      </Button>
    </div>
  );
}

export default function ProductFilters(props: ProductFiltersProps) {
  const { activeFiltersCount } = props;
  const dict = useDictionary();


  return (
    <>
      {/* Desktop sidebar */}
      <aside
        aria-label="Filters"
        className="hidden lg:block lg:sticky lg:top-4 self-start h-fit max-h-[calc(100vh-2rem)] overflow-y-auto scroll
                   border border-border/50 rounded-2xl bg-card/50 backdrop-blur-sm p-6
                   shadow-xl shadow-black/5 dark:shadow-black/20
                   hover:shadow-2xl hover:shadow-black/10 dark:hover:shadow-black/30
                   transition-shadow duration-300 scrollbar-thin pr-2
                  [&::-webkit-scrollbar]:w-2
                  [&::-webkit-scrollbar-track]:rounded-full
                  [&::-webkit-scrollbar-track]:bg-gray-100
                  [&::-webkit-scrollbar-thumb]:rounded-full
                  [&::-webkit-scrollbar-thumb]:bg-gray-300
                  dark:[&::-webkit-scrollbar-track]:bg-neutral-700
                  dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500"
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
            {dict?.filters?.filters}
            {activeFiltersCount > 0 && (
              <Badge className="ml-2 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center bg-gradient-to-br from-brand-primary to-brand-primary/80 text-white shadow-lg">
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
            <SheetTitle className="text-text-light dark:text-text-lightdark">
              {dict?.filters?.filters}
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
