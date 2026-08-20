import { useState } from "react";
import { useApp } from "@/context/AppContext";
import Card from "@/components/Card";
import type { Vehicle, VehicleType, FuelType } from "@/types";
import { Car, Plus, Pencil, Trash2, Check, X } from "lucide-react";

const vehicleTypes: VehicleType[] = ["Car", "Bike", "SUV", "Truck", "Other"];
const fuelTypes: FuelType[] = ["Petrol", "Diesel", "CNG", "Electric", "Hybrid"];

export default function CustomerVehicles() {
  const { currentUser, vehicles, addVehicle, updateVehicle, deleteVehicle } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    type: "Car" as VehicleType,
    brand: "",
    model: "",
    registrationNumber: "",
    fuelType: "Petrol" as FuelType,
    year: new Date().getFullYear(),
    nickname: "",
  });

  if (!currentUser) return null;
  const myVehicles = vehicles.filter((v) => v.ownerId === currentUser.id);

  function resetForm() {
    setForm({
      type: "Car",
      brand: "",
      model: "",
      registrationNumber: "",
      fuelType: "Petrol",
      year: new Date().getFullYear(),
      nickname: "",
    });
    setEditingId(null);
    setShowForm(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editingId) {
      updateVehicle(editingId, form);
    } else {
      addVehicle(form);
    }
    resetForm();
  }

  function startEdit(v: Vehicle) {
    setForm({
      type: v.type,
      brand: v.brand,
      model: v.model,
      registrationNumber: v.registrationNumber,
      fuelType: v.fuelType,
      year: v.year,
      nickname: v.nickname || "",
    });
    setEditingId(v.id);
    setShowForm(true);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Vehicles</h1>
          <p className="text-gray-500 text-sm">Manage your registered vehicles</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
          >
            <Plus className="h-4 w-4" /> Add Vehicle
          </button>
        )}
      </div>

      {showForm && (
        <Card className="p-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Vehicle Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as VehicleType })}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {vehicleTypes.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nickname (optional)</label>
                <input
                  value={form.nickname}
                  onChange={(e) => setForm({ ...form, nickname: e.target.value })}
                  placeholder="Daily Driver"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Brand</label>
                <input
                  required
                  value={form.brand}
                  onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  placeholder="Honda"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Model</label>
                <input
                  required
                  value={form.model}
                  onChange={(e) => setForm({ ...form, model: e.target.value })}
                  placeholder="City"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Registration Number</label>
                <input
                  required
                  value={form.registrationNumber}
                  onChange={(e) => setForm({ ...form, registrationNumber: e.target.value.toUpperCase() })}
                  placeholder="GJ01AB1234"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none uppercase"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Fuel Type</label>
                <select
                  value={form.fuelType}
                  onChange={(e) => setForm({ ...form, fuelType: e.target.value as FuelType })}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {fuelTypes.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Year</label>
                <input
                  type="number"
                  required
                  value={form.year}
                  onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) })}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition">
                <Check className="h-4 w-4" /> {editingId ? "Update" : "Add"} Vehicle
              </button>
              <button type="button" onClick={resetForm} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition">
                <X className="h-4 w-4" /> Cancel
              </button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        {myVehicles.length === 0 && !showForm && (
          <Card className="p-8 col-span-2 text-center">
            <Car className="h-10 w-10 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">No vehicles added yet. Add one to get started.</p>
          </Card>
        )}
        {myVehicles.map((v) => (
          <Card key={v.id} className="p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Car className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">{v.brand} {v.model}</p>
                  <p className="text-sm text-gray-500">{v.nickname}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => startEdit(v)} className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition">
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={() => deleteVehicle(v.id)} className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <div className="p-2 rounded-lg bg-gray-50">
                <p className="text-xs text-gray-400">Registration</p>
                <p className="font-mono font-semibold text-gray-700">{v.registrationNumber}</p>
              </div>
              <div className="p-2 rounded-lg bg-gray-50">
                <p className="text-xs text-gray-400">Type</p>
                <p className="font-semibold text-gray-700">{v.type}</p>
              </div>
              <div className="p-2 rounded-lg bg-gray-50">
                <p className="text-xs text-gray-400">Fuel</p>
                <p className="font-semibold text-gray-700">{v.fuelType}</p>
              </div>
              <div className="p-2 rounded-lg bg-gray-50">
                <p className="text-xs text-gray-400">Year</p>
                <p className="font-semibold text-gray-700">{v.year}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
