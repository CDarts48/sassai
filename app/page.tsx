"use client";

import { useState } from "react";
import SearchBar from "@/components/search-bar";
import Link from "next/link";

export default function HomePage() {
  const [answer, setAnswer] = useState("");

  return (
    <div className="px-4 py-8 sm:py-12 lg:py-16 max-w-7xl mx-auto">
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
              {/* Icon for Step 1 */}
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
              {/* Icon for Step 2 */}
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
              {/* Icon for Step 3 */}
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
      <section>
        <SearchBar onResult={(response) => setAnswer(response)} />
        {answer && (
          <div className="mt-4 p-4 bg-gray-100 border border-gray-200 rounded">
            <p className="text-gray-800">{answer}</p>
          </div>
        )}
      </section>

      <div className="text-xl text-center font-semibold mb-4">
        For entertainment purposes only! Not Investment advice.
      </div>
    </div>
  );
}