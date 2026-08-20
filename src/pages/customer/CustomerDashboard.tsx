import { Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import Card from "@/components/Card";
import { StatusBadge } from "@/components/StatusBadges";
import {
  Siren,
  Car,
  Clock,
  CreditCard,
  Phone,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export default function CustomerDashboard() {
  const { currentUser, vehicles, requests } = useApp();
  if (!currentUser) return null;

  const myRequests = requests.filter((r) => r.customerId === currentUser.id);
  const activeRequest = myRequests.find(
    (r) => !["RATED", "CANCELLED", "REJECTED"].includes(r.status)
  );
  const recentServices = myRequests
    .filter((r) => ["RATED", "PAID"].includes(r.status))
    .slice(0, 3);
  const myVehicles = vehicles.filter((v) => v.ownerId === currentUser.id);

  const stats = [
    { label: "Active Request", value: activeRequest ? "1" : "None", icon: Clock, color: "blue" },
    { label: "Vehicles", value: myVehicles.length, icon: Car, color: "green" },
    { label: "Total Services", value: myRequests.length, icon: CheckCircle2, color: "gray" },
    { label: "Pending Payments", value: myRequests.filter((r) => r.status === "PAYMENT_PENDING").length, icon: CreditCard, color: "orange" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Hero CTA */}
      <Card className="overflow-hidden">
        <div className="relative bg-gradient-to-br from-blue-600 to-blue-800 p-6 lg:p-8 text-white">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-extrabold">Need help on the road?</h1>
              <p className="mt-1 text-blue-100">Get a verified mechanic to your location in minutes.</p>
            </div>
            <Link
              to="/customer/emergency"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-blue-700 font-bold hover:bg-blue-50 transition shadow-lg whitespace-nowrap"
            >
              <Siren className="h-5 w-5" />
              Get Emergency Help
            </Link>
          </div>
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
                  <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                  <p className="text-xs text-gray-500">{s.label}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Active Request */}
        <Card className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Active Request</h3>
            {activeRequest && <StatusBadge status={activeRequest.status} />}
          </div>
          {activeRequest ? (
            <Link to="/customer/active" className="block">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-mono font-bold text-blue-600">{activeRequest.requestId}</span>
                  <span className="text-sm text-gray-600">{activeRequest.issueType}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Car className="h-4 w-4" />
                  {activeRequest.vehicle.brand} {activeRequest.vehicle.model} · {activeRequest.vehicle.registrationNumber}
                </div>
                {activeRequest.mechanicId && activeRequest.distanceKm !== undefined && (
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-600">Distance: <b>{activeRequest.distanceKm.toFixed(1)} km</b></span>
                    <span className="text-gray-600">ETA: <b>{activeRequest.etaMins} min</b></span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-blue-600 text-sm font-medium">
                  View details <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </Link>
          ) : (
            <div className="text-center py-8">
              <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-gray-500">No active requests. You're all set!</p>
              <Link to="/customer/emergency" className="inline-flex items-center gap-1.5 mt-3 text-blue-600 font-medium text-sm">
                <Siren className="h-4 w-4" /> Request assistance
              </Link>
            </div>
          )}
        </Card>

        {/* Emergency Support */}
        <Card className="p-5">
          <h3 className="font-bold text-gray-900 mb-4">Emergency Support</h3>
          <div className="space-y-3">
            <a href="tel:112" className="flex items-center gap-3 p-3 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 transition">
              <Phone className="h-5 w-5" />
              <div>
                <p className="font-semibold text-sm">Call Emergency 112</p>
                <p className="text-xs text-red-600">For accidents or danger</p>
              </div>
            </a>
            <a href="tel:+919825011111" className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition">
              <Phone className="h-5 w-5" />
              <div>
                <p className="font-semibold text-sm">RoadResQ Support</p>
                <p className="text-xs text-blue-600">24/7 helpline</p>
              </div>
            </a>
            <div className="flex items-start gap-2 p-3 rounded-xl bg-yellow-50 text-yellow-800">
              <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
              <p className="text-xs">Stay in a safe location and follow local emergency guidance.</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Services */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">Recent Services</h3>
          <Link to="/customer/history" className="text-sm text-blue-600 font-medium">View all</Link>
        </div>
        {recentServices.length === 0 ? (
          <p className="text-gray-500 text-sm py-4 text-center">No completed services yet.</p>
        ) : (
          <div className="space-y-3">
            {recentServices.map((r) => (
              <div key={r.requestId} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                <div>
                  <p className="font-semibold text-sm text-gray-900">{r.requestId} · {r.issueType}</p>
                  <p className="text-xs text-gray-500">{r.vehicle.brand} {r.vehicle.model} · {new Date(r.createdAt).toLocaleDateString("en-IN")}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm text-gray-900">₹{r.invoice?.total || 0}</p>
                  <StatusBadge status={r.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
