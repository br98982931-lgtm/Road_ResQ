import { useApp } from "@/context/AppContext";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import { Wrench, Mail, Phone, Star, ShieldCheck, Car, Clock, TrendingDown } from "lucide-react";

export default function MechanicProfile() {
  const { currentUser, mechanics } = useApp();
  if (!currentUser) return null;
  const myProfile = mechanics.find((m) => m.email === currentUser.email);
  if (!myProfile) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Profile</h1>

      <Card className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
            <Wrench className="h-8 w-8 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{myProfile.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              {myProfile.verified && <Badge color="green"><ShieldCheck className="h-3 w-3" /> Verified</Badge>}
              <span className="flex items-center gap-0.5 text-sm text-gray-600">
                <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" /> {myProfile.rating}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
            <Mail className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-400">Email</p>
              <p className="text-sm font-semibold text-gray-700">{myProfile.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
            <Phone className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-400">Phone</p>
              <p className="text-sm font-semibold text-gray-700">{myProfile.phone}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
            <Car className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-400">Service Vehicle</p>
              <p className="text-sm font-semibold text-gray-700">{myProfile.serviceVehicle}</p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="font-bold text-gray-900 mb-4">Performance Stats</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-gray-50">
            <p className="text-xs text-gray-400">Completed Services</p>
            <p className="text-lg font-bold text-gray-900">{myProfile.completedServices}</p>
          </div>
          <div className="p-3 rounded-xl bg-gray-50">
            <p className="text-xs text-gray-400">Rating</p>
            <p className="text-lg font-bold text-gray-900 flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" /> {myProfile.rating}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-gray-50">
            <p className="text-xs text-gray-400">Avg Response Time</p>
            <p className="text-lg font-bold text-gray-900 flex items-center gap-1">
              <Clock className="h-4 w-4 text-gray-400" /> {myProfile.responseTimeMins} min
            </p>
          </div>
          <div className="p-3 rounded-xl bg-gray-50">
            <p className="text-xs text-gray-400">Cancellation Rate</p>
            <p className="text-lg font-bold text-gray-900 flex items-center gap-1">
              <TrendingDown className="h-4 w-4 text-gray-400" /> {(myProfile.cancellationRate * 100).toFixed(0)}%
            </p>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-xs text-gray-400 mb-2">Expertise Areas</p>
          <div className="flex flex-wrap gap-2">
            {myProfile.expertise.map((e) => (
              <Badge key={e} color="blue">{e}</Badge>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
