import { useCallback, useEffect, useMemo, useState } from "react";

type Entry = { term: string; ts: number; count: number };

const KEY_PREFIX = "search-history:";
const NAMESPACE_DEFAULT = "default";

export function useSearchHistory(options?: {
  max?: number;
  namespace?: string;
  caseInsensitive?: boolean;
}) {
  const { max = 12, namespace = NAMESPACE_DEFAULT, caseInsensitive = true } = options || {};
  const storageKey = useMemo(() => `${KEY_PREFIX}${namespace}`, [namespace]);

  const [items, setItems] = useState<Entry[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);

      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, [storageKey]);

  const persist = useCallback(
    (next: Entry[]) => {
      setItems(next);
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {}
    },
    [storageKey],
  );

  const add = useCallback(
    (termRaw: string) => {
      const term = termRaw.trim();

      if (!term) return;

      const cmp = (s: string) => (caseInsensitive ? s.toLowerCase() : s);
      const now = Date.now();

      const idx = items.findIndex((x) => cmp(x.term) === cmp(term));
      let next = [...items];

      if (idx >= 0) {
        const hit = next[idx];

        next.splice(idx, 1);
        next.unshift({ term: hit.term, ts: now, count: hit.count + 1 });
      } else {
        next.unshift({ term, ts: now, count: 1 });
      }

      if (next.length > max) next = next.slice(0, max);
      persist(next);
    },
    [items, max, caseInsensitive, persist],
  );

  const remove = useCallback(
    (termRaw: string) => {
      const term = termRaw.trim();
      const cmp = (s: string) => (caseInsensitive ? s.toLowerCase() : s);
      const next = items.filter((x) => cmp(x.term) !== cmp(term));

      persist(next);
    },
    [items, caseInsensitive, persist],
  );

  const clear = useCallback(() => persist([]), [persist]);

  return { items, add, remove, clear };
}
