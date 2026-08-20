import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import { PriorityBadge } from "@/components/StatusBadges";
import MapView from "@/components/MapView";
import { formatDistance, formatEta, haversineKm, etaMinutes } from "@/lib/geo";
import type { ServiceRequest } from "@/types";
import {
  Car,
  MapPin,
  Clock,
  Star,
  CheckCircle2,
  X,
  Inbox,
  AlertTriangle,
} from "lucide-react";

export default function MechanicIncoming() {
  const { currentUser, mechanics, requests, acceptRequest, rejectRequest } = useApp();
  const navigate = useNavigate();
  if (!currentUser) return null;

  const myProfile = mechanics.find((m) => m.email === currentUser.email);
  if (!myProfile) return null;

  const incoming = requests.filter(
    (r) => r.mechanicId === myProfile.id && r.status === "MECHANIC_ASSIGNED"
  );

  function handleAccept(req: ServiceRequest) {
    acceptRequest(req.requestId);
    navigate("/mechanic/active");
  }

  function handleReject(req: ServiceRequest) {
    rejectRequest(req.requestId);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Incoming Requests</h1>
        <p className="text-sm text-gray-500">Review and accept emergency requests assigned to you.</p>
      </div>

      {incoming.length === 0 ? (
        <Card className="p-8 text-center">
          <Inbox className="h-10 w-10 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500">No incoming requests right now.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {incoming.map((req) => {
            const dist = haversineKm({ lat: myProfile.lat, lng: myProfile.lng }, req.location);
            const eta = etaMinutes(dist);
            const isCritical = req.priority === "CRITICAL" || req.priority === "HIGH";

            return (
              <Card key={req.requestId} className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-blue-600">{req.requestId}</span>
                      <PriorityBadge priority={req.priority} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mt-1">{req.issueType}</h3>
                  </div>
                  {isCritical && (
                    <Badge color="red"><AlertTriangle className="h-3 w-3" /> Urgent</Badge>
                  )}
                </div>

                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Car className="h-4 w-4" /> {req.vehicle.brand} {req.vehicle.model} ({req.vehicle.registrationNumber})
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="h-4 w-4" /> {formatDistance(dist)} away
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="h-4 w-4" /> ETA {formatEta(eta)}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Star className="h-4 w-4" /> {req.customerName}
                    </div>
                  </div>
                  <MapView center={req.location} customerLocation={req.location} mechanicLocation={{ lat: myProfile.lat, lng: myProfile.lng }} height="180px" interactive={false} />
                </div>

                {req.description && (
                  <div className="p-3 rounded-xl bg-gray-50 mb-4">
                    <p className="text-xs text-gray-400 mb-1">Description</p>
                    <p className="text-sm text-gray-700">{req.description}</p>
                  </div>
                )}

                {req.matchReason && req.matchReason.length > 0 && (
                  <div className="p-3 rounded-xl bg-blue-50 mb-4">
                    <p className="text-xs text-blue-600 mb-1">Match reason</p>
                    {req.matchReason.map((r, i) => (
                      <p key={i} className="text-sm text-blue-700 flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> {r}
                      </p>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => handleAccept(req)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 transition"
                  >
                    <CheckCircle2 className="h-5 w-5" /> Accept Request
                  </button>
                  <button
                    onClick={() => handleReject(req)}
                    className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition"
                  >
                    <X className="h-5 w-5" /> Reject
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
