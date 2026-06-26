import type { LucideIcon } from "lucide-react";

type StatCardProps = {
  label: string;
  value: string;
  helper?: string;
  icon: LucideIcon;
  tone?: "money" | "work" | "quote";
  metric?: string;
};

const tones = {
  money: {
    card: "border-emerald-200 bg-emerald-50/70",
    strip: "bg-emerald-600",
    icon: "bg-emerald-700 text-white",
    value: "text-emerald-950",
    bar: "bg-emerald-600"
  },
  work: {
    card: "border-sky-200 bg-sky-50/70",
    strip: "bg-sky-600",
    icon: "bg-sky-700 text-white",
    value: "text-sky-950",
    bar: "bg-sky-600"
  },
  quote: {
    card: "border-amber-200 bg-amber-50/80",
    strip: "bg-amber-500",
    icon: "bg-amber-600 text-white",
    value: "text-amber-950",
    bar: "bg-amber-500"
  }
};

export function StatCard({ label, value, helper, icon: Icon, tone = "money", metric }: StatCardProps) {
  const styles = tones[tone];
  return (
    <div className={`relative overflow-hidden rounded-lg border p-5 shadow-soft ${styles.card}`}>
      <div className={`absolute inset-x-0 top-0 h-1 ${styles.strip}`} />
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-bold uppercase text-slate-600">{label}</p>
          <p className={`mt-3 text-4xl font-black ${styles.value}`}>{value}</p>
          {helper ? <p className="mt-2 text-sm font-medium text-slate-700">{helper}</p> : null}
        </div>
        <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-lg shadow-sm ${styles.icon}`}>
          <Icon aria-hidden="true" size={24} />
        </div>
      </div>
      <div className="mt-5">
        <div className="h-2 rounded-full bg-white/80">
          <div className={`h-2 w-2/3 rounded-full ${styles.bar}`} />
        </div>
        {metric ? <p className="mt-2 text-xs font-semibold uppercase text-slate-600">{metric}</p> : null}
      </div>
    </div>
  );
}
