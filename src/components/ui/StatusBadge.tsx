import { clsx } from "clsx";

const styles: Record<string, string> = {
  a_planifier: "bg-slate-100 text-slate-700",
  planifiee: "bg-blue-100 text-blue-800",
  en_cours: "bg-clay-100 text-clay-700",
  terminee: "bg-brand-100 text-brand-800",
  brouillon: "bg-slate-100 text-slate-700",
  envoye: "bg-blue-100 text-blue-800",
  accepte: "bg-brand-100 text-brand-800",
  refuse: "bg-red-100 text-red-800",
  expire: "bg-stone-200 text-stone-700",
  emise: "bg-blue-100 text-blue-800",
  payee: "bg-brand-100 text-brand-800",
  en_retard: "bg-red-100 text-red-800",
  annulee: "bg-slate-100 text-slate-700"
};

const labels: Record<string, string> = {
  a_planifier: "A planifier",
  planifiee: "Planifiee",
  en_cours: "En cours",
  terminee: "Terminee",
  brouillon: "Brouillon",
  envoye: "Envoye",
  accepte: "Accepte",
  refuse: "Refuse",
  expire: "Expire",
  emise: "Emise",
  payee: "Payee",
  en_retard: "En retard",
  annulee: "Annulee"
};

export function StatusBadge({ value }: { value: string }) {
  return (
    <span className={clsx("inline-flex rounded-full px-3 py-1 text-sm font-semibold", styles[value] ?? "bg-slate-100 text-slate-700")}>
      {labels[value] ?? value}
    </span>
  );
}
