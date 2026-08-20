import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import Card from "@/components/Card";
import { StatusBadge } from "@/components/StatusBadges";
import {
  Wrench,
  Star,
  CheckCircle2,
  Clock,
  Wallet,
  TrendingUp,
  Power,
  Inbox,
} from "lucide-react";

export default function MechanicDashboard() {
  const { currentUser, mechanics, requests, toggleMechanicAvailability } = useApp();
  const navigate = useNavigate();
  if (!currentUser) return null;

  const myProfile = mechanics.find((m) => m.id === currentUser.id || m.email === currentUser.email);
  if (!myProfile) return <Card className="p-8 text-center"><p className="text-gray-500">Mechanic profile not found.</p></Card>;

  const assignedRequests = requests.filter((r) => r.mechanicId === myProfile.id);
  const incomingRequests = requests.filter(
    (r) => r.mechanicId === myProfile.id && r.status === "MECHANIC_ASSIGNED"
  );
  const activeJob = assignedRequests.find(
    (r) => !["RATED", "CANCELLED", "REJECTED", "PAYMENT_PENDING", "PAID"].includes(r.status) && r.status !== "MECHANIC_ASSIGNED"
  );
  const completedToday = assignedRequests.filter(
    (r) => ["SERVICE_COMPLETED", "PAYMENT_PENDING", "PAID", "RATED"].includes(r.status) &&
    r.completedAt && new Date(r.completedAt).toDateString() === new Date().toDateString()
  );
  const todayEarnings = completedToday
    .filter((r) => r.payment)
    .reduce((sum, r) => sum + (r.invoice?.total || 0), 0);

  const stats = [
    { label: "Today's Earnings", value: `₹${todayEarnings}`, icon: Wallet, color: "green" },
    { label: "Completed Today", value: completedToday.length, icon: CheckCircle2, color: "blue" },
    { label: "Incoming", value: incomingRequests.length, icon: Inbox, color: "orange" },
    { label: "Rating", value: myProfile.rating, icon: Star, color: "yellow" },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Status toggle */}
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <Wrench className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">{myProfile.name}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="flex items-center gap-0.5 text-sm text-gray-600">
                  <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" /> {myProfile.rating}
                </span>
                <span className="text-sm text-gray-400">·</span>
                <span className="text-sm text-gray-600">{myProfile.completedServices} jobs</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => toggleMechanicAvailability(myProfile.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition ${
              myProfile.available
                ? "bg-green-100 text-green-700 hover:bg-green-200"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Power className={`h-4 w-4 ${myProfile.available ? "text-green-600" : "text-gray-400"}`} />
            {myProfile.available ? "Online" : "Offline"}
          </button>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="p-4">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-xl bg-${s.color}-50 flex items-center justify-center`}>
                  <Icon className={`h-5 w-5 text-${s.color}-600`} />
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900">{s.value}</p>
                  <p className="text-xs text-gray-500">{s.label}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Incoming requests alert */}
      {incomingRequests.length > 0 && (
        <Card className="p-5 border-orange-200 bg-orange-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Inbox className="h-5 w-5 text-orange-600" />
              <div>
                <p className="font-bold text-orange-900">{incomingRequests.length} New Incoming Request{incomingRequests.length > 1 ? "s" : ""}</p>
                <p className="text-sm text-orange-700">Check and accept before they expire.</p>
              </div>
            </div>
            <button
              onClick={() => navigate("/mechanic/incoming")}
              className="px-4 py-2 rounded-xl bg-orange-600 text-white font-semibold text-sm hover:bg-orange-700 transition"
            >
              View Requests
            </button>
          </div>
        </Card>
      )}

      {/* Active job */}
      <Card className="p-5">
        <h3 className="font-bold text-gray-900 mb-4">Active Job</h3>
        {activeJob ? (
          <button onClick={() => navigate("/mechanic/active")} className="block w-full text-left">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono font-bold text-blue-600">{activeJob.requestId}</span>
                <p className="text-sm font-semibold text-gray-900 mt-1">{activeJob.issueType}</p>
                <p className="text-xs text-gray-500">{activeJob.customerName} · {activeJob.vehicle.brand} {activeJob.vehicle.model}</p>
              </div>
              <StatusBadge status={activeJob.status} />
            </div>
            <p className="text-sm text-blue-600 font-medium mt-3">Go to active service →</p>
          </button>
        ) : (
          <p className="text-gray-500 text-sm text-center py-4">No active job right now.</p>
        )}
      </Card>

      {/* Recent completed */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">Recent Completed Jobs</h3>
          <button onClick={() => navigate("/mechanic/history")} className="text-sm text-blue-600 font-medium">View all</button>
        </div>
        {assignedRequests.filter((r) => ["PAID", "RATED"].includes(r.status)).length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">No completed jobs yet.</p>
        ) : (
          <div className="space-y-2">
            {assignedRequests.filter((r) => ["PAID", "RATED"].includes(r.status)).slice(0, 3).map((r) => (
              <div key={r.requestId} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                <div>
                  <p className="font-semibold text-sm text-gray-900">{r.requestId} · {r.issueType}</p>
                  <p className="text-xs text-gray-500">{r.customerName} · {new Date(r.createdAt).toLocaleDateString("en-IN")}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm text-gray-900">₹{r.invoice?.total || 0}</p>
                  {r.rating && <p className="text-xs text-yellow-600">★ {r.rating.overall}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
