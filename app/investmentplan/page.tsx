// components/investmentPlanDashboard.tsx
"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Spinner } from "@/components/spinner";

interface DailyinvestmentPlan {
  Breakfast?: string;
  Lunch?: string;
  Dinner?: string;
  Snacks?: string;
}

interface WeeklyinvestmentPlan {
  [day: string]: DailyinvestmentPlan;
}

interface investmentPlanResponse {
  investmentPlan?: WeeklyinvestmentPlan;
  error?: string;
}

interface investmentPlanInput {
  dietType: string;
  calories: number;
  allergies: string;
  cuisine: string;
  snacks: boolean;
  days?: number;
}

export default function investmentPlanDashboard() {
  const [dietType, setDietType] = useState("");
  const [calories, setCalories] = useState<number>(2000);
  const [allergies, setAllergies] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [snacks, setSnacks] = useState(false);

  // Initialize the mutation using React Query
  const mutation = useMutation<investmentPlanResponse, Error, investmentPlanInput>({
    mutationFn: async (payload: investmentPlanInput) => {
      const response = await fetch("/api/generate-investmentplan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData: investmentPlanResponse = await response.json();
        throw new Error(errorData.error || "Failed to generate investment plan.");
      }

      return response.json();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload: investmentPlanInput = {
      dietType,
      calories,
      allergies,
      cuisine,
      snacks,
      days: 7, // Ensure a weekly plan is generated
    };

    mutation.mutate(payload);
  };

  // Define the days of the week in order
  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  // Function to retrieve the investment plan for a specific day
  const getinvestmentPlanForDay = (day: string): DailyinvestmentPlan | undefined => {
    if (!mutation.data?.investmentPlan) return undefined;

    return mutation.data.investmentPlan[day];
  };

  return (
    <div className="min-h-screen flex items-center justify-center  p-4">
      <div className="w-full max-w-6xl flex flex-col md:flex-row bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Left Panel: Form */}
        <div className="w-full md:w-1/3 lg:w-1/4 p-6 bg-emerald-500 text-white">
          <h1 className="text-2xl font-bold mb-6 text-center">
            AI investment Plan Generator
          </h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Diet Type */}
            <div>
              <label
                htmlFor="dietType"
                className="block text-sm font-medium mb-1"
              >
                Diet Type
              </label>
              <input
                type="text"
                id="dietType"
                value={dietType}
                onChange={(e) => setDietType(e.target.value)}
                required
                className="w-full px-3 py-2 border border-emerald-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="e.g., Vegetarian, Keto, Mediterranean"
              />
            </div>

            {/* Calories */}
            <div>
              <label
                htmlFor="calories"
                className="block text-sm font-medium mb-1"
              >
                Daily Calorie Goal
              </label>
              <input
                type="number"
                id="calories"
                value={calories}
                onChange={(e) => setCalories(Number(e.target.value))}
                required
                min={500}
                max={5000}
                className="w-full px-3 py-2 border border-emerald-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="e.g., 2000"
              />
            </div>

            {/* Allergies */}
            <div>
              <label
                htmlFor="allergies"
                className="block text-sm font-medium mb-1"
              >
                Allergies or Restrictions
              </label>
              <input
                type="text"
                id="allergies"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                className="w-full px-3 py-2 border border-emerald-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="e.g., Nuts, Dairy, None"
              />
            </div>

            {/* Preferred Cuisine */}
            <div>
              <label
                htmlFor="cuisine"
                className="block text-sm font-medium mb-1"
              >
                Preferred Cuisine
              </label>
              <input
                type="text"
                id="cuisine"
                value={cuisine}
                onChange={(e) => setCuisine(e.target.value)}
                className="w-full px-3 py-2 border border-emerald-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="e.g., Italian, Chinese, No Preference"
              />
            </div>

            {/* Snacks */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="snacks"
                checked={snacks}
                onChange={(e) => setSnacks(e.target.checked)}
                className="h-4 w-4 text-emerald-300 border-emerald-300 rounded"
              />
              <label htmlFor="snacks" className="ml-2 block text-sm text-white">
                Include Snacks
              </label>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={mutation.isPending}
                className={`w-full bg-emerald-500 text-white py-2 px-4 rounded-md hover:bg-emerald-600 transition-colors ${mutation.isPending ? "opacity-50 cursor-not-allowed" : ""
                  }`}
              >
                {mutation.isPending ? "Generating..." : "Generate investment Plan"}
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

        {/* Right Panel: Weekly investment Plan Display */}
        <div className="w-full md:w-2/3 lg:w-3/4 p-6 bg-gray-50">
          <h2 className="text-2xl font-bold mb-6 text-emerald-700">
            Weekly investment Plan
          </h2>

          {mutation.isSuccess && mutation.data.investmentPlan ? (
            <div className="h-[600px] overflow-y-auto">
              <div className="space-y-6">
                {daysOfWeek.map((day) => {
                  const investmentPlan = getinvestmentPlanForDay(day);
                  return (
                    <div
                      key={day}
                      className="bg-white shadow-md rounded-lg p-4 border border-emerald-200"
                    >
                      <h3 className="text-xl font-semibold mb-2 text-emerald-600">
                        {day}
                      </h3>
                      {investmentPlan ? (
                        <div className="space-y-2">
                          <div>
                            <strong>Breakfast:</strong> {investmentPlan.Breakfast}
                          </div>
                          <div>
                            <strong>Lunch:</strong> {investmentPlan.Lunch}
                          </div>
                          <div>
                            <strong>Dinner:</strong> {investmentPlan.Dinner}
                          </div>
                          {investmentPlan.Snacks && (
                            <div>
                              <strong>Snacks:</strong> {investmentPlan.Snacks}
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-500">No investment plan available.</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : mutation.isPending ? (
            <div className="flex justify-center items-center h-full">
              {/* Spinner */}
              <Spinner />
            </div>
          ) : (
            <p className="text-gray-600">
              Please generate a investment plan to see it here.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}