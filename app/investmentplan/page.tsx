"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Spinner } from "@/components/spinner";

// Rename the daily plan fields for investment strategies
interface DailyInvestmentPlan {
  Morning?: string;      // e.g., Market opening strategy or tip
  Afternoon?: string;    // e.g., Midday market update
  Evening?: string;      // e.g., End-of-day summary or tip
  Alternative?: string;  // e.g., Alternative investment tip if applicable
}

// Weekly plan contains one record per day
interface WeeklyInvestmentPlan {
  [day: string]: DailyInvestmentPlan;
}

interface InvestmentPlanResponse {
  investmentPlan?: WeeklyInvestmentPlan;
  error?: string;
}

// Input for the investment AI
interface InvestmentPlanInput {
  investmentGoal: string;
  riskTolerance: number;
  investmentConstraints: string;
  preferredMarkets: string;
  includeAlternatives: boolean;
  days?: number;
}

export default function InvestmentPlanDashboard() {
  // Form state for investment plan inputs
  const [investmentGoal, setInvestmentGoal] = useState("");
  const [riskTolerance, setRiskTolerance] = useState<number>(5);
  const [investmentConstraints, setInvestmentConstraints] = useState("");
  const [preferredMarkets, setPreferredMarkets] = useState("");
  const [includeAlternatives, setIncludeAlternatives] = useState(false);

  // Mutation for calling your API to generate an investment plan
  const mutation = useMutation<InvestmentPlanResponse, Error, InvestmentPlanInput>({
    mutationFn: async (payload: InvestmentPlanInput) => {
      const response = await fetch("/api/generate-investmentplan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData: InvestmentPlanResponse = await response.json();
        throw new Error(errorData.error || "Failed to generate investment plan.");
      }

      return response.json();
    },
  });

  // Form submit handler – builds the payload and invokes the mutation
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload: InvestmentPlanInput = {
      investmentGoal,
      riskTolerance,
      investmentConstraints,
      preferredMarkets,
      includeAlternatives,
      days: 7, // Generate a weekly investment plan
    };

    mutation.mutate(payload);
  };

  // Define days of the week – assumes the response is keyed by day
  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  // Retrieve the plan for a given day from the mutation response
  const getInvestmentPlanForDay = (day: string): DailyInvestmentPlan | undefined => {
    if (!mutation.data?.investmentPlan) return undefined;
    return mutation.data.investmentPlan[day];
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-6xl flex flex-col md:flex-row bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Left Panel: Investment Plan Form */}
        <div className="w-full md:w-1/3 lg:w-1/4 p-6 bg-emerald-500 text-white">
          <h1 className="text-2xl font-bold mb-6 text-center">
            AI Investment Plan Generator
          </h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Investment Goal */}
            <div>
              <label htmlFor="investmentGoal" className="block text-sm font-medium mb-1">
                Investment Goal
              </label>
              <input
                type="text"
                id="investmentGoal"
                value={investmentGoal}
                onChange={(e) => setInvestmentGoal(e.target.value)}
                required
                className="w-full px-3 py-2 border border-emerald-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="e.g., Retirement, Wealth Growth"
              />
            </div>

            {/* Risk Tolerance */}
            <div>
              <label htmlFor="riskTolerance" className="block text-sm font-medium mb-1">
                Risk Tolerance (1-10)
              </label>
              <input
                type="number"
                id="riskTolerance"
                value={riskTolerance}
                onChange={(e) => setRiskTolerance(Number(e.target.value))}
                required
                min={1}
                max={10}
                className="w-full px-3 py-2 border border-emerald-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="e.g., 5"
              />
            </div>

            {/* Investment Constraints */}
            <div>
              <label htmlFor="investmentConstraints" className="block text-sm font-medium mb-1">
                Investment Constraints
              </label>
              <input
                type="text"
                id="investmentConstraints"
                value={investmentConstraints}
                onChange={(e) => setInvestmentConstraints(e.target.value)}
                className="w-full px-3 py-2 border border-emerald-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="e.g., Avoid high volatility"
              />
            </div>

            {/* Preferred Markets */}
            <div>
              <label htmlFor="preferredMarkets" className="block text-sm font-medium mb-1">
                Preferred Markets
              </label>
              <input
                type="text"
                id="preferredMarkets"
                value={preferredMarkets}
                onChange={(e) => setPreferredMarkets(e.target.value)}
                className="w-full px-3 py-2 border border-emerald-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="e.g., US, International, Emerging Markets"
              />
            </div>

            {/* Include Alternative Investments */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="includeAlternatives"
                checked={includeAlternatives}
                onChange={(e) => setIncludeAlternatives(e.target.checked)}
                className="h-4 w-4 text-emerald-300 border-emerald-300 rounded"
              />
              <label htmlFor="includeAlternatives" className="ml-2 block text-sm text-white">
                Include Alternative Investments
              </label>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={mutation.isPending}
                className={`w-full bg-emerald-500 text-white py-2 px-4 rounded-md hover:bg-emerald-600 transition-colors ${
                  mutation.isPending ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {mutation.isPending ? "Generating..." : "Generate Investment Plan"}
              </button>
            </div>
          </form>

          {/* Error Message */}
          {mutation.isError && (
            <div className="mt-4 p-3 bg-red-200 text-red-800 rounded-md">
              {mutation.error?.message || "An unexpected error occurred."}
            </div>
          )}
        </div>

        {/* Right Panel: Display the Weekly Investment Plan */}
        <div className="w-full md:w-2/3 lg:w-3/4 p-6 bg-gray-50">
          <h2 className="text-2xl font-bold mb-6 text-emerald-700">
            Weekly Investment Plan
          </h2>

          {mutation.isSuccess && mutation.data.investmentPlan ? (
            <div className="h-[600px] overflow-y-auto">
              <div className="space-y-6">
                {daysOfWeek.map((day) => {
                  const investmentPlan = getInvestmentPlanForDay(day);
                  return (
                    <div key={day} className="bg-white shadow-md rounded-lg p-4 border border-emerald-200">
                      <h3 className="text-xl font-semibold mb-2 text-emerald-600">{day}</h3>
                      {investmentPlan ? (
                        <div className="space-y-2">
                          <div>
                            <strong>Morning Strategy:</strong> {investmentPlan.Morning}
                          </div>
                          <div>
                            <strong>Afternoon Strategy:</strong> {investmentPlan.Afternoon}
                          </div>
                          <div>
                            <strong>Evening Strategy:</strong> {investmentPlan.Evening}
                          </div>
                          {investmentPlan.Alternative && (
                            <div>
                              <strong>Alternative:</strong> {investmentPlan.Alternative}
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-500">No investment plan available for this day.</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : mutation.isPending ? (
            <div className="flex justify-center items-center h-full">
              <Spinner />
            </div>
          ) : (
            <p className="text-gray-600">Please generate an investment plan to see it here.</p>
          )}
        </div>
      </div>
    </div>
  );
}