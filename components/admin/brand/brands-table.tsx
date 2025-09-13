"use client";

import type { BrandModel } from "@/types/brand";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { TriangleAlert } from "lucide-react";

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

  const handleUpdateBrand = async (
    brandId: string,
    name: string,
    description: string,
    origin: string,
  ) => {
    const current = brands.find((p) => p.id === brandId);

    if (!current) return;
    const prev = brands;
    const patched: BrandModel = { ...current, name, description, origin };

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
    const draft: BrandModel = { id: tempId, name, description, origin };

    setBrands([draft, ...prev]);
    try {
      const createdId: string = await createBrand(name, origin, description);

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
      <Card className="bg-brand-surface dark:bg-brand-surfacedark border border-brand-muted/60 dark:border-brand-muteddark/60 backdrop-blur">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <input
              className="w-full md:w-72 rounded-md border border-brand-muted dark:border-brand-muteddark bg-brand-surface dark:bg-brand-surfacedark px-3 py-2 text-sm
                         text-text-light dark:text-text-lightdark placeholder:text-text-subtle dark:placeholder:text-text-subtledark
                         focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
              placeholder="Search by name or origin..."
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <AddBrandModal onCreate={handleCreateBrand} />
          </div>
        </CardHeader>

        <CardContent className="overflow-auto max-h-[calc(100lvh-210px)]">
          {loading && (
            <p className="p-4 text-text-subtle dark:text-text-subtledark">Loading brands...</p>
          )}
          {error && <p className="p-4 text-red-500">{error}</p>}

          {!loading && !error && (
            <Table>
              <TableHeader className="bg-brand-surface/60 dark:bg-brand-surfacedark/60">
                <TableRow>
                  <TableHead className="text-text-subtle dark:text-text-subtledark">Name</TableHead>
                  <TableHead className="text-text-subtle dark:text-text-subtledark">
                    Origin
                  </TableHead>
                  <TableHead className="text-text-subtle dark:text-text-subtledark">
                    Description
                  </TableHead>
                  <TableHead className="text-right text-text-subtle dark:text-text-subtledark">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredBrands.map((brand) => (
                  <TableRow
                    key={brand.id}
                    className="hover:bg-brand-surface/60 dark:hover:bg-brand-surfacedark/60"
                  >
                    <TableCell className="font-medium text-text-light dark:text-text-lightdark">
                      {brand.name}
                      <div className="text-sm text-text-subtle dark:text-text-subtledark">
                        ID: {brand.id}
                      </div>
                    </TableCell>
                    <TableCell className="text-text-light dark:text-text-lightdark">
                      {brand.origin}
                    </TableCell>
                    <TableCell className="max-w-[520px] truncate text-text-light dark:text-text-lightdark">
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
                        <Button
                          className="bg-red-600 hover:bg-red-700 text-white"
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
                    <TableCell
                      className="text-center py-8 text-text-subtle dark:text-text-subtledark"
                      colSpan={4}
                    >
                      Brand not found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="bg-brand-surface dark:bg-brand-surfacedark border border-brand-muted dark:border-brand-muteddark">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-text-light dark:text-text-lightdark">
              <TriangleAlert className="h-5 w-5 text-red-600" />
              Delete brand?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-text-subtle dark:text-text-subtledark">
              {deleteTarget ? (
                <>
                  You are about to delete{" "}
                  <span className="font-semibold text-text-light dark:text-text-lightdark">
                    {deleteTarget.name}
                  </span>
                  . ეს ქმედება შეუქცევადია.
                </>
              ) : (
                "ეს ქმედება შეუქცევადია."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="bg-brand-surface dark:bg-brand-surfacedark text-text-light dark:text-text-lightdark border border-brand-muted dark:border-brand-muteddark hover:bg-brand-surface/70 dark:hover:bg-brand-surfacedark/70"
              disabled={deleting}
              onClick={() => {
                setDeleteOpen(false);
                setDeleteTarget(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={deleting}
              onClick={() => deleteTarget && handleDeleteBrand(deleteTarget.id)}
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
