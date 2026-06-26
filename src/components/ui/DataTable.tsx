export function DataTable({ children }: { children: React.ReactNode }) {
  return <div className="panel overflow-hidden">{children}</div>;
}

export function TableEmpty({ children }: { children: React.ReactNode }) {
  return <div className="p-8 text-center text-base text-slate-600">{children}</div>;
}
