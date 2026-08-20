import { useApp } from "@/context/AppContext";
import Card from "@/components/Card";
import { Wallet, TrendingUp, CheckCircle2, Star } from "lucide-react";

export default function MechanicEarnings() {
  const { currentUser, mechanics, requests } = useApp();
  if (!currentUser) return null;
  const myProfile = mechanics.find((m) => m.email === currentUser.email);
  if (!myProfile) return null;

  const myJobs = requests.filter((r) => r.mechanicId === myProfile.id);
  const paidJobs = myJobs.filter((r) => r.payment);
  const totalEarned = paidJobs.reduce((sum, r) => sum + (r.invoice?.total || 0), 0);
  const pendingAmount = myJobs
    .filter((r) => r.status === "PAYMENT_PENDING")
    .reduce((sum, r) => sum + (r.invoice?.total || 0), 0);
  const todayJobs = paidJobs.filter(
    (r) => r.payment && new Date(r.payment.paidAt).toDateString() === new Date().toDateString()
  );
  const todayEarnings = todayJobs.reduce((sum, r) => sum + (r.invoice?.total || 0), 0);
  const avgRating = myProfile.rating;

  const stats = [
    { label: "Total Earnings", value: `₹${totalEarned}`, icon: Wallet, color: "green" },
    { label: "Today's Earnings", value: `₹${todayEarnings}`, icon: TrendingUp, color: "blue" },
    { label: "Pending Payment", value: `₹${pendingAmount}`, icon: CheckCircle2, color: "orange" },
    { label: "Rating", value: avgRating, icon: Star, color: "yellow" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Earnings</h1>

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

      <Card className="p-5">
        <h3 className="font-bold text-gray-900 mb-4">Payment History</h3>
        {paidJobs.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">No payments received yet.</p>
        ) : (
          <div className="space-y-3">
            {paidJobs.map((r) => (
              <div key={r.requestId} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                <div>
                  <p className="font-semibold text-sm text-gray-900">{r.requestId} · {r.issueType}</p>
                  <p className="text-xs text-gray-500">{r.customerName}</p>
                  {r.payment && (
                    <p className="text-xs text-green-600 mt-0.5">{r.payment.method} · {r.payment.transactionId}</p>
                  )}
                </div>
                <p className="font-bold text-sm text-green-700">+₹{r.invoice?.total}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
