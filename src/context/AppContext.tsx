import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type {
  User,
  Vehicle,
  MechanicProfile,
  ServiceRequest,
  AppNotification,
  UserRole,
  GeoPoint,
  IssueType,
  Priority,
  ServiceItem,
  Payment as PaymentType,
  Rating,
} from "@/types";
import {
  DEMO_USERS,
  DEMO_VEHICLES,
  DEMO_MECHANICS,
  DEMO_REQUESTS,
  DEMO_NOTIFICATIONS,
} from "@/lib/seed";
import { haversineKm, etaMinutes, generatePath } from "@/lib/geo";

const STORAGE_KEY = "roadresq_state_v1";
const DISPATCH_OFFER_TIMEOUT_MS = 30_000;

interface PersistShape {
  users: User[];
  vehicles: Vehicle[];
  mechanics: MechanicProfile[];
  requests: ServiceRequest[];
  notifications: AppNotification[];
  requestCounter: number;
}

interface AppState {
  currentUser: User | null;
  users: User[];
  vehicles: Vehicle[];
  mechanics: MechanicProfile[];
  requests: ServiceRequest[];
  notifications: AppNotification[];
  login: (email: string, password: string) => User | null;
  logout: () => void;
  addVehicle: (v: Omit<Vehicle, "id" | "ownerId">) => void;
  updateVehicle: (id: string, v: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;
  createRequest: (input: {
    vehicle: Vehicle;
    issueType: IssueType;
    description: string;
    priority: Priority;
    location: GeoPoint;
    address: string;
    notes?: string;
    preferredMechanicId?: string;
    matchReason?: string[];
  }) => ServiceRequest;
  findNearbyMechanics: (location: GeoPoint, issueType: IssueType) => MechanicProfile[];
  assignMechanic: (requestId: string, mechanicId: string, reason: string[]) => void;
  autoMatch: (requestId: string) => void;
  acceptRequest: (requestId: string) => void;
  rejectRequest: (requestId: string) => void;
  startNavigation: (requestId: string) => void;
  markOnTheWay: (requestId: string) => void;
  advanceMechanic: (requestId: string) => void;
  markArrived: (requestId: string) => void;
  startService: (requestId: string) => void;
  addServiceItem: (requestId: string, item: Omit<ServiceItem, "id">) => void;
  completeService: (requestId: string) => void;
  payRequest: (requestId: string, method: PaymentType["method"]) => void;
  rateRequest: (requestId: string, rating: Omit<Rating, "ratedAt">) => void;
  cancelRequest: (requestId: string) => void;
  toggleMechanicAvailability: (mechanicId: string) => void;
  verifyMechanic: (mechanicId: string) => void;
  reassignMechanic: (requestId: string, mechanicId: string) => void;
  setMechanicLocation: (mechanicId: string, loc: GeoPoint) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: (role: UserRole) => void;
}

const AppContext = createContext<AppState | null>(null);

function loadState(): PersistShape {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as PersistShape;
  } catch {
    // ignore
  }
  return {
    users: DEMO_USERS,
    vehicles: DEMO_VEHICLES,
    mechanics: DEMO_MECHANICS,
    requests: DEMO_REQUESTS,
    notifications: DEMO_NOTIFICATIONS,
    requestCounter: 1000,
  };
}

const ISSUE_BASE_COST: Record<IssueType, number> = {
  "Vehicle Breakdown": 250,
  "Flat Tyre": 200,
  "Dead Battery": 300,
  "Fuel Empty": 350,
  "Engine Problem": 400,
  Overheating: 250,
  "Towing Required": 500,
  "Accident / Emergency": 600,
  "Lockout / Lost Key": 350,
  Other: 250,
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistShape>(loadState);
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const raw = localStorage.getItem("roadresq_current_user");
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    if (currentUser) localStorage.setItem("roadresq_current_user", JSON.stringify(currentUser));
    else localStorage.removeItem("roadresq_current_user");
  }, [currentUser]);

  function pushNotification(n: Omit<AppNotification, "id" | "createdAt" | "read">) {
    setState((s) => ({
      ...s,
      notifications: [
        {
          ...n,
          id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          createdAt: new Date().toISOString(),
          read: false,
        },
        ...s.notifications,
      ].slice(0, 200),
    }));
  }

  function updateRequest(requestId: string, patch: Partial<ServiceRequest>) {
    setState((s) => ({
      ...s,
      requests: s.requests.map((r) =>
        r.requestId === requestId ? { ...r, ...patch } : r
      ),
    }));
  }

  const login: AppState["login"] = (email, password) => {
    const user = state.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (user) {
      setCurrentUser(user);
      return user;
    }
    return null;
  };

  const logout = () => setCurrentUser(null);

  function createNotification(
    notification: Omit<AppNotification, "id" | "createdAt" | "read">
  ): AppNotification {
    return {
      ...notification,
      id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString(),
      read: false,
    };
  }

  function chooseMechanic(
    request: ServiceRequest,
    mechanics: MechanicProfile[],
    excludedIds: string[] = []
  ) {
    return mechanics
      .filter(
        (mechanic) =>
          mechanic.available &&
          !mechanic.busy &&
          mechanic.expertise.includes(request.issueType) &&
          !excludedIds.includes(mechanic.id)
      )
      .map((mechanic) => ({
        mechanic,
        distance: haversineKm(request.location, {
          lat: mechanic.lat,
          lng: mechanic.lng,
        }),
      }))
      .sort(
        (a, b) =>
          a.distance - b.distance ||
          b.mechanic.rating - a.mechanic.rating ||
          a.mechanic.responseTimeMins - b.mechanic.responseTimeMins
      )[0];
  }

  function dispatchRequest(
    requestId: string,
    preferredMechanicId?: string,
    preferredReason?: string[]
  ) {
    setState((s) => {
      const request = s.requests.find((item) => item.requestId === requestId);
      if (!request || !["SEARCHING", "REJECTED"].includes(request.status)) return s;

      const attemptedIds = request.attemptedMechanicIds || [];
      const preferred = preferredMechanicId
        ? s.mechanics.find(
            (mechanic) =>
              mechanic.id === preferredMechanicId &&
              mechanic.available &&
              !mechanic.busy &&
              mechanic.expertise.includes(request.issueType)
          )
        : undefined;
      const selected = preferred
        ? {
            mechanic: preferred,
            distance: haversineKm(request.location, {
              lat: preferred.lat,
              lng: preferred.lng,
            }),
          }
        : chooseMechanic(request, s.mechanics, attemptedIds);
      const nextAttemptedIds = selected
        ? [...new Set([...attemptedIds, selected.mechanic.id])]
        : attemptedIds;
      const expiresAt = new Date(Date.now() + DISPATCH_OFFER_TIMEOUT_MS).toISOString();

      if (!selected) {
        return {
          ...s,
          requests: s.requests.map((item) =>
            item.requestId === requestId
              ? {
                  ...item,
                  status: "SEARCHING",
                  mechanicId: undefined,
                  mechanicLocation: undefined,
                  dispatchExpiresAt: expiresAt,
                }
              : item
          ),
          notifications: [
            createNotification({
              role: "admin",
              message: `No suitable mechanic is currently available for ${requestId}.`,
              requestId,
            }),
            ...s.notifications,
          ].slice(0, 200),
        };
      }

      const { mechanic, distance } = selected;
      const reasons = [
        "Nearest available mechanic",
        "Correct expertise",
        `High rating (${mechanic.rating})`,
        `Fast response (${mechanic.responseTimeMins} min avg)`,
      ];
      return {
        ...s,
        mechanics: s.mechanics.map((item) =>
          item.id === mechanic.id ? { ...item, busy: true } : item
        ),
        requests: s.requests.map((item) =>
          item.requestId === requestId
            ? {
                ...item,
                mechanicId: mechanic.id,
                attemptedMechanicIds: nextAttemptedIds,
                mechanicLocation: { lat: mechanic.lat, lng: mechanic.lng },
                distanceKm: distance,
                etaMins: etaMinutes(distance),
                status: "MECHANIC_ASSIGNED",
                dispatchExpiresAt: expiresAt,
                matchReason: preferredReason?.length ? preferredReason : reasons,
                movementPath: generatePath(
                  { lat: mechanic.lat, lng: mechanic.lng },
                  item.location,
                  5
                ),
                currentPathIndex: 0,
              }
            : item
        ),
        notifications: [
          createNotification({
            role: "mechanic",
            message: `New emergency request ${requestId} — ${request.issueType}`,
            requestId,
          }),
          createNotification({
            role: "customer",
            message: `Mechanic assigned: ${mechanic.name}. Waiting for acceptance...`,
            requestId,
          }),
          ...s.notifications,
        ].slice(0, 200),
      };
    });
  }

  useEffect(() => {
    const timer = window.setInterval(() => {
      const now = Date.now();
      state.requests
        .filter(
          (request) =>
            ["SEARCHING", "MECHANIC_ASSIGNED"].includes(request.status) &&
            request.dispatchExpiresAt &&
            Date.parse(request.dispatchExpiresAt) <= now
        )
        .forEach((request) => {
          setState((s) => ({
            ...s,
            mechanics: s.mechanics.map((mechanic) =>
              mechanic.id === request.mechanicId ? { ...mechanic, busy: false } : mechanic
            ),
            requests: s.requests.map((item) =>
              item.requestId === request.requestId
                ? { ...item, status: "SEARCHING", mechanicId: undefined, mechanicLocation: undefined }
                : item
            ),
            notifications: [
              createNotification({
                role: "admin",
                message: `Mechanic offer timed out for ${request.requestId}. Trying the next mechanic.`,
                requestId: request.requestId,
              }),
              ...s.notifications,
            ].slice(0, 200),
          }));
          dispatchRequest(request.requestId);
        });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [state.requests]);

  const addVehicle: AppState["addVehicle"] = (v) => {
    if (!currentUser) return;
    setState((s) => ({
      ...s,
      vehicles: [
        ...s.vehicles,
        { ...v, id: `v-${Date.now()}`, ownerId: currentUser.id },
      ],
    }));
  };

  const updateVehicle: AppState["updateVehicle"] = (id, v) => {
    setState((s) => ({
      ...s,
      vehicles: s.vehicles.map((veh) => (veh.id === id ? { ...veh, ...v } : veh)),
    }));
  };

  const deleteVehicle: AppState["deleteVehicle"] = (id) => {
    setState((s) => ({
      ...s,
      vehicles: s.vehicles.filter((veh) => veh.id !== id),
    }));
  };

  const createRequest: AppState["createRequest"] = (input) => {
    if (!currentUser) throw new Error("not logged in");
    const reqId = `RR-${state.requestCounter + 1}`;
    const now = new Date().toISOString();
    const newReq: ServiceRequest = {
      requestId: reqId,
      customerId: currentUser.id,
      customerName: currentUser.name,
      customerPhone: currentUser.phone || "",
      vehicle: input.vehicle,
      issueType: input.issueType,
      description: input.description,
      priority: input.priority,
      notes: input.notes,
      location: input.location,
      address: input.address,
      status: "SEARCHING",
      createdAt: now,
      serviceItems: [],
    };
    setState((s) => ({
      ...s,
      requests: [newReq, ...s.requests],
      requestCounter: s.requestCounter + 1,
      notifications: [
        createNotification({
          role: "admin",
          message: `New emergency request ${reqId} (${input.priority}) — ${input.issueType}`,
          requestId: reqId,
        }),
        ...s.notifications,
      ].slice(0, 200),
    }));
    dispatchRequest(reqId, input.preferredMechanicId, input.matchReason);
    return newReq;
  };

  const findNearbyMechanics: AppState["findNearbyMechanics"] = (location, issueType) => {
    return state.mechanics
      .filter((m) => m.available && !m.busy && m.expertise.includes(issueType))
      .map((m) => ({ m, dist: haversineKm(location, { lat: m.lat, lng: m.lng }) }))
      .sort((a, b) => a.dist - b.dist)
      .map(({ m, dist }) => ({ ...m, _dist: dist }));
  };

  const assignMechanic: AppState["assignMechanic"] = (requestId, mechanicId, reason) => {
    dispatchRequest(requestId, mechanicId, reason);
  };

  const autoMatch: AppState["autoMatch"] = (requestId) => {
    dispatchRequest(requestId);
  };

  const acceptRequest: AppState["acceptRequest"] = (requestId) => {
    updateRequest(requestId, {
      status: "MECHANIC_ACCEPTED",
      acceptedAt: new Date().toISOString(),
      dispatchExpiresAt: undefined,
    });
    pushNotification({
      role: "customer",
      message: `Your mechanic has accepted the request.`,
      requestId,
    });
    pushNotification({
      role: "admin",
      message: `Mechanic accepted request ${requestId}.`,
      requestId,
    });
  };

  const rejectRequest: AppState["rejectRequest"] = (requestId) => {
    setState((s) => ({
      ...s,
      mechanics: s.mechanics.map((mechanic) => {
        const request = s.requests.find((item) => item.requestId === requestId);
        return mechanic.id === request?.mechanicId ? { ...mechanic, busy: false } : mechanic;
      }),
      requests: s.requests.map((request) =>
        request.requestId === requestId
          ? { ...request, status: "SEARCHING", mechanicId: undefined, mechanicLocation: undefined }
          : request
      ),
      notifications: [
        createNotification({
          role: "admin",
          message: `Mechanic rejected ${requestId}. Trying the next suitable mechanic.`,
          requestId,
        }),
        ...s.notifications,
      ].slice(0, 200),
    }));
    dispatchRequest(requestId);
  };

  const startNavigation: AppState["startNavigation"] = (requestId) => {
    updateRequest(requestId, { status: "ON_THE_WAY" });
    pushNotification({
      role: "customer",
      message: `Mechanic is on the way!`,
      requestId,
    });
  };

  const markOnTheWay: AppState["markOnTheWay"] = (requestId) => {
    updateRequest(requestId, { status: "ON_THE_WAY" });
    pushNotification({
      role: "customer",
      message: `Mechanic is on the way!`,
      requestId,
    });
  };

  const advanceMechanic: AppState["advanceMechanic"] = (requestId) => {
    const req = state.requests.find((r) => r.requestId === requestId);
    if (!req || !req.movementPath) return;
    const nextIndex = (req.currentPathIndex ?? 0) + 1;
    if (nextIndex >= req.movementPath.length) {
      markArrived(requestId);
      return;
    }
    const newPos = req.movementPath[nextIndex];
    const dist = haversineKm(newPos, req.location);
    updateRequest(requestId, {
      mechanicLocation: newPos,
      currentPathIndex: nextIndex,
      distanceKm: dist,
      etaMins: etaMinutes(dist),
    });
  };

  const markArrived: AppState["markArrived"] = (requestId) => {
    const req = state.requests.find((r) => r.requestId === requestId);
    updateRequest(requestId, {
      status: "ARRIVED",
      arrivedAt: new Date().toISOString(),
      mechanicLocation: req?.location,
      distanceKm: 0,
      etaMins: 0,
    });
    pushNotification({
      role: "customer",
      message: `Your mechanic has arrived!`,
      requestId,
    });
    pushNotification({
      role: "mechanic",
      message: `Customer reached for ${requestId}.`,
      requestId,
    });
  };

  const startService: AppState["startService"] = (requestId) => {
    updateRequest(requestId, {
      status: "SERVICE_STARTED",
      serviceStartedAt: new Date().toISOString(),
    });
    pushNotification({
      role: "customer",
      message: `Service has started.`,
      requestId,
    });
  };

  const addServiceItem: AppState["addServiceItem"] = (requestId, item) => {
    setState((s) => ({
      ...s,
      requests: s.requests.map((r) =>
        r.requestId === requestId
          ? {
              ...r,
              serviceItems: [
                ...r.serviceItems,
                { ...item, id: `si-${Date.now()}-${Math.random().toString(36).slice(2, 5)}` },
              ],
            }
          : r
      ),
    }));
  };

  const completeService: AppState["completeService"] = (requestId) => {
    const req = state.requests.find((r) => r.requestId === requestId);
    if (!req) return;
    // if no items added, add a base cost
    const items = req.serviceItems.length
      ? req.serviceItems
      : [
          {
            id: `si-${Date.now()}`,
            description: `${req.issueType} service`,
            amount: ISSUE_BASE_COST[req.issueType],
          },
        ];
    const finalTotal = items.reduce((sum, i) => sum + i.amount, 0);
    updateRequest(requestId, {
      status: "PAYMENT_PENDING",
      completedAt: new Date().toISOString(),
      serviceItems: items,
      invoice: {
        items,
        total: finalTotal,
        generatedAt: new Date().toISOString(),
      },
    });
    if (req.mechanicId) {
      setState((s) => ({
        ...s,
        mechanics: s.mechanics.map((mechanic) =>
          mechanic.id === req.mechanicId ? { ...mechanic, busy: false } : mechanic
        ),
      }));
    }
    pushNotification({
      role: "customer",
      message: `Service completed. Invoice of ₹${finalTotal} is ready for payment.`,
      requestId,
    });
    pushNotification({
      role: "admin",
      message: `Service completed for ${requestId}. Awaiting payment.`,
      requestId,
    });
  };

  const payRequest: AppState["payRequest"] = (requestId, method) => {
    const req = state.requests.find((r) => r.requestId === requestId);
    if (!req || !req.invoice) return;
    updateRequest(requestId, {
      status: "PAID",
      paidAt: new Date().toISOString(),
      payment: {
        method,
        amount: req.invoice.total,
        paidAt: new Date().toISOString(),
        transactionId: `TXN${Date.now().toString().slice(-8)}`,
      },
    });
    // update mechanic earnings
    if (req.mechanicId) {
      setState((s) => ({
        ...s,
        mechanics: s.mechanics.map((m) =>
          m.id === req.mechanicId
            ? { ...m, totalEarnings: m.totalEarnings + req.invoice!.total }
            : m
        ),
      }));
    }
    pushNotification({
      role: "customer",
      message: `Payment of ₹${req.invoice.total} successful.`,
      requestId,
    });
    pushNotification({
      role: "mechanic",
      message: `Payment of ₹${req.invoice.total} received for ${requestId}.`,
      requestId,
    });
    pushNotification({
      role: "admin",
      message: `Payment received for ${requestId}: ₹${req.invoice.total}.`,
      requestId,
    });
  };

  const rateRequest: AppState["rateRequest"] = (requestId, rating) => {
    const req = state.requests.find((r) => r.requestId === requestId);
    updateRequest(requestId, {
      status: "RATED",
      ratedAt: new Date().toISOString(),
      rating: { ...rating, ratedAt: new Date().toISOString() },
    });
    // update mechanic stats
    if (req?.mechanicId) {
      setState((s) => ({
        ...s,
        mechanics: s.mechanics.map((m) => {
          if (m.id !== req.mechanicId) return m;
          const newCompleted = m.completedServices + 1;
          const newRating =
            (m.rating * m.completedServices + rating.overall) / newCompleted;
          return {
            ...m,
            completedServices: newCompleted,
            rating: Math.round(newRating * 10) / 10,
          };
        }),
      }));
    }
    pushNotification({
      role: "mechanic",
      message: `You received a ${rating.overall}-star rating for ${requestId}.`,
      requestId,
    });
  };

  const cancelRequest: AppState["cancelRequest"] = (requestId) => {
    const req = state.requests.find((request) => request.requestId === requestId);
    updateRequest(requestId, { status: "CANCELLED" });
    if (req?.mechanicId) {
      setState((s) => ({
        ...s,
        mechanics: s.mechanics.map((mechanic) =>
          mechanic.id === req.mechanicId ? { ...mechanic, busy: false } : mechanic
        ),
      }));
    }
    pushNotification({
      role: "admin",
      message: `Request ${requestId} was cancelled by customer.`,
      requestId,
    });
  };

  const toggleMechanicAvailability: AppState["toggleMechanicAvailability"] = (mechanicId) => {
    setState((s) => ({
      ...s,
      mechanics: s.mechanics.map((m) =>
        m.id === mechanicId ? { ...m, available: !m.available } : m
      ),
    }));
  };

  const verifyMechanic: AppState["verifyMechanic"] = (mechanicId) => {
    setState((s) => ({
      ...s,
      mechanics: s.mechanics.map((m) =>
        m.id === mechanicId ? { ...m, verified: true } : m
      ),
    }));
  };

  const reassignMechanic: AppState["reassignMechanic"] = (requestId, mechanicId) => {
    assignMechanic(requestId, mechanicId, ["Reassigned by admin"]);
  };

  const setMechanicLocation: AppState["setMechanicLocation"] = (mechanicId, loc) => {
    setState((s) => ({
      ...s,
      mechanics: s.mechanics.map((m) =>
        m.id === mechanicId ? { ...m, lat: loc.lat, lng: loc.lng } : m
      ),
    }));
  };

  const markNotificationRead: AppState["markNotificationRead"] = (id) => {
    setState((s) => ({
      ...s,
      notifications: s.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    }));
  };

  const markAllNotificationsRead: AppState["markAllNotificationsRead"] = (role) => {
    setState((s) => ({
      ...s,
      notifications: s.notifications.map((n) =>
        n.role === role ? { ...n, read: true } : n
      ),
    }));
  };

  const value: AppState = {
    currentUser,
    users: state.users,
    vehicles: state.vehicles,
    mechanics: state.mechanics,
    requests: state.requests,
    notifications: state.notifications,
    login,
    logout,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    createRequest,
    findNearbyMechanics,
    assignMechanic,
    autoMatch,
    acceptRequest,
    rejectRequest,
    startNavigation,
    markOnTheWay,
    advanceMechanic,
    markArrived,
    startService,
    addServiceItem,
    completeService,
    payRequest,
    rateRequest,
    cancelRequest,
    toggleMechanicAvailability,
    verifyMechanic,
    reassignMechanic,
    setMechanicLocation,
    markNotificationRead,
    markAllNotificationsRead,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
