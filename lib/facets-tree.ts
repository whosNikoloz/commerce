import type { FacetValueModel } from "@/types/facet";
import type { FacetValueNode } from "@/types/facet-ui";

export function toTree(list: FacetValueModel[]): FacetValueNode[] {
  const map = new Map<string, FacetValueNode>();
  const roots: FacetValueNode[] = [];

  for (const x of list) map.set(x.id, { ...x, children: [] });

  for (const x of list) {
    const node = map.get(x.id)!;

    if (x.parentId) {
      const p = map.get(x.parentId);

      if (p) p.children!.push(node);
      else roots.push(node); 
    } else {
      roots.push(node);
    }
  }

  return Array.from(new Set(roots));
}

export function toFlat(tree: FacetValueNode[]): FacetValueModel[] {
  const out: FacetValueModel[] = [];
  const walk = (arr: FacetValueNode[], parentId: string | null) => {
    for (const n of arr) {
      out.push({ id: n.id, value: n.value, parentId: parentId ?? undefined });
      if (n.children?.length) walk(n.children, n.id);
    }
  };

  walk(tree, null);

  return out;
}
