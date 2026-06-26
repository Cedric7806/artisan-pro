import Link from "next/link";
import { clearSession } from "@/lib/auth";
import { BriefcaseBusiness, CalendarDays, FileText, Home, ReceiptText, Settings, Users, Wrench } from "lucide-react";
import type { UserSession } from "@/lib/types";

const items = [
  { href: "/app/tableau-de-bord", label: "Accueil", icon: Home },
  { href: "/app/clients", label: "Clients", icon: Users },
  { href: "/app/interventions", label: "Interventions", icon: BriefcaseBusiness },
  { href: "/app/planning", label: "Planning", icon: CalendarDays },
  { href: "/app/devis", label: "Devis", icon: FileText },
  { href: "/app/factures", label: "Factures", icon: ReceiptText },
  { href: "/app/equipe", label: "Equipe", icon: Wrench },
  { href: "/app/parametres/entreprise", label: "Parametres", icon: Settings }
];

async function logoutAction() {
  "use server";
  await clearSession();
}

export function AppNav({ user }: { user: UserSession }) {
  return (
    <header className="border-b border-line bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <Link href="/app/tableau-de-bord" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-700 text-lg font-bold text-white">AP</span>
            <span>
              <span className="block text-lg font-bold text-slate-950">Artisan Pro</span>
              <span className="block text-sm text-slate-600">{user.entreprise_nom}</span>
            </span>
          </Link>
          <form action={logoutAction}>
            <button className="btn-secondary h-10 px-3 text-sm" type="submit">Deconnexion</button>
          </form>
        </div>
        <nav className="flex gap-2 overflow-x-auto pb-1">
          {items.map((item) => (
            <Link key={item.href} href={item.href} className="flex min-w-fit items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">
              <item.icon aria-hidden="true" size={18} />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
