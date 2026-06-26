import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AppNav } from "@/components/AppNav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/connexion");

  return (
    <div className="min-h-screen bg-paper md:grid md:grid-cols-[minmax(0,1fr)_18rem]">
      <AppNav user={user} />
      <main className="container-page md:order-1">{children}</main>
    </div>
  );
}
