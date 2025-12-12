import React from "react";

type Props = {
  children: React.ReactNode;
  color?: "green" | "amber" | "red" | "sky";
};

const colorMap: Record<NonNullable<Props["color"]>, string> = {
  green: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  amber: "bg-amber-500/20 text-amber-300 border-amber-500/40",
  red: "bg-rose-500/20 text-rose-300 border-rose-500/40",
  sky: "bg-sky-500/20 text-sky-200 border-sky-500/40"
};

export function Badge({ children, color = "sky" }: Props) {
  return <span className={`px-2 py-1 rounded-full border text-xs font-semibold ${colorMap[color]}`}>{children}</span>;
}
