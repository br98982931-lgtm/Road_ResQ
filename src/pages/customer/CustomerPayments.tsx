import { useApp } from "@/context/AppContext";
import Card from "@/components/Card";
import { StatusBadge } from "@/components/StatusBadges";
import { CreditCard, CheckCircle2, Clock } from "lucide-react";

export default function CustomerPayments() {
  const { currentUser, requests } = useApp();
  if (!currentUser) return null;

  const myRequests = requests
    .filter((r) => r.customerId === currentUser.id && r.invoice)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const totalPaid = myRequests.filter((r) => r.payment).reduce((sum, r) => sum + (r.invoice?.total || 0), 0);
  const totalPending = myRequests.filter((r) => !r.payment && r.status === "PAYMENT_PENDING").reduce((sum, r) => sum + (r.invoice?.total || 0), 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Payments</h1>

      <div className="grid grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-green-50 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">₹{totalPaid}</p>
              <p className="text-xs text-gray-500">Total Paid</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-yellow-50 flex items-center justify-center">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">₹{totalPending}</p>
              <p className="text-xs text-gray-500">Pending</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <h3 className="font-bold text-gray-900 mb-4">Payment History</h3>
        {myRequests.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">No payments yet.</p>
        ) : (
          <div className="space-y-3">
            {myRequests.map((r) => (
              <div key={r.requestId} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                <div>
                  <p className="font-semibold text-sm text-gray-900">{r.requestId} · {r.issueType}</p>
                  <p className="text-xs text-gray-500">{new Date(r.createdAt).toLocaleDateString("en-IN")}</p>
                  {r.payment && (
                    <p className="text-xs text-green-600 mt-0.5">{r.payment.method} · {r.payment.transactionId}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm text-gray-900">₹{r.invoice?.total}</p>
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
