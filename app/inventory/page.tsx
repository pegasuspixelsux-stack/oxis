"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CARS_COLLECTION, type Car } from "@/lib/db/cars";

export default function PublicInventoryPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMake, setSelectedMake] = useState("All");
  const [selectedBodyStyle, setSelectedBodyStyle] = useState("All");
  const [maxPrice, setMaxPrice] = useState(100000);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // 3x4 grid specification

  // Bottom Tabs state
  const [activeTab, setActiveTab] = useState<"finance" | "trade">("finance");

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

  useEffect(() => {
    async function fetchInventory() {
      try {
        const q = query(collection(db, CARS_COLLECTION), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const list = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Car);
        setCars(list);
      } catch (err) {
        console.error("Error fetching inventory:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchInventory();
  }, []);

  // Filter options and price ceiling are derived from whatever is actually in
  // the collection, instead of a hardcoded list — a hardcoded Make/Body Style
  // list silently excludes any make or body style that isn't in that list
  // (e.g. Tesla, Volkswagen, Hatchback were unselectable), and a hardcoded
  // price ceiling below the priciest listing makes that listing unreachable
  // no matter where the slider is set.
  const availableMakes = useMemo(
    () => Array.from(new Set(cars.map((car) => car.make).filter(Boolean))).sort(),
    [cars]
  );
  const availableBodyStyles = useMemo(
    () => Array.from(new Set(cars.map((car) => car.bodyStyle).filter(Boolean))).sort(),
    [cars]
  );
  const priceCeiling = useMemo(() => {
    const prices = cars
      .map((car) => parseInt(String(car.price).replace(/[^0-9]/g, ""), 10))
      .filter((price) => Number.isFinite(price) && price > 0);
    return prices.length ? Math.ceil(Math.max(...prices) / 10000) * 10000 : 100000;
  }, [cars]);

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
  const filteredCars = cars.filter((car) => {
    const matchesSearch =
      car.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.make?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMake = selectedMake === "All" || car.make === selectedMake;
    const matchesBody = selectedBodyStyle === "All" || car.bodyStyle === selectedBodyStyle;

    // Parse price string like "$28,995" to number
    const numericPrice = parseInt(String(car.price).replace(/[^0-9]/g, ""), 10);
    const matchesPrice = !Number.isFinite(numericPrice) || numericPrice <= maxPrice;

    return matchesSearch && matchesMake && matchesBody && matchesPrice;
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
    <div className="min-h-screen bg-[#FBFBFD] text-[#1D1D1F] font-sans pb-24">
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
          {/* Left Column: Advanced Search & Filters */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-[#D2D2D7]/60 shadow-xs space-y-5 sticky top-24">
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

        {/* Bottom Section: Two Tabs Component (Finance Calculator & Trade-In Form) */}
        <div className="bg-white rounded-3xl border border-[#D2D2D7]/60 shadow-xl overflow-hidden max-w-4xl mx-auto">
          {/* Tab Headers */}
          <div className="flex border-b border-[#D2D2D7]/60 bg-[#F5F5F7]/50">
            <button
              onClick={() => setActiveTab("finance")}
              className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider transition-all ${activeTab === "finance" ? "bg-white text-blue-600 border-b-2 border-blue-600 shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
            >
              Finance Calculator
            </button>
            <button
              onClick={() => setActiveTab("trade")}
              className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider transition-all ${activeTab === "trade" ? "bg-white text-blue-600 border-b-2 border-blue-600 shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
            >
              Trade-In Appraisal
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-8 sm:p-12">
            {activeTab === "finance" ? (
              <div className="space-y-8">
                <div className="text-center max-w-lg mx-auto">
                  <h3 className="text-2xl font-bold tracking-tight text-[#1D1D1F]">
                    Estimate Your Monthly Payment
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Configure your terms to find an estimated financing plan tailored to your budget.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div className="space-y-5">
                    <div>
                      <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
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
                      <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
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
                      <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                        <span>Loan Term</span>
                        <span>{loanTerm} Months</span>
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

                  {/* Estimated Output Card */}
                  <div className="bg-[#F5F5F7] p-8 rounded-2xl border border-[#D2D2D7]/60 text-center flex flex-col justify-center space-y-3">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                      Estimated Payment
                    </span>
                    <div className="text-4xl font-bold text-blue-600">
                      ${Math.round(monthlyPayment).toLocaleString()}{" "}
                      <span className="text-xs text-slate-500 font-normal">/mo</span>
                    </div>
                    <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-200">
                      Based on {interestRate}% APR and ${loanAmount.toLocaleString()} financed amount. Subject
                      to credit approval.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-8 max-w-xl mx-auto">
                <div className="text-center">
                  <h3 className="text-2xl font-bold tracking-tight text-[#1D1D1F]">Value Your Trade-In</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Get an instant preliminary estimate for your current vehicle toward your next purchase.
                  </p>
                </div>

                {tradeSubmitted ? (
                  <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-2">
                    <h4 className="text-sm font-bold text-emerald-700">Appraisal Inquiry Submitted</h4>
                    <p className="text-xs text-emerald-600">
                      Our valuation team will review your vehicle details and contact you with an offer within
                      24 hours.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleTradeSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Make</label>
                        <input
                          type="text"
                          placeholder="e.g. Toyota"
                          required
                          value={tradeMake}
                          onChange={(e) => setTradeMake(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Model</label>
                        <input
                          type="text"
                          placeholder="e.g. RAV4"
                          required
                          value={tradeModel}
                          onChange={(e) => setTradeModel(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Year</label>
                        <input
                          type="number"
                          placeholder="2019"
                          required
                          value={tradeYear}
                          onChange={(e) => setTradeYear(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Mileage</label>
                        <input
                          type="text"
                          placeholder="45,000 mi"
                          required
                          value={tradeMileage}
                          onChange={(e) => setTradeMileage(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-lg shadow-blue-500/20 transition-all mt-4"
                    >
                      Get Trade-In Estimate
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
