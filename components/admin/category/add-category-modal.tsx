"use client";

import type { CategoryModel } from "@/types/category";

import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createCategory } from "@/app/api/services/categoryService";

interface AddCategoryModalProps {
  categories: CategoryModel[];
  onCategoryAdded?: () => void;
}

export default function AddCategoryModal({
  categories,
  onCategoryAdded,
}: AddCategoryModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    parentId: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      toast.error("Please enter a category name");
      return;
    }

    setLoading(true);

    try {
      const categoryData: CategoryModel = {
        id: crypto.randomUUID(), // Generate new ID
        name: formData.name,
        description: formData.description,
        parentId: formData.parentId || undefined,
        isActive: true,
        facets: [],
        images: [],
      };

      await createCategory(categoryData);
      toast.success("Category created successfully");

      setFormData({
        name: "",
        description: "",
        parentId: "",
      });

      setOpen(false);
      onCategoryAdded?.();
    } catch (error) {
      console.error("Failed to create category:", error);
      toast.error("Failed to create category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          size="sm"
        >
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Add New Category
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-400">
            Create a new category for organizing your products
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label className="text-slate-700 dark:text-slate-300 font-semibold" htmlFor="name">
                Category Name *
              </Label>
              <Input
                required
                className="border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                id="name"
                placeholder="e.g., Smartphones"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label className="text-slate-700 dark:text-slate-300 font-semibold" htmlFor="description">
                Description
              </Label>
              <Textarea
                className="border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 min-h-[100px]"
                id="description"
                placeholder="Category description..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label className="text-slate-700 dark:text-slate-300 font-semibold" htmlFor="parent">
                Parent Category (Optional)
              </Label>
              <Select
                value={formData.parentId || undefined}
                onValueChange={(value) => setFormData({ ...formData, parentId: value })}
              >
                <SelectTrigger className="border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                  <SelectValue placeholder="None (Top Level)" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800">
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              className="bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 hover:bg-slate-300 dark:hover:bg-slate-600"
              disabled={loading}
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold"
              disabled={loading}
              type="submit"
            >
              {loading ? "Creating..." : "Create Category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
