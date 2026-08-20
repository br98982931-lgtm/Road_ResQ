import { useApp } from "@/context/AppContext";
import Card from "@/components/Card";
import { StatusBadge } from "@/components/StatusBadges";
import { Car, Star } from "lucide-react";

export default function CustomerHistory() {
  const { currentUser, requests } = useApp();
  if (!currentUser) return null;

  const myRequests = requests
    .filter((r) => r.customerId === currentUser.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Service History</h1>

      {myRequests.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-500">No service requests yet.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {myRequests.map((r) => (
            <Card key={r.requestId} className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-blue-600">{r.requestId}</span>
                    <StatusBadge status={r.status} />
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{r.issueType}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Car className="h-3.5 w-3.5" /> {r.vehicle.brand} {r.vehicle.model} · {r.vehicle.registrationNumber}
                  </p>
                  <p className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleString("en-IN")}</p>
                </div>
                <div className="text-right space-y-1">
                  {r.invoice && <p className="font-bold text-gray-900">₹{r.invoice.total}</p>}
                  {r.rating && (
                    <div className="flex items-center gap-0.5 justify-end">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star key={n} className={`h-3.5 w-3.5 ${n <= r.rating!.overall ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
