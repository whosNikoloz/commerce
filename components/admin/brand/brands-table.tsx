"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { TriangleAlert } from "lucide-react";

import UpdateBrandModal from "./update-brad-modal";
import AddBrandModal from "./add-brand-modal";

import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
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

import { BrandModel } from "@/types/brand";
import { getAllBrands, updateBrand, createBrand, deleteBrand } from "@/app/api/services/brandService";

interface Props {
  Brands: BrandModel[];
}

export function BrandsTable({ Brands: initialBrands }: Props) {
  const [brands, setBrands] = useState<BrandModel[]>(initialBrands || []);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🔻 delete dialog state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<BrandModel | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setBrands(initialBrands || []);
  }, [initialBrands]);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await getAllBrands();
        setBrands(response);
      } catch (err) {
        console.error("Error fetching brands:", err);
        setError("Failed to load brands.");
      } finally {
        setLoading(false);
      }
    };
    fetchBrands();
  }, []);

  // ✅ Update (id, name, description, origin)
  const handleUpdateBrand = async (
    brandId: string,
    name: string,
    description: string,
    origin: string,
  ) => {
    const current = brands.find((p) => p.id === brandId);
    if (!current) return;

    const prevBrands = brands;
    const patched: BrandModel = { ...current, name, description, origin };

    setBrands((prev) => prev.map((p) => (p.id === brandId ? patched : p)));

    try {
      await updateBrand(patched);
      toast.success("ბრენდი წარმატებით განახლდა.");
    } catch (err) {
      console.error("Failed to update brand", err);
      toast.error("ბრენდის განახლება ვერ მოხერხდა.");
      setBrands(prevBrands);
    }
  };

  const handleCreateBrand = async (name: string, description: string, origin: string) => {
    const tempId = `temp-${Date.now()}`;
    const newBrand: BrandModel = { id: tempId, name, description, origin };

    const prevBrands = brands;
    setBrands((prev) => [newBrand, ...prev]);

    try {
      const createdId: string = await createBrand(name, origin, description);
      setBrands((prev) => prev.map((b) => (b.id === tempId ? { ...b, id: createdId } : b)));
      toast.success("ბრენდი წარმატებით დაემატა.");
    } catch (err) {
      console.error("Failed to create brand", err);
      toast.error("ბრენდის დამატება ვერ მოხერხდა.");
      setBrands(prevBrands);
    }
  };

  const handleDeleteBrand = async (brandId: string) => {
    const prevBrands = brands;
    setDeleting(true);

    setBrands((prev) => prev.filter((b) => b.id !== brandId));

    try {
      await deleteBrand(brandId);
      toast.success("ბრენდი წაიშალა.");
    } catch (err) {
      console.error("Failed to delete brand", err);
      toast.error("ბრენდის წაშლა ვერ მოხერხდა.");
      setBrands(prevBrands);
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
      setDeleteTarget(null);
    }
  };

  const filteredBrands = brands.filter(
    (brand) =>
      brand.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      brand.origin?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

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

        <CardContent className="overflow-auto max-h-[calc(100vh-240px)]">
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
                      <div className="text-sm text-slate-500 dark:text-slate-400">ID: {brand.id}</div>
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
                          variant="destructive"
                          size="sm"
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
                    <TableCell colSpan={4} className="text-center py-8 text-slate-500">
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
                  You are about to delete <span className="font-semibold">{deleteTarget.name}</span>.
                  ეს ქმედება შეუქცევადია და ბრენდი ამოიშლება სიიდან.
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
