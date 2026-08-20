import { type ReactNode, useState } from "react";
import { Link, useLocation, useNavigate, Navigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import Logo from "@/components/Logo";
import type { UserRole } from "@/types";
import {
  LayoutDashboard,
  Car,
  Siren,
  ClipboardList,
  Clock,
  CreditCard,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  Bell,
  Wrench,
  Inbox,
  Wallet,
  Map,
  Users,
  Settings,
  ShieldCheck,
} from "lucide-react";

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
}

const navByRole: Record<UserRole, NavItem[]> = {
  customer: [
    { to: "/customer", label: "Dashboard", icon: LayoutDashboard },
    { to: "/customer/vehicles", label: "My Vehicles", icon: Car },
    { to: "/customer/emergency", label: "Emergency Assistance", icon: Siren },
    { to: "/customer/active", label: "Active Request", icon: Clock },
    { to: "/customer/history", label: "Service History", icon: ClipboardList },
    { to: "/customer/payments", label: "Payments", icon: CreditCard },
    { to: "/customer/profile", label: "Profile", icon: UserIcon },
  ],
  mechanic: [
    { to: "/mechanic", label: "Dashboard", icon: LayoutDashboard },
    { to: "/mechanic/incoming", label: "Incoming Requests", icon: Inbox },
    { to: "/mechanic/active", label: "Active Service", icon: Wrench },
    { to: "/mechanic/history", label: "Service History", icon: ClipboardList },
    { to: "/mechanic/earnings", label: "Earnings", icon: Wallet },
    { to: "/mechanic/profile", label: "Profile", icon: UserIcon },
  ],
  admin: [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { to: "/admin/live-map", label: "Live Operations", icon: Map },
    { to: "/admin/requests", label: "Request Management", icon: ClipboardList },
    { to: "/admin/mechanics", label: "Mechanic Management", icon: Users },
    { to: "/admin/settings", label: "Settings", icon: Settings },
  ],
};

const roleLabel: Record<UserRole, string> = {
  customer: "Customer",
  mechanic: "Mechanic",
  admin: "Admin",
};

const roleColor: Record<UserRole, string> = {
  customer: "blue",
  mechanic: "green",
  admin: "gray",
};

export default function RoleLayout({
  role,
  children,
}: {
  role: UserRole;
  children: ReactNode;
}) {
  const { currentUser, logout, notifications, markNotificationRead, markAllNotificationsRead } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  if (!currentUser || currentUser.role !== role) {
    return <Navigate to="/" replace />;
  }

  const navItems = navByRole[role];
  const myNotifications = notifications.filter((n) => n.role === role);
  const unreadCount = myNotifications.filter((n) => !n.read).length;

  function handleLogout() {
    logout();
    navigate("/");
  }

  const sidebar = (
    <div className="h-full flex flex-col bg-white border-r border-gray-200">
      <div className="p-5 border-b border-gray-100">
        <Logo size="sm" />
      </div>
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                active
                  ? `bg-${roleColor[role]}-50 text-${roleColor[role]}-700`
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-gray-100">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-gray-50">
          <div className={`h-9 w-9 rounded-full bg-${roleColor[role]}-100 flex items-center justify-center`}>
            <span className="text-sm font-bold text-${roleColor[role]}-700">
              {currentUser.name.charAt(0)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{currentUser.name}</p>
            <p className="text-xs text-gray-500">{roleLabel[role]}</p>
          </div>
          <button onClick={handleLogout} className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition" title="Logout">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop sidebar */}
      <div className="hidden lg:block w-64 shrink-0 fixed inset-y-0 left-0">{sidebar}</div>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-64 shrink-0">{sidebar}</div>
          <div className="flex-1 bg-black/30" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-gray-200 px-4 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="lg:hidden">
              <Logo size="sm" />
            </div>
            <div className="hidden lg:block">
              <h2 className="text-lg font-bold text-gray-900">
                {navItems.find((n) => n.to === location.pathname)?.label || "RoadResQ"}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotifOpen(!notifOpen);
                  if (!notifOpen && unreadCount > 0) markAllNotificationsRead(role);
                }}
                className="relative p-2 rounded-lg text-gray-600 hover:bg-gray-100"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white rounded-xl shadow-xl border border-gray-200 z-50">
                  <div className="p-3 border-b border-gray-100 flex items-center justify-between">
                    <span className="font-semibold text-sm text-gray-900">Notifications</span>
                    <button onClick={() => setNotifOpen(false)}>
                      <X className="h-4 w-4 text-gray-400" />
                    </button>
                  </div>
                  {myNotifications.length === 0 ? (
                    <p className="p-4 text-sm text-gray-500 text-center">No notifications yet.</p>
                  ) : (
                    myNotifications.slice(0, 15).map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          markNotificationRead(n.id);
                          if (n.requestId) {
                            setNotifOpen(false);
                            if (role === "customer") navigate(`/customer/active`);
                            if (role === "mechanic") navigate(`/mechanic/active`);
                            if (role === "admin") navigate(`/admin/requests`);
                          }
                        }}
                        className="p-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer"
                      >
                        <p className="text-sm text-gray-700">{n.message}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(n.createdAt).toLocaleString("en-IN")}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-${roleColor[role]}-50 text-${roleColor[role]}-700 text-xs font-semibold`}>
              <ShieldCheck className="h-3.5 w-3.5" />
              {roleLabel[role]}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
