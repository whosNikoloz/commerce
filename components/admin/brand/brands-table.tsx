"use client";

import type { BrandModel } from "@/types/brand";

import Image from "next/image";
import { useEffect, useMemo, useState, type ReactElement } from "react";
import { toast } from "sonner";
import { TriangleAlert, Trash2, Edit, CornerDownRight, ChevronRight, ChevronDown } from "lucide-react";
import dynamic from "next/dynamic";

import UpdateBrandModal from "./update-brad-modal";
import AddBrandModal from "./add-brand-modal";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  getAllBrands,
  updateBrand,
  createBrand,
  deleteBrand,
} from "@/app/api/services/brandService";
import { useDictionary } from "@/app/context/dictionary-provider";

const ReviewImagesModal = dynamic(() => import("./review-images-modal"), { ssr: false });

interface Props {
  Brands: BrandModel[];
}

// Utility to build a flat list with depth for tree rendering
function buildBrandTree(brands: BrandModel[]): Array<BrandModel & { depth: number }> {
  const brandMap = new Map<string, BrandModel>();

  brands.forEach(b => brandMap.set(b.id, b));

  const childrenMap = new Map<string, BrandModel[]>();
  const roots: BrandModel[] = [];

  brands.forEach(b => {
    if (b.parentId && brandMap.has(b.parentId)) {
      if (!childrenMap.has(b.parentId)) childrenMap.set(b.parentId, []);
      childrenMap.get(b.parentId)!.push(b);
    } else {
      roots.push(b);
    }
  });

  // Sort roots by name
  roots.sort((a, b) => (a.name || "").localeCompare(b.name || ""));

  const result: Array<BrandModel & { depth: number }> = [];

  function traverse(brand: BrandModel, depth: number) {
    result.push({ ...brand, depth });
    const children = childrenMap.get(brand.id) || [];

    // Sort children by name
    children.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    children.forEach(child => traverse(child, depth + 1));
  }

  roots.forEach(root => traverse(root, 0));

  return result;
}

export function BrandsTable({ Brands: initialBrands }: Props) {
  const dict = useDictionary();
  const t = dict.admin.brands.table;
  const tToast = dict.admin.brands.toast;

  const [brands, setBrands] = useState<BrandModel[]>(initialBrands || []);
  const [loading, setLoading] = useState(!(initialBrands && initialBrands.length > 0));
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<BrandModel | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Edit Modal State
  const [brandToEdit, setBrandToEdit] = useState<BrandModel | null>(null);

  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // Toggle expand/collapse
  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  };

  useEffect(() => {
    setBrands(initialBrands || []);
    if (initialBrands?.length) setLoading(false);
  }, [initialBrands]);

  useEffect(() => {
    if (initialBrands?.length) return;
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        const response = await getAllBrands();

        if (cancelled) return;
        setBrands(response || []);
        setError(null);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Error fetching brands:", err);
        if (!cancelled) setError(t.loadingError || "Failed to load brands.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [initialBrands]);

  const handleImagesChanged = async (brandId: string, urls: string[]) => {
    const current = brands.find((p) => p.id === brandId);

    if (!current) return;

    const prev = brands;
    const patched: BrandModel = { ...current, images: urls };

    setBrands((prevList) => prevList.map((p) => (p.id === brandId ? patched : p)));

    try {
      await updateBrand(patched);
      toast.success(tToast.updated);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Failed to persist brand image order", err);
      toast.error(tToast.updateFailed);
      setBrands(prev);
    }
  };

  const handleUpdateBrand = async (
    brandId: string,
    name: string,
    description: string,
    origin: string,
    parentId?: string | null,
  ) => {
    const current = brands.find((p) => p.id === brandId);

    if (!current) return;

    const prev = brands;
    const patched: BrandModel = {
      ...current,
      name,
      description,
      origin,
      parentId: parentId ?? current.parentId,
      images: current.images, // keep existing images intact
    };

    setBrands((list) => list.map((p) => (p.id === brandId ? patched : p)));
    try {
      await updateBrand(patched);
      toast.success(tToast.updated);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Failed to update brand", err);
      setBrands(prev);
      toast.error(tToast.updateFailed);
    }
  };

  const handleCreateBrand = async (
    name: string,
    description: string,
    origin: string,
    parentId?: string | null,
  ) => {
    const tempId = `temp-${Date.now()}`;
    const prev = brands;
    const draft: BrandModel = { id: tempId, name, description, origin, images: [], parentId: parentId ?? null };

    setBrands([draft, ...prev]);
    try {
      const createdId: string = await createBrand(name, origin, description, [], parentId);

      setBrands((list) => list.map((b) => (b.id === tempId ? { ...b, id: createdId } : b)));
      toast.success(tToast.created);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Failed to create brand", err);
      setBrands(prev);
      toast.error(tToast.createFailed);
    }
  };

  const handleDeleteBrand = async () => {
    if (!deleteTarget) return;

    const brandId = deleteTarget.id;
    const prev = brands;

    setDeleting(true);
    setBrands((list) => list.filter((b) => b.id !== brandId));
    try {
      await deleteBrand(brandId);
      toast.success(tToast.deleted);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Failed to delete brand", err);
      setBrands(prev);
      toast.error(tToast.deleteFailed);
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
      setDeleteTarget(null);
    }
  };

  // Updated tree builder that respects expansion
  const visibleBrands = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    if (q) {
      // Flat filter search - ignore tree structure
      return brands.filter(
        (b) => (b.name ?? "").toLowerCase().includes(q) || (b.origin ?? "").toLowerCase().includes(q),
      ).map(b => ({ ...b, depth: 0, hasChildren: false }));
    }

    // Build Tree
    const brandMap = new Map<string, BrandModel>();

    brands.forEach(b => brandMap.set(b.id, b));

    const childrenMap = new Map<string, BrandModel[]>();
    const roots: BrandModel[] = [];

    brands.forEach(b => {
      if (b.parentId && brandMap.has(b.parentId)) {
        if (!childrenMap.has(b.parentId)) childrenMap.set(b.parentId, []);
        childrenMap.get(b.parentId)!.push(b);
      } else {
        roots.push(b);
      }
    });

    // Sort roots
    roots.sort((a, b) => (a.name || "").localeCompare(b.name || ""));

    const result: Array<BrandModel & { depth: number; hasChildren: boolean }> = [];

    function traverse(brand: BrandModel, depth: number) {
      const children = childrenMap.get(brand.id) || [];
      const hasChildren = children.length > 0;

      result.push({ ...brand, depth, hasChildren });

      // Only traverse children if expanded
      if (hasChildren && expandedIds.has(brand.id)) {
        children.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        children.forEach(child => traverse(child, depth + 1));
      }
    }

    roots.forEach(root => traverse(root, 0));

    return result;
  }, [brands, searchTerm, expandedIds]);

  return (
    <>
      <Card className="bg-white/70 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800/60 backdrop-blur-xl shadow-xl relative">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5 pointer-events-none rounded-lg" />
        <CardHeader className="relative">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <input
                aria-label={t.searchPlaceholder}
                className="w-full rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-4 py-2.5 text-sm
                           text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400
                           focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 dark:focus:border-blue-600
                           shadow-sm hover:shadow-md transition-all duration-300 font-medium"
                placeholder={t.searchPlaceholder}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <AddBrandModal brands={brands} onCreate={handleCreateBrand} />
          </div>
        </CardHeader>

        <CardContent className="overflow-auto max-h-[calc(100lvh-210px)] relative">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="font-primary text-slate-600 dark:text-slate-400 font-medium">{t.loading}</p>
              </div>
            </div>
          )}
          {error && (
            <div className="p-6 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-semibold">
                <TriangleAlert className="h-5 w-5" />
                {error}
              </div>
            </div>
          )}

          {!loading && !error && (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader className="bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800/80 dark:to-slate-800/50 sticky top-0 z-10 backdrop-blur-sm">
                    <TableRow className="border-b-2 border-slate-200 dark:border-slate-700">
                      <TableHead className="text-slate-700 dark:text-slate-300 font-bold text-sm uppercase tracking-wide">
                        {t.name}
                      </TableHead>
                      <TableHead className="text-slate-700 dark:text-slate-300 font-bold text-sm uppercase tracking-wide">
                        {t.origin}
                      </TableHead>
                      <TableHead className="text-slate-700 dark:text-slate-300 font-bold text-sm uppercase tracking-wide">
                        Parent
                      </TableHead>
                      <TableHead className="text-slate-700 dark:text-slate-300 font-bold text-sm uppercase tracking-wide">
                        {t.description}
                      </TableHead>
                      <TableHead className="w-[72px] sm:w-[80px] text-slate-700 dark:text-slate-300 font-bold text-sm uppercase tracking-wide">
                        {t.image}
                      </TableHead>
                      <TableHead className="text-right text-slate-700 dark:text-slate-300 font-bold text-sm uppercase tracking-wide">
                        {t.actions}
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {visibleBrands.map((brand) => {
                      const parent = brand.parentId ? brands.find(b => b.id === brand.parentId) : null;

                      return (
                        <TableRow
                          key={brand.id}
                          className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 dark:hover:from-blue-950/20 dark:hover:to-purple-950/20
                                     transition-all duration-300 border-b border-slate-200/50 dark:border-slate-700/50"
                        >
                          {/* NAME / ID (Tree) */}
                          <TableCell className="font-bold text-slate-900 dark:text-slate-100">
                            <div className="flex items-center gap-2" style={{ paddingLeft: `${brand.depth * 24}px` }}>
                              <div className="flex-1">
                                <div className="font-bold">{brand.name}</div>
                                <div className="text-xs text-slate-500 dark:text-slate-400 font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded inline-block mt-1">
                                  ID: {brand.id}
                                </div>
                              </div>

                              {brand.hasChildren ? (
                                <button
                                  className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                                  onClick={() => toggleExpand(brand.id)}
                                >
                                  {expandedIds.has(brand.id) ? (
                                    <ChevronDown className="h-4 w-4 text-slate-500" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4 text-slate-500" />
                                  )}
                                </button>
                              ) : (
                                brand.depth > 0 && <CornerDownRight className="h-4 w-4 text-slate-300 dark:text-slate-600 shrink-0" />
                              )}

                              {!brand.hasChildren && brand.depth === 0 && <div className="w-6" />}
                            </div>
                          </TableCell>

                          {/* Origin */}
                          <TableCell className="text-slate-700 dark:text-slate-300 font-semibold">
                            {brand.origin}
                          </TableCell>

                          {/* Parent */}
                          <TableCell>
                            {parent ? (
                              <Badge
                                className="border-2 border-blue-200 dark:border-blue-800/50 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 font-semibold px-3 py-1"
                                variant="outline"
                              >
                                {parent.name}
                              </Badge>
                            ) : (
                              <span className="font-primary text-slate-400 dark:text-slate-500 font-medium">-</span>
                            )}
                          </TableCell>

                          {/* Description */}
                          <TableCell className="max-w-[400px] truncate text-slate-600 dark:text-slate-400 font-medium">
                            {brand.description}
                          </TableCell>

                          {/* IMAGE CELL */}
                          <TableCell>
                            <div className="relative w-16 h-16">
                              <Image
                                alt={brand.name ?? "Brand"}
                                className="rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-800"
                                height={64}
                                src={brand.images?.[0] || "/placeholder.png"}
                                width={64}
                              />
                              {!!brand.images && brand.images.length > 1 && (
                                <span className="font-primary absolute -top-2 -right-2 bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full font-medium">
                                  +{brand.images.length}
                                </span>
                              )}
                            </div>
                          </TableCell>

                          {/* Actions */}
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold shadow-md hover:shadow-xl transition-all duration-300"
                                size="sm"
                                onClick={() => setBrandToEdit(brand)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>

                              <ReviewImagesModal
                                brandId={brand.id}
                                existing={(brand.images ?? []).map((url, idx) => ({
                                  key: (idx + 1).toString(),
                                  url,
                                }))}
                                maxFiles={8}
                                maxSizeMB={5}
                                onChanged={(urls) => handleImagesChanged(brand.id, urls)}
                              />
                              <Button
                                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300"
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  setDeleteTarget(brand);
                                  setDeleteOpen(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}

                    {visibleBrands.length === 0 && (
                      <TableRow>
                        <TableCell className="text-center py-12" colSpan={6}>
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                              <TriangleAlert className="h-8 w-8 text-slate-400" />
                            </div>
                            <p className="font-primary text-slate-500 dark:text-slate-400 font-semibold">{t.noBrands}</p>
                            <p className="font-primary text-sm text-slate-400 dark:text-slate-500">{t.adjustSearch}</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>


              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {(() => {
                  // Build a map of parent -> children
                  const childrenMap = new Map<string, typeof visibleBrands>();
                  const rootBrands: typeof visibleBrands = [];

                  visibleBrands.forEach(brand => {
                    if (brand.depth === 0) {
                      rootBrands.push(brand);
                    } else if (brand.parentId) {
                      if (!childrenMap.has(brand.parentId)) {
                        childrenMap.set(brand.parentId, []);
                      }
                      childrenMap.get(brand.parentId)!.push(brand);
                    }
                  });

                  // Recursive render function
                  const renderBrandCard = (brand: typeof visibleBrands[0], depth: number = 0): ReactElement => {
                    const parent = brand.parentId ? brands.find(b => b.id === brand.parentId) : null;
                    const children = childrenMap.get(brand.id) || [];
                    const isExpanded = expandedIds.has(brand.id);

                    return (
                      <div key={brand.id} style={{ marginLeft: depth > 0 ? `${depth * 20}px` : '0' }}>
                        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-xl border-2 border-slate-200 dark:border-slate-700 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden mb-3">
                          {/* Image banner */}
                          <div className="relative w-full h-40">
                            <Image
                              fill
                              alt={brand.name ?? "Brand"}
                              className="object-cover"
                              priority={false}
                              sizes="100vw"
                              src={brand.images?.[0] || "/placeholder.png"}
                            />
                            {!!brand.images && brand.images.length > 1 && (
                              <span className="font-primary absolute top-2 right-2 bg-blue-600/90 text-white text-xs px-2 py-1 rounded-full">
                                +{brand.images.length}
                              </span>
                            )}
                          </div>

                          {/* Card Header */}
                          <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 p-4 border-b-2 border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-3">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-heading font-black text-slate-900 dark:text-slate-100 text-lg truncate flex items-center gap-2">
                                  {depth > 0 && !brand.hasChildren && <CornerDownRight className="h-4 w-4 text-slate-400" />}
                                  <span className="flex-1">{brand.name}</span>
                                  {brand.hasChildren && (
                                    <button
                                      className="p-1"
                                      onClick={() => toggleExpand(brand.id)}
                                    >
                                      {isExpanded ? (
                                        <ChevronDown className="h-4 w-4 text-slate-500" />
                                      ) : (
                                        <ChevronRight className="h-4 w-4 text-slate-500" />
                                      )}
                                    </button>
                                  )}
                                </h3>
                                <p className="font-primary text-xs text-slate-500 dark:text-slate-400 font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded inline-block mt-1">
                                  ID: {brand.id}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Card Body */}
                          <div className="p-4 space-y-3">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                                  {t.origin}
                                </div>
                                <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                  {brand.origin}
                                </div>
                              </div>
                              <div>
                                <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1 text-right">
                                  Parent
                                </div>
                                <div className="text-right">
                                  {parent ? (
                                    <Badge
                                      className="border-2 border-blue-200 dark:border-blue-800/50 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 font-semibold px-2 py-0.5 text-xs"
                                      variant="outline"
                                    >
                                      {parent.name}
                                    </Badge>
                                  ) : (
                                    <span className="font-primary text-slate-400 dark:text-slate-500 font-medium text-sm">-</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div>
                              <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                                {t.description}
                              </div>
                              <div className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                                {brand.description}
                              </div>
                            </div>
                          </div>

                          {/* Card Footer */}
                          <div className="bg-slate-50 dark:bg-slate-800/50 p-3 border-t border-slate-200 dark:border-slate-700 flex gap-2">
                            <Button
                              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold shadow-sm hover:shadow-md transition-all duration-300"
                              size="sm"
                              onClick={() => setBrandToEdit(brand)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              {t.edit || "Edit"}
                            </Button>
                            <ReviewImagesModal
                              brandId={brand.id}
                              existing={(brand.images ?? []).map((url, idx) => ({
                                key: (idx + 1).toString(),
                                url,
                              }))}
                              maxFiles={8}
                              maxSizeMB={5}
                              onChanged={(urls) => handleImagesChanged(brand.id, urls)}
                            />
                            <Button
                              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300 gap-2"
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                setDeleteTarget(brand);
                                setDeleteOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                              {t.delete}
                            </Button>
                          </div>
                        </div>

                        {/* Render children if expanded */}
                        {isExpanded && children.length > 0 && (
                          <div className="space-y-3">
                            {children.map(child => renderBrandCard(child, depth + 1))}
                          </div>
                        )}
                      </div>
                    );
                  };

                  return rootBrands.map(brand => renderBrandCard(brand, 0));
                })()}

                {visibleBrands.length === 0 && (
                  <div className="flex flex-col items-center gap-3 py-12">
                    <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <TriangleAlert className="h-8 w-8 text-slate-400" />
                    </div>
                    <p className="font-primary text-slate-500 dark:text-slate-400 font-semibold">{t.noBrands}</p>
                    <p className="font-primary text-sm text-slate-400 dark:text-slate-500">{t.adjustSearch}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Standardized Delete Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 dark:text-slate-100">
              {t.deleteDialogTitle || "Delete Brand?"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 dark:text-slate-400">
              {deleteTarget ? (
                <>
                  {t.deleteConfirmation || "Are you sure you want to delete"}{" "}
                  <span className="font-primary font-bold text-slate-900 dark:text-slate-100">
                    {deleteTarget.name}
                  </span>
                  ? {t.deleteWarning || "This action cannot be undone."}
                </>
              ) : (
                t.actionCannotBeUndone
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>{t.cancel}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={deleting}
              onClick={handleDeleteBrand}
            >
              {deleting ? "Deleting..." : (t.deleteBrand || "Delete Brand")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Managed Edit Modal */}
      {brandToEdit && (
        <UpdateBrandModal
          brandId={brandToEdit.id}
          brands={brands}
          initialDescription={brandToEdit.description}
          initialName={brandToEdit.name}
          initialOrigin={brandToEdit.origin}
          initialParentId={brandToEdit.parentId}
          open={!!brandToEdit}
          onOpenChange={(open) => !open && setBrandToEdit(null)}
          onSave={handleUpdateBrand}
        />
      )}
    </>
  );
}
