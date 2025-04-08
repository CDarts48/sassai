"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface SearchBarProps {
  hideHeading?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ hideHeading = false }) => {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    setLoading(true);
    const originalQuestion = message;
    try {
      const response = await fetch(`/api/search-bar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });
      const data = await response.json();
      if (response.ok) {
        router.push(
          `/response?question=${encodeURIComponent(
            originalQuestion
          )}&answer=${encodeURIComponent(data.answer)}`
        );
      } else {
        console.error(data.error);
      }
    } catch (error) {
      console.error("Error sending search query:", error);
    } finally {
      setLoading(false);
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };
  

  return (
    <div className="text-center mb-12">
      {!hideHeading && (
        <h3 className="text-xl font-semibold mb-4">Try it free!</h3>
      )}
      <input
        type="text"
        value={message}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder="Search…"
        className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-400"
      />
      <button
        onClick={handleSendMessage}
        className="mt-4 px-4 py-2 bg-emerald-500 text-white rounded hover:bg-emerald-600 transition"
      >
        {loading ? "Loading..." : "Search"}
      </button>
    </div>
  );
};

export default SearchBar;