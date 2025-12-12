import React from "react";

type Props = {
  title: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
};

export function Panel({ title, actions, children }: Props) {
  return (
    <section className="card p-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
        {actions}
      </div>
      <div className="text-sm text-slate-200/80">{children}</div>
    </section>
  );
}
