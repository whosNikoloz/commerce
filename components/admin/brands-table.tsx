"use client";

import { useEffect, useState } from "react";
import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { BrandModel } from "@/types/brand";
import { getAllBrands } from "@/app/api/services/brandService";

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
                                {/* <TableHead className="text-right">Actions</TableHead> */}
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
                                    <TableCell>{brand.description}</TableCell>
                                    {/* <TableCell className="text-right">
                                        <div className="flex justify-end space-x-2">
                                            <Button variant="outline" size="sm">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This will permanently delete the brand "{brand.name}".
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => console.log("TODO: delete brand", brand.id)}
                                                        className="bg-red-600 hover:bg-red-700"
                                                    >
                                                        Delete
                                                    </AlertDialogAction>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </TableCell> */}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}
