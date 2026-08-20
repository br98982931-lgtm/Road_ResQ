import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import Logo from "@/components/Logo";
import { Shield, User as UserIcon, Wrench, AlertCircle } from "lucide-react";

const roleCards = [
  {
    role: "customer",
    email: "customer@roadresq.com",
    label: "Customer / Driver",
    desc: "Request emergency roadside assistance",
    icon: UserIcon,
    color: "blue",
  },
  {
    role: "mechanic",
    email: "mechanic@roadresq.com",
    label: "Mechanic / Provider",
    desc: "Accept requests and provide service",
    icon: Wrench,
    color: "green",
  },
  {
    role: "admin",
    email: "admin@roadresq.com",
    label: "Admin / Operations",
    desc: "Monitor and manage all operations",
    icon: Shield,
    color: "gray",
  },
] as const;

export default function Login() {
  const { login } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const user = login(email, password);
    if (user) {
      navigate(`/${user.role}`);
    } else {
      setError("Invalid email or password. Try the demo accounts below.");
    }
  }

  function quickLogin(roleEmail: string) {
    setEmail(roleEmail);
    setPassword("RoadResQ@123");
    const user = login(roleEmail, "RoadResQ@123");
    if (user) navigate(`/${user.role}`);
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Hero left / form right on desktop */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Left hero */}
        <div className="lg:w-1/2 bg-gradient-to-br from-blue-700 via-blue-800 to-slate-900 text-white p-8 lg:p-16 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
          <div className="relative z-10">
            <Logo size="lg" />
          </div>
          <div className="relative z-10 mt-12 lg:mt-0">
            <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight">
              Roadside assistance,<br />under control.
            </h1>
            <p className="mt-4 text-blue-100 text-lg max-w-md">
              Break down anywhere. Get verified mechanics to your location with live tracking, transparent pricing, and secure payment.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {["Live GPS Tracking", "Verified Mechanics", "Transparent Pricing", "Secure Payment"].map((f) => (
                <span key={f} className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur text-sm font-medium border border-white/20">
                  {f}
                </span>
              ))}
            </div>
          </div>
          <p className="relative z-10 text-blue-200 text-sm mt-8"></p>
        </div>

        {/* Right form */}
        <div className="lg:w-1/2 flex items-center justify-center p-8 lg:p-16">
          <div className="w-full max-w-md">
            <div className="lg:hidden mb-8">
              <Logo size="md" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Sign in to continue</h2>
            <p className="text-gray-500 mt-1">Use a demo account or pick a role below.</p>

            <form onSubmit={submit} className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="customer@roadresq.com"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="RoadResQ@123"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  required
                />
              </div>
              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition shadow-lg shadow-blue-600/20"
              >
                Sign In
              </button>
            </form>

            <div className="mt-8">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Quick demo login</p>
              <div className="space-y-2.5">
                {roleCards.map((r) => {
                  const Icon = r.icon;
                  return (
                    <button
                      key={r.role}
                      onClick={() => quickLogin(r.email)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition text-left group"
                    >
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center bg-${r.color}-100 text-${r.color}-600 group-hover:scale-110 transition`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm">{r.label}</p>
                        <p className="text-xs text-gray-500 truncate">{r.desc}</p>
                      </div>
                      <span className="text-xs text-gray-400 font-mono">{r.email}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
