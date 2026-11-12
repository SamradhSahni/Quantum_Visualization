"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/apiClient";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatDisplayCopy } from "@/lib/copyFormatter";
import { ShieldAlert, ShieldCheck, Users, Activity, RefreshCw, Lock } from "lucide-react";

interface AdminOverview {
  environment: string;
  cookie_secure: boolean;
  metrics: {
    total_users: number;
    active_admins: number;
    active_refresh_sessions: number;
    total_artifacts: number;
    total_audit_events: number;
  };
}

interface AdminUserRow {
  id: string;
  email: string;
  name: string;
  role: "viewer" | "researcher" | "admin";
  is_active: boolean;
  token_version: number;
  failed_login_attempts: number;
  created_at: string | null;
}

interface AuditLogRow {
  id: number;
  actor_user_id: string | null;
  event_type: string;
  ip_address: string;
  request_id: string;
  target_resource: string;
  outcome: string;
  detail: string;
  created_at: string | null;
}

export default function AdminPage() {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [logs, setLogs] = useState<AuditLogRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadConsole = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const [ovRes, usrRes, logRes] = await Promise.all([
        apiFetch("/api/admin/overview"),
        apiFetch("/api/admin/users?limit=100"),
        apiFetch("/api/admin/audit-logs?limit=50"),
      ]);
      if (!ovRes.ok) {
        const d = await ovRes.json().catch(() => ({}));
        setErrorMsg(d.detail || "Administrator privileges are required to view this console.");
        setLoading(false);
        return;
      }
      const ovData = await ovRes.json();
      const usrData = usrRes.ok ? await usrRes.json() : { users: [] };
      const logData = logRes.ok ? await logRes.json() : { logs: [] };
      setOverview(ovData);
      setUsers(usrData.users || []);
      setLogs(logData.logs || []);
    } catch {
      setErrorMsg("Unable to reach Admin Security API.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && isAdmin) {
      loadConsole();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [authLoading, isAdmin, loadConsole]);

  const handleUpdateUser = async (
    targetId: string,
    patch: { role?: string; is_active?: boolean; reset_lockout?: boolean }
  ) => {
    setErrorMsg(null);
    const res = await apiFetch(`/api/admin/users/${targetId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setErrorMsg(d.detail || "Failed updating account.");
      return;
    }
    await loadConsole();
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#000000] text-white pt-28 px-6 max-w-6xl mx-auto">
        <Card surface="card" outerRadius={16} className="p-8 border border-[#313131] text-center text-sm text-[#9B9B9B]">
          {formatDisplayCopy("Verifying Administrator Security Clearance...")}
        </Card>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-[#000000] text-white pt-28 px-6 max-w-xl mx-auto">
        <Card surface="card" outerRadius={16} className="p-8 border border-[#EF4444] text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#181818] border border-[#313131] flex items-center justify-center mx-auto">
            <Lock className="w-5 h-5 text-[#EF4444]" />
          </div>
          <h1 className="text-xl font-semibold text-white">
            {formatDisplayCopy("Access Restricted (403 Forbidden)")}
          </h1>
          <p className="text-xs text-[#9B9B9B] leading-relaxed">
            {formatDisplayCopy("This administrative console is strictly gated by server verified Administrator RBAC permissions.")}
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000000] text-white pt-24 pb-20 px-6 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-[#313131]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#181818] border border-[#313131] mb-2">
            <ShieldCheck size={14} className="text-[#00F0FF]" />
            <span className="text-xs font-mono text-[#E1E1E1]">
              {formatDisplayCopy("Tier 3 Security Operations Console")}
            </span>
          </div>
          <h1 className="text-2xl font-semibold text-white">
            {formatDisplayCopy("Platform RBAC & Security Audit Console")}
          </h1>
        </div>

        <Button variant="secondary" size="sm" onClick={loadConsole} icon={<RefreshCw size={14} />}>
          {formatDisplayCopy("Refresh Telemetry")}
        </Button>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-lg bg-[#1F1F1F] border border-[#EF4444] text-xs text-[#FCA5A5] flex items-center gap-2">
          <ShieldAlert size={15} className="text-[#EF4444]" />
          <span>{formatDisplayCopy(errorMsg)}</span>
        </div>
      )}

      {overview && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: "Total Users", value: overview.metrics.total_users },
            { label: "Active Admins", value: overview.metrics.active_admins },
            { label: "Active Sessions", value: overview.metrics.active_refresh_sessions },
            { label: "Saved Artifacts", value: overview.metrics.total_artifacts },
            { label: "Audit Events", value: overview.metrics.total_audit_events },
          ].map((stat) => (
            <Card key={stat.label} surface="card" outerRadius={14} className="p-4 border border-[#313131]">
              <div className="text-[11px] font-mono uppercase text-[#9B9B9B]">{formatDisplayCopy(stat.label)}</div>
              <div className="text-2xl font-mono font-semibold text-white mt-1">{stat.value}</div>
            </Card>
          ))}
        </div>
      )}

      {/* User Directory & RBAC Controls */}
      <Card surface="card" outerRadius={16} className="p-5 border border-[#313131] space-y-4">
        <div className="flex items-center gap-2">
          <Users size={16} className="text-[#00F0FF]" />
          <h2 className="text-sm font-semibold text-white">{formatDisplayCopy("Account Directory & Role Controls")}</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[#313131] text-[#9B9B9B]">
                <th className="py-2 pr-4">{formatDisplayCopy("Email")}</th>
                <th className="py-2 pr-4">{formatDisplayCopy("Name")}</th>
                <th className="py-2 pr-4">{formatDisplayCopy("Role")}</th>
                <th className="py-2 pr-4">{formatDisplayCopy("Status")}</th>
                <th className="py-2 pr-4">{formatDisplayCopy("Failed Logins")}</th>
                <th className="py-2">{formatDisplayCopy("Actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#242424]">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="py-2.5 pr-4 text-white">{u.email}</td>
                  <td className="py-2.5 pr-4 text-[#E1E1E1]">{u.name}</td>
                  <td className="py-2.5 pr-4">
                    <select
                      value={u.role}
                      disabled={u.id === user.id}
                      onChange={(e) => void handleUpdateUser(u.id, { role: e.target.value })}
                      className="px-2 py-1 rounded bg-[#181818] border border-[#313131] text-white text-xs"
                    >
                      <option value="viewer">viewer</option>
                      <option value="researcher">researcher</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td className="py-2.5 pr-4">
                    <span className={u.is_active ? "text-[#39D353]" : "text-[#EF4444]"}>
                      {u.is_active ? "ACTIVE" : "DISABLED"}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4 text-[#9B9B9B]">{u.failed_login_attempts}</td>
                  <td className="py-2.5 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => void handleUpdateUser(u.id, { is_active: !u.is_active })}
                      className="px-2.5 py-1 rounded bg-[#181818] border border-[#313131] hover:border-[#00F0FF] text-white"
                    >
                      {u.is_active ? formatDisplayCopy("Disable") : formatDisplayCopy("Enable")}
                    </button>
                    {u.failed_login_attempts > 0 && (
                      <button
                        type="button"
                        onClick={() => void handleUpdateUser(u.id, { reset_lockout: true })}
                        className="px-2.5 py-1 rounded bg-[#181818] border border-[#313131] hover:border-[#39D353] text-[#39D353]"
                      >
                        {formatDisplayCopy("Reset Lock")}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Recent Security Audit Logs */}
      <Card surface="card" outerRadius={16} className="p-5 border border-[#313131] space-y-4">
        <div className="flex items-center gap-2">
          <Activity size={16} className="text-[#39D353]" />
          <h2 className="text-sm font-semibold text-white">{formatDisplayCopy("Security Audit Event Stream")}</h2>
        </div>

        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[#313131] text-[#9B9B9B]">
                <th className="py-2 pr-4">{formatDisplayCopy("Event")}</th>
                <th className="py-2 pr-4">{formatDisplayCopy("Outcome")}</th>
                <th className="py-2 pr-4">{formatDisplayCopy("Client IP")}</th>
                <th className="py-2 pr-4">{formatDisplayCopy("Resource")}</th>
                <th className="py-2">{formatDisplayCopy("Detail")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#242424]">
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="py-2 pr-4 text-[#00F0FF]">{log.event_type}</td>
                  <td className="py-2 pr-4">
                    <span className={log.outcome === "deny" ? "text-[#EF4444]" : "text-[#39D353]"}>
                      {log.outcome.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-2 pr-4 text-[#9B9B9B]">{log.ip_address}</td>
                  <td className="py-2 pr-4 text-[#E1E1E1]">{log.target_resource}</td>
                  <td className="py-2 text-[#9B9B9B]">{log.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

