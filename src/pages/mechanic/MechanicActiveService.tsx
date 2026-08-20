import { useState } from "react";
import { useApp } from "@/context/AppContext";
import Card from "@/components/Card";
import MapView from "@/components/MapView";
import Badge from "@/components/Badge";
import { StatusBadge } from "@/components/StatusBadges";
import { formatDistance, formatEta } from "@/lib/geo";
import {
  Navigation,
  MapPin,
  Clock,
  Car,
  Wrench,
  CheckCircle2,
  Plus,
  Trash2,
  Phone,
  Play,
  Square,
  Loader2,
  Zap,
} from "lucide-react";

export default function MechanicActiveService() {
  const {
    currentUser,
    mechanics,
    requests,
    startNavigation,
    advanceMechanic,
    markArrived,
    startService,
    addServiceItem,
    completeService,
  } = useApp();

  if (!currentUser) return null;
  const myProfile = mechanics.find((m) => m.email === currentUser.email);
  if (!myProfile) return null;

  const myJobs = requests.filter((r) => r.mechanicId === myProfile.id);
  const activeJob = myJobs.find(
    (r) => !["RATED", "CANCELLED", "REJECTED"].includes(r.status) && r.status !== "MECHANIC_ASSIGNED"
  );
  const assignedJob = myJobs.find((r) => r.status === "MECHANIC_ASSIGNED");

  const [itemDesc, setItemDesc] = useState("");
  const [itemAmount, setItemAmount] = useState("");
  const [completing, setCompleting] = useState(false);

  if (!activeJob && !assignedJob) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="p-8 text-center">
          <Wrench className="h-10 w-10 text-gray-300 mx-auto mb-2" />
          <h2 className="text-lg font-bold text-gray-900">No Active Service</h2>
          <p className="text-gray-500 text-sm mt-1">Accept a request from your incoming requests to start.</p>
        </Card>
      </div>
    );
  }

  const job = activeJob || assignedJob!;

  function handleAddItem() {
    if (!itemDesc || !itemAmount) return;
    addServiceItem(job.requestId, { description: itemDesc, amount: parseInt(itemAmount) });
    setItemDesc("");
    setItemAmount("");
  }

  function handleComplete() {
    setCompleting(true);
    setTimeout(() => {
      completeService(job.requestId);
      setCompleting(false);
    }, 800);
  }

  const total = job.serviceItems.reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Active Service</h1>
          <p className="text-sm text-gray-500 font-mono">{job.requestId}</p>
        </div>
        <StatusBadge status={job.status} />
      </div>

      {/* Customer info */}
      <Card className="p-5">
        <h3 className="font-bold text-gray-900 mb-3">Customer & Vehicle</h3>
        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <div className="p-3 rounded-xl bg-gray-50">
            <p className="text-xs text-gray-400">Customer</p>
            <p className="font-semibold text-gray-900">{job.customerName}</p>
            <a href={`tel:${job.customerPhone}`} className="flex items-center gap-1 text-blue-600 text-xs mt-1">
              <Phone className="h-3 w-3" /> {job.customerPhone}
            </a>
          </div>
          <div className="p-3 rounded-xl bg-gray-50">
            <p className="text-xs text-gray-400">Vehicle</p>
            <p className="font-semibold text-gray-900">{job.vehicle.brand} {job.vehicle.model}</p>
            <p className="text-xs text-gray-500 font-mono">{job.vehicle.registrationNumber}</p>
          </div>
          <div className="p-3 rounded-xl bg-gray-50">
            <p className="text-xs text-gray-400">Issue</p>
            <p className="font-semibold text-gray-900">{job.issueType}</p>
          </div>
          <div className="p-3 rounded-xl bg-gray-50">
            <p className="text-xs text-gray-400">Location</p>
            <p className="text-xs text-gray-700">{job.address}</p>
          </div>
        </div>
      </Card>

      {/* Navigation / Map phase */}
      {["MECHANIC_ACCEPTED", "ON_THE_WAY"].includes(job.status) && (
        <Card className="p-5 space-y-4">
          <h3 className="font-bold text-gray-900">Navigation</h3>
          <MapView
            customerLocation={job.location}
            mechanicLocation={job.mechanicLocation}
            route={job.movementPath}
            height="300px"
          />
          <div className="flex gap-4 p-3 rounded-xl bg-orange-50">
            <div className="flex items-center gap-1.5 text-orange-700">
              <MapPin className="h-4 w-4" />
              <span className="font-bold">{formatDistance(job.distanceKm || 0)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-orange-700">
              <Clock className="h-4 w-4" />
              <span className="font-bold">ETA {formatEta(job.etaMins || 0)}</span>
            </div>
          </div>
          <div className="flex gap-2">
            {job.status === "MECHANIC_ACCEPTED" && (
              <button
                onClick={() => startNavigation(job.requestId)}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-orange-600 text-white font-bold hover:bg-orange-700 transition"
              >
                <Navigation className="h-5 w-5" /> Start Navigation
              </button>
            )}
            {job.status === "ON_THE_WAY" && (
              <>
                <button
                  onClick={() => advanceMechanic(job.requestId)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition"
                >
                  <Zap className="h-5 w-5" /> Advance (Simulate Movement)
                </button>
                <button
                  onClick={() => markArrived(job.requestId)}
                  className="px-5 py-3 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 transition"
                >
                  Mark Arrived
                </button>
              </>
            )}
          </div>
          <p className="text-xs text-gray-400 text-center">Click "Advance" to simulate the mechanic moving toward the customer. The customer sees live updates.</p>
        </Card>
      )}

      {/* Arrived phase */}
      {job.status === "ARRIVED" && (
        <Card className="p-5 text-center">
          <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-3" />
          <h3 className="font-bold text-gray-900 text-lg">Customer reached!</h3>
          <p className="text-sm text-gray-500 mb-4">Start the service when you begin working on the vehicle.</p>
          <button
            onClick={() => startService(job.requestId)}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700 transition mx-auto"
          >
            <Play className="h-5 w-5" /> Start Service
          </button>
        </Card>
      )}

      {/* Service phase */}
      {job.status === "SERVICE_STARTED" && (
        <Card className="p-5 space-y-4">
          <h3 className="font-bold text-gray-900">Service Management</h3>
          <p className="text-sm text-gray-500">Add parts, labor, and charges for this service.</p>

          {/* Add service item */}
          <div className="flex gap-2">
            <input
              value={itemDesc}
              onChange={(e) => setItemDesc(e.target.value)}
              placeholder="e.g. Battery Replacement"
              className="flex-1 px-3 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            />
            <input
              type="number"
              value={itemAmount}
              onChange={(e) => setItemAmount(e.target.value)}
              placeholder="₹ Amount"
              className="w-28 px-3 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            />
            <button
              onClick={handleAddItem}
              disabled={!itemDesc || !itemAmount}
              className="flex items-center gap-1 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 disabled:opacity-40 transition"
            >
              <Plus className="h-4 w-4" /> Add
            </button>
          </div>

          {/* Quick add buttons */}
          <div className="flex flex-wrap gap-2">
            {[
              { description: "Battery Replacement", amount: 350 },
              { description: "Labor", amount: 150 },
              { description: "Emergency Visit", amount: 100 },
              { description: "Towing", amount: 500 },
              { description: "Fuel (5L)", amount: 450 },
            ].map((q) => (
              <button
                key={q.description}
                onClick={() => addServiceItem(job.requestId, q)}
                className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition"
              >
                + {q.description} ₹{q.amount}
              </button>
            ))}
          </div>

          {/* Service items list */}
          {job.serviceItems.length > 0 && (
            <div className="space-y-2">
              {job.serviceItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                  <span className="text-sm text-gray-700">{item.description}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">₹{item.amount}</span>
                  </div>
                </div>
              ))}
              <div className="flex justify-between p-3 rounded-xl bg-blue-50 border-t-2 border-blue-200">
                <span className="font-bold text-gray-900">Total</span>
                <span className="font-bold text-lg text-blue-700">₹{total}</span>
              </div>
            </div>
          )}

          <button
            onClick={handleComplete}
            disabled={completing}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 disabled:opacity-50 transition"
          >
            {completing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Square className="h-5 w-5" />}
            {completing ? "Completing..." : "Complete Service"}
          </button>
        </Card>
      )}

      {/* Completed / Payment pending */}
      {["SERVICE_COMPLETED", "PAYMENT_PENDING", "PAID", "RATED"].includes(job.status) && (
        <Card className="p-5">
          <h3 className="font-bold text-gray-900 mb-4">Invoice</h3>
          {job.invoice ? (
            <div className="space-y-2">
              {job.invoice.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-600">{item.description}</span>
                  <span className="font-semibold text-gray-900">₹{item.amount}</span>
                </div>
              ))}
              <div className="pt-3 border-t border-gray-200 flex justify-between">
                <span className="font-bold text-gray-900">Total</span>
                <span className="font-bold text-lg text-gray-900">₹{job.invoice.total}</span>
              </div>
              <div className="mt-3">
                {job.payment ? (
                  <Badge color="green"><CheckCircle2 className="h-3 w-3" /> Paid via {job.payment.method}</Badge>
                ) : (
                  <Badge color="yellow">Awaiting customer payment</Badge>
                )}
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Invoice not generated yet.</p>
          )}
        </Card>
      )}
    </div>
  );
}
