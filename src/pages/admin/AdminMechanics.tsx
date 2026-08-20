import { useApp } from "@/context/AppContext";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import {
  Wrench,
  Star,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Power,
  MapPin,
  Clock,
  TrendingDown,
  Eye,
} from "lucide-react";

export default function AdminMechanics() {
  const { mechanics, requests, toggleMechanicAvailability, verifyMechanic } = useApp();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mechanic Management</h1>
        <p className="text-sm text-gray-500">View and manage all service providers.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {mechanics.map((m) => {
          const activeRequest = requests.find(
            (r) => r.mechanicId === m.id && !["RATED", "CANCELLED", "REJECTED", "PAID"].includes(r.status)
          );
          return (
            <Card key={m.id} className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-full bg-green-100 flex items-center justify-center">
                    <Wrench className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{m.name}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      {m.verified ? (
                        <Badge color="green"><ShieldCheck className="h-3 w-3" /> Verified</Badge>
                      ) : (
                        <Badge color="yellow">Unverified</Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className={`h-3 w-3 rounded-full ${m.available ? "bg-green-500" : "bg-gray-300"}`} />
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" /> Rating</span>
                  <span className="font-semibold text-gray-900">{m.rating}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Completed</span>
                  <span className="font-semibold text-gray-900">{m.completedServices}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Avg Response</span>
                  <span className="font-semibold text-gray-900">{m.responseTimeMins} min</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 flex items-center gap-1"><TrendingDown className="h-3.5 w-3.5" /> Cancel Rate</span>
                  <span className="font-semibold text-gray-900">{(m.cancellationRate * 100).toFixed(0)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> Location</span>
                  <span className="font-mono text-xs text-gray-700">{m.lat.toFixed(3)}, {m.lng.toFixed(3)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Vehicle</span>
                  <span className="text-xs text-gray-700">{m.serviceVehicle}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Active Request</span>
                  <span className="text-xs font-semibold">{activeRequest ? activeRequest.requestId : "None"}</span>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                {!m.verified && (
                  <button
                    onClick={() => verifyMechanic(m.id)}
                    className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-green-50 text-green-700 text-xs font-semibold hover:bg-green-100 transition"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" /> Verify
                  </button>
                )}
                <button
                  onClick={() => toggleMechanicAvailability(m.id)}
                  className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-semibold transition ${
                    m.available
                      ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                  }`}
                >
                  <Power className="h-3.5 w-3.5" />
                  {m.available ? "Set Unavailable" : "Set Available"}
                </button>
              </div>

              <div className="mt-2 flex flex-wrap gap-1">
                {m.expertise.map((e) => (
                  <Badge key={e} color="blue">{e}</Badge>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
