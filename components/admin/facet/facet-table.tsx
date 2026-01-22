"use client";

import type { CategoryModel } from "@/types/category";
import type { FacetModel } from "@/types/facet";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Filter, Layers, Plus, SortAsc, Tags, Trash2 } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getAllFacets, deleteFacet } from "@/app/api/services/facetService";
import { useDictionary } from "@/app/context/dictionary-provider";

const AddFacetModal = dynamic(() => import("./add-facet-modal"), { ssr: false });
const UpdateFacetModal = dynamic(() => import("./update-facet-modal"), { ssr: false });
const CategoryTree = dynamic(() => import("@/components/admin/product/category-tree").then(m => m.CategoryTree), { ssr: false });

function useDebounced<T>(value: T, delay = 250): T {
  const [v, setV] = useState(value);

  useEffect(() => { const t = setTimeout(() => setV(value), delay);

 return () => clearTimeout(t); }, [value, delay]);

  return v;
}

export function FacetsTable({ initialCategories }: { initialCategories: CategoryModel[] }) {
  const dict = useDictionary();
  const t = dict.admin.facets.table;
  const tToast = dict.admin.facets.toast;

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [facets, setFacets] = useState<FacetModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const dSearch = useDebounced(search, 250);

  const [sortBy, setSortBy] = useState<"name" | "type">("name");
  const [typeFilter, setTypeFilter] = useState<"all" | "custom" | "system">("all");

  const [isPending, startTransition] = useTransition();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [facetToDelete, setFacetToDelete] = useState<FacetModel | null>(null);

  useEffect(() => {
    if (!selectedCategoryId) { setFacets([]);

 return; }
    let ab = false;

    (async () => {
      setLoading(true); setError(null);
      try {
        const data = await getAllFacets(selectedCategoryId);

        if (!ab) setFacets(data);
      } catch (e) {
        // eslint-disable-next-line no-console
        if (!ab) { setError("Failed to load facets"); console.error(e); }
      } finally { if (!ab) setLoading(false); }
    })();

    return () => { ab = true; };
  }, [selectedCategoryId]);

  const filtered = useMemo(() => {
    const q = dSearch.toLowerCase().trim();

    return facets
      .filter(f => (q ? (f.name ?? "").toLowerCase().includes(q) : true))
      .filter(f => typeFilter === "all" ? true : typeFilter === "custom" ? !!f.isCustom : !f.isCustom)
      .sort((a,b) => sortBy === "name" ? (a.name ?? "").localeCompare(b.name ?? "") : (a.displayType ?? 0) - (b.displayType ?? 0));
  }, [facets, dSearch, typeFilter, sortBy]);

  const handleDelete = async () => {
    if (!facetToDelete) return;

    try {
      await deleteFacet(facetToDelete.id);
      setFacets(prev => prev.filter(f => f.id !== facetToDelete.id));
      toast.success(tToast.facetDeleted);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      toast.error(tToast.facetDeleteFailed);
    } finally {
      setDeleteDialogOpen(false);
      setFacetToDelete(null);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Sidebar */}
      <div className="hidden lg:block lg:col-span-1">
        <CategoryTree Categories={initialCategories} onSelectCategory={(id) => startTransition(() => setSelectedCategoryId(id))} />
      </div>

      {/* Main */}
      <div className="lg:col-span-3">
        <Card className="bg-white/70 dark:bg-slate-900/70 border-2 border-slate-200/60 dark:border-slate-800/60 backdrop-blur-xl shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-500/5 pointer-events-none" />
          <CardHeader className="pb-4 relative">
            <div className="flex flex-col gap-3 md:gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-2 flex-1">
                {/* Add Facet */}
                <AddFacetModal
                  categories={initialCategories}
                  disabled={!selectedCategoryId}
                  presetCategoryId={selectedCategoryId ?? undefined}
                  onCreated={() => {
                    if (selectedCategoryId) {
                      // eslint-disable-next-line no-console
                      getAllFacets(selectedCategoryId).then(setFacets).catch(console.error);
                    }
                  }}
                />

                <Sheet>
                  <SheetTrigger asChild>
                    <Button className="lg:hidden shrink-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800" size="sm" variant="outline">
                      <Layers className="mr-2 h-4 w-4" /> {t.categories}
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="h-[85vh] p-0 bg-white dark:bg-slate-900" side="bottom">
                    <SheetHeader className="px-6 pt-6 mb-6"><SheetTitle>{t.categories}</SheetTitle></SheetHeader>
                    <div className="px-4 pb-4">
                      <CategoryTree Categories={initialCategories} onSelectCategory={(id) => startTransition(() => setSelectedCategoryId(id))} />
                    </div>
                  </SheetContent>
                </Sheet>

                {/* Search */}
                <div className="relative flex-1">
                  <Tags className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-500 dark:text-cyan-400 h-4 w-4" />
                  <Input aria-label={t.searchPlaceholder} className="pl-10" placeholder={t.searchPlaceholder} value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <Select value={typeFilter} onValueChange={(v: typeof typeFilter) => setTypeFilter(v)}>
                  <SelectTrigger className="w-36"><Filter className="h-4 w-4 mr-2" /><SelectValue placeholder={t.type} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.allTypes}</SelectItem>
                    <SelectItem value="custom">{t.custom}</SelectItem>
                    <SelectItem value="system">{t.system}</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={(v: typeof sortBy) => setSortBy(v)}>
                  <SelectTrigger className="w-32"><SortAsc className="h-4 w-4 mr-2" /><SelectValue placeholder={t.name} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">{t.name}</SelectItem>
                    <SelectItem value="type">{t.type}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {selectedCategoryId && (
              <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                {isPending ? t.updating : t.facetsFound.replace("{count}", String(filtered.length))}
              </div>
            )}
          </CardHeader>

          <CardContent className="p-0">
            <div className="max-h-[calc(100vh-280px)] overflow-auto">
              {!selectedCategoryId ? (
                <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
                  <Plus className="h-14 w-14 text-slate-400 dark:text-slate-500 mb-4" />
                  <h3 className="font-heading text-base md:text-lg font-semibold text-slate-600 dark:text-slate-400 mb-2">{t.selectCategory}</h3>
                  <p className="font-primary text-slate-500 dark:text-slate-400 max-w-sm">{t.selectCategoryDescription}</p>
                </div>
              ) : loading ? (
                <div className="flex items-center justify-center py-12 px-6">{t.loadingFacets}</div>
              ) : error ? (
                <div className="text-center py-12 px-6">
                  <div className="text-red-500 mb-2">{t.loadFailed}</div>
                  <Button variant="outline" onClick={() => location.reload()}>{t.tryAgain}</Button>
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                  <h3 className="font-heading text-base md:text-lg font-semibold text-slate-600 dark:text-slate-400 mb-2">{t.noFacets}</h3>
                  <p className="font-primary text-slate-500 dark:text-slate-400 max-w-sm">{t.noFacetsDescription}</p>
                </div>
              ) : (
                <div className="overflow-x-auto relative">
                  <Table>
                    <TableHeader className="bg-slate-100 dark:bg-slate-800/60 sticky top-0">
                      <TableRow>
                        <TableHead>{t.tableHeaderName}</TableHead>
                        <TableHead>{t.tableHeaderDisplay}</TableHead>
                        <TableHead>{t.tableHeaderCustom}</TableHead>
                        <TableHead>{t.tableHeaderValues}</TableHead>
                        <TableHead className="text-right">{t.tableHeaderActions}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map(f => (
                        <TableRow key={f.id} className="border-b">
                          <TableCell className="font-medium">{f.name}</TableCell>
                          <TableCell>{f.displayType}</TableCell>
                          <TableCell>{f.isCustom ? t.yes : t.no}</TableCell>
                          <TableCell className="max-w-[380px] truncate">
                            {(f.facetValues ?? []).map(v => v.value).slice(0,6).join(", ")}{(f.facetValues?.length ?? 0) > 6 ? "…" : ""}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <UpdateFacetModal
                                categories={initialCategories}
                                facet={f}
                                onUpdated={(model) => setFacets(prev => prev.map(x => x.id === model.id ? model : x))}
                              />
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  setFacetToDelete(f);
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 dark:text-slate-100">
              {t.deleteDialogTitle}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 dark:text-slate-400">
              {facetToDelete ? (
                <>
                  {t.deleteConfirmation}{" "}
                  <span className="font-primary font-bold text-slate-900 dark:text-slate-100">
                    {facetToDelete.name}
                  </span>
                  {t.deleteWarning}
                </>
              ) : (
                t.actionCannotBeUndone
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleDelete}
            >
              {t.deleteFacet}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}