import { useApp } from "@/context/AppContext";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import { Settings, Database, Wrench, ShieldCheck, Zap } from "lucide-react";

export default function AdminSettings() {
  const { requests, mechanics, vehicles } = useApp();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500">System configuration and integrations.</p>
      </div>

      <Card className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <Database className="h-5 w-5 text-blue-600" />
          <h3 className="font-bold text-gray-900">Data Overview</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-gray-50 text-center">
            <p className="text-2xl font-bold text-gray-900">{requests.length}</p>
            <p className="text-xs text-gray-500">Requests</p>
          </div>
          <div className="p-3 rounded-xl bg-gray-50 text-center">
            <p className="text-2xl font-bold text-gray-900">{mechanics.length}</p>
            <p className="text-xs text-gray-500">Mechanics</p>
          </div>
          <div className="p-3 rounded-xl bg-gray-50 text-center">
            <p className="text-2xl font-bold text-gray-900">{vehicles.length}</p>
            <p className="text-xs text-gray-500">Vehicles</p>
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <Zap className="h-5 w-5 text-orange-600" />
          <h3 className="font-bold text-gray-900">Odoo Integration (Ready)</h3>
          <Badge color="green">Architecture Ready</Badge>
        </div>
        <p className="text-sm text-gray-600 mb-3">
          RoadResQ is designed to connect to Odoo as the operational backend. The data layer is structured for:
        </p>
        <div className="space-y-2 text-sm">
          {[
            "Customers → Odoo res.partner",
            "Mechanics → Odoo field service technicians",
            "Vehicles → Odoo fleet.vehicle",
            "Service Requests → Odoo field service tasks",
            "Invoices → Odoo account.move",
            "Payments → Odoo payment transactions",
            "Ratings → Odoo helpdesk ratings",
          ].map((item) => (
            <div key={item} className="flex items-center gap-2 text-gray-700">
              <Wrench className="h-3.5 w-3.5 text-gray-400" /> {item}
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 rounded-xl bg-blue-50 text-sm text-blue-700">
          <p className="font-semibold">Future Architecture:</p>
          <p className="text-xs mt-1">Frontend → API → Odoo → Custom roadside_assistance module → Odoo ORM / PostgreSQL → Fleet, Field Service, Accounting, Inventory, Payment, Helpdesk</p>
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex items-center gap-3 mb-3">
          <ShieldCheck className="h-5 w-5 text-green-600" />
          <h3 className="font-bold text-gray-900">System Status</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
          <span className="text-sm text-gray-700">All systems operational</span>
        </div>
      </Card>
    </div>
  );
}
