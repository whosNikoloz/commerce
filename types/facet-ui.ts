import type { FacetValueModel } from "@/types/facet";

export type FacetValueNode = FacetValueModel & {
  children?: FacetValueNode[];
};

export function hasChildren(v: unknown): v is { children: unknown[] } {
  return !!v && typeof v === "object" && Array.isArray((v as any).children);
}
