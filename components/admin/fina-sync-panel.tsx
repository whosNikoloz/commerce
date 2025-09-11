"use client";

import type { FinaSyncStatus } from "@/types/fina";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Play, RefreshCw, ListChecks, Terminal } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getFinaSyncStatus,
  syncAll,
  fullSync,
  finaAuthenticate,
} from "@/app/api/services/syncService";

type LogLevel = "info" | "success" | "error";
type LogItem = {
  id: string;
  t: string; // ISO time
  level: LogLevel;
  msg: string;
};

const levelColor: Record<LogLevel, string> = {
  info: "text-slate-600 dark:text-slate-300",
  success: "text-emerald-600 dark:text-emerald-400",
  error: "text-red-600 dark:text-red-400",
};

export default function FinaSyncPanel() {
  const [status, setStatus] = useState<FinaSyncStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const [logs, setLogs] = useState<LogItem[]>([]);
  const logEndRef = useRef<HTMLDivElement | null>(null);

  const addLog = useCallback((msg: string, level: LogLevel = "info") => {
    setLogs((prev) => [
      ...prev,
      { id: crypto.randomUUID(), t: new Date().toISOString(), level, msg },
    ]);
  }, []);

  const scrollToBottom = useCallback(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [logs, scrollToBottom]);

  // useEffect(() => {
  //   let cancelled = false;
  //   let timer: any;

  //   const tick = async () => {
  //     try {
  //       const s = await getFinaSyncStatus();

  //       if (!cancelled) setStatus(s);
  //     } catch (e) {
  //       // Swallow errors silently (server might 401/stop)
  //     }
  //   };

  //   tick();
  //   timer = setInterval(tick, 1500);

  //   return () => {
  //     cancelled = true;
  //     clearInterval(timer);
  //   };
  // }, []);

  const onSyncAll = async () => {
    try {
      setBusy(true);
      addLog("Sync-All started…", "info");
      await syncAll();
      addLog("Sync-All finished.", "success");
      toast.success("Sync-All finished");
    } catch (e: any) {
      console.error(e);
      addLog(`Sync-All failed: ${e?.message ?? "Unknown error"}`, "error");
      toast.error("Sync-All failed");
    } finally {
      setBusy(false);
    }
  };

  const onAuthorization = async () => {
    try {
      setBusy(true);
      addLog("Authorization started…", "info");
      await finaAuthenticate();
      addLog("Authorization finished.", "success");
      toast.success("Authorization finished");
    } catch (e: any) {
      console.error(e);
      addLog(`Authorization failed: ${e?.message ?? "Unknown error"}`, "error");
      toast.error("Authorization failed");
    } finally {
      setBusy(false);
    }
  };

  const onFullSync = async () => {
    try {
      setBusy(true);
      addLog("Full Sync started…", "info");
      await fullSync();
      addLog("Full Sync finished.", "success");
      toast.success("Full Sync finished");
    } catch (e: any) {
      console.error(e);
      addLog(`Full Sync failed: ${e?.message ?? "Unknown error"}`, "error");
      toast.error("Full Sync failed");
    } finally {
      setBusy(false);
    }
  };

  const progressLabel = useMemo(() => {
    if (!status) return "—";
    const p = typeof status.progress === "number" ? `${status.progress}%` : "—";
    const stage = status.stage ? ` • ${status.stage}` : "";

    return `${p}${stage}`;
  }, [status]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
      {/* Left: Controls + Status (spans 2) */}
      <div className="xl:col-span-2 space-y-6">
        <Card className="dark:bg-brand-muteddark bg-brand-muted backdrop-blur">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ListChecks className="h-5 w-5" />
              <div className="text-lg font-semibold">Controls</div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Button className="gap-2" disabled={busy} variant="secondary" onClick={onSyncAll}>
                <RefreshCw className="h-4 w-4" />
                Sync All
              </Button>
              <Button className="gap-2" disabled={busy} onClick={onAuthorization}>
                <Play className="h-4 w-4" />
                Authorization
              </Button>
              {/* <Button className="gap-2" disabled={busy} onClick={onFullSync}>
                <Play className="h-4 w-4" />
                Full Sync
              </Button> */}
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-brand-muteddark bg-brand-muted backdrop-blur">
          <CardHeader>
            <div className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              <div className="text-lg font-semibold">Live Status</div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm text-muted-foreground">
              {status?.running ? "Running" : "Idle"}
            </div>
            <div className="text-base font-medium">{progressLabel}</div>
            <div className="text-xs text-muted-foreground">{status?.message ?? ""}</div>
            <div className="text-xs text-muted-foreground">Started: {status?.startedAt ?? "—"}</div>
            <div className="text-xs text-muted-foreground">
              Finished: {status?.finishedAt ?? "—"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right: Logger (spans 3) */}
      <div className="xl:col-span-3">
        <Card className="dark:bg-brand-muteddark bg-brand-muted backdrop-blur">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="h-5 w-5" />
                <div className="text-lg font-semibold">Activity Log</div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => setLogs([])}>
                  Clear
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    const blob = new Blob(
                      [logs.map((l) => `[${l.t}] ${l.level.toUpperCase()} - ${l.msg}`).join("\n")],
                      { type: "text/plain;charset=utf-8" },
                    );
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");

                    a.href = url;
                    a.download = `fina-sync-log-${new Date().toISOString()}.txt`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  Download
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="overflow-auto max-h-[calc(100lvh-210px)]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[220px]">Time</TableHead>
                  <TableHead>Message</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="align-top text-xs text-muted-foreground">
                      {new Date(l.t).toLocaleString()}
                    </TableCell>
                    <TableCell className={`align-top text-sm ${levelColor[l.level]}`}>
                      {l.msg}
                    </TableCell>
                  </TableRow>
                ))}
                {logs.length === 0 && (
                  <TableRow>
                    <TableCell className="text-center py-8 text-slate-500" colSpan={2}>
                      No activity yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <div ref={logEndRef} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
