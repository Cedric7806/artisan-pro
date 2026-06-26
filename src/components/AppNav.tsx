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
    <aside className="border-b border-line bg-white md:sticky md:top-0 md:order-2 md:flex md:h-screen md:w-72 md:flex-col md:border-b-0 md:border-l">
      <div className="flex h-full flex-col gap-5 px-4 py-4 sm:px-6 md:px-5">
        <Link href="/app/tableau-de-bord" className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-700 text-lg font-bold text-white">AP</span>
          <span className="min-w-0">
            <span className="block text-lg font-bold text-slate-950">Artisan Pro</span>
            <span className="block truncate text-sm text-slate-600">{user.entreprise_nom}</span>
          </span>
        </Link>
        <nav className="grid gap-1">
          {items.map((item) => (
            <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-lg px-3 py-3 text-base font-semibold text-slate-700 transition hover:bg-slate-100">
              <item.icon aria-hidden="true" size={20} />
              {item.label}
            </Link>
          ))}
        </nav>
        <form action={logoutAction} className="mt-auto">
          <button className="btn-secondary w-full justify-center text-sm" type="submit">Deconnexion</button>
        </form>
      </div>
    </aside>
  );
}
