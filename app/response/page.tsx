"use client";

import { useSearchParams } from "next/navigation";

export default function ResponseContent() {
  const searchParams = useSearchParams();
  const question = searchParams.get("question");
  const answer = searchParams.get("answer");

  return (
    <div>
      <h1>Response</h1>
      <p>Question: {question}</p>
      <p>Answer: {answer}</p>
    </div>
  );
}