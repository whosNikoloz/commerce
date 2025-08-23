"use client";

import { useEffect, useState } from "react";
import { Tag, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { getAllCategories, updateCategory } from "@/app/api/services/categoryService";
import { CategoryModel } from "@/types/category";

export function CategoriesTable() {
  const [categories, setCategories] = useState<CategoryModel[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getAllCategories();

        setCategories(data);
      } catch (err) {
        console.error("❌ Error loading categories", err);
      }
    };

    fetchCategories();
  }, []);

  const toggleCategoryVisibility = async (categoryId: string) => {
    const current = categories.find((p) => p.id === categoryId);

    if (!current) return;

    const prevCategories = categories;

    setCategories((prev) =>
      prev.map((category) =>
        category.id === categoryId ? { ...category, isActive: !category.isActive } : category,
      ),
    );

    const payload: CategoryModel = {
      id: current.id,
      name: current.name,
      description: current.description,
      parentId: current.parentId,
      isActive: !current.isActive,
      facets: current.facets,
    };

    try {
      await updateCategory(payload);
      toast.success("პროდუქტი წარმატებით განახლდა.");
    } catch (err) {
      console.error("Failed to update product", err);
      toast.error("პროდუქტის განახლება ვერ მოხერხდა.");
      setCategories(prevCategories);
    }
  };

  const deleteCategory = (categoryId: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== categoryId));
  };

  const filteredCategories = categories.filter(
    (category) =>
      category.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <Card className="border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <input
            className="w-full md:w-64 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-white dark:border-slate-700 dark:placeholder:text-slate-500"
            placeholder="Search by name or description..."
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent className="overflow-auto max-h-[calc(100vh-240px)]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Parent</TableHead>
              <TableHead>Facets</TableHead>
              <TableHead>Status</TableHead>
              {/* <TableHead className="text-right">Actions</TableHead> */}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCategories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{category.name}</div>
                      <div className="text-sm text-muted-foreground">ID: {category.id}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="max-w-xs">
                  <p className="truncate">{category.description}</p>
                </TableCell>
                <TableCell>
                  {category.parentId ? (
                    <Badge
                      className="border-blue-200 text-blue-700 dark:border-blue-800 dark:text-blue-300"
                      variant="outline"
                    >
                      {categories.find((c) => c.id === category.parentId)?.name || "|"}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>

                <TableCell>
                  <Badge variant="secondary">{category.facets?.length ?? 0} facets</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={(category as any).visible}
                      className="data-[state=checked]:bg-blue-600"
                      onCheckedChange={() => toggleCategoryVisibility(category.id)}
                    />
                    {(category as any).visible ? (
                      <Eye className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-slate-400" />
                    )}
                  </div>
                </TableCell>
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
                            This will delete category "{category.name}".
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteCategory(category.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell> */}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
