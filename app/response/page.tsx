"use client";

import { Suspense } from "react";
import SearchBar from "@/components/search-bar";
import { useSearchParams } from "next/navigation";
import StockDataDisplay from "@/components/StockDataDisplay";

function ResponseContent() {
  const searchParams = useSearchParams();
  const question = searchParams.get("question") || "No question provided.";
  const answer = searchParams.get("answer") || "No answer provided.";

  let content = <div className="whitespace-pre-wrap">{answer}</div>;
  try {
    const parsed = JSON.parse(answer);
    if (parsed && parsed["Meta Data"]) {
      content = <StockDataDisplay data={parsed} />;
    }
  } catch {
    // Not JSON; leave content as plain text.
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="p-4 bg-green border border-gray-200 rounded whitespace-pre-wrap mb-8">
        <h3 className="font-medium text-lg mb-2">Your question:</h3>
        {question}
      </div>
      <div className="p-4 border border-gray-200 rounded">
        {content}
      </div>
    </div>
  );
}

export default function ResponsePage() {
  return (
    <div className="px-4 py-8 sm:py-12 lg:py-16 w-full bg-black-50">
      <Suspense fallback={<div>Loading response...</div>}>
        <ResponseContent />
      </Suspense>
      <SearchBar hideHeading={true} />
      <div className="flex justify-center items-center mt-8">
        Not Investment Advice. For Entertainment Purposes Only.
      </div>
    </div>
  );
}