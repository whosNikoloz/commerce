"use client";


import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { FacetValueNode } from "@/types/facet-ui";


export default function FacetValuesEditor({
  values,
  onChange,
}: {
  // ვიღებთ/ვაბრუნებთ FacetValueNode[], რათა children იყოს typesafe
  values: FacetValueNode[];
  onChange: (v: FacetValueNode[]) => void;
}) {
  const [local, setLocal] = useState<FacetValueNode[]>(values);

  // sync prop -> state როცა მოდალი იხსნება/იცვლება
  useEffect(() => {
    setLocal(values ?? []);
  }, [values]);

  const commit = (next: FacetValueNode[]) => {
    setLocal(next);
    onChange(next);
  };

  const addRoot = () =>
    commit([
      ...local,
      { id: crypto.randomUUID(), value: "", parentId: undefined, children: [] },
    ]);

  const updateValue = (id: string, value: string) =>
    commit(updateNode(local, id, (n) => ({ ...n, value })));

  const removeValue = (id: string) => commit(removeNode(local, id));

  const addChild = (id: string) =>
    commit(
      updateNode(local, id, (n) => ({
        ...n,
        children: [
          ...(n.children ?? []),
          {
            id: crypto.randomUUID(),
            value: "",
            parentId: n.id, // child-ს ვუკავშირებთ მშობლის id-ს
            children: [],
          },
        ],
      })),
    );

  return (
    <div className="space-y-3">
      {local.map((node) => (
        <NodeRow
          key={node.id}
          depth={0}
          node={node}
          onAddChild={addChild}
          onChangeValue={updateValue}
          onRemove={removeValue}
        />
      ))}
      <Button type="button" variant="outline" onClick={addRoot}>
        <Plus className="h-4 w-4" /> Add value
      </Button>
      <Card className="p-3 text-xs text-slate-500">
        Tip: you can nest values (e.g., Resolution → 4K → 3840×2160)
      </Card>
    </div>
  );
}

function NodeRow({
  node,
  depth,
  onChangeValue,
  onAddChild,
  onRemove,
}: {
  node: FacetValueNode;
  depth: number;
  onChangeValue: (id: string, value: string) => void;
  onAddChild: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2" style={{ paddingLeft: depth * 16 }}>
        <Input
          placeholder={depth ? "Sub-value" : "Value"}
          value={node.value ?? ""}
          onChange={(e) => onChangeValue(node.id, e.target.value)}
        />
        <Button size="icon" type="button" variant="ghost" onClick={() => onAddChild(node.id)}>
          <Plus className="h-4 w-4" />
        </Button>
        <Button size="icon" type="button" variant="destructive" onClick={() => onRemove(node.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {(node.children ?? []).map((ch) => (
        <NodeRow
          key={ch.id}
          depth={depth + 1}
          node={ch}
          onAddChild={onAddChild}
          onChangeValue={onChangeValue}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}

// ---- Helpers (typesafe ხის ჩასწორება) ----
function updateNode(
  tree: FacetValueNode[],
  id: string,
  fn: (n: FacetValueNode) => FacetValueNode,
): FacetValueNode[] {
  return tree.map((n) =>
    n.id === id
      ? fn(n)
      : {
          ...n,
          children: n.children ? updateNode(n.children, id, fn) : n.children,
        },
  );
}

function removeNode(tree: FacetValueNode[], id: string): FacetValueNode[] {
  const walk = (arr: FacetValueNode[]): FacetValueNode[] =>
    arr
      .filter((n) => n.id !== id)
      .map((n) => ({
        ...n,
        children: n.children ? walk(n.children) : n.children,
      }));

  return walk(tree);
}
