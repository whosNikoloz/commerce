// components/admin/facets/DisplayTypePreview.tsx
"use client";

import { FacetTypeEnum } from "@/types/enums";
import type { FacetValueModel } from "@/types/facet";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

export function DisplayTypePreview({
  displayType,
  values,
}: {
  displayType: number | string;
  values: FacetValueModel[];
}) {
  const t = Number(displayType);
  const first = values?.[0];

  switch (t) {
    case FacetTypeEnum.CheckboxList:
      return (
        <div className="space-y-2">
          {(values.length ? values : [{ id: "1", value: "Option A" }, { id: "2", value: "Option B" }]).map(v => (
            <div key={v.id} className="flex items-center gap-2">
              <Checkbox id={`pv-${v.id}`} />
              <Label htmlFor={`pv-${v.id}`}>{v.value || "Value"}</Label>
            </div>
          ))}
        </div>
      );

    case FacetTypeEnum.RadioButtonList:
      return (
        <RadioGroup className="space-y-2">
          {(values.length ? values : [{ id: "1", value: "One" }, { id: "2", value: "Two" }]).map(v => (
            <div key={v.id} className="flex items-center gap-2">
              <RadioGroupItem id={`pv-r-${v.id}`} value={v.id!} />
              <Label htmlFor={`pv-r-${v.id}`}>{v.value || "Value"}</Label>
            </div>
          ))}
        </RadioGroup>
      );

    case FacetTypeEnum.RangeSlider:
      return (
        <div className="space-y-3">
          <Slider defaultValue={[100, 600]} min={0} max={1000} step={10} />
          <div className="flex gap-2">
            <Input className="w-24" placeholder="Min" defaultValue="100" />
            <Input className="w-24" placeholder="Max" defaultValue="600" />
          </div>
        </div>
      );

    case FacetTypeEnum.NumericInput:
      return <Input className="w-40" type="number" placeholder={first?.value || "Enter number"} />;

    case FacetTypeEnum.BooleanSwitch:
      return (
        <div className="flex items-center justify-between">
          <span className="text-sm">{first?.value || "Enabled"}</span>
          <Switch />
        </div>
      );

    case FacetTypeEnum.SearchBox:
      return <Input placeholder={first?.value || "Search…"} />;

    case FacetTypeEnum.DateRangePicker:
      return (
        <div className="flex items-center gap-2">
          <Input type="date" className="w-44" />
          <span className="text-xs text-muted-foreground">to</span>
          <Input type="date" className="w-44" />
        </div>
      );

    default:
      return <div className="text-xs text-muted-foreground">Select a display type to preview.</div>;
  }
}
