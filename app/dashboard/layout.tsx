"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut as firebaseSignOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/components/auth-provider";
import { GaugeIcon, MailIcon, TagIcon, ChecklistIcon, ArrowRightIcon } from "@/components/icons";

const NAV_LINKS = [
  { name: "Panel de Control", href: "/dashboard", icon: GaugeIcon },
  { name: "Consultas", href: "/dashboard/leads", icon: MailIcon },
  { name: "Inventario", href: "/dashboard/inventory", icon: TagIcon },
  { name: "Pipeline", href: "/dashboard/pipeline", icon: ChecklistIcon },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();

  async function handleSignOut() {
    await firebaseSignOut(auth);
    await fetch("/api/auth/session", { method: "DELETE" });
    router.push("/login");
  }

  return (
    <div className="flex min-h-screen bg-[#F5F5F7] text-[#1D1D1F]">
      <aside className="fixed inset-y-0 z-30 flex w-64 flex-col border-r border-black/[0.06] bg-white/70 backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-black/[0.06] p-6">
          <Link href="/dashboard" className="text-lg font-semibold tracking-tight text-[#1D1D1F]">
            OXIS <span className="text-[#0071E3]">AUTO</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1 rounded-full border border-black/10 bg-white px-2.5 py-1 text-[11px] font-semibold text-[#6E6E73] transition-all active:scale-95 hover:text-[#0071E3]"
          >
            Ver sitio
            <ArrowRightIcon className="h-3 w-3" />
          </Link>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {NAV_LINKS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all active:scale-[0.98] ${
                  isActive
                    ? "bg-white text-[#0071E3] shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
                    : "text-[#6E6E73] hover:bg-white/60 hover:text-[#1D1D1F]"
                }`}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-black/[0.06] p-4">
          <div className="mb-3 flex items-center gap-3 px-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0071E3] text-sm font-semibold text-white">
              {!loading && user?.email ? user.email.charAt(0).toUpperCase() : "…"}
            </div>
            <div className="overflow-hidden">
              <p className="truncate text-xs font-medium text-[#1D1D1F]">
                {loading ? "Cargando…" : user?.email ?? "Usuario"}
              </p>
              <p className="text-[11px] text-[#6E6E73]">Agente verificado</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-xs font-medium text-[#6E6E73] transition-all active:scale-[0.98] hover:border-red-300 hover:text-red-600"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="ml-64 flex-1 p-8 sm:p-12">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
