import type { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  color?: "green" | "red" | "yellow" | "blue" | "gray" | "orange" | "purple";
  size?: "sm" | "md";
}

const colorMap: Record<string, string> = {
  green: "bg-green-100 text-green-700 border-green-200",
  red: "bg-red-100 text-red-700 border-red-200",
  yellow: "bg-yellow-100 text-yellow-700 border-yellow-200",
  blue: "bg-blue-100 text-blue-700 border-blue-200",
  gray: "bg-gray-100 text-gray-600 border-gray-200",
  orange: "bg-orange-100 text-orange-700 border-orange-200",
  purple: "bg-purple-100 text-purple-700 border-purple-200",
};

export default function Badge({ children, color = "gray", size = "sm" }: BadgeProps) {
  const padding = size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border font-semibold ${padding} ${colorMap[color]}`}>
      {children}
    </span>
  );
}
