"use client"

import { useState } from "react"
import { Edit, Trash2, Plus, Truck, MapPin } from "lucide-react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ShippingMethod {
  id: string
  name: string
  description: string
  baseRate: number
  deliveryTime: string
  zones: string[]
  status: "active" | "inactive"
  type: "standard" | "express" | "overnight" | "free"
}

const initialShippingMethods: ShippingMethod[] = [
  {
    id: "1",
    name: "Standard Shipping",
    description: "Regular delivery service",
    baseRate: 5.99,
    deliveryTime: "5-7 business days",
    zones: ["Domestic", "International"],
    status: "active",
    type: "standard",
  },
  {
    id: "2",
    name: "Express Shipping",
    description: "Fast delivery service",
    baseRate: 12.99,
    deliveryTime: "2-3 business days",
    zones: ["Domestic"],
    status: "active",
    type: "express",
  },
  {
    id: "3",
    name: "Overnight Shipping",
    description: "Next day delivery",
    baseRate: 24.99,
    deliveryTime: "1 business day",
    zones: ["Domestic"],
    status: "active",
    type: "overnight",
  },
  {
    id: "4",
    name: "Free Shipping",
    description: "Free delivery for orders over $50",
    baseRate: 0,
    deliveryTime: "7-10 business days",
    zones: ["Domestic"],
    status: "active",
    type: "free",
  },
  {
    id: "5",
    name: "International Express",
    description: "Fast international delivery",
    baseRate: 29.99,
    deliveryTime: "3-5 business days",
    zones: ["International"],
    status: "inactive",
    type: "express",
  },
]

export function ShippingTable() {
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>(initialShippingMethods)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newMethod, setNewMethod] = useState({
    name: "",
    description: "",
    baseRate: "",
    deliveryTime: "",
    type: "standard" as const,
  })

  const toggleMethodStatus = (methodId: string) => {
    setShippingMethods(
      shippingMethods.map((method) =>
        method.id === methodId ? { ...method, status: method.status === "active" ? "inactive" : "active" } : method,
      ),
    )
  }

  const deleteMethod = (methodId: string) => {
    setShippingMethods(shippingMethods.filter((method) => method.id !== methodId))
  }

  const addMethod = () => {
    if (newMethod.name.trim() && newMethod.baseRate) {
      const method: ShippingMethod = {
        id: (shippingMethods.length + 1).toString(),
        name: newMethod.name,
        description: newMethod.description,
        baseRate: Number.parseFloat(newMethod.baseRate),
        deliveryTime: newMethod.deliveryTime,
        zones: ["Domestic"],
        status: "active",
        type: newMethod.type,
      }
      setShippingMethods([...shippingMethods, method])
      setNewMethod({ name: "", description: "", baseRate: "", deliveryTime: "", type: "standard" })
      setIsAddDialogOpen(false)
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "free":
        return "bg-green-100 text-green-800"
      case "express":
        return "bg-blue-100 text-blue-800"
      case "overnight":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Shipping Methods</CardTitle>
              <CardDescription>Manage your shipping options and rates</CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Shipping Method
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Shipping Method</DialogTitle>
                  <DialogDescription>Create a new shipping option for your customers.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="name"
                      value={newMethod.name}
                      onChange={(e) => setNewMethod({ ...newMethod, name: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      value={newMethod.description}
                      onChange={(e) => setNewMethod({ ...newMethod, description: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="rate" className="text-right">
                      Base Rate ($)
                    </Label>
                    <Input
                      id="rate"
                      type="number"
                      step="0.01"
                      value={newMethod.baseRate}
                      onChange={(e) => setNewMethod({ ...newMethod, baseRate: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="delivery" className="text-right">
                      Delivery Time
                    </Label>
                    <Input
                      id="delivery"
                      placeholder="e.g., 2-3 business days"
                      value={newMethod.deliveryTime}
                      onChange={(e) => setNewMethod({ ...newMethod, deliveryTime: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="type" className="text-right">
                      Type
                    </Label>
                    <Select
                      value={newMethod.type}
                      onValueChange={(value: "standard") =>
                        setNewMethod({ ...newMethod, type: value })
                      }
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="express">Express</SelectItem>
                        <SelectItem value="overnight">Overnight</SelectItem>
                        <SelectItem value="free">Free</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" onClick={addMethod}>
                    Add Method
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
                <TableHead>Method</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Base Rate</TableHead>
                <TableHead>Delivery Time</TableHead>
                <TableHead>Zones</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shippingMethods.map((method) => (
                <TableRow key={method.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Truck className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{method.name}</div>
                        <div className="text-sm text-muted-foreground">{method.description}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getTypeColor(method.type)}>{method.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">
                      {method.baseRate === 0 ? "Free" : `$${method.baseRate.toFixed(2)}`}
                    </span>
                  </TableCell>
                  <TableCell>{method.deliveryTime}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {method.zones.map((zone) => (
                        <Badge key={zone} variant="outline" className="text-xs">
                          <MapPin className="mr-1 h-3 w-3" />
                          {zone}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={method.status === "active"}
                        onCheckedChange={() => toggleMethodStatus(method.id)}
                      />
                      <Badge variant={method.status === "active" ? "default" : "secondary"}>{method.status}</Badge>
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
                              This action cannot be undone. This will permanently delete the shipping method "
                              {method.name}".
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteMethod(method.id)}
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

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Shipping Zones</CardTitle>
            <CardDescription>Configure shipping zones and rates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium">Domestic Zone</h4>
                  <p className="text-sm text-muted-foreground">United States</p>
                </div>
                <Badge>Active</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium">International Zone</h4>
                  <p className="text-sm text-muted-foreground">Worldwide</p>
                </div>
                <Badge>Active</Badge>
              </div>
              <Button variant="outline" className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add Shipping Zone
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Shipping Settings</CardTitle>
            <CardDescription>General shipping configuration</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Free shipping threshold</h4>
                  <p className="text-sm text-muted-foreground">Minimum order value for free shipping</p>
                </div>
                <Input className="w-24" placeholder="$50" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Processing time</h4>
                  <p className="text-sm text-muted-foreground">Time to prepare orders</p>
                </div>
                <Input className="w-32" placeholder="1-2 days" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Weight-based rates</h4>
                  <p className="text-sm text-muted-foreground">Calculate shipping by weight</p>
                </div>
                <Switch />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
