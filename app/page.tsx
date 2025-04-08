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
    <div className="px-4 py-8 sm:py-12 lg:py-16 w-full mx-auto">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-emerald-400 to-emerald-600 text-white rounded-lg mb-12 p-8 text-center">
        <h1 className="text-4xl font-bold mb-4">
          Personalized AI Investment Plans
        </h1>
        <p className="text-xl mb-6">
          Let our AI do the planning. Enjoy a cutting edge investment strategy!
        </p>
        <Link
          href="/sign-up"
          className="inline-block bg-white text-emerald-500 font-medium px-5 py-3 rounded hover:bg-gray-100 transition-colors"
        >
          Get Started
        </Link>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="mb-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-semibold">How It Works</h2>
          <p className="mt-2 text-gray-600">
            Follow these simple steps to get your personalized investment plan
          </p>
        </div>
        <div className="flex flex-col md:flex-row justify-center items-start space-y-8 md:space-y-0 md:space-x-8">
          {/* Step 1 */}
          <div className="flex flex-col items-center">
            <div className="bg-emerald-500 text-white rounded-full h-16 w-16 flex items-center justify-center mb-4">
              <span className="text-4xl font-bold">@</span>
            </div>
            <h3 className="text-xl font-medium mb-2">Create an Account</h3>
            <p className="text-center text-gray-600">
              Sign up or sign in to access your personalized investment plans.
            </p>
          </div>
          {/* Step 2 */}
          <div className="flex flex-col items-center">
            <div className="bg-emerald-500 text-white rounded-full h-16 w-16 flex items-center justify-center mb-4">
              <span className="text-4xl font-bold">%</span>
            </div>
            <h3 className="text-xl font-medium mb-2">Set Your Preferences</h3>
            <p className="text-center text-gray-600">
              Input your investment preferences and goals to tailor your
              investment plans.
            </p>
          </div>
          {/* Step 3 */}
          <div className="flex flex-col items-center">
            <div className="bg-emerald-500 text-white rounded-full h-16 w-16 flex items-center justify-center mb-4">
              <span className="text-4xl font-bold">$</span>
            </div>
            <h3 className="text-xl font-medium mb-2">
              Receive Your Investment Plan
            </h3>
            <p className="text-center text-gray-600">
              Get your customized Investment plan delivered weekly to your
              account.
            </p>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="mb-12">
        <SearchBar />
      </section>;

      {/* Companies Section */}
      <section className="mb-12">
        <div className="text-center mb-8">
          <p className="mt-2 text-gray-600">
            Discover the benefits of using our AI-driven investment platform.
            Click a company symbol below to see details:
          </p>
        </div>
        <div className="flex justify-center space-x-4">
          {["AAPL", "MSFT", "GOOGL", "AMZN"].map((symbol) => (
            <button
              key={symbol}
              onClick={() => handleCompanyClick(symbol)}
              className="px-4 py-2 border rounded hover:bg-gray-100 transition"
              disabled={loadingSymbol === symbol}
            >
              {loadingSymbol === symbol ? "Loading..." : symbol}
            </button>
          ))}
        </div>
      </section>

      {/* Plans Section */}
      <section className="mb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Portfolio Management */}
          <div className="p-6 border rounded-lg">
            <h2 className="text-2xl font-semibold mb-2">Portfolio Management</h2>
            <p className="text-gray-600">
              Harness the power of AI to manage your portfolio with advanced
              investment strategies tailored to your financial goals.
            </p>
          </div>
          {/* Real Time Stock Tracking & Quantitative Analysis */}
          <div className="p-6 border rounded-lg">
            <h2 className="text-2xl font-semibold mb-2">
              Real-Time Stock Tracking & Quantitative Analysis
            </h2>
            <p className="text-gray-600">
              Stay updated with live stock prices and deep quantitative analysis
              to make informed investment decisions, powered by real-time data.
            </p>
          </div>
          {/* Crypto */}
          <div className="p-6 border rounded-lg">
            <h2 className="text-2xl font-semibold mb-2">Crypto</h2>
            <p className="text-gray-600">
              Explore the world of cryptocurrency with insights, market trends,
              and expert analysis on top crypto assets to diversify your
              portfolio.
            </p>
          </div>
        </div>
      </section>

      {/* Disclaimer Section */}
      <section className="mb-12">
        <div className="text-xl text-center font-semibold mb-4">
          For entertainment purposes only! Not Investment advice.
        </div>
      </section>
    </div>
  );
}