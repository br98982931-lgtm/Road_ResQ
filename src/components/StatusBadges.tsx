import type { Priority, RequestStatus } from "@/types";
import Badge from "./Badge";

export function PriorityBadge({ priority }: { priority: Priority }) {
  const color =
    priority === "CRITICAL"
      ? "red"
      : priority === "HIGH"
      ? "orange"
      : priority === "MEDIUM"
      ? "yellow"
      : "blue";
  return <Badge color={color}>{priority}</Badge>;
}

const statusColorMap: Record<RequestStatus, "green" | "red" | "yellow" | "blue" | "gray" | "orange" | "purple"> = {
  NEW: "blue",
  SEARCHING: "yellow",
  MECHANIC_ASSIGNED: "blue",
  MECHANIC_ACCEPTED: "blue",
  ON_THE_WAY: "orange",
  ARRIVED: "orange",
  SERVICE_STARTED: "purple",
  SERVICE_COMPLETED: "purple",
  PAYMENT_PENDING: "yellow",
  PAID: "green",
  RATED: "green",
  CANCELLED: "gray",
  REJECTED: "red",
};

export function StatusBadge({ status }: { status: RequestStatus }) {
  const label = status.replace(/_/g, " ");
  return <Badge color={statusColorMap[status]}>{label}</Badge>;
}
