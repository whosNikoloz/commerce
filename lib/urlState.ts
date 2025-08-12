// lib/urlState.ts
import { Condition, StockStatus } from "@/types/enums";
import { FilterModel } from "@/types/filter";

export type UrlState = {
    brand?: string[];       // CSV in URL
    cond?: number[];        // Condition[]
    stock?: number;         // StockStatus enum number
    min?: number;
    max?: number;
    facet?: string[];       // facetValueId[]
    page?: number;
    sort?: string;          // "featured" | "price_asc" | ...
    view?: "grid" | "list";
};

const toInt = (v?: string | null) =>
    v == null ? undefined : Number.isNaN(+v) ? undefined : parseInt(v, 10);
const toFloat = (v?: string | null) =>
    v == null ? undefined : Number.isNaN(+v) ? undefined : parseFloat(v);
const fromCsv = (v?: string | null) => (v ? v.split(",").filter(Boolean) : []);
const toCsv = (arr?: string[]) => (arr && arr.length ? arr.join(",") : undefined);

export function readUrlState(sp: URLSearchParams): UrlState {
    const brand = fromCsv(sp.get("brand"));
    const condCsv = fromCsv(sp.get("cond")).map(x => parseInt(x, 10)).filter(n => !Number.isNaN(n));
    const facet = fromCsv(sp.get("facet"));

    return {
        brand: brand.length ? brand : undefined,
        cond: condCsv.length ? condCsv : undefined,
        stock: toInt(sp.get("stock")),
        min: toFloat(sp.get("min")),
        max: toFloat(sp.get("max")),
        facet: facet.length ? facet : undefined,
        page: toInt(sp.get("page")) ?? 1,
        sort: sp.get("sort") ?? "featured",
        view: (sp.get("view") as "grid" | "list") ?? "grid",
    };
}

export function writeUrl(basePath: string, s: UrlState) {
    const sp = new URLSearchParams();
    if (s.brand?.length) sp.set("brand", toCsv(s.brand)!);
    if (s.cond?.length) sp.set("cond", s.cond.join(","));
    if (s.stock !== undefined) sp.set("stock", String(s.stock));
    if (s.min !== undefined) sp.set("min", String(s.min));
    if (s.max !== undefined) sp.set("max", String(s.max));
    if (s.facet?.length) sp.set("facet", s.facet.join(","));
    if (s.page && s.page > 1) sp.set("page", String(s.page));
    if (s.sort && s.sort !== "featured") sp.set("sort", s.sort);
    if (s.view && s.view !== "grid") sp.set("view", s.view);

    const q = sp.toString();
    return q ? `${basePath}?${q}` : basePath;
}

export function toUrlState(filter: FilterModel, opts: {
    page: number,
    sort: string,
    view: "grid" | "list",
}): UrlState {
    return {
        brand: filter.brandIds,
        cond: (filter.condition ?? []) as unknown as number[],
        stock: filter.stockStatus as unknown as number | undefined,
        min: filter.minPrice,
        max: filter.maxPrice,
        facet: (filter.facetFilters ?? []).map(f => f.facetValueId),
        page: opts.page,
        sort: opts.sort,
        view: opts.view,
    };
}

export function toFilterFromUrl(u: UrlState): Partial<FilterModel> {
    return {
        brandIds: u.brand ?? [],
        condition: (u.cond ?? []) as unknown as Condition[],
        stockStatus: (u.stock ?? undefined) as unknown as StockStatus | undefined,
        minPrice: u.min,
        maxPrice: u.max,
        facetFilters: (u.facet ?? []).map(id => ({ facetValueId: id })),
    };
}
