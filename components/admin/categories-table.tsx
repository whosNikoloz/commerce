"use client"

import { useState } from "react"
import { Edit, Trash2, Plus, Tag, Eye, EyeOff } from "lucide-react"
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
  visible: boolean
  parentCategory?: string
}

const initialCategories: Category[] = [
  {
    id: "1",
    name: "Electronics",
    description: "Electronic devices and gadgets",
    productCount: 45,
    visible: true,
  },
  {
    id: "2",
    name: "Smartphones",
    description: "Mobile phones and accessories",
    productCount: 23,
    visible: true,
    parentCategory: "Electronics",
  },
  {
    id: "3",
    name: "Home & Kitchen",
    description: "Home appliances and kitchen items",
    productCount: 67,
    visible: true,
  },
  {
    id: "4",
    name: "Sports & Outdoors",
    description: "Sports equipment and outdoor gear",
    productCount: 34,
    visible: true,
  },
  {
    id: "5",
    name: "Books",
    description: "Physical and digital books",
    productCount: 12,
    visible: true,
  },
  {
    id: "6",
    name: "Clothing",
    description: "Fashion and apparel",
    productCount: 89,
    visible: true,
  },
]

export function CategoriesTable() {
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    parentCategory: "",
  })

  const toggleCategoryStatus = (categoryId: string) => {
    setCategories(
      categories.map((category) =>
        category.id === categoryId
          ? { ...category, visible: !category.visible }
          : category,
      ),
    )
  }

  const filteredCategories = categories.filter(
    (categorie) =>
      categorie.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (categorie.parentCategory && categorie.parentCategory.toLowerCase().includes(searchTerm.toLowerCase()))
  )


  const deleteCategory = (categoryId: string) => {
    setCategories(categories.filter((category) => category.id !== categoryId))
  }

  // const addCategory = () => {
  //   if (newCategory.name.trim()) {
  //     const category: Category = {
  //       id: (categories.length + 1).toString(),
  //       name: newCategory.name,
  //       description: newCategory.description,
  //       productCount: 0,
  //       visible: false,
  //       parentCategory: newCategory.parentCategory || undefined,
  //     }
  //     setCategories([...categories, category])
  //     setNewCategory({ name: "", description: "", parentCategory: "" })
  //     setIsAddDialogOpen(false)
  //   }
  // }

  return (
    <Card className="border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 w-full md:w-auto">
            <input
              type="text"
              placeholder="Search by name or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-64 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-white dark:border-slate-700 dark:placeholder:text-slate-500"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="overflow-auto max-h-[calc(100vh-240px)]">
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
                      checked={category.visible}
                      onCheckedChange={() => toggleCategoryStatus(category.id)}
                      className="data-[state=checked]:bg-blue-600"
                    />
                    {category.visible ? (
                      <Eye className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-slate-400" />
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
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
