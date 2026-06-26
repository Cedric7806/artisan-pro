export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-paper">
      <div className="mx-auto grid min-h-screen max-w-6xl items-center gap-8 px-4 py-8 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="hidden lg:block">
          <div className="max-w-md">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-lg bg-brand-700 text-xl font-bold text-white">AP</div>
            <h1 className="text-4xl font-bold leading-tight text-slate-950">La gestion quotidienne des artisans, enfin rangee au meme endroit.</h1>
            <p className="mt-4 text-lg text-slate-600">Clients, interventions, planning, devis et factures pour les petites equipes de service a domicile.</p>
          </div>
        </section>
        {children}
      </div>
    </main>
  );
}
