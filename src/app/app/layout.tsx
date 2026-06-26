import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AppNav } from "@/components/AppNav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/connexion");

  return (
    <div className="min-h-screen bg-paper">
      <AppNav user={user} />
      <main className="container-page">{children}</main>
    </div>
  );
}
