"use client";

import { useState, useMemo } from "react";
import { Button } from "@heroui/button";
import { useDisclosure } from "@heroui/modal";
import { IconPlus, IconEdit, IconTrash, IconEye, IconTemplate } from "@tabler/icons-react";
import { toast } from "sonner";

import AddTenantModal from "./add-tenant-modal";
import EditTenantModal from "./edit-tenant-modal";

import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { TENANTS } from "@/config/tenat";

export default function TenantsTable() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTenant, setSelectedTenant] = useState<{
    domain: string;
    config: (typeof TENANTS)[string];
  } | null>(null);

  const addModal = useDisclosure();
  const editModal = useDisclosure();

  const tenants = useMemo(() => {
    return Object.entries(TENANTS).map(([domain, config]) => ({ domain, config }));
  }, []);

  const filteredTenants = useMemo(() => {
    if (!searchQuery.trim()) return tenants;
    const query = searchQuery.toLowerCase();
    return tenants.filter((tenant) => tenant.domain.toLowerCase().includes(query));
  }, [tenants, searchQuery]);

  const handleEdit = (domain: string, config: (typeof TENANTS)[string]) => {
    setSelectedTenant({ domain, config });
    editModal.onOpen();
  };

  const handleDelete = async (domain: string) => {
    if (
      !confirm(
        `Are you sure you want to delete tenant "${domain}"?\n\nThis will update GitHub and trigger a redeployment. The tenant will be removed in 2-3 minutes.`,
      )
    ) {
      return;
    }

    try {
      const response = await fetch("/api/admin/tenants/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to delete tenant");
      }

      toast.success("Tenant deleted! Changes will be live in 2-3 minutes after deployment.");

      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } catch (error: any) {
      toast.error(error.message || "Failed to delete tenant");
      console.error(error);
    }
  };

  const getTemplateLabel = (templateId: number) => {
    switch (templateId) {
      case 1:
        return "Tech/Electronics";
      case 2:
        return "Home/Furniture";
      case 3:
        return "Beauty/Health";
      default:
        return `Template ${templateId}`;
    }
  };

  const getThemeMode = (mode: string) => (mode === "dark" ? "Dark" : "Light");

  return (
    <>
      <Card className="bg-white/70 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800/60 backdrop-blur-xl shadow-xl relative">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-violet-500/5 pointer-events-none rounded-lg" />
        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <div>
              <CardDescription className="text-slate-600 dark:text-slate-400 font-medium mt-1">
                {filteredTenants.length} tenant{filteredTenants.length !== 1 ? "s" : ""} configured
              </CardDescription>
            </div>
            <Button
              className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-semibold shadow-md hover:shadow-xl transition-all duration-300"
              startContent={<IconPlus className="h-4 w-4" />}
              onPress={addModal.onOpen}
            >
              Add Tenant
            </Button>
          </div>
        </CardHeader>
        <CardContent className="relative">
          <div className="mb-6">
            <Input
              className="max-w-md rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-4 py-2.5 text-sm
                         text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400
                         focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 dark:focus:border-indigo-600
                         shadow-sm hover:shadow-md transition-all duration-300 font-medium"
              placeholder="🔍 Search by domain..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block rounded-xl border-2 border-slate-200 dark:border-slate-700 overflow-hidden">
            <Table>
              <TableHeader className="bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800/80 dark:to-slate-800/50">
                <TableRow className="border-b-2 border-slate-200 dark:border-slate-700">
                  <TableHead className="text-slate-700 dark:text-slate-300 font-bold text-sm uppercase tracking-wide">
                    Domain
                  </TableHead>
                  <TableHead className="text-slate-700 dark:text-slate-300 font-bold text-sm uppercase tracking-wide">
                    Template
                  </TableHead>
                  <TableHead className="text-slate-700 dark:text-slate-300 font-bold text-sm uppercase tracking-wide">
                    Theme Mode
                  </TableHead>
                  <TableHead className="text-slate-700 dark:text-slate-300 font-bold text-sm uppercase tracking-wide">
                    Theme Color
                  </TableHead>
                  <TableHead className="text-slate-700 dark:text-slate-300 font-bold text-sm uppercase tracking-wide">
                    Sections
                  </TableHead>
                  <TableHead className="text-right text-slate-700 dark:text-slate-300 font-bold text-sm uppercase tracking-wide">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTenants.length === 0 ? (
                  <TableRow>
                    <TableCell className="text-center py-12" colSpan={6}>
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                          <IconEye className="h-8 w-8 text-slate-400" />
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 font-semibold">
                          {searchQuery ? "No tenants found matching your search" : "No tenants configured yet"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTenants.map((tenant) => (
                    <TableRow
                      key={tenant.domain}
                      className="hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-violet-50/50 dark:hover:from-indigo-950/20 dark:hover:to-violet-950/20 transition-all duration-300 border-b border-slate-200/50 dark:border-slate-700/50"
                    >
                      <TableCell className="font-bold">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg ring-2 ring-white dark:ring-slate-800">
                            <IconEye className="h-5 w-5 text-white" />
                          </div>
                          <span className="font-mono text-sm text-slate-900 dark:text-slate-100">{tenant.domain}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <IconTemplate className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                          <Badge
                            className="border-2 border-indigo-200 dark:border-indigo-800/50 text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 font-semibold px-3 py-1"
                            variant="outline"
                          >
                            {getTemplateLabel(tenant.config.templateId)}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            tenant.config.theme.mode === "dark"
                              ? "bg-slate-800 text-slate-100 font-semibold px-3 py-1"
                              : "bg-slate-100 text-slate-700 font-semibold px-3 py-1"
                          }
                          variant={tenant.config.theme.mode === "dark" ? "default" : "secondary"}
                        >
                          {getThemeMode(tenant.config.theme.mode)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className="h-8 w-8 rounded-lg border-2 border-slate-200 dark:border-slate-700 shadow-sm ring-2 ring-white dark:ring-slate-800"
                            style={{ backgroundColor: tenant.config.themeColor }}
                          />
                          <span className="font-mono text-xs text-slate-600 dark:text-slate-400 font-semibold">
                            {tenant.config.themeColor}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold px-3 py-1 ring-1 ring-slate-200 dark:ring-slate-700">
                          {tenant.config.homepage.sections.filter((s) => s.enabled).length} enabled
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            isIconOnly
                            className="h-8 w-8 min-w-8"
                            size="sm"
                            variant="flat"
                            onPress={() => handleEdit(tenant.domain, tenant.config)}
                          >
                            <IconEdit className="h-4 w-4" />
                          </Button>
                          <Button
                            isIconOnly
                            className="h-8 w-8 min-w-8 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                            size="sm"
                            variant="flat"
                            onPress={() => handleDelete(tenant.domain)}
                          >
                            <IconTrash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {filteredTenants.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-12">
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <IconEye className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-semibold">
                  {searchQuery ? "No tenants found matching your search" : "No tenants configured yet"}
                </p>
              </div>
            ) : (
              filteredTenants.map((tenant) => (
                <div
                  key={tenant.domain}
                  className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-xl border-2 border-slate-200 dark:border-slate-700 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  {/* Card Header */}
                  <div className="bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-950/30 dark:to-violet-950/30 p-4 border-b-2 border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg ring-2 ring-white dark:ring-slate-800 flex-shrink-0">
                        <IconEye className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-black text-slate-900 dark:text-slate-100 text-base font-mono truncate">
                          {tenant.domain}
                        </h3>
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                          Template
                        </div>
                        <div className="flex items-center gap-1">
                          <IconTemplate className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                          <Badge className="border-2 border-indigo-200 dark:border-indigo-800/50 text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 font-semibold px-2 py-0.5 text-xs" variant="outline">
                            {getTemplateLabel(tenant.config.templateId)}
                          </Badge>
                        </div>
                      </div>

                      <div>
                        <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                          Theme Mode
                        </div>
                        <Badge
                          className={
                            tenant.config.theme.mode === "dark"
                              ? "bg-slate-800 text-slate-100 font-semibold px-2 py-0.5 text-xs"
                              : "bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 text-xs"
                          }
                          variant={tenant.config.theme.mode === "dark" ? "default" : "secondary"}
                        >
                          {getThemeMode(tenant.config.theme.mode)}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                          Theme Color
                        </div>
                        <div className="flex items-center gap-2">
                          <div
                            className="h-6 w-6 rounded-lg border-2 border-slate-200 dark:border-slate-700 shadow-sm ring-2 ring-white dark:ring-slate-800"
                            style={{ backgroundColor: tenant.config.themeColor }}
                          />
                          <span className="font-mono text-xs text-slate-600 dark:text-slate-400 font-semibold">
                            {tenant.config.themeColor}
                          </span>
                        </div>
                      </div>

                      <div>
                        <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                          Sections
                        </div>
                        <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold px-2 py-0.5 ring-1 ring-slate-200 dark:ring-slate-700 text-xs">
                          {tenant.config.homepage.sections.filter((s) => s.enabled).length} enabled
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3 border-t border-slate-200 dark:border-slate-700 flex gap-2">
                    <Button
                      className="flex-1 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300 gap-2"
                      size="sm"
                      onPress={() => handleEdit(tenant.domain, tenant.config)}
                    >
                      <IconEdit className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      isIconOnly
                      className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300"
                      size="sm"
                      onPress={() => handleDelete(tenant.domain)}
                    >
                      <IconTrash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <AddTenantModal isOpen={addModal.isOpen} onClose={addModal.onClose} />

      {selectedTenant && (
        <EditTenantModal
          config={selectedTenant.config}
          domain={selectedTenant.domain}
          isOpen={editModal.isOpen}
          onClose={() => {
            editModal.onClose();
            setSelectedTenant(null);
          }}
        />
      )}
    </>
  );
}
