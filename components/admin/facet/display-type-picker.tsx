// components/admin/facets/DisplayTypePicker.tsx
"use client";

import {
  ListChecks,     // checkbox
  ListTree,       // radio
  SlidersHorizontal, // range
  Hash,           // numeric
  ToggleRight,    // boolean
  Search,         // search
  CalendarRange   // date range
} from "lucide-react";

import { cn } from "@/lib/utils";
import { FacetTypeEnum } from "@/types/enums";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type Props = {
  value: string | number;
  onChange: (v: string) => void;
};

const OPTIONS: Array<{
  value: string;
  title: string;
  desc: string;
  icon: React.ComponentType<any>;
}> = [
  { value: String(FacetTypeEnum.CheckboxList),   title: "Checkbox List",   desc: "Multiple choice", icon: ListChecks },
  { value: String(FacetTypeEnum.RadioButtonList),title: "Radio List",      desc: "Single choice",   icon: ListTree },
  { value: String(FacetTypeEnum.RangeSlider),    title: "Range Slider",    desc: "Min–Max",         icon: SlidersHorizontal },
  { value: String(FacetTypeEnum.NumericInput),   title: "Numeric Input",   desc: "Exact number",    icon: Hash },
  { value: String(FacetTypeEnum.BooleanSwitch),  title: "Boolean",         desc: "On/Off",          icon: ToggleRight },
  { value: String(FacetTypeEnum.SearchBox),      title: "Search Box",      desc: "Free text",       icon: Search },
  { value: String(FacetTypeEnum.DateRangePicker),title: "Date Range",      desc: "From–To",         icon: CalendarRange },
];

export default function DisplayTypePicker({ value, onChange }: Props) {
  return (
    <TooltipProvider delayDuration={100}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {OPTIONS.map(({ value: v, title, desc, icon: Icon }) => {
          const active = String(value) === v;

          return (
            <button
              key={v}
              className={cn(
                "rounded-xl border p-4 text-left transition-all flex items-start gap-3",
                "hover:shadow-md hover:border-primary/40",
                active
                  ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                  : "border-border bg-card"
              )}
              type="button"
              onClick={() => onChange(v)}
            >
              <div className={cn(
                "rounded-lg p-2 shrink-0",
                active ? "bg-primary/10" : "bg-muted"
              )}>
                <Icon className={cn("h-5 w-5", active ? "text-primary" : "text-muted-foreground")} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{title}</span>
                  {active && <Badge className="h-5" variant="secondary">Selected</Badge>}
                </div>
                <div className="text-xs text-muted-foreground mt-1">{desc}</div>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="sr-only">Info</span>
                </TooltipTrigger>
                <TooltipContent>{desc}</TooltipContent>
              </Tooltip>
            </button>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
