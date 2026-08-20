import { useApp } from "@/context/AppContext";
import Card from "@/components/Card";
import { StatusBadge } from "@/components/StatusBadges";
import {
  Activity,
  Users,
  Clock,
  Wallet,
  CheckCircle2,
  Star,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";

export default function AdminDashboard() {
  const { requests, mechanics } = useApp();

  const activeRequests = requests.filter(
    (r) => !["RATED", "CANCELLED", "REJECTED"].includes(r.status)
  );
  const availableMechanics = mechanics.filter((m) => m.available);
  const completedServices = requests.filter((r) =>
    ["SERVICE_COMPLETED", "PAYMENT_PENDING", "PAID", "RATED"].includes(r.status)
  );
  const paidRequests = requests.filter((r) => r.payment);
  const todayRevenue = paidRequests
    .filter((r) => r.payment && new Date(r.payment.paidAt).toDateString() === new Date().toDateString())
    .reduce((sum, r) => sum + (r.invoice?.total || 0), 0);
  const totalRevenue = paidRequests.reduce((sum, r) => sum + (r.invoice?.total || 0), 0);
  const ratedRequests = requests.filter((r) => r.rating);
  const avgRating = ratedRequests.length
    ? (ratedRequests.reduce((sum, r) => sum + (r.rating?.overall || 0), 0) / ratedRequests.length).toFixed(1)
    : "—";
  const avgResponseTime = Math.round(
    mechanics.reduce((sum, m) => sum + m.responseTimeMins, 0) / mechanics.length
  );

  const criticalUnaccepted = requests.filter(
    (r) => ["HIGH", "CRITICAL"].includes(r.priority) &&
    ["SEARCHING", "MECHANIC_ASSIGNED", "REJECTED"].includes(r.status)
  );

  const stats = [
    { label: "Active Requests", value: activeRequests.length, icon: Activity, color: "blue" },
    { label: "Available Mechanics", value: availableMechanics.length, icon: Users, color: "green" },
    { label: "Avg Response Time", value: `${avgResponseTime}m`, icon: Clock, color: "orange" },
    { label: "Today's Revenue", value: `₹${todayRevenue}`, icon: Wallet, color: "green" },
    { label: "Completed Services", value: completedServices.length, icon: CheckCircle2, color: "blue" },
    { label: "Average Rating", value: avgRating, icon: Star, color: "yellow" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Operations Dashboard</h1>
        <p className="text-sm text-gray-500">Real-time overview of all RoadResQ operations.</p>
      </div>

      {/* Critical alert */}
      {criticalUnaccepted.length > 0 && (
        <Card className="p-4 border-red-200 bg-red-50">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <div>
              <p className="font-bold text-red-900">Escalation Required</p>
              <p className="text-sm text-red-700">{criticalUnaccepted.length} high/critical request(s) not yet accepted. Reassign mechanics immediately.</p>
            </div>
          </div>
        </Card>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="p-5">
              <div className="flex items-center gap-3">
                <div className={`h-12 w-12 rounded-xl bg-${s.color}-50 flex items-center justify-center`}>
                  <Icon className={`h-6 w-6 text-${s.color}-600`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                  <p className="text-xs text-gray-500">{s.label}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Active requests */}
      <Card className="p-5">
        <h3 className="font-bold text-gray-900 mb-4">Active Requests</h3>
        {activeRequests.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">No active requests.</p>
        ) : (
          <div className="space-y-3">
            {activeRequests.map((r) => {
              const mech = mechanics.find((m) => m.id === r.mechanicId);
              return (
                <div key={r.requestId} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-blue-600 text-sm">{r.requestId}</span>
                      <StatusBadge status={r.status} />
                    </div>
                    <p className="text-sm text-gray-700 mt-1">{r.issueType} · {r.customerName}</p>
                    <p className="text-xs text-gray-500">
                      {r.vehicle.brand} {r.vehicle.model} · {r.priority}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    {mech ? <p className="font-semibold text-gray-700">{mech.name}</p> : <p className="text-gray-400">Unassigned</p>}
                    {r.distanceKm !== undefined && <p className="text-xs text-gray-500">{r.distanceKm.toFixed(1)} km · {r.etaMins}m</p>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Revenue summary */}
      <Card className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="h-5 w-5 text-green-600" />
          <h3 className="font-bold text-gray-900">Revenue Summary</h3>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 rounded-xl bg-gray-50 text-center">
            <p className="text-xs text-gray-400">Today</p>
            <p className="text-xl font-bold text-green-700">₹{todayRevenue}</p>
          </div>
          <div className="p-3 rounded-xl bg-gray-50 text-center">
            <p className="text-xs text-gray-400">Total</p>
            <p className="text-xl font-bold text-gray-900">₹{totalRevenue}</p>
          </div>
          <div className="p-3 rounded-xl bg-gray-50 text-center">
            <p className="text-xs text-gray-400">Paid Requests</p>
            <p className="text-xl font-bold text-gray-900">{paidRequests.length}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
