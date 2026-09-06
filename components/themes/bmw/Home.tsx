"use client";

import { SiteHeader } from "./site-header";
import { HeroSection } from "./hero-section";
import { IntroSection } from "./intro-section";
import { InventorySection } from "./inventory/inventory-section";
import { FinanceToolsSection } from "./finance/finance-tools-section";
import { ContactSection } from "./contact-section";
import { SiteFooter } from "./site-footer";
import { ShowroomProvider } from "@/components/showroom-context";
import type { HomeProps } from "@/components/themes/types";

// BMW home surface. Props from HomeThemeRouter are accepted for contract
// parity; InventorySection and FinanceToolsSection currently read the
// cars collection through their own effects (unchanged in the move), so
// the props are not yet threaded into them. Any future change to that
// wiring stays inside components/themes/bmw/.
export default function Home(_props: HomeProps) {
  return (
    <ShowroomProvider>
      <SiteHeader />
      <main className="flex-1">
        <HeroSection />
        <IntroSection />
        <InventorySection />
        <FinanceToolsSection />
        <ContactSection />
      </main>
      <SiteFooter />
    </ShowroomProvider>
  );
}
