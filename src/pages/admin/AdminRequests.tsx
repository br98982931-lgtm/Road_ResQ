import { useState } from "react";
import { useApp } from "@/context/AppContext";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import { PriorityBadge, StatusBadge } from "@/components/StatusBadges";
import type { RequestStatus, IssueType, Priority } from "@/types";
import { Filter, X, AlertTriangle, RefreshCw, MapPin, Clock } from "lucide-react";

const statusFilters: (RequestStatus | "ALL")[] = [
  "ALL",
  "SEARCHING",
  "MECHANIC_ASSIGNED",
  "MECHANIC_ACCEPTED",
  "ON_THE_WAY",
  "ARRIVED",
  "SERVICE_STARTED",
  "PAYMENT_PENDING",
  "PAID",
  "RATED",
  "CANCELLED",
  "REJECTED",
];

const priorityFilters: (Priority | "ALL")[] = ["ALL", "LOW", "MEDIUM", "HIGH", "CRITICAL"];

export default function AdminRequests() {
  const { requests, mechanics, reassignMechanic } = useApp();
  const [statusFilter, setStatusFilter] = useState<RequestStatus | "ALL">("ALL");
  const [priorityFilter, setPriorityFilter] = useState<Priority | "ALL">("ALL");
  const [issueFilter, setIssueFilter] = useState<IssueType | "ALL">("ALL");
  const [mechanicFilter, setMechanicFilter] = useState<string | "ALL">("ALL");
  const [selected, setSelected] = useState<typeof requests[0] | null>(null);

  const filtered = requests.filter((r) => {
    if (statusFilter !== "ALL" && r.status !== statusFilter) return false;
    if (priorityFilter !== "ALL" && r.priority !== priorityFilter) return false;
    if (issueFilter !== "ALL" && r.issueType !== issueFilter) return false;
    if (mechanicFilter !== "ALL" && r.mechanicId !== mechanicFilter) return false;
    return true;
  });

  const allIssues = Array.from(new Set(requests.map((r) => r.issueType)));

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Request Management</h1>
        <p className="text-sm text-gray-500">Monitor, filter, and manage all service requests.</p>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-semibold text-gray-700">Filters</span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Status</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-blue-500">
              {statusFilters.map((s) => <option key={s} value={s}>{s === "ALL" ? "All Statuses" : s.replace(/_/g, " ")}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Priority</label>
            <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value as any)} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-blue-500">
              {priorityFilters.map((p) => <option key={p} value={p}>{p === "ALL" ? "All Priorities" : p}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Issue Type</label>
            <select value={issueFilter} onChange={(e) => setIssueFilter(e.target.value as any)} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-blue-500">
              <option value="ALL">All Issues</option>
              {allIssues.map((i) => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Mechanic</label>
            <select value={mechanicFilter} onChange={(e) => setMechanicFilter(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-blue-500">
              <option value="ALL">All Mechanics</option>
              {mechanics.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
        </div>
      </Card>

      {/* Request list */}
      <div className="space-y-3">
        <p className="text-sm text-gray-500">{filtered.length} request(s) found</p>
        {filtered.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500">No requests match your filters.</p>
          </Card>
        ) : (
          filtered.map((r) => {
            const mech = mechanics.find((m) => m.id === r.mechanicId);
            const needsEscalation = ["HIGH", "CRITICAL"].includes(r.priority) &&
              ["SEARCHING", "MECHANIC_ASSIGNED", "REJECTED"].includes(r.status);
            return (
              <Card key={r.requestId} className="p-4" onClick={() => setSelected(r)}>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-blue-600 text-sm">{r.requestId}</span>
                      <StatusBadge status={r.status} />
                      <PriorityBadge priority={r.priority} />
                      {needsEscalation && <Badge color="red"><AlertTriangle className="h-3 w-3" /> Escalation</Badge>}
                    </div>
                    <p className="text-sm font-semibold text-gray-900">{r.issueType}</p>
                    <p className="text-xs text-gray-500">{r.customerName} · {r.vehicle.brand} {r.vehicle.model} · {r.vehicle.registrationNumber}</p>
                    <p className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleString("en-IN")}</p>
                  </div>
                  <div className="text-right text-sm">
                    {mech ? <p className="font-semibold text-gray-700">{mech.name}</p> : <p className="text-gray-400">Unassigned</p>}
                    {r.invoice && <p className="text-xs text-gray-500">₹{r.invoice.total}</p>}
                    {r.distanceKm !== undefined && <p className="text-xs text-gray-500">{r.distanceKm.toFixed(1)} km</p>}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Detail modal with reassign */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <Card className="p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">{selected.requestId}</h2>
              <button onClick={() => setSelected(null)} className="p-2 rounded-lg hover:bg-gray-100">
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-gray-50">
                  <p className="text-xs text-gray-400">Customer</p>
                  <p className="font-semibold text-gray-900">{selected.customerName}</p>
                  <p className="text-xs text-gray-500">{selected.customerPhone}</p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50">
                  <p className="text-xs text-gray-400">Vehicle</p>
                  <p className="font-semibold text-gray-900">{selected.vehicle.brand} {selected.vehicle.model}</p>
                  <p className="text-xs text-gray-500 font-mono">{selected.vehicle.registrationNumber}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <PriorityBadge priority={selected.priority} />
                <StatusBadge status={selected.status} />
              </div>

              {selected.description && (
                <div className="p-3 rounded-xl bg-gray-50">
                  <p className="text-xs text-gray-400">Description</p>
                  <p className="text-gray-700">{selected.description}</p>
                </div>
              )}

              <div className="p-3 rounded-xl bg-gray-50">
                <p className="text-xs text-gray-400">Location</p>
                <p className="text-xs text-gray-700">{selected.address}</p>
                <p className="text-xs text-gray-400 font-mono">{selected.location.lat.toFixed(5)}, {selected.location.lng.toFixed(5)}</p>
              </div>

              {selected.mechanicId && (
                <div className="p-3 rounded-xl bg-green-50">
                  <p className="text-xs text-gray-400">Assigned Mechanic</p>
                  <p className="font-semibold text-green-700">{mechanics.find((m) => m.id === selected.mechanicId)?.name}</p>
                  {selected.distanceKm !== undefined && (
                    <div className="flex gap-3 mt-1 text-xs text-gray-600">
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {selected.distanceKm.toFixed(1)} km</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {selected.etaMins} min</span>
                    </div>
                  )}
                </div>
              )}

              {selected.invoice && (
                <div className="p-3 rounded-xl bg-gray-50">
                  <p className="text-xs text-gray-400 mb-2">Invoice</p>
                  {selected.invoice.items.map((i) => (
                    <div key={i.id} className="flex justify-between text-sm">
                      <span className="text-gray-600">{i.description}</span>
                      <span className="font-semibold">₹{i.amount}</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-gray-200 flex justify-between">
                    <span className="font-bold">Total</span>
                    <span className="font-bold">₹{selected.invoice.total}</span>
                  </div>
                </div>
              )}

              {/* Reassign */}
              <div className="p-3 rounded-xl border-2 border-blue-100">
                <p className="text-xs text-gray-400 mb-2 flex items-center gap-1"><RefreshCw className="h-3 w-3" /> Reassign Mechanic</p>
                <div className="space-y-2">
                  {mechanics.filter((m) => m.available && m.id !== selected.mechanicId).map((m) => (
                    <button
                      key={m.id}
                      onClick={() => { reassignMechanic(selected.requestId, m.id); setSelected(null); }}
                      className="w-full flex items-center justify-between p-2 rounded-lg bg-gray-50 hover:bg-blue-50 transition text-left"
                    >
                      <span className="text-sm font-semibold text-gray-700">{m.name}</span>
                      <span className="text-xs text-gray-500">★ {m.rating} · {m.completedServices} jobs</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
