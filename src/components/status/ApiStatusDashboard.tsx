"use client";

import { memo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Server,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";

type EndpointStatus = {
  path: string;
  method: string;
  description: string;
  status: number;
  ok: boolean;
  latency: number;
  error?: string;
};

type StatusResponse = {
  endpoints: EndpointStatus[];
  timestamp: string;
};

const ApiStatusSkeleton = () => (
  <div className="space-y-6">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-14 w-14 rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-9 w-24 rounded-md" />
      </div>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 9 }).map((_, i) => (
        <Card
          key={i}
          className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-500/30 backdrop-blur-md"
        >
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0 space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-full max-w-[200px]" />
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <Skeleton className="h-5 w-14 rounded-full" />
                <Skeleton className="h-4 w-12" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
    <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-500/30 backdrop-blur-md">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-white text-sm">
          <Server className="h-4 w-4 text-slate-400" />
          Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-28 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </CardContent>
    </Card>
  </div>
);

const ApiStatusDashboard = memo(() => {
  const [data, setData] = useState<StatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/status");
      const json = await res.json();
      setData(json);
    } catch {
      setData(null);
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const id = setInterval(() => {
      setIsFetching(true);
      fetchStatus();
    }, 30000);
    return () => clearInterval(id);
  }, []);

  const handleRefresh = () => {
    setIsFetching(true);
    fetchStatus();
  };

  if (isLoading) return <ApiStatusSkeleton />;

  const endpoints = data?.endpoints || [];
  const okCount = endpoints.filter((e) => e.ok).length;
  const failCount = endpoints.length - okCount;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header - icon + title inline, description below (home page style) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 bg-gradient-to-br from-emerald-500/10 to-slate-900/50 border-emerald-500/30 backdrop-blur-md rounded-xl p-4 sm:p-5">
        <div className="min-w-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-3 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-xl flex-shrink-0 flex items-center">
              <Zap className="h-6 w-6 sm:h-7 sm:w-7 text-emerald-400" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white break-words">
              API Status
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 mt-2">
            Real-time endpoint health and latency
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge
            variant="outline"
            className="bg-green-500/10 border-green-500/30 text-green-300"
          >
            <Activity className="h-3 w-3 mr-1 animate-pulse" />
            Live
          </Badge>
          <Badge
            variant="outline"
            className="bg-blue-500/10 border-blue-500/30 text-blue-300"
          >
            <Clock className="h-3 w-3 mr-1" />
            10s refresh
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isFetching}
            className="border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {endpoints.map((ep, i) => (
          <Card
            key={i}
            className={`bg-gradient-to-br backdrop-blur-md ${
              ep.ok
                ? "from-emerald-500/10 to-slate-900/50 border-emerald-500/30"
                : "from-red-500/10 to-slate-900/50 border-red-500/30"
            }`}
          >
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {ep.description}
                  </p>
                  <p className="text-xs text-gray-400 truncate mt-0.5">
                    {ep.method} {ep.path}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0 ml-2">
                  <Badge
                    variant="outline"
                    className={
                      ep.ok
                        ? "bg-green-500/20 text-green-300 border-green-500/30 text-xs"
                        : "bg-red-500/20 text-red-300 border-red-500/30 text-xs"
                    }
                  >
                    {ep.ok ? (
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                    ) : (
                      <XCircle className="h-3 w-3 mr-1" />
                    )}
                    {ep.status || "ERR"}
                  </Badge>
                  <span className="text-xs text-gray-400">{ep.latency}ms</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-500/30 backdrop-blur-md">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-white text-sm">
            <Server className="h-4 w-4 text-slate-400" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              className={
                failCount === 0
                  ? "bg-green-500/20 text-green-300 border-green-500/30"
                  : "bg-amber-500/20 text-amber-300 border-amber-500/30"
              }
            >
              <CheckCircle2 className="h-3 w-3 mr-1" />
              {okCount} operational
            </Badge>
            {failCount > 0 && (
              <Badge className="bg-red-500/20 text-red-300 border-red-500/30">
                <XCircle className="h-3 w-3 mr-1" />
                {failCount} down
              </Badge>
            )}
            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
              <Clock className="h-3 w-3 mr-1" />
              Updated:{" "}
              {data?.timestamp
                ? new Date(data.timestamp).toLocaleTimeString()
                : "—"}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});

ApiStatusDashboard.displayName = "ApiStatusDashboard";

export default ApiStatusDashboard;
