"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { BrandModel } from "@/types/brand";
import { getAllBrands, updateBrand } from "@/app/api/services/brandService";
import { toast } from "sonner";
import UpdateBrandModal from "./update-brad-modal";

export function BrandsTable() {
    const [brands, setBrands] = useState<BrandModel[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

    // ✅ Keep param order: (id, name, description, origin)
    const handleUpdateBrand = async (
        brandId: string,
        name: string,
        description: string,
        origin: string
    ) => {
        const current = brands.find((p) => p.id === brandId);
        if (!current) return;

        const prevBrands = brands;

        // ✅ Build patched brand with new values
        const patched: BrandModel = {
            ...current,
            name,
            description,
            origin,
        };

        // Optimistic UI
        setBrands((prev) => prev.map((p) => (p.id === brandId ? patched : p)));

        try {
            // ✅ Send patched (new) values to API
            await updateBrand(patched);
            toast.success("ბრენდი წარმატებით განახლდა.");
        } catch (err) {
            console.error("Failed to update brand", err);
            toast.error("ბრენდის განახლება ვერ მოხერხდა.");
            setBrands(prevBrands);
        }
    };

    const filteredBrands = brands.filter(
        (brand) =>
            brand.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            brand.origin?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Card className="dark:bg-brand-muteddark bg-brand-muted backdrop-blur">
            <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <input
                        type="text"
                        placeholder="Search by name or origin..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full md:w-64 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-white dark:border-slate-700 dark:placeholder:text-slate-500"
                    />
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
                                <TableRow
                                    key={brand.id}
                                    className="hover:bg-slate-50 dark:hover:bg-slate-800"
                                >
                                    <TableCell className="font-medium text-slate-900 dark:text-slate-100">
                                        {brand.name}
                                        <div className="text-sm text-slate-500 dark:text-slate-400">
                                            ID: {brand.id}
                                        </div>
                                    </TableCell>
                                    <TableCell>{brand.origin}</TableCell>
                                    <TableCell>{brand.description}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end space-x-2">
                                            <UpdateBrandModal
                                                brandId={brand.id}
                                                initialDescription={brand.description}
                                                initialOrigin={brand.origin}
                                                initialName={brand.name}
                                                onSave={handleUpdateBrand}
                                            />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}
