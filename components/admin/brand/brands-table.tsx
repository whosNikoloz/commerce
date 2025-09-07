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

  // delete dialog state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<BrandModel | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ✅ keep local state in sync when server prop changes
  useEffect(() => {
    setBrands(initialBrands || []);
    if (initialBrands?.length) setLoading(false);
  }, [initialBrands]);

  // ✅ only fetch on client if SSR gave us nothing
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

  // —— CRUD ——
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
      <Card className="dark:bg-brand-muteddark bg-brand-muted backdrop-blur">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <input
              className="w-full md:w-64 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-white dark:border-slate-700 dark:placeholder:text-slate-500"
              placeholder="Search by name or origin..."
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <AddBrandModal onCreate={handleCreateBrand} />
          </div>
        </CardHeader>

        <CardContent className="overflow-auto max-h-[calc(100lvh-210px)]">
          {loading && <p className="p-4 text-gray-500">Loading brands...</p>}
          {error && <p className="p-4 text-red-500">{error}</p>}

          {!loading && !error && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Origin</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredBrands.map((brand) => (
                  <TableRow key={brand.id} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                    <TableCell className="font-medium text-slate-900 dark:text-slate-100">
                      {brand.name}
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        ID: {brand.id}
                      </div>
                    </TableCell>
                    <TableCell>{brand.origin}</TableCell>
                    <TableCell className="max-w-[520px] truncate">{brand.description}</TableCell>
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
                    <TableCell className="text-center py-8 text-slate-500" colSpan={4}>
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <TriangleAlert className="h-5 w-5 text-red-600" />
              Delete brand?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget ? (
                <>
                  You are about to delete <span className="font-semibold">{deleteTarget.name}</span>
                  . ეს ქმედება შეუქცევადია.
                </>
              ) : (
                "ეს ქმედება შეუქცევადია."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={deleting}
              onClick={() => {
                setDeleteOpen(false);
                setDeleteTarget(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
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
