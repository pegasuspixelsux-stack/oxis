"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { signOut as firebaseSignOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/components/auth-provider";
import {
  GaugeIcon,
  MailIcon,
  TagIcon,
  ChecklistIcon,
  GearIcon,
  ArrowRightIcon,
  MenuIcon,
  CloseIcon,
} from "@/components/icons";

const NAV_LINKS = [
  { name: "Panel de Control", href: "/dashboard", icon: GaugeIcon },
  { name: "Consultas", href: "/dashboard/leads", icon: MailIcon },
  { name: "Inventario", href: "/dashboard/inventory", icon: TagIcon },
  { name: "Pipeline", href: "/dashboard/pipeline", icon: ChecklistIcon },
  { name: "Configuración", href: "/dashboard/settings", icon: GearIcon },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close the mobile drawer whenever the route changes (a nav click, or
  // browser back/forward) — otherwise it stays open over the new page.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  async function handleSignOut() {
    await firebaseSignOut(auth);
    await fetch("/api/auth/session", { method: "DELETE" });
    router.push("/login");
  }

  const navContent = (
    <>
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
    </>
  );

  return (
    <div className="flex min-h-screen bg-[#F5F5F7] text-[#1D1D1F]">
      {/* Desktop sidebar — always visible from md up */}
      <aside className="fixed inset-y-0 z-30 hidden w-64 flex-col border-r border-black/[0.06] bg-white/70 backdrop-blur-xl md:flex">
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
        {navContent}
      </aside>

      {/* Mobile top bar — replaces the sidebar below md, opens an off-canvas drawer */}
      <header className="fixed inset-x-0 top-0 z-30 flex h-16 items-center justify-between border-b border-black/[0.06] bg-white/80 px-4 backdrop-blur-xl md:hidden">
        <Link href="/dashboard" className="text-base font-semibold tracking-tight text-[#1D1D1F]">
          OXIS <span className="text-[#0071E3]">AUTO</span>
        </Link>
        <button
          type="button"
          aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-black/10 text-[#1D1D1F] transition-colors active:scale-95"
        >
          {mobileOpen ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
        </button>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 360, damping: 34 }}
              className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r border-black/[0.06] bg-white shadow-2xl md:hidden"
            >
              <div className="flex items-center justify-between border-b border-black/[0.06] p-6">
                <span className="text-lg font-semibold tracking-tight text-[#1D1D1F]">
                  OXIS <span className="text-[#0071E3]">AUTO</span>
                </span>
                <button
                  type="button"
                  aria-label="Cerrar menú"
                  onClick={() => setMobileOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-[#6E6E73] transition-all active:scale-90 hover:bg-[#F5F5F7] hover:text-[#1D1D1F]"
                >
                  <CloseIcon className="h-4 w-4" />
                </button>
              </div>
              {navContent}
              <Link
                href="/"
                className="mx-4 mb-4 inline-flex items-center justify-center gap-1 rounded-xl border border-black/10 bg-white px-3 py-2.5 text-xs font-semibold text-[#6E6E73] transition-all active:scale-[0.98] hover:text-[#0071E3]"
              >
                Ver sitio
                <ArrowRightIcon className="h-3 w-3" />
              </Link>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1 p-6 pt-24 sm:p-12 md:ml-64 md:pt-12">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
