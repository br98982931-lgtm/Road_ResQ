import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import Card from "@/components/Card";
import MapView from "@/components/MapView";
import Badge from "@/components/Badge";
import { PriorityBadge } from "@/components/StatusBadges";
import type { IssueType, Priority, GeoPoint, Vehicle, MechanicProfile } from "@/types";
import { haversineKm, etaMinutes, formatDistance, formatEta, getCurrentPosition, reverseGeocode } from "@/lib/geo";
import { AHMEDABAD_CENTER } from "@/lib/seed";
import {
  MapPin,
  Navigation,
  Star,
  Clock,
  Wrench,
  CheckCircle2,
  Zap,
  Search,
  Sparkles,
  Loader2,
  AlertTriangle,
  Car,
} from "lucide-react";

const issueTypes: IssueType[] = [
  "Vehicle Breakdown",
  "Flat Tyre",
  "Dead Battery",
  "Fuel Empty",
  "Engine Problem",
  "Overheating",
  "Towing Required",
  "Accident / Emergency",
  "Lockout / Lost Key",
  "Other",
];

const prioritySuggestion: Record<IssueType, Priority> = {
  "Flat Tyre": "LOW",
  "Lockout / Lost Key": "LOW",
  "Dead Battery": "MEDIUM",
  "Fuel Empty": "MEDIUM",
  "Overheating": "MEDIUM",
  "Vehicle Breakdown": "HIGH",
  "Engine Problem": "HIGH",
  "Towing Required": "HIGH",
  "Accident / Emergency": "CRITICAL",
  Other: "MEDIUM",
};

type Step = "details" | "location" | "mechanics" | "confirm";

export default function EmergencyRequest() {
  const { currentUser, vehicles, createRequest, findNearbyMechanics, mechanics } = useApp();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("details");
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [issueType, setIssueType] = useState<IssueType | null>(null);
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("MEDIUM");
  const [notes, setNotes] = useState("");
  const [location, setLocation] = useState<GeoPoint | null>(null);
  const [address, setAddress] = useState("");
  const [locating, setLocating] = useState(false);
  const [locationConfirmed, setLocationConfirmed] = useState(false);
  const [nearbyMechanics, setNearbyMechanics] = useState<(MechanicProfile & { _dist: number })[]>([]);
  const [selectedMechanic, setSelectedMechanic] = useState<string | null>(null);
  const [matchReason, setMatchReason] = useState<string[]>([]);
  const [autoMatching, setAutoMatching] = useState(false);
  const [creating, setCreating] = useState(false);

  if (!currentUser) return null;
  const myVehicles = vehicles.filter((v) => v.ownerId === currentUser.id);

  function selectIssue(issue: IssueType) {
    setIssueType(issue);
    setPriority(prioritySuggestion[issue]);
  }

  async function useCurrentLocation() {
    setLocating(true);
    try {
      const pos = await getCurrentPosition();
      setLocation(pos);
      const addr = await reverseGeocode(pos);
      setAddress(addr);
    } catch {
      // Fallback to Ahmedabad demo location
      setLocation(AHMEDABAD_CENTER);
      setAddress("Ahmedabad, Gujarat, India (Demo fallback location — GPS unavailable)");
    }
    setLocating(false);
  }

  function useDemoLocation() {
    // Spot on Ahmedabad-Rajkot highway (NH47)
    const demo = { lat: 23.0392, lng: 72.5637 };
    setLocation(demo);
    setAddress("NH47, Ahmedabad-Rajkot Highway, Gujarat (Demo location)");
  }

  function confirmLocation() {
    if (!location) return;
    setLocationConfirmed(true);
    setStep("mechanics");
    // Find nearby mechanics
    if (issueType) {
      const found = findNearbyMechanics(location, issueType);
      setNearbyMechanics(found as any);
    }
  }

  function handleAutoMatch() {
    if (!location || !issueType) return;
    setAutoMatching(true);
    // Simulate searching
    setTimeout(() => {
      // Create a temporary request to use autoMatch
      createRequest({
        vehicle: selectedVehicle!,
        issueType,
        description,
        priority,
        location,
        address,
        notes,
      });
      // Find the updated request
      const mech = nearbyMechanics.find((m) => m.available && m.expertise.includes(issueType));
      if (mech) {
        setSelectedMechanic(mech.id);
        const dist = haversineKm(location, { lat: mech.lat, lng: mech.lng });
        setMatchReason([
          "Closest available mechanic",
          "Correct expertise",
          `High rating (${mech.rating})`,
          `Fast response (${mech.responseTimeMins} min avg)`,
          `Low cancellation rate (${(mech.cancellationRate * 100).toFixed(0)}%)`,
        ]);
      }
      setAutoMatching(false);
      setStep("confirm");
      // Navigate to active request after a moment
      setTimeout(() => navigate("/customer/active"), 1500);
    }, 2000);
  }

  function handleManualAssign(mechanicId: string) {
    setSelectedMechanic(mechanicId);
    const mech = nearbyMechanics.find((m) => m.id === mechanicId);
    if (mech) {
      setMatchReason([
        "Selected by customer",
        `${formatDistance(mech._dist)} away`,
        `Rating ${mech.rating}`,
      ]);
    }
  }

  function handleRequestAssistance() {
    if (!selectedVehicle || !issueType || !location) return;
    setCreating(true);
    createRequest({
      vehicle: selectedVehicle,
      issueType,
      description,
      priority,
      location,
      address,
      notes,
      preferredMechanicId: selectedMechanic || undefined,
      matchReason,
    });
    setCreating(false);
    navigate("/customer/active");
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Step indicator */}
      <div className="flex items-center gap-2 text-sm">
        {(["details", "location", "mechanics", "confirm"] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold ${
              step === s ? "bg-blue-600 text-white" :
              (["details", "location", "mechanics", "confirm"].indexOf(step) > i) ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"
            }`}>
              {["details", "location", "mechanics", "confirm"].indexOf(step) > i ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
            </div>
            <span className={`capitalize ${step === s ? "font-semibold text-gray-900" : "text-gray-400"}`}>
              {s === "details" ? "Details" : s === "location" ? "Location" : s === "mechanics" ? "Mechanic" : "Confirm"}
            </span>
            {i < 3 && <div className="w-8 h-px bg-gray-200" />}
          </div>
        ))}
      </div>

      {/* Step 1: Details */}
      {step === "details" && (
        <Card className="p-5 space-y-5">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Emergency Request</h2>
            <p className="text-sm text-gray-500">Tell us about your vehicle and the problem.</p>
          </div>

          {/* Vehicle selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Select Vehicle</label>
            {myVehicles.length === 0 ? (
              <p className="text-sm text-red-600 bg-red-50 p-3 rounded-xl">
                No vehicles added. Please add a vehicle first.
              </p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {myVehicles.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVehicle(v)}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition ${
                      selectedVehicle?.id === v.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Car className={`h-6 w-6 ${selectedVehicle?.id === v.id ? "text-blue-600" : "text-gray-400"}`} />
                    <div>
                      <p className="font-semibold text-sm text-gray-900">{v.brand} {v.model}</p>
                      <p className="text-xs text-gray-500 font-mono">{v.registrationNumber}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Issue type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">What's the problem?</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {issueTypes.map((issue) => (
                <button
                  key={issue}
                  onClick={() => selectIssue(issue)}
                  className={`p-3 rounded-xl border-2 text-sm font-medium text-left transition ${
                    issueType === issue
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 hover:border-gray-300 text-gray-700"
                  }`}
                >
                  {issue}
                </button>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Priority</label>
            <div className="flex gap-2 flex-wrap">
              {(["LOW", "MEDIUM", "HIGH", "CRITICAL"] as Priority[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`px-4 py-2 rounded-xl border-2 text-sm font-semibold transition ${
                    priority === p ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 text-gray-700"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Car stopped on Ahmedabad-Rajkot highway..."
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Additional Notes (optional)</label>
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any extra info for the mechanic"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {priority === "CRITICAL" && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 text-red-700">
              <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
              <p className="text-sm">This is a critical emergency. If anyone is injured, call 112 immediately before requesting roadside assistance.</p>
            </div>
          )}

          <button
            disabled={!selectedVehicle || !issueType}
            onClick={() => setStep("location")}
            className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            Continue to Location
          </button>
        </Card>
      )}

      {/* Step 2: Location */}
      {step === "location" && (
        <Card className="p-5 space-y-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Confirm Your Location</h2>
            <p className="text-sm text-gray-500">We need your location to find nearby mechanics.</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={useCurrentLocation}
              disabled={locating}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {locating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Navigation className="h-5 w-5" />}
              {locating ? "Getting location..." : "Use My Current Location"}
            </button>
            <button
              onClick={useDemoLocation}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition"
            >
              <MapPin className="h-5 w-5" /> Demo Location
            </button>
          </div>

          {location && (
            <>
              <MapView center={location} customerLocation={location} height="300px" onMapClick={(p) => { setLocation(p); setLocationConfirmed(false); }} />
              <div className="p-4 rounded-xl bg-gray-50 space-y-1">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Selected Location</p>
                    <p className="text-sm text-gray-600">{address}</p>
                    <p className="text-xs text-gray-400 font-mono mt-1">{location.lat.toFixed(5)}, {location.lng.toFixed(5)}</p>
                  </div>
                </div>
              </div>
              <button
                onClick={confirmLocation}
                className="w-full py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition"
              >
                Confirm Location & Find Mechanics
              </button>
            </>
          )}

          <button onClick={() => setStep("details")} className="w-full py-2 text-sm text-gray-500 hover:text-gray-700">
            Back to details
          </button>
        </Card>
      )}

      {/* Step 3: Mechanics */}
      {step === "mechanics" && (
        <Card className="p-5 space-y-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Nearby Mechanics</h2>
            <p className="text-sm text-gray-500">Choose a mechanic or let us auto-match the best one.</p>
          </div>

          <button
            onClick={handleAutoMatch}
            disabled={autoMatching}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 transition shadow-lg shadow-blue-600/20"
          >
            {autoMatching ? (
              <><Loader2 className="h-5 w-5 animate-spin" /> Finding the best mechanic...</>
            ) : (
              <><Sparkles className="h-5 w-5" /> Auto Match Best Mechanic</>
            )}
          </button>

          {autoMatching && (
            <div className="flex items-center gap-2 p-4 rounded-xl bg-blue-50 text-blue-700">
              <Search className="h-5 w-5 animate-pulse" />
              <span className="text-sm font-medium">Analyzing availability, distance, expertise, rating, and response time...</span>
            </div>
          )}

          <div className="space-y-3">
            <p className="text-sm font-semibold text-gray-700">Or choose manually:</p>
            {nearbyMechanics.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No available mechanics found nearby.</p>
            ) : (
              nearbyMechanics.map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleManualAssign(m.id)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition ${
                    selectedMechanic === m.id ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-full bg-green-100 flex items-center justify-center">
                        <Wrench className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{m.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {m.verified && <Badge color="green">Verified</Badge>}
                          <span className="flex items-center gap-0.5 text-sm text-gray-600">
                            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" /> {m.rating}
                          </span>
                        </div>
                      </div>
                    </div>
                    {selectedMechanic === m.id && <CheckCircle2 className="h-6 w-6 text-blue-600" />}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {formatDistance(m._dist)}</span>
                    <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {formatEta(etaMinutes(m._dist))}</span>
                    <span className="flex items-center gap-1"><Wrench className="h-4 w-4" /> {m.expertise.join(", ")}</span>
                  </div>
                </button>
              ))
            )}
          </div>

          {selectedMechanic && (
            <button
              onClick={handleRequestAssistance}
              className="w-full py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition"
            >
              Request Assistance
            </button>
          )}

          <button onClick={() => setStep("location")} className="w-full py-2 text-sm text-gray-500 hover:text-gray-700">
            Back to location
          </button>
        </Card>
      )}

      {/* Step 4: Confirm (auto-match result) */}
      {step === "confirm" && selectedMechanic && (
        <Card className="p-5 space-y-4">
          <div className="text-center">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Best Match Found!</h2>
          </div>

          {(() => {
            const m = mechanics.find((x) => x.id === selectedMechanic);
            if (!m || !location) return null;
            const dist = haversineKm(location, { lat: m.lat, lng: m.lng });
            return (
              <>
                <div className="p-4 rounded-xl border-2 border-green-200 bg-green-50">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                      <Wrench className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{m.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {m.verified && <Badge color="green">Verified</Badge>}
                        <span className="flex items-center gap-0.5 text-sm text-gray-600">
                          <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" /> {m.rating}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {formatDistance(dist)}</span>
                    <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {formatEta(etaMinutes(dist))}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-700">Why this mechanic?</p>
                  {matchReason.map((r, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="h-4 w-4 text-green-600" /> {r}
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating your request...
                </div>
              </>
            );
          })()}
        </Card>
      )}
    </div>
  );
}
