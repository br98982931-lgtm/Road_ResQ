import { useState } from "react";
import { useApp } from "@/context/AppContext";
import Card from "@/components/Card";
import MapView from "@/components/MapView";
import Badge from "@/components/Badge";
import { PriorityBadge, StatusBadge } from "@/components/StatusBadges";
import type { ServiceRequest } from "@/types";
import { MapPin, Wrench, Car, Clock, CreditCard, X } from "lucide-react";

export default function AdminLiveMap() {
  const { requests, mechanics } = useApp();
  const [selected, setSelected] = useState<ServiceRequest | null>(null);

  const activeRequests = requests.filter(
    (r) => !["RATED", "CANCELLED", "REJECTED", "NEW"].includes(r.status)
  );

  const markers = activeRequests.flatMap((r) => {
    const list: Array<{ pos: { lat: number; lng: number }; label: string; color: "red" | "green" | "orange" | "blue" }> = [];
    if (r.location) {
      list.push({
        pos: r.location,
        label: `${r.requestId} — ${r.customerName} (${r.priority})`,
        color: r.priority === "CRITICAL" ? "red" : r.priority === "HIGH" ? "orange" : "blue",
      });
    }
    if (r.mechanicLocation && ["ON_THE_WAY", "MECHANIC_ACCEPTED", "ARRIVED"].includes(r.status)) {
      list.push({
        pos: r.mechanicLocation,
        label: `Mechanic: ${mechanics.find((m) => m.id === r.mechanicId)?.name || ""}`,
        color: "green",
      });
    }
    return list;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Live Operations Map</h1>
        <p className="text-sm text-gray-500">Real-time view of all active requests and mechanic locations.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="p-4">
            <MapView markers={markers} height="500px" zoom={12} />
            <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-600">
              <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-red-600" /> Critical</span>
              <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-orange-500" /> High</span>
              <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-blue-600" /> Normal</span>
              <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-green-600" /> Mechanic</span>
            </div>
          </Card>
        </div>

        <div className="space-y-3">
          <h3 className="font-bold text-gray-900">Active Requests ({activeRequests.length})</h3>
          {activeRequests.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-gray-500 text-sm">No active requests on the map.</p>
            </Card>
          ) : (
            activeRequests.map((r) => {
              const mech = mechanics.find((m) => m.id === r.mechanicId);
              return (
                <Card key={r.requestId} className="p-4" onClick={() => setSelected(r)}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono font-bold text-blue-600 text-sm">{r.requestId}</span>
                    <PriorityBadge priority={r.priority} />
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{r.issueType}</p>
                  <p className="text-xs text-gray-500">{r.customerName} · {r.vehicle.brand} {r.vehicle.model}</p>
                  <div className="flex items-center justify-between mt-2">
                    <StatusBadge status={r.status} />
                    {mech ? <span className="text-xs text-gray-600">{mech.name}</span> : <span className="text-xs text-gray-400">Unassigned</span>}
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <Card className="p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selected.requestId}</h2>
                <p className="text-sm text-gray-500">{selected.issueType}</p>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 rounded-lg hover:bg-gray-100">
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-gray-50">
                  <p className="text-xs text-gray-400">Customer</p>
                  <p className="font-semibold text-gray-900">{selected.customerName}</p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50">
                  <p className="text-xs text-gray-400">Vehicle</p>
                  <p className="font-semibold text-gray-900">{selected.vehicle.brand} {selected.vehicle.model}</p>
                  <p className="text-xs text-gray-500 font-mono">{selected.vehicle.registrationNumber}</p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50">
                  <p className="text-xs text-gray-400">Priority</p>
                  <PriorityBadge priority={selected.priority} />
                </div>
                <div className="p-3 rounded-xl bg-gray-50">
                  <p className="text-xs text-gray-400">Status</p>
                  <StatusBadge status={selected.status} />
                </div>
              </div>

              {selected.mechanicId && (
                <div className="p-3 rounded-xl bg-green-50">
                  <p className="text-xs text-gray-400">Mechanic</p>
                  <p className="font-semibold text-green-700">{mechanics.find((m) => m.id === selected.mechanicId)?.name}</p>
                </div>
              )}

              {selected.distanceKm !== undefined && (
                <div className="flex gap-4 p-3 rounded-xl bg-orange-50">
                  <span className="flex items-center gap-1 text-orange-700 text-sm">
                    <MapPin className="h-4 w-4" /> {selected.distanceKm.toFixed(1)} km
                  </span>
                  <span className="flex items-center gap-1 text-orange-700 text-sm">
                    <Clock className="h-4 w-4" /> ETA {selected.etaMins} min
                  </span>
                </div>
              )}

              <div className="p-3 rounded-xl bg-gray-50">
                <p className="text-xs text-gray-400">Location</p>
                <p className="text-xs text-gray-700">{selected.address}</p>
              </div>

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
                  {selected.payment ? (
                    <Badge color="green"><CreditCard className="h-3 w-3" /> Paid</Badge>
                  ) : selected.status === "PAYMENT_PENDING" ? (
                    <Badge color="yellow">Payment Pending</Badge>
                  ) : null}
                </div>
              )}

              {selected.rating && (
                <div className="p-3 rounded-xl bg-yellow-50">
                  <p className="text-xs text-gray-400">Rating</p>
                  <p className="font-semibold text-yellow-700">{selected.rating.overall} stars</p>
                  {selected.rating.review && <p className="text-xs text-gray-600 mt-1">"{selected.rating.review}"</p>}
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
