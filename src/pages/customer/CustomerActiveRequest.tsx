import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import Card from "@/components/Card";
import MapView from "@/components/MapView";
import Badge from "@/components/Badge";
import { StatusBadge } from "@/components/StatusBadges";
import { formatDistance, formatEta } from "@/lib/geo";
import type { RequestStatus, ServiceRequest } from "@/types";
import {
  Phone,
  MessageSquare,
  Share2,
  X,
  Star,
  Wrench,
  MapPin,
  Clock,
  CheckCircle2,
  Circle,
  CreditCard,
  Loader2,
  ShieldCheck,
} from "lucide-react";

const timelineOrder: RequestStatus[] = [
  "SEARCHING",
  "MECHANIC_ASSIGNED",
  "MECHANIC_ACCEPTED",
  "ON_THE_WAY",
  "ARRIVED",
  "SERVICE_STARTED",
  "SERVICE_COMPLETED",
  "PAYMENT_PENDING",
  "PAID",
  "RATED",
];

const timelineLabels: Record<string, string> = {
  SEARCHING: "Request Created",
  MECHANIC_ASSIGNED: "Mechanic Assigned",
  MECHANIC_ACCEPTED: "Mechanic Accepted",
  ON_THE_WAY: "On The Way",
  ARRIVED: "Arrived",
  SERVICE_STARTED: "Service Started",
  SERVICE_COMPLETED: "Service Completed",
  PAYMENT_PENDING: "Payment Pending",
  PAID: "Paid",
  RATED: "Rated",
};

export default function CustomerActiveRequest() {
  const { currentUser, requests, mechanics, cancelRequest, payRequest, rateRequest } = useApp();
  const navigate = useNavigate();
  const [showPayment, setShowPayment] = useState(false);
  const [paying, setPaying] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [ratingForm, setRatingForm] = useState({ overall: 5, serviceQuality: 5, punctuality: 5, communication: 5, review: "" });
  const [paymentMethod, setPaymentMethod] = useState<"UPI" | "Card" | "Net Banking">("UPI");

  if (!currentUser) return null;

  const myRequests = requests.filter((r) => r.customerId === currentUser.id);
  const activeRequest = myRequests.find(
    (r) => !["RATED", "CANCELLED", "REJECTED"].includes(r.status)
  );

  if (!activeRequest) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="p-8 text-center">
          <div className="h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="h-7 w-7 text-gray-400" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">No Active Request</h2>
          <p className="text-gray-500 text-sm mt-1">You don't have any active service requests.</p>
          <button
            onClick={() => navigate("/customer/emergency")}
            className="mt-4 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
          >
            Get Emergency Help
          </button>
        </Card>
      </div>
    );
  }

  const mechanic = activeRequest.mechanicId
    ? mechanics.find((m) => m.id === activeRequest.mechanicId)
    : null;

  const currentStatusIndex = timelineOrder.indexOf(activeRequest.status);

  function handlePay() {
    setPaying(true);
    setTimeout(() => {
      payRequest(activeRequest!.requestId, paymentMethod);
      setPaying(false);
      setShowPayment(false);
    }, 1800);
  }

  function handleSubmitRating() {
    rateRequest(activeRequest!.requestId, ratingForm);
    setShowRating(false);
  }

  function shareLocation() {
    if (navigator.share && activeRequest) {
      navigator.share({
        title: "RoadResQ Location",
        text: `My location: ${activeRequest.address}`,
        url: `https://maps.google.com/?q=${activeRequest.location.lat},${activeRequest.location.lng}`,
      }).catch(() => {});
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Active Request</h1>
          <p className="text-sm text-gray-500 font-mono">{activeRequest.requestId}</p>
        </div>
        <StatusBadge status={activeRequest.status} />
      </div>

      {/* Status banner */}
      {activeRequest.status === "SEARCHING" && (
        <Card className="p-4 flex items-center gap-3 bg-yellow-50 border-yellow-200">
          <Loader2 className="h-5 w-5 text-yellow-600 animate-spin" />
          <p className="text-sm font-medium text-yellow-800">Searching for nearby mechanics...</p>
        </Card>
      )}
      {activeRequest.status === "MECHANIC_ASSIGNED" && (
        <Card className="p-4 flex items-center gap-3 bg-blue-50 border-blue-200">
          <Wrench className="h-5 w-5 text-blue-600" />
          <p className="text-sm font-medium text-blue-800">Mechanic assigned. Waiting for acceptance...</p>
        </Card>
      )}
      {activeRequest.status === "MECHANIC_ACCEPTED" && (
        <Card className="p-4 flex items-center gap-3 bg-blue-50 border-blue-200">
          <CheckCircle2 className="h-5 w-5 text-blue-600" />
          <p className="text-sm font-medium text-blue-800">Your mechanic has accepted the request!</p>
        </Card>
      )}
      {["ON_THE_WAY"].includes(activeRequest.status) && (
        <Card className="p-4 flex items-center gap-3 bg-orange-50 border-orange-200">
          <MapPin className="h-5 w-5 text-orange-600 animate-pulse" />
          <p className="text-sm font-medium text-orange-800">Your mechanic is on the way!</p>
        </Card>
      )}
      {activeRequest.status === "ARRIVED" && (
        <Card className="p-4 flex items-center gap-3 bg-orange-50 border-orange-200">
          <CheckCircle2 className="h-5 w-5 text-orange-600" />
          <p className="text-sm font-medium text-orange-800">Your mechanic has arrived!</p>
        </Card>
      )}
      {activeRequest.status === "SERVICE_STARTED" && (
        <Card className="p-4 flex items-center gap-3 bg-purple-50 border-purple-200">
          <Wrench className="h-5 w-5 text-purple-600" />
          <p className="text-sm font-medium text-purple-800">Service is in progress...</p>
        </Card>
      )}
      {activeRequest.status === "PAYMENT_PENDING" && (
        <Card className="p-4 flex items-center gap-3 bg-yellow-50 border-yellow-200">
          <CreditCard className="h-5 w-5 text-yellow-600" />
          <div className="flex-1">
            <p className="text-sm font-medium text-yellow-800">Service completed! Payment of ₹{activeRequest.invoice?.total} is pending.</p>
          </div>
          <button onClick={() => setShowPayment(true)} className="px-4 py-2 rounded-lg bg-yellow-600 text-white text-sm font-semibold hover:bg-yellow-700 transition">
            Pay Now
          </button>
        </Card>
      )}
      {activeRequest.status === "PAID" && !showRating && (
        <Card className="p-4 flex items-center gap-3 bg-green-50 border-green-200">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <p className="text-sm font-medium text-green-800 flex-1">Payment successful! Rate your experience.</p>
          <button onClick={() => setShowRating(true)} className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition">
            Rate Service
          </button>
        </Card>
      )}

      {/* Map */}
      <Card className="p-4">
        <MapView
          customerLocation={activeRequest.location}
          mechanicLocation={activeRequest.mechanicLocation}
          route={activeRequest.movementPath}
          height="350px"
        />
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Mechanic info */}
        <Card className="p-5">
          <h3 className="font-bold text-gray-900 mb-4">Mechanic Details</h3>
          {mechanic ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <Wrench className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">{mechanic.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {mechanic.verified && <Badge color="green"><ShieldCheck className="h-3 w-3" /> Verified</Badge>}
                    <span className="flex items-center gap-0.5 text-sm text-gray-600">
                      <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" /> {mechanic.rating}
                    </span>
                  </div>
                </div>
              </div>
              {activeRequest.distanceKm !== undefined && activeRequest.status === "ON_THE_WAY" && (
                <div className="flex gap-4 p-3 rounded-xl bg-orange-50">
                  <div className="flex items-center gap-1.5 text-orange-700">
                    <MapPin className="h-4 w-4" />
                    <span className="font-bold">{formatDistance(activeRequest.distanceKm)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-orange-700">
                    <Clock className="h-4 w-4" />
                    <span className="font-bold">ETA {formatEta(activeRequest.etaMins || 0)}</span>
                  </div>
                </div>
              )}
              <p className="text-sm text-gray-600">{mechanic.serviceVehicle}</p>
              <p className="text-sm text-gray-500">Expertise: {mechanic.expertise.join(", ")}</p>
              <div className="flex gap-2 pt-2">
                <a href={`tel:${mechanic.phone}`} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-50 text-blue-700 font-semibold text-sm hover:bg-blue-100 transition">
                  <Phone className="h-4 w-4" /> Call
                </a>
                <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold text-sm hover:bg-gray-200 transition">
                  <MessageSquare className="h-4 w-4" /> Message
                </button>
                <button onClick={shareLocation} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold text-sm hover:bg-gray-200 transition">
                  <Share2 className="h-4 w-4" /> Share
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No mechanic assigned yet.</p>
          )}
        </Card>

        {/* Request info */}
        <Card className="p-5">
          <h3 className="font-bold text-gray-900 mb-4">Request Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Vehicle</span><span className="font-semibold">{activeRequest.vehicle.brand} {activeRequest.vehicle.model}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Registration</span><span className="font-mono font-semibold">{activeRequest.vehicle.registrationNumber}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Issue</span><span className="font-semibold">{activeRequest.issueType}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Priority</span><span className="font-semibold">{activeRequest.priority}</span></div>
            <div className="pt-2 border-t border-gray-100">
              <p className="text-gray-500 mb-1">Description</p>
              <p className="text-gray-700">{activeRequest.description}</p>
            </div>
            <div className="pt-2 border-t border-gray-100">
              <p className="text-gray-500 mb-1">Location</p>
              <p className="text-gray-700 text-xs">{activeRequest.address}</p>
              <p className="text-gray-400 text-xs font-mono">{activeRequest.location.lat.toFixed(5)}, {activeRequest.location.lng.toFixed(5)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Timeline */}
      <Card className="p-5">
        <h3 className="font-bold text-gray-900 mb-4">Service Timeline</h3>
        <div className="space-y-1">
          {timelineOrder.map((status, i) => {
            const done = i < currentStatusIndex;
            const current = i === currentStatusIndex;
            return (
              <div key={status} className="flex items-center gap-3">
                <div className="flex flex-col items-center">
                  {done ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : current ? (
                    <div className="h-5 w-5 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-300" />
                  )}
                  {i < timelineOrder.length - 1 && <div className={`w-px h-6 ${done ? "bg-green-400" : "bg-gray-200"}`} />}
                </div>
                <span className={`text-sm ${done ? "text-gray-500" : current ? "font-bold text-blue-600" : "text-gray-400"}`}>
                  {timelineLabels[status]}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Invoice (when completed) */}
      {activeRequest.invoice && ["PAYMENT_PENDING", "PAID", "RATED"].includes(activeRequest.status) && (
        <Card className="p-5">
          <h3 className="font-bold text-gray-900 mb-4">Invoice</h3>
          <div className="space-y-2">
            {activeRequest.invoice.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-gray-600">{item.description}</span>
                <span className="font-semibold text-gray-900">₹{item.amount}</span>
              </div>
            ))}
            <div className="pt-3 border-t border-gray-200 flex justify-between">
              <span className="font-bold text-gray-900">Total</span>
              <span className="font-bold text-lg text-gray-900">₹{activeRequest.invoice.total}</span>
            </div>
            {activeRequest.payment && (
              <div className="mt-2 p-3 rounded-xl bg-green-50 text-sm">
                <p className="font-semibold text-green-700">Payment Completed</p>
                <p className="text-green-600 text-xs">Method: {activeRequest.payment.method} · Txn: {activeRequest.payment.transactionId}</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Cancel button */}
      {["SEARCHING", "MECHANIC_ASSIGNED", "MECHANIC_ACCEPTED", "ON_THE_WAY"].includes(activeRequest.status) && (
        <button
          onClick={() => { cancelRequest(activeRequest.requestId); navigate("/customer"); }}
          className="w-full py-2.5 rounded-xl border border-red-200 text-red-600 font-semibold hover:bg-red-50 transition flex items-center justify-center gap-2"
        >
          <X className="h-4 w-4" /> Cancel Request
        </button>
      )}

      {/* Payment Modal */}
      {showPayment && activeRequest.invoice && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <Card className="p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Payment</h2>
            <p className="text-sm text-gray-500 mb-4">Amount: ₹{activeRequest.invoice.total}</p>
            <div className="space-y-2 mb-4">
              {(["UPI", "Card", "Net Banking"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setPaymentMethod(m)}
                  className={`w-full p-3 rounded-xl border-2 text-left transition ${
                    paymentMethod === m ? "border-blue-500 bg-blue-50" : "border-gray-200"
                  }`}
                >
                  <span className="font-semibold text-sm">{m}</span>
                </button>
              ))}
            </div>
            {paying ? (
              <div className="flex items-center justify-center gap-2 py-4 text-blue-600">
                <Loader2 className="h-5 w-5 animate-spin" /> Processing Payment...
              </div>
            ) : (
              <button
                onClick={handlePay}
                className="w-full py-3 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 transition"
              >
                Pay ₹{activeRequest.invoice.total}
              </button>
            )}
            <button onClick={() => setShowPayment(false)} className="w-full mt-2 py-2 text-sm text-gray-500">
              Cancel
            </button>
          </Card>
        </div>
      )}

      {/* Rating Modal */}
      {showRating && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <Card className="p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-gray-900 mb-1">How was your experience?</h2>
            <p className="text-sm text-gray-500 mb-4">Rate your service with {mechanic?.name}</p>

            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">Overall Rating</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} onClick={() => setRatingForm({ ...ratingForm, overall: n })}>
                    <Star className={`h-8 w-8 ${n <= ratingForm.overall ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 mb-4">
              {[
                { key: "serviceQuality", label: "Service Quality" },
                { key: "punctuality", label: "Punctuality" },
                { key: "communication", label: "Communication" },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{label}</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button key={n} onClick={() => setRatingForm({ ...ratingForm, [key]: n })}>
                        <Star className={`h-5 w-5 ${(ratingForm as any)[key] >= n ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <textarea
              value={ratingForm.review}
              onChange={(e) => setRatingForm({ ...ratingForm, review: e.target.value })}
              placeholder="Write a review (optional)"
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none mb-4"
            />

            <button
              onClick={handleSubmitRating}
              className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition"
            >
              Submit Rating
            </button>
          </Card>
        </div>
      )}
    </div>
  );
}
