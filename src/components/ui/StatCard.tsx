import type { LucideIcon } from "lucide-react";

type StatCardProps = {
  label: string;
  value: string;
  helper?: string;
  icon: LucideIcon;
};

export function StatCard({ label, value, helper, icon: Icon }: StatCardProps) {
  return (
    <div className="panel p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">{value}</p>
          {helper ? <p className="mt-2 text-sm text-slate-600">{helper}</p> : null}
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-100 text-brand-800">
          <Icon aria-hidden="true" size={24} />
        </div>
      </div>
    </div>
  );
}
