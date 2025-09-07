"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { TriangleAlert, GripVertical, Plus, RefreshCw, Eye, EyeOff, Star } from "lucide-react";
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
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  } as React.CSSProperties;

  return (
    <TableRow
      ref={setNodeRef}
      className={[
        "hover:bg-slate-50 dark:hover:bg-slate-800",
        dragging || isDragging ? "opacity-70 ring-2 ring-blue-500/30" : "",
      ].join(" ")}
      style={style}
    >
      <TableCell className="w-10 align-middle">
        <button
          className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
          {...attributes}
          {...listeners}
          aria-label="Drag handle"
        >
          <GripVertical className="h-4 w-4 opacity-70" />
        </button>
      </TableCell>
      {children}
    </TableRow>
  );
}

export function FaqsTable({ initialFaqs }: { initialFaqs: FAQModel[] }) {
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

    console.log("Sorted", sorted);
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
        console.error(e);
        if (!isCancelled) setError("ჩატვირთვა ვერ მოხერხდა.");
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
        toast.message("ცვლილება არ არის შესანახი.");

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
      toast.success("რიგი შენახულია.");
    } catch (e) {
      console.error(e);
      setOrderDirty(true);
      toast.error("რიგის შენახვა ვერ მოხერხდა.");
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
      const id = await createFaq(q, a, isActive, isFeatured); // service returns string id

      setFaqs((list) => list.map((x) => (x.id === tempId ? { ...x, id } : x)));
      toast.success("FAQ დაემატა.");
    } catch (e) {
      console.error(e);
      setFaqs(prev);
      toast.error("დამატება ვერ მოხერხდა.");
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
      toast.success("განახლდა.");
    } catch (e) {
      console.error(e);
      setFaqs(prev);
      toast.error("განახლება ვერ მოხერხდა.");
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
      console.error(e);
      setFaqs(prev);
      toast.error("ვერ შეიცვალა.");
    }
  };

  const handleDelete = async (id: string) => {
    const prev = faqs;

    setDeleting(true);
    setFaqs((list) => list.filter((f) => f.id !== id));
    try {
      await deleteFaq(id);
      toast.success("წაიშალა.");
      setFaqs((list) => list.map((f, idx) => ({ ...f, orderNum: idx + 1 })));
      setOrderDirty(true);
    } catch (e) {
      console.error(e);
      setFaqs(prev);
      toast.error("წაშლა ვერ მოხერხდა.");
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
      <Card className="dark:bg-brand-muteddark bg-brand-muted backdrop-blur">
        <CardHeader className="sticky top-0 z-10 bg-brand-muted/70 dark:bg-brand-muteddark/70 backdrop-blur border-b">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex flex-1 items-center gap-3">
              <Input
                aria-label="Search"
                className="flex-1"
                placeholder="ძებნა კითხვით ან პასუხით…"
                size="lg"
                startContent={
                  <svg height="16" viewBox="0 0 24 24" width="16">
                    <path
                      d="m21 20l-4.35-4.35A7.5 7.5 0 1 0 9 16.5a7.47 7.47 0 0 0 4.65-1.6L18 19l3 1zM4.5 9A4.5 4.5 0 1 1 9 13.5A4.5 4.5 0 0 1 4.5 9"
                      fill="currentColor"
                    />
                  </svg>
                }
                value={search}
                variant="bordered"
                onChange={(e) => setSearch(e.target.value)}
              />
              <div className="hidden md:flex items-center gap-5">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={onlyActive}
                    className="data-[state=checked]:bg-blue-600"
                    onCheckedChange={setOnlyActive}
                  />
                  {onlyActive ? (
                    <Eye className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-slate-400" />
                  )}

                  <Switch
                    checked={onlyFeatured}
                    className="data-[state=checked]:bg-blue-600"
                    onCheckedChange={setOnlyFeatured}
                  />
                  <Star
                    className={`h-3.5 w-3.5 ${onlyFeatured ? "fill-white text-white" : "text-slate-400"}`}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                className="gap-2"
                disabled={!orderDirty}
                title={orderDirty ? "შეინახე ახალი რიგი" : "ცვლილება არაა"}
                variant="secondary"
                onClick={saveOrder}
              >
                <RefreshCw className="h-4 w-4" />
                რიგის შენახვა
              </Button>
              <AddFaqModal onCreate={handleCreate}>
                <Plus className="h-4 w-4" />
                დაამატე FAQ
              </AddFaqModal>
            </div>
          </div>

          {/* mobile filters */}
          <div className="mt-3 flex md:hidden items-center justify-between">
            <Switch
              checked={onlyActive}
              className="data-[state=checked]:bg-blue-600"
              onCheckedChange={setOnlyActive}
            />
            {onlyActive ? (
              <Eye className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <EyeOff className="h-4 w-4 text-slate-400" />
            )}
            <Switch
              checked={onlyFeatured}
              className="data-[state=checked]:bg-blue-600"
              onCheckedChange={setOnlyFeatured}
            />
            <Star
              className={`h-3.5 w-3.5 ${onlyFeatured ? "fill-white text-white" : "text-slate-400"}`}
            />
          </div>
        </CardHeader>

        <CardContent className="overflow-auto max-h-[calc(100lvh-210px)]">
          {loading && <p className="p-4 text-gray-500">იტვირთება…</p>}
          {error && <p className="p-4 text-red-500">{error}</p>}

          {!loading && !error && (
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
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10" />
                      <TableHead>კითხვა</TableHead>
                      <TableHead>პასუხი</TableHead>
                      <TableHead className="min-w-[220px]">სტატუსი</TableHead>
                      <TableHead className="text-right min-w-[180px]">ქმედებები</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {filtered.map((faq, idx) => (
                      <RowDraggable key={faq.id} faq={faq} isDragging={draggingId === faq.id}>
                        <TableCell className="align-top font-medium text-slate-900 dark:text-slate-100 max-w-[420px]">
                          <div className="line-clamp-2">{faq.question}</div>
                          <div className="text-xs text-slate-500">
                            #{(faq.orderNum ?? idx + 1).toString().padStart(2, "0")} • ID: {faq.id}
                          </div>
                        </TableCell>

                        <TableCell className="align-top max-w-[560px]">
                          <div className="line-clamp-2 text-slate-700 dark:text-slate-300">
                            {faq.answer}
                          </div>
                        </TableCell>

                        <TableCell className="align-top">
                          <div className="flex items-center gap-4">
                            <Switch
                              checked={!!faq.isActive}
                              className="data-[state=checked]:bg-blue-600"
                              onCheckedChange={(v) => handleToggle(faq.id, "isActive", v)}
                            />
                            {!!faq.isActive ? (
                              <Eye className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <EyeOff className="h-4 w-4 text-slate-400" />
                            )}
                            <Switch
                              checked={!!faq.isFeatured}
                              className="data-[state=checked]:bg-blue-600"
                              onCheckedChange={(v) => handleToggle(faq.id, "isFeatured", v)}
                            />
                            <Star
                              className={`h-3.5 w-3.5 ${!!faq.isFeatured ? "fill-white text-white" : "text-slate-400"}`}
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
                        <TableCell className="text-center py-8 text-slate-500" colSpan={5}>
                          ჩანაწერები ვერ მოიძებნა.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </SortableContext>
            </DndContext>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <TriangleAlert className="h-5 w-5 text-red-600" />
              წაშლა?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget ? (
                <>
                  წაიშლება: <span className="font-semibold">{deleteTarget.question}</span>. ქმედება
                  შეუქცევადია.
                </>
              ) : (
                "ქმედება შეუქცევადია."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={deleting}
              onClick={() => {
                setDeleteOpen(false);
                setDeleteTarget(null);
              }}
            >
              გაუქმება
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              disabled={deleting}
              onClick={() => deleteTarget && handleDelete(deleteTarget.id)}
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
