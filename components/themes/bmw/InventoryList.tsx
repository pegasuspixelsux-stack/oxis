"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useSettings } from "@/components/settings-provider";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import type { InventoryListProps } from "@/components/themes/types";

export default function InventoryList({
  cars,
  loading,
  availableMakes,
  availableBodyStyles,
  priceCeiling,
  filterCars,
}: InventoryListProps) {
  const { settings } = useSettings();

  // Search & Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMake, setSelectedMake] = useState("All");
  const [selectedBodyStyle, setSelectedBodyStyle] = useState("All");
  const [maxPrice, setMaxPrice] = useState(100000);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // 3x4 grid specification

  // Finance Calculator state
  const [carPrice, setCarPrice] = useState(35000);
  const [downPayment, setDownPayment] = useState(7000);
  const [loanTerm, setLoanTerm] = useState(48);
  const [interestRate] = useState(6.5);

  // Trade-In Form state
  const [tradeMake, setTradeMake] = useState("");
  const [tradeModel, setTradeModel] = useState("");
  const [tradeYear, setTradeYear] = useState("");
  const [tradeMileage, setTradeMileage] = useState("");
  const [tradeSubmitted, setTradeSubmitted] = useState(false);

  // Default the slider to the real ceiling once data arrives, so every
  // listing is included until the shopper narrows the range themselves.
  useEffect(() => {
    if (cars.length > 0) setMaxPrice(priceCeiling);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cars.length]);

  // Jump back to page 1 whenever the filter criteria change — otherwise
  // narrowing the results while on page 2+ can strand the shopper on a
  // now-empty page that still says "No vehicles match your criteria".
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedMake, selectedBodyStyle, maxPrice]);

  // Filter logic
  const filteredCars = filterCars({
    search: searchTerm,
    make: selectedMake === "All" ? undefined : selectedMake,
    bodyStyle: selectedBodyStyle === "All" ? undefined : selectedBodyStyle,
    maxPrice,
  });

  // Pagination logic (12 per page)
  const totalPages = Math.ceil(filteredCars.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentCars = filteredCars.slice(startIndex, startIndex + itemsPerPage);

  // Finance calculation
  const loanAmount = carPrice - downPayment;
  const monthlyRate = interestRate / 100 / 12;
  const monthlyPayment =
    monthlyRate > 0
      ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, loanTerm)) /
        (Math.pow(1 + monthlyRate, loanTerm) - 1)
      : loanAmount / loanTerm;

  const handleTradeSubmit = (e: FormEvent) => {
    e.preventDefault();
    setTradeSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#FBFBFD] text-[#1D1D1F] font-sans">
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-[#FBFBFD]/80 backdrop-blur-xl border-b border-[#D2D2D7]/40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-sm font-bold tracking-tight">
            OXIS<span className="text-blue-600">.</span>{" "}
            <span className="text-slate-400 font-normal">Showroom</span>
          </Link>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <Link href="/dashboard" className="text-slate-600 hover:text-slate-900 transition-colors">
              Control Panel
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 pt-10">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-[#1D1D1F]">Vehicle Inventory</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Explore our curated collection of verified pre-owned automobiles.
          </p>
        </div>

        {/* Main Layout: Advanced Search on Left, 3-Column Grid on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-20">
          {/* Left Column: Advanced Search & Filters.
              sticky is scoped to lg: deliberately — below that breakpoint the
              grid collapses to a single column, so this and the listings
              grid become full-width stacked siblings; an unscoped sticky
              here pins this column over the grid as the page scrolls on
              mobile instead of letting the two flow one after the other. */}
          <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-24 lg:self-start lg:z-10">
            <div className="bg-white p-6 rounded-2xl border border-[#D2D2D7]/60 shadow-xs space-y-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Advanced Search</h3>

              {/* Keyword Search */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">Keyword</label>
                <input
                  type="text"
                  placeholder="Search model, make..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Make Filter */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">Make</label>
                <select
                  value={selectedMake}
                  onChange={(e) => setSelectedMake(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="All">All Makes</option>
                  {availableMakes.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              {/* Body Style Filter */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">Body Style</label>
                <select
                  value={selectedBodyStyle}
                  onChange={(e) => setSelectedBodyStyle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="All">All Body Styles</option>
                  {availableBodyStyles.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              {/* Max Price Range */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-[11px] font-semibold text-slate-600">Max Price</label>
                  <span className="text-[11px] font-bold text-blue-600">${maxPrice.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="10000"
                  max={priceCeiling}
                  step="5000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>

              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedMake("All");
                  setSelectedBodyStyle("All");
                  setMaxPrice(priceCeiling);
                }}
                className="w-full py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Reset Filters
              </button>
            </div>

            {/* Finance Calculator — compact sidebar variant, same card
                treatment as Advanced Search above it. */}
            <div className="bg-white p-6 rounded-2xl border border-[#D2D2D7]/60 shadow-xs space-y-5">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Finance Calculator
                </h3>
                <p className="mt-1 text-[11px] text-slate-400">Estimate your monthly payment.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
                    <span>Vehicle Price</span>
                    <span>${carPrice.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="15000"
                    max="90000"
                    step="1000"
                    value={carPrice}
                    onChange={(e) => setCarPrice(Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
                    <span>Down Payment</span>
                    <span>${downPayment.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="30000"
                    step="500"
                    value={downPayment}
                    onChange={(e) => setDownPayment(Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
                    <span>Loan Term</span>
                    <span>{loanTerm} mo.</span>
                  </div>
                  <input
                    type="range"
                    min="12"
                    max="72"
                    step="12"
                    value={loanTerm}
                    onChange={(e) => setLoanTerm(Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                </div>
              </div>

              <div className="bg-[#F5F5F7] p-4 rounded-xl border border-[#D2D2D7]/60 text-center space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Estimated Payment
                </span>
                <div className="text-2xl font-bold text-blue-600">
                  ${Math.round(monthlyPayment).toLocaleString()}
                  <span className="text-xs font-normal text-slate-500">/mo</span>
                </div>
                <p className="text-[10px] text-slate-400 pt-1.5 border-t border-slate-200">
                  {interestRate}% APR on ${loanAmount.toLocaleString()} financed. Subject to credit
                  approval.
                </p>
              </div>
            </div>

            {/* Trade-In Appraisal — compact sidebar variant, same card
                treatment as the two above it. */}
            <div className="bg-white p-6 rounded-2xl border border-[#D2D2D7]/60 shadow-xs space-y-5">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Trade-In Appraisal
                </h3>
                <p className="mt-1 text-[11px] text-slate-400">
                  Get an instant estimate for your current vehicle.
                </p>
              </div>

              {tradeSubmitted ? (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-1">
                  <h4 className="text-xs font-bold text-emerald-700">Inquiry Submitted</h4>
                  <p className="text-[11px] text-emerald-600">
                    Our team will contact you with an offer within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleTradeSubmit} className="space-y-3">
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Make</label>
                      <input
                        type="text"
                        placeholder="Toyota"
                        required
                        value={tradeMake}
                        onChange={(e) => setTradeMake(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Model</label>
                      <input
                        type="text"
                        placeholder="RAV4"
                        required
                        value={tradeModel}
                        onChange={(e) => setTradeModel(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Year</label>
                      <input
                        type="number"
                        placeholder="2019"
                        required
                        value={tradeYear}
                        onChange={(e) => setTradeYear(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Mileage</label>
                      <input
                        type="text"
                        placeholder="45,000 mi"
                        required
                        value={tradeMileage}
                        onChange={(e) => setTradeMileage(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-lg shadow-blue-500/20 transition-all"
                  >
                    Get Trade-In Estimate
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Right Column: 3x4 Grid Listings & Pagination */}
          <div className="lg:col-span-3 space-y-8">
            {loading ? (
              <div className="h-64 flex items-center justify-center text-xs text-slate-500 font-medium">
                Loading inventory catalog...
              </div>
            ) : currentCars.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#D2D2D7]/60 p-12 text-center space-y-2">
                <h3 className="text-sm font-bold text-slate-800">No vehicles match your criteria</h3>
                <p className="text-xs text-slate-500">Try adjusting your search filters or price ranges.</p>
              </div>
            ) : (
              <>
                {/* 3-Column Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentCars.map((car) => {
                    const carImage =
                      car.images?.[0] ||
                      car.img ||
                      "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=600&q=80";
                    return (
                      <Link
                        key={car.id}
                        href={`/inventory/${car.id}`}
                        className="bg-white rounded-2xl border border-[#D2D2D7]/60 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group"
                      >
                        <div className="h-48 overflow-hidden relative bg-slate-100">
                          <img
                            src={carImage}
                            alt={car.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute top-3 right-3">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-white/90 backdrop-blur-md text-slate-800 shadow-xs">
                              {car.year}
                            </span>
                          </div>
                        </div>
                        <div className="p-5 flex flex-col flex-grow justify-between">
                          <div>
                            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                              {car.make}
                            </span>
                            <h3 className="text-sm font-bold text-[#1D1D1F] mt-0.5 truncate">{car.title}</h3>
                          </div>
                          <div className="mt-4 pt-3 border-t border-[#D2D2D7]/40 flex items-center justify-between">
                            <span className="text-base font-bold text-[#1D1D1F]">{car.price}</span>
                            <span className="text-xs font-semibold text-blue-600 group-hover:translate-x-1 transition-transform">
                              &rarr;
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-6">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 disabled:opacity-40 hover:bg-slate-50 transition-colors shadow-xs"
                    >
                      Previous
                    </button>
                    <span className="text-xs font-medium text-slate-500 px-3">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 disabled:opacity-40 hover:bg-slate-50 transition-colors shadow-xs"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Footer — same light/editorial system as the rest of this page,
          not the dark marketing-site SiteFooter, which would clash here. */}
      <footer className="mt-12 border-t border-[#D2D2D7]/60 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="text-sm font-bold tracking-tight text-[#1D1D1F]">
              OXIS<span className="text-blue-600">.</span>{" "}
              <span className="text-slate-400 font-normal">Showroom</span>
            </Link>
            <p className="mt-3 text-xs leading-relaxed text-slate-500 max-w-xs">
              Vehículos usados certificados, inspeccionados a fondo y respaldados por una garantía
              de devolución de 7 días.
            </p>
          </div>

          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Navegación
            </h3>
            <ul className="mt-4 space-y-2.5 text-xs">
              <li>
                <Link href="/" className="text-slate-600 hover:text-blue-600 transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/inventory" className="text-slate-600 hover:text-blue-600 transition-colors">
                  Inventario
                </Link>
              </li>
              <li>
                <Link href="/#contact" className="text-slate-600 hover:text-blue-600 transition-colors">
                  Contacto
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-slate-600 hover:text-blue-600 transition-colors">
                  Control Panel
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Horario de Atención
            </h3>
            <p className="mt-4 text-xs leading-relaxed text-slate-600 whitespace-pre-line">
              {settings.businessHours}
            </p>
          </div>

          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Visitanos
            </h3>
            <ul className="mt-4 space-y-2.5 text-xs text-slate-600">
              <li>{settings.address}</li>
              <li>
                <a
                  href={`tel:${settings.phoneNumber.replace(/[^0-9+]/g, "")}`}
                  className="hover:text-blue-600 transition-colors"
                >
                  {settings.phoneNumber}
                </a>
              </li>
              <li>
                <a
                  href={buildWhatsAppLink(
                    settings.whatsappNumber,
                    `Hola ${settings.dealershipName}, quiero hacer una consulta.`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 font-semibold hover:text-emerald-700 transition-colors"
                >
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#D2D2D7]/60">
          <div className="max-w-7xl mx-auto px-6 py-5 text-[11px] text-slate-400">
            &copy; {new Date().getFullYear()} {settings.dealershipName}. Todos los derechos
            reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
