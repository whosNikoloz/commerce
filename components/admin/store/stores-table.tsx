"use client";

import type { StoreModel } from "@/types/store";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Search,
  RefreshCw,
  Store,
  MapPin,
  Phone,
  Mail,
  User,
  Trash2,
  Edit,
} from "lucide-react";
import dynamic from "next/dynamic";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  getAllStores,
  deleteStore,
  updateStore,
} from "@/app/api/services/storeService";

const AddStoreModal = dynamic(() => import("./add-store-modal"), { ssr: false });
const UpdateStoreModal = dynamic(() => import("./update-store-modal"), { ssr: false });

export function StoresTable() {
  const [stores, setStores] = useState<StoreModel[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [storeToDelete, setStoreToDelete] = useState<string | null>(null);
  const [selectedStore, setSelectedStore] = useState<StoreModel | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  const fetchStores = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllStores();

      setStores(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch stores";

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const handleDelete = async () => {
    if (!storeToDelete) return;

    try {
      await deleteStore(storeToDelete);
      toast.success("Store deleted successfully");
      fetchStores();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete store");
    } finally {
      setDeleteDialogOpen(false);
      setStoreToDelete(null);
    }
  };

  const handleToggleActive = async (store: StoreModel) => {
    try {
      await updateStore({
        id: store.id,
        isActive: !store.isActive,
      });
      toast.success(`Store ${!store.isActive ? "activated" : "deactivated"} successfully`);
      fetchStores();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update store");
    }
  };

  const filteredStores = stores.filter((store) =>
    store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    store.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    store.manager?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative space-y-6">
      {/* Header Card */}
      <Card className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        <CardHeader className="space-y-6 pb-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-blue-100 dark:bg-blue-900/30 p-2.5">
                <Store className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="font-heading text-2xl font-bold text-slate-900 dark:text-slate-100">
                  Store Management
                </h2>
                <p className="font-primary text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Manage stores and transfer products between locations
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <AddStoreModal onSuccess={fetchStores} />
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                className="pl-10 border-slate-200 dark:border-slate-700"
                placeholder="Search by name, city, or manager..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button
              disabled={loading}
              variant="outline"
              onClick={fetchStores}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Error State */}
      {error && (
        <Card className="border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20">
          <CardContent className="pt-6">
            <p className="font-primary text-red-600 dark:text-red-400 text-center">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Table Card */}
      <Card className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-blue-500 mb-4" />
              <p className="font-primary text-slate-600 dark:text-slate-400">Loading stores...</p>
            </div>
          ) : filteredStores.length === 0 ? (
            <div className="p-12 text-center">
              <Store className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-700 mb-4" />
              <p className="font-primary text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                No stores found
              </p>
              <p className="font-primary text-slate-600 dark:text-slate-400">
                {searchTerm ? "Try adjusting your search" : "Create your first store to get started"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700">
                    <TableHead className="font-semibold">Store Name</TableHead>
                    <TableHead className="font-semibold">Location</TableHead>
                    <TableHead className="font-semibold">Contact</TableHead>
                    <TableHead className="font-semibold">Manager</TableHead>
                    <TableHead className="font-semibold">Active</TableHead>
                    <TableHead className="font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStores.map((store) => (
                    <TableRow
                      key={store.id}
                      className="group hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-all duration-200 border-slate-200 dark:border-slate-700"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-blue-100 dark:bg-blue-900/30 p-2">
                            <Store className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-slate-100">
                              {store.name}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-500">
                              ID: {store.id.slice(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {store.city || store.country ? (
                          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                            <MapPin className="h-4 w-4 text-slate-400" />
                            <span>
                              {store.city}
                              {store.city && store.country && ", "}
                              {store.country}
                            </span>
                          </div>
                        ) : (
                          <span className="font-primary text-slate-400 italic">Not specified</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {store.phone && (
                            <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                              <Phone className="h-3 w-3 text-slate-400" />
                              {store.phone}
                            </div>
                          )}
                          {store.email && (
                            <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                              <Mail className="h-3 w-3 text-slate-400" />
                              {store.email}
                            </div>
                          )}
                          {!store.phone && !store.email && (
                            <span className="font-primary text-slate-400 italic text-sm">Not specified</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {store.manager ? (
                          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                            <User className="h-4 w-4 text-slate-400" />
                            {store.manager}
                          </div>
                        ) : (
                          <span className="font-primary text-slate-400 italic">Not assigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={store.isActive}
                            onCheckedChange={() => handleToggleActive(store)}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedStore(store);
                              setIsUpdateModalOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setStoreToDelete(store.id);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 dark:text-slate-100">
              Are you sure?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 dark:text-slate-400">
              This action cannot be undone. This will permanently delete the store
              and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Update Modal */}
      {selectedStore && (
        <UpdateStoreModal
          open={isUpdateModalOpen}
          store={selectedStore}
          onOpenChange={setIsUpdateModalOpen}
          onSuccess={() => {
            fetchStores();
            setIsUpdateModalOpen(false);
          }}
        />
      )}

    </div>
  );
}
