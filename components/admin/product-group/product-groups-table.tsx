"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, Eye, Edit2, Package, Layers, Plus } from "lucide-react";
import dynamic from "next/dynamic";

import { EditProductGroupModal } from "./edit-product-group-modal";
import { CreateProductGroupModal } from "./create-product-group-modal";

import { CategoryModel } from "@/types/category";
import { BrandModel } from "@/types/brand";
import {
  ProductGroupModel,
  getAllProductGroups,
} from "@/app/api/services/productService";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

// Lazy load heavy components
const ProductGroupFilters = dynamic(() => import("./product-group-filters"), { ssr: false });

interface ProductGroupsTableProps {
  initialCategories: CategoryModel[];
  initialBrands: BrandModel[];
}

export function ProductGroupsTable({
  initialCategories,
  initialBrands,
}: ProductGroupsTableProps) {
  const [productGroups, setProductGroups] = useState<ProductGroupModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Filters
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);

  // Edit modal
  const [editingGroup, setEditingGroup] = useState<ProductGroupModel | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Create modal
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Fetch product groups based on filters
  useEffect(() => {
    const fetchGroups = async () => {
      setLoading(true);
      try {
        const groups = await getAllProductGroups(
          selectedCategoryId || undefined,
          selectedBrandId || undefined
        );

        setProductGroups(groups);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Failed to fetch product groups:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [selectedCategoryId, selectedBrandId]);

  // Filter groups by search term
  const filteredGroups = useMemo(() => {
    if (!searchTerm) return productGroups;

    const search = searchTerm.toLowerCase();

    return productGroups.filter((group) =>
      group.name?.toLowerCase().includes(search)
    );
  }, [productGroups, searchTerm]);

  // Get category name by ID
  const getCategoryName = (categoryId?: string) => {
    if (!categoryId) return "All Categories";

    return initialCategories.find((c) => c.id === categoryId)?.name || "Unknown";
  };

  // Get brand name by ID
  const getBrandName = (brandId?: string) => {
    if (!brandId) return "All Brands";

    return initialBrands.find((b) => b.id === brandId)?.name || "Unknown";
  };

  const handleEdit = (group: ProductGroupModel) => {
    setEditingGroup(group);
    setEditModalOpen(true);
  };

  const handleGroupUpdated = () => {
    // Refresh the product groups list
    const fetchGroups = async () => {
      setLoading(true);
      try {
        const groups = await getAllProductGroups(
          selectedCategoryId || undefined,
          selectedBrandId || undefined
        );

        setProductGroups(groups);
      } catch (error) {
        console.error("Failed to fetch product groups:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block lg:col-span-1">
          <div className="sticky top-4 h-[calc(100vh-2rem)]">
            <ProductGroupFilters
              brands={initialBrands}
              categories={initialCategories}
              selectedBrandId={selectedBrandId}
              selectedCategoryId={selectedCategoryId}
              onSelectBrand={setSelectedBrandId}
              onSelectCategory={setSelectedCategoryId}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Card className="bg-white/70 dark:bg-slate-900/70 border-2 border-slate-200/60 dark:border-slate-800/60 backdrop-blur-xl shadow-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-500/5 pointer-events-none" />
            <CardHeader className="pb-4 relative">
              <div className="flex flex-col gap-3 md:gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-2 flex-1">
                  <Button
                    className="shrink-0  text-white shadow-lg"
                    size="sm"
                    onClick={() => setCreateModalOpen(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    New Group
                  </Button>
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button
                        className="lg:hidden shrink-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800"
                        size="sm"
                        variant="outline"
                      >
                        <Layers className="mr-2 h-4 w-4" />
                        Filters
                      </Button>
                    </SheetTrigger>
                    <SheetContent
                      className="h-[85vh] p-0 bg-white dark:bg-slate-900 overflow-y-auto"
                      side="bottom"
                    >
                      <SheetHeader className="px-6 pt-6 mb-6">
                        <SheetTitle className="text-slate-900 dark:text-slate-100">
                          Filters
                        </SheetTitle>
                      </SheetHeader>
                      <div className="px-4 pb-4 h-[calc(100%-80px)]">
                        <ProductGroupFilters
                          brands={initialBrands}
                          categories={initialCategories}
                          selectedBrandId={selectedBrandId}
                          selectedCategoryId={selectedCategoryId}
                          onSelectBrand={setSelectedBrandId}
                          onSelectCategory={setSelectedCategoryId}
                        />
                      </div>
                    </SheetContent>
                  </Sheet>

                  {/* Search */}
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-500 dark:text-cyan-400 h-4 w-4" />
                    <Input
                      aria-label="Search product groups"
                      className="pl-10 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 focus:border-cyan-500 dark:focus:border-cyan-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 font-medium shadow-sm"
                      placeholder="Search product groups..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Active Filters Display */}
              {(selectedCategoryId || selectedBrandId) && (
                <div className="mt-3 flex items-center gap-2 text-sm">
                  <Package className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                  <div className="flex flex-wrap gap-2">
                    {selectedCategoryId && (
                      <Badge
                        className="bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100 border border-blue-200 dark:border-blue-800"
                        variant="secondary"
                      >
                        {getCategoryName(selectedCategoryId)}
                      </Badge>
                    )}
                    {selectedBrandId && (
                      <Badge
                        className="bg-purple-100 dark:bg-purple-900/30 text-purple-900 dark:text-purple-100 border border-purple-200 dark:border-purple-800"
                        variant="secondary"
                      >
                        {getBrandName(selectedBrandId)}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </CardHeader>

            <CardContent className="p-0">
              <div className="max-h-[calc(100vh-280px)] overflow-auto">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600" />
                  </div>
                ) : filteredGroups.length === 0 ? (
                  <div className="text-center py-12 px-4">
                    <Package className="h-12 w-12 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                      No product groups found
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Desktop Table View */}
                    <div className="hidden md:block">
                      <Table>
                        <TableHeader className="sticky top-0 z-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm">
                          <TableRow className="border-b-2 border-slate-200 dark:border-slate-800">
                            <TableHead className="font-bold text-slate-900 dark:text-slate-100">
                              Group Name
                            </TableHead>
                            <TableHead className="font-bold text-slate-900 dark:text-slate-100">
                              Category
                            </TableHead>
                            <TableHead className="font-bold text-slate-900 dark:text-slate-100">
                              Brand
                            </TableHead>
                            <TableHead className="text-center font-bold text-slate-900 dark:text-slate-100">
                              Products
                            </TableHead>
                            <TableHead className="text-right font-bold text-slate-900 dark:text-slate-100">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredGroups.map((group) => (
                            <TableRow
                              key={group.id}
                              className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800"
                            >
                              <TableCell className="font-semibold text-slate-900 dark:text-slate-100">
                                {group.name}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                                  variant="outline"
                                >
                                  {getCategoryName(group.categoryId)}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  className="bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800"
                                  variant="outline"
                                >
                                  {getBrandName(group.brandId)}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge
                                  className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                                  variant="secondary"
                                >
                                  {group.productIds?.length || 0}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  {/* <Button
                                    className="text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20"
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleEdit(group)}
                                  >
                                    <Eye className="h-4 w-4 mr-1" />
                                    View
                                  </Button> */}
                                  <Button
                                    className="border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-50 dark:hover:bg-cyan-900/20"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleEdit(group)}
                                  >
                                    <Edit2 className="h-4 w-4 mr-1" />
                                    Edit
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden space-y-4 p-4">
                      {filteredGroups.map((group) => (
                        <Card
                          key={group.id}
                          className="group hover:shadow-2xl transition-all duration-300 bg-white/90 dark:bg-slate-900/90 border-2 border-slate-200 dark:border-slate-800 hover:border-cyan-300 dark:hover:border-cyan-700"
                        >
                          <CardContent className="p-4 space-y-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100">
                                  {group.name}
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                  ID: {group.id}
                                </p>
                              </div>
                              <Badge
                                className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                                variant="secondary"
                              >
                                {group.productIds?.length || 0} products
                              </Badge>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              <Badge
                                className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                                variant="outline"
                              >
                                {getCategoryName(group.categoryId)}
                              </Badge>
                              <Badge
                                className="bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800"
                                variant="outline"
                              >
                                {getBrandName(group.brandId)}
                              </Badge>
                            </div>

                            <div className="flex gap-2 pt-2">
                              <Button
                                className="flex-1 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20"
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEdit(group)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              <Button
                                className="flex-1 border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-50 dark:hover:bg-cyan-900/20"
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit(group)}
                              >
                                <Edit2 className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Modal */}
      {editingGroup && (
        <EditProductGroupModal
          brandId={selectedBrandId || undefined}
          categoryId={selectedCategoryId || undefined}
          group={editingGroup}
          open={editModalOpen}
          onGroupUpdated={handleGroupUpdated}
          onOpenChange={setEditModalOpen}
        />
      )}

      {/* Create Modal */}
      <CreateProductGroupModal
        brands={initialBrands}
        categories={initialCategories}
        open={createModalOpen}
        onGroupCreated={handleGroupUpdated}
        onOpenChange={setCreateModalOpen}
      />
    </div>
  );
}
