"use client";

import type { BrandModel } from "@/types/brand";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { TriangleAlert, Trash2 } from "lucide-react";
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

const ReviewImagesModal = dynamic(() => import("./review-images-modal"), { ssr: false });

interface Props {
  Brands: BrandModel[];
}

export function BrandsTable({ Brands: initialBrands }: Props) {
  const [brands, setBrands] = useState<BrandModel[]>(initialBrands || []);
  const [loading, setLoading] = useState(!(initialBrands && initialBrands.length > 0));
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<BrandModel | null>(null);
  const [deleting, setDeleting] = useState(false);

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
        console.error("Error fetching brands:", err);
        if (!cancelled) setError("Failed to load brands.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [initialBrands]);

  const handleImagesChanged = (brandId: string, urls: string[]) => {
    setBrands((prev) => prev.map((p) => (p.id === brandId ? { ...p, images: urls } : p)));
  };

  const handleUpdateBrand = async (
    brandId: string,
    name: string,
    description: string,
    origin: string,
  ) => {
    const current = brands.find((p) => p.id === brandId);
    if (!current) return;

    const prev = brands;
    const patched: BrandModel = {
      ...current,
      name,
      description,
      origin,
      images: current.images, // keep existing images intact
    };

    setBrands((list) => list.map((p) => (p.id === brandId ? patched : p)));
    try {
      await updateBrand(patched);
      toast.success("ბრენდი წარმატებით განახლდა.");
    } catch (err) {
      console.error("Failed to update brand", err);
      setBrands(prev);
      toast.error("ბრენდის განახლება ვერ მოხერხდა.");
    }
  };

  const handleCreateBrand = async (name: string, description: string, origin: string) => {
    const tempId = `temp-${Date.now()}`;
    const prev = brands;
    const draft: BrandModel = { id: tempId, name, description, origin, images: [] };

    setBrands([draft, ...prev]);
    try {
      const createdId: string = await createBrand(name, origin, description, []);

      setBrands((list) => list.map((b) => (b.id === tempId ? { ...b, id: createdId } : b)));
      toast.success("ბრენდი წარმატებით დაემატა.");
    } catch (err) {
      console.error("Failed to create brand", err);
      setBrands(prev);
      toast.error("ბრენდის დამატება ვერ მოხერხდა.");
    }
  };

  const handleDeleteBrand = async (brandId: string) => {
    const prev = brands;

    setDeleting(true);
    setBrands((list) => list.filter((b) => b.id !== brandId));
    try {
      await deleteBrand(brandId);
      toast.success("ბრენდი წაიშალა.");
    } catch (err) {
      console.error("Failed to delete brand", err);
      setBrands(prev);
      toast.error("ბრენდის წაშლა ვერ მოხერხდა.");
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
      setDeleteTarget(null);
    }
  };

  const filteredBrands = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return brands;
    return brands.filter(
      (b) => (b.name ?? "").toLowerCase().includes(q) || (b.origin ?? "").toLowerCase().includes(q),
    );
  }, [brands, searchTerm]);

  return (
    <>
      <Card className="bg-white/70 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800/60 backdrop-blur-xl shadow-xl relative">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5 pointer-events-none rounded-lg" />
        <CardHeader className="relative">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <input
                className="w-full rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-4 py-2.5 text-sm
                           text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400
                           focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 dark:focus:border-blue-600
                           shadow-sm hover:shadow-md transition-all duration-300 font-medium"
                placeholder="🔍 Search by name or origin..."
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <AddBrandModal onCreate={handleCreateBrand} />
          </div>
        </CardHeader>

        <CardContent className="overflow-auto max-h-[calc(100lvh-210px)] relative">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-slate-600 dark:text-slate-400 font-medium">Loading brands...</p>
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
                      <TableHead className="w-[72px] sm:w-[80px] text-slate-700 dark:text-slate-300 font-bold text-sm uppercase tracking-wide">
                        Image
                      </TableHead>
                      <TableHead className="text-slate-700 dark:text-slate-300 font-bold text-sm uppercase tracking-wide">
                        Name
                      </TableHead>
                      <TableHead className="text-slate-700 dark:text-slate-300 font-bold text-sm uppercase tracking-wide">
                        Origin
                      </TableHead>
                      <TableHead className="text-slate-700 dark:text-slate-300 font-bold text-sm uppercase tracking-wide">
                        Description
                      </TableHead>
                      <TableHead className="text-right text-slate-700 dark:text-slate-300 font-bold text-sm uppercase tracking-wide">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {filteredBrands.map((brand) => (
                      <TableRow
                        key={brand.id}
                        className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 dark:hover:from-blue-950/20 dark:hover:to-purple-950/20
                                   transition-all duration-300 border-b border-slate-200/50 dark:border-slate-700/50"
                      >
                        {/* IMAGE CELL */}
                        <TableCell>
                          <div className="relative w-16 h-16">
                            <Image
                              alt={brand.name ?? "Brand"}
                              className="rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-800"
                              height={64}
                              width={64}
                              src={brand.images?.[0] || "/placeholder.png"}
                            />
                            {!!brand.images && brand.images.length > 1 && (
                              <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full font-medium">
                                +{brand.images.length}
                              </span>
                            )}
                          </div>
                        </TableCell>

                        {/* NAME / ID */}
                        <TableCell className="font-bold text-slate-900 dark:text-slate-100">
                          <div className="flex items-center gap-3">
                            <div>
                              <div className="font-bold">{brand.name}</div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded inline-block mt-1">
                                ID: {brand.id}
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="text-slate-700 dark:text-slate-300 font-semibold">
                          {brand.origin}
                        </TableCell>

                        <TableCell className="max-w-[520px] truncate text-slate-600 dark:text-slate-400 font-medium">
                          {brand.description}
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <UpdateBrandModal
                              brandId={brand.id ?? ""}
                              initialDescription={brand.description}
                              initialName={brand.name}
                              initialOrigin={brand.origin}
                              onSave={handleUpdateBrand}
                            />
                            <ReviewImagesModal
                              brandId={brand.id}
                              existing={(brand.images ?? []).map((url, idx) => ({
                                key: idx.toString(),
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
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}

                    {filteredBrands.length === 0 && (
                      <TableRow>
                        <TableCell className="text-center py-12" colSpan={5}>
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                              <TriangleAlert className="h-8 w-8 text-slate-400" />
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 font-semibold">No brands found</p>
                            <p className="text-sm text-slate-400 dark:text-slate-500">Try adjusting your search</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {filteredBrands.map((brand) => (
                  <div
                    key={brand.id}
                    className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-xl border-2 border-slate-200 dark:border-slate-700 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
                  >
                    {/* Image banner like ProductCard */}
                    <div className="relative w-full h-40">
                      <Image
                        fill
                        alt={brand.name ?? "Brand"}
                        className="object-cover"
                        src={brand.images?.[0] || "/placeholder.png"}
                        sizes="100vw"
                        priority={false}
                      />
                      {!!brand.images && brand.images.length > 1 && (
                        <span className="absolute top-2 right-2 bg-blue-600/90 text-white text-xs px-2 py-1 rounded-full">
                          +{brand.images.length}
                        </span>
                      )}
                    </div>

                    {/* Card Header */}
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 p-4 border-b-2 border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-black text-slate-900 dark:text-slate-100 text-lg truncate">
                            {brand.name}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded inline-block mt-1">
                            ID: {brand.id}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 space-y-3">
                      <div>
                        <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                          Origin
                        </div>
                        <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          {brand.origin}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                          Description
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                          {brand.description}
                        </div>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3 border-t border-slate-200 dark:border-slate-700 flex gap-2">
                      <UpdateBrandModal
                        brandId={brand.id ?? ""}
                        initialDescription={brand.description}
                        initialName={brand.name}
                        initialOrigin={brand.origin}
                        onSave={handleUpdateBrand}
                      />
                      <ReviewImagesModal
                        brandId={brand.id}
                        existing={(brand.images ?? []).map((url, idx) => ({
                          key: idx.toString(),
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
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}

                {filteredBrands.length === 0 && (
                  <div className="flex flex-col items-center gap-3 py-12">
                    <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <TriangleAlert className="h-8 w-8 text-slate-400" />
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 font-semibold">No brands found</p>
                    <p className="text-sm text-slate-400 dark:text-slate-500">Try adjusting your search</p>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-2 border-slate-200 dark:border-slate-800 shadow-2xl relative">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-red-500/5 pointer-events-none rounded-lg" />
          <AlertDialogHeader className="relative">
            <AlertDialogTitle className="flex items-center gap-3 text-slate-900 dark:text-slate-100 text-xl font-bold">
              <div className="p-2.5 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg">
                <TriangleAlert className="h-5 w-5 text-white" />
              </div>
              Delete Brand?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 dark:text-slate-400 text-base font-medium mt-2">
              {deleteTarget ? (
                <>
                  You are about to permanently delete{" "}
                  <span className="font-bold text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                    {deleteTarget.name}
                  </span>
                  . This action cannot be undone.
                </>
              ) : (
                "This action cannot be undone."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="relative gap-2">
            <AlertDialogCancel
              className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-2 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold shadow-sm hover:shadow-md transition-all duration-300"
              disabled={deleting}
              onClick={() => {
                setDeleteOpen(false);
                setDeleteTarget(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold shadow-md hover:shadow-xl transition-all duration-300 disabled:opacity-50"
              disabled={deleting}
              onClick={() => deleteTarget && handleDeleteBrand(deleteTarget.id)}
            >
              {deleting ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Deleting...
                </span>
              ) : (
                "Delete Brand"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
