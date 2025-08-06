"use client"

import { useState } from "react"
import Image from "next/image"
import { Eye, EyeOff, Edit, Trash2, Plus } from "lucide-react"
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

interface Product {
  id: string
  name: string
  price: number
  category: string
  stock: number
  status: "active" | "inactive"
  image: string
  visible: boolean
}

const initialProducts: Product[] = [
  {
    id: "1",
    name: "Wireless Headphones",
    price: 99.99,
    category: "Electronics",
    stock: 45,
    status: "active",
    image: "/placeholder.svg?height=64&width=64",
    visible: true,
  },
  {
    id: "2",
    name: "Smart Watch",
    price: 299.99,
    category: "Electronics",
    stock: 23,
    status: "active",
    image: "/placeholder.svg?height=64&width=64",
    visible: true,
  },
  {
    id: "3",
    name: "Coffee Maker",
    price: 149.99,
    category: "Home & Kitchen",
    stock: 12,
    status: "inactive",
    image: "/placeholder.svg?height=64&width=64",
    visible: false,
  },
  {
    id: "4",
    name: "Running Shoes",
    price: 79.99,
    category: "Sports",
    stock: 67,
    status: "active",
    image: "/placeholder.svg?height=64&width=64",
    visible: true,
  },
  {
    id: "5",
    name: "Laptop Stand",
    price: 39.99,
    category: "Office",
    stock: 0,
    status: "active",
    image: "/placeholder.svg?height=64&width=64",
    visible: true,
  },
]

export function ProductsTable() {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [searchTerm, setSearchTerm] = useState<string>("")


  const toggleProductVisibility = (productId: string) => {
    setProducts(
      products.map((product) => (product.id === productId ? { ...product, visible: !product.visible } : product)),
    )
  }

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const deleteProduct = (productId: string) => {
    setProducts(products.filter((product) => product.id !== productId))
  }

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: "Out of Stock", variant: "destructive" as const }
    if (stock < 20) return { label: "Low Stock", variant: "secondary" as const }
    return { label: "In Stock", variant: "default" as const }
  }

  return (
    <Card className="dark:bg-brand-muteddark bg-brand-muted backdrop-blur">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="text-text-light">Product List</CardTitle>
            <CardDescription>Manage your product inventory here</CardDescription>
          </div>
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 w-full md:w-auto">
            <input
              type="text"
              placeholder="Search by name or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-64 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-white dark:border-slate-700 dark:placeholder:text-slate-500"
            />
            <Button className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-lg shadow-blue-500/25">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="">
              <TableHead className="w-[80px]">Image</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Visible</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => {
              const stockStatus = getStockStatus(product.stock)
              return (
                <TableRow key={product.id} className="">
                  <TableCell>
                    <div className="relative">
                      <Image
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        width={64}
                        height={64}
                        className="rounded-xl object-cover ring-2 ring-slate-200 dark:ring-slate-700"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-slate-900 dark:text-slate-100">{product.name}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">ID: {product.id}</div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="border-blue-200 text-blue-700 dark:border-blue-800 dark:text-blue-300"
                    >
                      {product.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium text-slate-900 dark:text-slate-100">
                    ${product.price.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-slate-900 dark:text-slate-100">{product.stock} units</span>
                      <Badge
                        variant={stockStatus.variant}
                        className={
                          stockStatus.variant === "destructive"
                            ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            : stockStatus.variant === "secondary"
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                              : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                        }
                      >
                        {stockStatus.label}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={product.status === "active" ? "default" : "secondary"}
                      className={
                        product.status === "active"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                          : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
                      }
                    >
                      {product.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={product.visible}
                        onCheckedChange={() => toggleProductVisibility(product.id)}
                        className="data-[state=checked]:bg-blue-600"
                      />
                      {product.visible ? (
                        <Eye className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-slate-400" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" size="sm" className="border-slate-200 dark:border-slate-700">
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
                              This action cannot be undone. This will permanently delete the product "{product.name}"
                              from your inventory.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteProduct(product.id)}
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
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
