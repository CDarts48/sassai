"use client";

import SearchBar from "@/components/search-bar";
import { useSearchParams } from "next/navigation";

export default function ResponsePage() {
  const searchParams = useSearchParams();
  const question = searchParams.get("question") || "No question provided.";
  const answer = searchParams.get("answer") || "No answer provided.";

  return (
    <div className="px-4 py-8 sm:py-12 lg:py-16 w-full bg-black-50">
      <div className="max-w-7xl mx-auto">
        <div className="p-4 bg-green border border-gray-200 rounded whitespace-pre-wrap mb-8">
          {question}
        </div>
        <div className="p-4 bg--100 border border-gray-200 rounded whitespace-pre-wrap">
          {answer}
        </div>
      </div>
      <SearchBar hideHeading={true} />
      </div>
  );
}