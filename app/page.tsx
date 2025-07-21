"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SearchBar from "@/components/search-bar";
import Link from "next/link";

export default function HomePage() {
  const router = useRouter();
  const [loadingSymbol, setLoadingSymbol] = useState<string | null>(null);

  const handleCompanyClick = async (symbol: string) => {
    try {
      setLoadingSymbol(symbol);
      const res = await fetch(
        `/api/ticker-search?keywords=${encodeURIComponent(symbol)}`
      );
      if (!res.ok) {
        console.error("Ticker search API error", res.status);
        return;
      }
      const data = await res.json();
      // Format the returned data as needed. Here we simply stringify the JSON.
      const formattedAnswer = JSON.stringify(data, null, 2);
      router.push(
        `/response?question=${encodeURIComponent(
          symbol
        )}&answer=${encodeURIComponent(formattedAnswer)}`
      );
    } catch (error) {
      console.error("Error fetching ticker search data:", error);
    } finally {
      setLoadingSymbol(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">
          <h1 className="text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-emerald-200 bg-clip-text text-transparent">
            Institutional-Grade AI Investment Platform
          </h1>
          <p className="text-xl lg:text-2xl mb-8 text-slate-200 max-w-3xl mx-auto leading-relaxed">
            Leverage advanced quantitative models and machine learning to optimize your portfolio with institutional-quality insights.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-semibold text-lg rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all duration-300 shadow-xl hover:shadow-2xl border border-emerald-500/20"
          >
            Take a tour of our platform.
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-6">How It Works</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Follow these simple steps
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Step 1 */}
            <div className="text-center group">
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-full h-20 w-20 flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <span className="text-2xl font-bold">1</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-slate-900">Create an Account</h3>
              <p className="text-slate-600 leading-relaxed">
                Sign up through our secure platform.
              </p>
            </div>
            {/* Step 2 */}
            <div className="text-center group">
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-full h-20 w-20 flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <span className="text-2xl font-bold">2</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-slate-900">Set Your Preferences</h3>
              <p className="text-slate-600 leading-relaxed">
                Input your preferences and risk tolerance.
              </p>
            </div>
            {/* Step 3 */}
            <div className="text-center group">
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-full h-20 w-20 flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <span className="text-2xl font-bold">3</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-slate-900">
                Receive Your Insights.
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Let our AI find things others may not.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Market Research Tools</h2>
            <p className="text-lg text-slate-600">
              Access institutional-grade research and analysis
            </p>
          </div>
          <SearchBar />
        </div>
      </section>

      {/* Companies Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Featured Securities</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Discover the benefits of using our AI-driven platform.
              Click a company symbol below to see institutional-grade analysis:
            </p>
          </div>
          <div className="flex justify-center space-x-6">
            {["AAPL", "MSFT", "GOOGL", "AMZN"].map((symbol) => (
              <button
                key={symbol}
                onClick={() => handleCompanyClick(symbol)}
                className="px-8 py-4 bg-white border-2 border-slate-200 rounded-lg font-semibold text-slate-800 hover:border-emerald-500 hover:text-emerald-600 hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loadingSymbol === symbol}
              >
                {loadingSymbol === symbol ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600"></div>
                    <span>Loading...</span>
                  </div>
                ) : (
                  symbol
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-6">Our Services</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Comprehensive solutions powered by artificial intelligence
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Portfolio Management */}
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-slate-200">
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg h-16 w-16 flex items-center justify-center mb-6">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Portfolio Management</h3>
              <p className="text-slate-600 leading-relaxed">
                Harness the power of AI.
              </p>
            </div>
            {/* Real Time Stock Tracking & Quantitative Analysis */}
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-slate-200">
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg h-16 w-16 flex items-center justify-center mb-6">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">
                Real-Time Analytics
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Stay updated with live data and deep analysis.
              </p>
            </div>
            {/* Crypto */}
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-slate-200">
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg h-16 w-16 flex items-center justify-center mb-6">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Digital Assets</h3>
              <p className="text-slate-600 leading-relaxed">
                Explore the world of cryptocurrency.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer Section */}
    </div>
  );
}