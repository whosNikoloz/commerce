"use client"

import { useState } from "react"
import { Edit, Trash2, Plus, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface Category {
  id: string
  name: string
  description: string
  productCount: number
  status: "active" | "inactive"
  parentCategory?: string
}

const initialCategories: Category[] = [
  {
    id: "1",
    name: "Electronics",
    description: "Electronic devices and gadgets",
    productCount: 45,
    status: "active",
  },
  {
    id: "2",
    name: "Smartphones",
    description: "Mobile phones and accessories",
    productCount: 23,
    status: "active",
    parentCategory: "Electronics",
  },
  {
    id: "3",
    name: "Home & Kitchen",
    description: "Home appliances and kitchen items",
    productCount: 67,
    status: "active",
  },
  {
    id: "4",
    name: "Sports & Outdoors",
    description: "Sports equipment and outdoor gear",
    productCount: 34,
    status: "active",
  },
  {
    id: "5",
    name: "Books",
    description: "Physical and digital books",
    productCount: 12,
    status: "inactive",
  },
  {
    id: "6",
    name: "Clothing",
    description: "Fashion and apparel",
    productCount: 89,
    status: "active",
  },
]

export function CategoriesTable() {
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    parentCategory: "",
  })

  const toggleCategoryStatus = (categoryId: string) => {
    setCategories(
      categories.map((category) =>
        category.id === categoryId
          ? { ...category, status: category.status === "active" ? "inactive" : "active" }
          : category,
      ),
    )
  }

  const deleteCategory = (categoryId: string) => {
    setCategories(categories.filter((category) => category.id !== categoryId))
  }

  const addCategory = () => {
    if (newCategory.name.trim()) {
      const category: Category = {
        id: (categories.length + 1).toString(),
        name: newCategory.name,
        description: newCategory.description,
        productCount: 0,
        status: "active",
        parentCategory: newCategory.parentCategory || undefined,
      }
      setCategories([...categories, category])
      setNewCategory({ name: "", description: "", parentCategory: "" })
      setIsAddDialogOpen(false)
    }
  }

  return (
    <Card className="border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Categories</CardTitle>
            <CardDescription>Manage your product categories and subcategories</CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-lg shadow-blue-500/25">
                <Plus className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Category</DialogTitle>
                <DialogDescription>Create a new product category for your store.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={newCategory.description}
                    onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="parent" className="text-right">
                    Parent
                  </Label>
                  <Input
                    id="parent"
                    placeholder="Optional parent category"
                    value={newCategory.parentCategory}
                    onChange={(e) => setNewCategory({ ...newCategory, parentCategory: e.target.value })}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  onClick={addCategory}
                  className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-lg shadow-blue-500/25"
                >
                  Add Category
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Parent Category</TableHead>
              <TableHead>Products</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
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
                  {category.parentCategory ? (
                    <Badge
                      variant="outline"
                      className="border-blue-200 text-blue-700 dark:border-blue-800 dark:text-blue-300"
                    >
                      {category.parentCategory}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{category.productCount} products</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={category.status === "active"}
                      onCheckedChange={() => toggleCategoryStatus(category.id)}
                      className="data-[state=checked]:bg-blue-600"
                    />
                    <Badge
                      variant={category.status === "active" ? "default" : "secondary"}
                      className={
                        category.status === "active"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                          : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
                      }
                    >
                      {category.status}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the category "{category.name}"
                            and may affect {category.productCount} products.
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
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
