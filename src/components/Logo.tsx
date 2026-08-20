import { Link } from "react-router-dom";
import { Wrench } from "lucide-react";

export default function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const dims = size === "lg" ? "h-12 w-12" : size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const text = size === "lg" ? "text-3xl" : size === "sm" ? "text-lg" : "text-xl";
  return (
    <Link to="/" className="flex items-center gap-2.5 group">
      <div className={`${dims} rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-600/20 group-hover:scale-105 transition-transform`}>
        <Wrench className="h-5 w-5 text-white" strokeWidth={2.5} />
      </div>
      <div className="flex flex-col leading-none">
        <span className={`${text} font-extrabold text-gray-900 tracking-tight`}>
          Road<span className="text-blue-600">ResQ</span>
        </span>
        <span className="text-[10px] text-gray-500 font-medium tracking-wide">
          ROADSIDE ASSISTANCE
        </span>
      </div>
    </Link>
  );
}
