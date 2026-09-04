import { SiteHeader } from "@/components/site-header";
import { HeroSection } from "@/components/hero-section";
import { IntroSection } from "@/components/intro-section";
import { InventorySection } from "@/components/inventory/inventory-section";
import { FinanceToolsSection } from "@/components/finance/finance-tools-section";
import { ContactSection } from "@/components/contact-section";
import { SiteFooter } from "@/components/site-footer";
import { ShowroomProvider } from "@/components/showroom-context";

export default function Home() {
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
