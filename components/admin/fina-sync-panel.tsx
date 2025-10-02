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
import { syncAll, fullSync, finaAuthenticate } from "@/app/api/services/syncService";

type LogLevel = "info" | "success" | "error";
type LogItem = {
  id: string;
  t: string; // ISO time
  level: LogLevel;
  msg: string;
};

const levelColor: Record<LogLevel, string> = {
  info: "text-blue-600 dark:text-blue-400",
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

  // Optional polling (left commented as in your original)
  // useEffect(() => {
  //   let cancelled = false;
  //   let timer: any;
  //   const tick = async () => {
  //     try {
  //       const s = await getFinaSyncStatus();
  //       if (!cancelled) setStatus(s);
  //     } catch {}
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
        <Card className="bg-white/70 dark:bg-slate-900/70 border-2 border-slate-200/60 dark:border-slate-800/60 backdrop-blur-xl shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-cyan-500/5 pointer-events-none" />
          <CardHeader className="relative">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-md">
                <ListChecks className="h-5 w-5 text-white" />
              </div>
              <div className="text-xl font-black text-slate-900 dark:text-slate-100">
                Controls
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 relative">
            <div className="grid grid-cols-2 gap-3">
              <Button
                className="gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold shadow-md hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                disabled={busy}
                onClick={onSyncAll}
              >
                <RefreshCw className={`h-4 w-4 ${busy ? 'animate-spin' : ''}`} />
                Sync All
              </Button>
              <Button
                className="gap-2 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-semibold shadow-md hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                disabled={busy}
                onClick={onAuthorization}
              >
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

        <Card className="bg-white/70 dark:bg-slate-900/70 border-2 border-slate-200/60 dark:border-slate-800/60 backdrop-blur-xl shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-blue-500/5 pointer-events-none" />
          <CardHeader className="relative">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-md">
                <RefreshCw className="h-5 w-5 text-white" />
              </div>
              <div className="text-xl font-black text-slate-900 dark:text-slate-100">
                Live Status
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 relative">
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Status</span>
              <span className={`text-sm font-bold ${status?.running ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>
                {status?.running ? "Running" : "Idle"}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Progress</span>
              <span className="text-base font-bold text-slate-900 dark:text-slate-100">
                {progressLabel}
              </span>
            </div>
            {status?.message && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <p className="text-xs font-medium text-blue-700 dark:text-blue-300">{status.message}</p>
              </div>
            )}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Started</span>
                <span className="text-xs text-slate-600 dark:text-slate-300">{status?.startedAt ?? "—"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Finished</span>
                <span className="text-xs text-slate-600 dark:text-slate-300">{status?.finishedAt ?? "—"}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right: Logger (spans 3) */}
      <div className="xl:col-span-3">
        <Card className="bg-white/70 dark:bg-slate-900/70 border-2 border-slate-200/60 dark:border-slate-800/60 backdrop-blur-xl shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-500/5 via-transparent to-blue-500/5 pointer-events-none" />
          <CardHeader className="relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl shadow-md">
                  <Terminal className="h-5 w-5 text-white" />
                </div>
                <div className="text-xl font-black text-slate-900 dark:text-slate-100">
                  Activity Log
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  className="border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 font-semibold shadow-sm hover:shadow-md transition-all duration-300"
                  size="sm"
                  onClick={() => setLogs([])}
                >
                  Clear
                </Button>
                <Button
                  className="bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white font-semibold shadow-sm hover:shadow-md transition-all duration-300"
                  size="sm"
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

          <CardContent className="overflow-auto max-h-[calc(100lvh-210px)] relative">
            <Table>
              <TableHeader className="bg-slate-100 dark:bg-slate-800/60 sticky top-0">
                <TableRow className="border-b-2 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800/60">
                  <TableHead className="w-[220px] text-slate-600 dark:text-slate-400 font-bold">Time</TableHead>
                  <TableHead className="text-slate-600 dark:text-slate-400 font-bold">Message</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((l) => (
                  <TableRow
                    key={l.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors duration-200 border-b border-slate-200/50 dark:border-slate-700/50"
                  >
                    <TableCell className="align-top text-xs font-medium text-slate-500 dark:text-slate-400">
                      {new Date(l.t).toLocaleString()}
                    </TableCell>
                    <TableCell className={`align-top text-sm font-medium ${levelColor[l.level]}`}>
                      {l.msg}
                    </TableCell>
                  </TableRow>
                ))}
                {logs.length === 0 && (
                  <TableRow>
                    <TableCell className="text-center py-12 text-slate-500 dark:text-slate-400 font-medium" colSpan={2}>
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
