"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { TriangleAlert, GripVertical, Plus, RefreshCw, Eye, EyeOff, Star, Trash2 } from "lucide-react";
import { DndContext, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { Input } from "@heroui/input";

import AddFaqModal from "./add-faq-modal";
import UpdateFaqModal from "./update-faq-modal";

import { FAQModel } from "@/types/faq";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getAllFaqs, createFaq, updateFaq, deleteFaq } from "@/app/api/services/faqService";
import { Switch } from "@/components/ui/switch";

import { useDictionary } from "@/app/context/dictionary-provider";


function RowDraggable({
  faq,
  children,
  isDragging,
}: {
  faq: FAQModel;
  children: React.ReactNode;
  isDragging: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: dragging,
  } = useSortable({ id: faq.id });
  const style = { transform: CSS.Transform.toString(transform), transition } as React.CSSProperties;

  return (
    <TableRow
      ref={setNodeRef}
      className={[
        "hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-blue-50/50 dark:hover:from-blue-950/20 dark:hover:to-blue-950/20 transition-all duration-300 border-b border-slate-200/50 dark:border-slate-700/50",
        dragging || isDragging ? "opacity-70 ring-2 ring-amber-400/50 dark:ring-amber-600/50 shadow-lg" : "",
      ].join(" ")}
      style={style}
    >
      <TableCell className="w-10 align-middle">
        <button className="font-primary cursor-grab active:cursor-grabbing p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors duration-200 ring-1 ring-slate-200 dark:ring-slate-700"
          {...attributes}
          {...listeners}
          aria-label="Drag handle"
        >
          <GripVertical className="h-4 w-4 text-slate-400" />
        </button>
      </TableCell>
      {children}
    </TableRow>
  );
}

export function FaqsTable({ initialFaqs }: { initialFaqs: FAQModel[] }) {
  const dict = useDictionary();
  const t = dict?.admin?.faqs?.table;

  if (!t) {
    console.warn("FAQ dictionary keys missing", dict?.admin);
    return <div>Loading translations...</div>;
  }
  const [faqs, setFaqs] = useState<FAQModel[]>([]);
  const [loading, setLoading] = useState(!(initialFaqs && initialFaqs.length > 0));
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [onlyActive, setOnlyActive] = useState(false);
  const [onlyFeatured, setOnlyFeatured] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<FAQModel | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [orderDirty, setOrderDirty] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const lastSavedOrderRef = useRef<Record<string, number>>({});

  useEffect(() => {
    const sorted = sortByOrder(initialFaqs || []);

    setFaqs(sorted);
    const map: Record<string, number> = {};

    sorted.forEach((f, idx) => (map[f.id] = f.orderNum ?? idx + 1));
    lastSavedOrderRef.current = map;
  }, [initialFaqs]);

  useEffect(() => {
    if (initialFaqs?.length) return;
    let isCancelled = false;

    (async () => {
      setLoading(true);
      try {
        const list = await getAllFaqs();

        if (isCancelled) return;
        const sorted = sortByOrder(list || []);

        setFaqs(sorted);
        const map: Record<string, number> = {};

        sorted.forEach((f, idx) => (map[f.id] = f.orderNum ?? idx + 1));
        lastSavedOrderRef.current = map;
        setError(null);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
        if (!isCancelled) setError(t.toasts.updateError);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [initialFaqs]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function onDragEnd(e: DragEndEvent) {
    setDraggingId(null);
    const { active, over } = e;

    if (!over || active.id === over.id) return;

    const oldIndex = faqs.findIndex((f) => f.id === active.id);
    const newIndex = faqs.findIndex((f) => f.id === over.id);

    if (oldIndex < 0 || newIndex < 0) return;

    const next = arrayMove(faqs, oldIndex, newIndex).map((f, idx) => ({ ...f, orderNum: idx + 1 }));

    setFaqs(next);
    setOrderDirty(true);
  }

  async function saveOrder() {
    try {
      const changed = faqs.filter((f, idx) => {
        const currentOrder = f.orderNum ?? idx + 1;
        const lastSaved = lastSavedOrderRef.current[f.id];

        return currentOrder !== lastSaved;
      });

      if (changed.length === 0) {
        setOrderDirty(false);
        toast.message(t.noChanges);

        return;
      }

      await Promise.all(
        changed.map((f) =>
          updateFaq({ ...f, orderNum: f.orderNum ?? faqs.findIndex((x) => x.id === f.id) + 1 }),
        ),
      );

      const newMap: Record<string, number> = {};

      faqs.forEach((f, idx) => (newMap[f.id] = f.orderNum ?? idx + 1));
      lastSavedOrderRef.current = newMap;

      setOrderDirty(false);
      toast.success(t.orderSaved);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      setOrderDirty(true);
      toast.error(t.orderSaveFailed);
    }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();

    return faqs
      .filter((f) =>
        q
          ? (f.question ?? "").toLowerCase().includes(q) ||
          (f.answer ?? "").toLowerCase().includes(q)
          : true,
      )
      .filter((f) => (onlyActive ? !!f.isActive : true))
      .filter((f) => (onlyFeatured ? !!f.isFeatured : true));
  }, [faqs, search, onlyActive, onlyFeatured]);

  const handleCreate = async (q: string, a: string, isActive: boolean, isFeatured: boolean) => {
    const tempId = `temp-${Date.now()}`;
    const prev = faqs;

    const newItem: FAQModel = {
      id: tempId,
      question: q,
      answer: a,
      isActive,
      isFeatured,
      orderNum: (faqs?.length ?? 0) + 1,
    };

    setFaqs([newItem, ...faqs]);

    try {
      const id = await createFaq(q, a, isActive, isFeatured);

      setFaqs((list) => list.map((x) => (x.id === tempId ? { ...x, id } : x)));
      toast.success(t.toasts.createSuccess);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      setFaqs(prev);
      toast.error(t.toasts.createError);
    }
  };

  const handleUpdate = async (
    id: string,
    q: string,
    a: string,
    isActive: boolean,
    isFeatured: boolean,
  ) => {
    const current = faqs.find((f) => f.id === id);

    if (!current) return;

    const prev = faqs;
    const patched: FAQModel = { ...current, question: q, answer: a, isActive, isFeatured };

    setFaqs((list) => list.map((f) => (f.id === id ? patched : f)));

    try {
      await updateFaq(patched);
      toast.success(t.toasts.updateSuccess);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      setFaqs(prev);
      toast.error(t.toasts.updateError);
    }
  };

  const handleToggle = async (id: string, field: "isActive" | "isFeatured", val: boolean) => {
    const current = faqs.find((f) => f.id === id);

    if (!current) return;

    const prev = faqs;
    const patched: FAQModel = { ...current, [field]: val };

    setFaqs((list) => list.map((f) => (f.id === id ? patched : f)));

    try {
      await updateFaq(patched);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      setFaqs(prev);
      toast.error(t.toasts.toggleError);
    }
  };

  const handleDelete = async (id: string) => {
    const prev = faqs;

    setDeleting(true);
    setFaqs((list) => list.filter((f) => f.id !== id));
    try {
      await deleteFaq(id);
      toast.success(t.toasts.deleteSuccess);
      setFaqs((list) => list.map((f, idx) => ({ ...f, orderNum: idx + 1 })));
      setOrderDirty(true);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      setFaqs(prev);
      toast.error(t.toasts.deleteError);
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
      setDeleteTarget(null);
    }
  };

  function sortByOrder(list: FAQModel[]) {
    return [...list].sort(
      (a, b) => (a.orderNum ?? Number.MAX_SAFE_INTEGER) - (b.orderNum ?? Number.MAX_SAFE_INTEGER),
    );
  }

  return (
    <>
      <Card className="bg-white/70 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800/60 backdrop-blur-xl shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-blue-500/5 pointer-events-none rounded-lg" />
        <CardHeader className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-700/60 relative">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex flex-1 items-center gap-3">
              <Input
                aria-label="Search"
                className="flex-1"
                classNames={{
                  label: "text-slate-700 dark:text-slate-300 font-semibold",
                  inputWrapper:
                    "bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-600 data-[focus=true]:border-blue-500 shadow-sm hover:shadow-md transition-all duration-300",
                  input:
                    "text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium",
                }}
                placeholder={t.searchPlaceholder}
                size="lg"
                startContent={
                  <svg className="text-slate-400" height="16" viewBox="0 0 24 24" width="16">
                    <path
                      d="m21 20l-4.35-4.35A7.5 7.5 0 1 0 9 16.5a7.47 7.47 0 0 0 4.65-1.6L18 19l3 1zM4.5 9A4.5 4.5 0 1 1 9 13.5A4.5 4.5 0 0 1 4.5 9"
                      fill="currentColor"
                    />
                  </svg>
                }
                onChange={(e) => setSearch(e.target.value)}
              />

              <div className="hidden md:flex items-center gap-5">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={onlyActive}
                    className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-emerald-500 data-[state=checked]:to-emerald-600"
                    onCheckedChange={setOnlyActive}
                  />
                  {onlyActive ? (
                    <Eye className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-slate-400" />
                  )}

                  <Switch
                    checked={onlyFeatured}
                    className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-500 data-[state=checked]:to-blue-600"
                    onCheckedChange={setOnlyFeatured}
                  />
                  <Star
                    className={`h-3.5 w-3.5 ${onlyFeatured ? "fill-blue-500 text-blue-500 dark:fill-blue-400 dark:text-blue-400" : "text-slate-400"
                      }`}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                className="gap-2 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:border-blue-300 dark:hover:border-blue-600 font-semibold shadow-sm hover:shadow-md transition-all duration-300 disabled:opacity-50"
                disabled={!orderDirty}
                title={orderDirty ? t.saveOrder : t.noChanges}
                variant="secondary"
                onClick={saveOrder}
              >
                <RefreshCw className="h-4 w-4" />
                {t.saveOrder}
              </Button>

              <AddFaqModal onCreate={handleCreate}>
                <Plus className="h-4 w-4" />
                {t.addFaq}
              </AddFaqModal>
            </div>
          </div>

          {/* mobile filters */}
          <div className="mt-3 flex md:hidden items-center justify-between">
            <Switch
              checked={onlyActive}
              className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-emerald-500 data-[state=checked]:to-emerald-600"
              onCheckedChange={setOnlyActive}
            />
            {onlyActive ? (
              <Eye className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <EyeOff className="h-4 w-4 text-slate-400" />
            )}
            <Switch
              checked={onlyFeatured}
              className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-500 data-[state=checked]:to-blue-600"
              onCheckedChange={setOnlyFeatured}
            />
            <Star
              className={`h-3.5 w-3.5 ${onlyFeatured ? "fill-blue-500 text-blue-500 dark:fill-blue-400 dark:text-blue-400" : "text-slate-400"}`}
            />
          </div>
        </CardHeader>

        <CardContent className="overflow-auto max-h-[calc(100lvh-210px)]">
          {loading && <p className="font-primary p-4 text-text-subtle">{t.loading}</p>}
          {error && <p className="font-primary p-4 text-red-500">{error}</p>}

          {!loading && !error && (
            <>
              {/* Desktop Table View with Drag and Drop */}
              <div className="hidden md:block">
                <DndContext
                  sensors={sensors}
                  onDragEnd={onDragEnd}
                  onDragStart={(e) => setDraggingId(String(e.active.id))}
                >
                  <SortableContext
                    items={filtered.map((f) => f.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <Table>
                      <TableHeader className="bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800/80 dark:to-slate-800/50 sticky top-0 z-10 backdrop-blur-sm">
                        <TableRow className="border-b-2 border-slate-200 dark:border-slate-700">
                          <TableHead className="w-10" />
                          <TableHead className="text-slate-700 dark:text-slate-300 font-bold text-sm uppercase tracking-wide">
                            {t.headers.question}
                          </TableHead>
                          <TableHead className="text-slate-700 dark:text-slate-300 font-bold text-sm uppercase tracking-wide">
                            {t.headers.answer}
                          </TableHead>
                          <TableHead className="min-w-[220px] text-slate-700 dark:text-slate-300 font-bold text-sm uppercase tracking-wide">
                            {t.headers.status}
                          </TableHead>
                          <TableHead className="text-right min-w-[180px] text-slate-700 dark:text-slate-300 font-bold text-sm uppercase tracking-wide">
                            {t.headers.actions}
                          </TableHead>
                        </TableRow>
                      </TableHeader>

                      <TableBody>
                        {filtered.map((faq, idx) => (
                          <RowDraggable key={faq.id} faq={faq} isDragging={draggingId === faq.id}>
                            <TableCell className="align-top font-bold text-slate-900 dark:text-slate-100 max-w-[420px]">
                              <div className="line-clamp-2">{faq.question}</div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded inline-block mt-1">
                                #{(faq.orderNum ?? idx + 1).toString().padStart(2, "0")} • ID: {faq.id}
                              </div>
                            </TableCell>

                            <TableCell className="align-top max-w-[560px]">
                              <div className="line-clamp-2 text-slate-600 dark:text-slate-400 font-medium">
                                {faq.answer}
                              </div>
                            </TableCell>

                            <TableCell className="align-top">
                              <div className="flex items-center gap-4">
                                <Switch
                                  checked={!!faq.isActive}
                                  className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-emerald-500 data-[state=checked]:to-emerald-600"
                                  onCheckedChange={(v) => handleToggle(faq.id, "isActive", v)}
                                />
                                {!!faq.isActive ? (
                                  <Eye className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                ) : (
                                  <EyeOff className="h-4 w-4 text-slate-400" />
                                )}
                                <Switch
                                  checked={!!faq.isFeatured}
                                  className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-500 data-[state=checked]:to-blue-600"
                                  onCheckedChange={(v) => handleToggle(faq.id, "isFeatured", v)}
                                />
                                <Star
                                  className={`h-3.5 w-3.5 ${!!faq.isFeatured ? "fill-blue-500 text-blue-500 dark:fill-blue-400 dark:text-blue-400" : "text-slate-400"}`}
                                />
                              </div>
                            </TableCell>

                            <TableCell className="align-top text-right">
                              <div className="flex justify-end gap-2">
                                <UpdateFaqModal
                                  faqId={faq.id}
                                  initialActive={faq.isActive}
                                  initialAnswer={faq.answer}
                                  initialFeatured={faq.isFeatured}
                                  initialQuestion={faq.question}
                                  onSave={handleUpdate}
                                />
                                <Button
                                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300"
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => {
                                    setDeleteTarget(faq);
                                    setDeleteOpen(true);
                                  }}
                                >
                                  Delete
                                </Button>
                              </div>
                            </TableCell>
                          </RowDraggable>
                        ))}

                        {filtered.length === 0 && (
                          <TableRow>
                            <TableCell className="text-center py-8 text-text-subtle" colSpan={5}>
                              ჩანაწერები ვერ მოიძებნა.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </SortableContext>
                </DndContext>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {filtered.map((faq, idx) => (
                  <div
                    key={faq.id}
                    className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-xl border-2 border-slate-200 dark:border-slate-700 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
                  >
                    {/* Card Header */}
                    <div className="bg-gradient-to-r from-blue-50 to-blue-50 dark:from-blue-950/30 dark:to-blue-950/30 p-4 border-b-2 border-slate-200 dark:border-slate-700">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg ring-2 ring-white dark:ring-slate-800 flex-shrink-0">
                          <span className="font-primary text-white font-bold text-sm">#{(faq.orderNum ?? idx + 1).toString().padStart(2, "0")}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-heading font-black text-slate-900 dark:text-slate-100 text-base leading-tight">{faq.question}</h3>
                          <p className="font-primary text-xs text-slate-500 dark:text-slate-400 font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded inline-block mt-1">
                            ID: {faq.id}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 space-y-3">
                      <div>
                        <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">{t.headers.answer}</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3">{faq.answer}</div>
                      </div>

                      <div className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={!!faq.isActive}
                            className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-emerald-500 data-[state=checked]:to-emerald-600"
                            onCheckedChange={(v) => handleToggle(faq.id, "isActive", v)}
                          />
                          {!!faq.isActive ? (
                            <Eye className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <EyeOff className="h-4 w-4 text-slate-400" />
                          )}
                          <span className="font-primary text-xs font-semibold text-slate-700 dark:text-slate-300">Active</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Switch
                            checked={!!faq.isFeatured}
                            className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-500 data-[state=checked]:to-blue-600"
                            onCheckedChange={(v) => handleToggle(faq.id, "isFeatured", v)}
                          />
                          <Star
                            className={`h-3.5 w-3.5 ${!!faq.isFeatured ? "fill-blue-500 text-blue-500 dark:fill-blue-400 dark:text-blue-400" : "text-slate-400"}`}
                          />
                          <span className="font-primary text-xs font-semibold text-slate-700 dark:text-slate-300">{t.featured}</span>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3 border-t border-slate-200 dark:border-slate-700 flex gap-2">
                      <UpdateFaqModal
                        faqId={faq.id}
                        initialActive={faq.isActive}
                        initialAnswer={faq.answer}
                        initialFeatured={faq.isFeatured}
                        initialQuestion={faq.question}
                        onSave={handleUpdate}
                      />
                      <Button
                        className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300 gap-2"
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setDeleteTarget(faq);
                          setDeleteOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                        {t.delete}
                      </Button>
                    </div>
                  </div>
                ))}

                {filtered.length === 0 && (
                  <div className="flex flex-col items-center gap-3 py-12">
                    <p className="font-primary text-slate-500 dark:text-slate-400 font-semibold">{t.empty}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="bg-brand-surface dark:bg-brand-surfacedark border border-brand-muted dark:border-brand-muteddark">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-text-light dark:text-text-lightdark">
              <TriangleAlert className="h-5 w-5 text-red-600" />
              {t.deleteConfirmTitle}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-text-subtle dark:text-text-subtledark">
              {deleteTarget ? (
                t.deleteConfirmDesc.replace("{question}", deleteTarget.question)
              ) : (
                t.deleteWarning
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="bg-brand-surface dark:bg-brand-surfacedark text-text-light dark:text-text-lightdark border border-brand-muted dark:border-brand-muteddark hover:bg-brand-surface/70 dark:hover:bg-brand-surfacedark/70"
              disabled={deleting}
              onClick={() => {
                setDeleteOpen(false);
                setDeleteTarget(null);
              }}
            >
              {t.cancel}
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={deleting}
              onClick={() => deleteTarget && handleDelete(deleteTarget.id)}
            >
              {deleting ? t.deleting : t.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
