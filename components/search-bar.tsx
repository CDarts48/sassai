import React, { useState, useEffect } from 'react';

interface SymbolSuggestion {
  "1. symbol": string;
  "2. name": string;
  // add any extra fields you need
}

interface SearchBarProps {
    onResult: (response: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = () => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SymbolSuggestion[]>([]);
  const [result, setResult] = useState<string>(''); // new state variable for result

  // Debounce and fetch suggestions from your ticker search API when user types
  useEffect(() => {
    // Clear suggestions if nothing is typed
    if (message.trim().length < 1) {
      setSuggestions([]);
      return;
    }

    const debounceTimer = setTimeout(() => {
      const fetchSuggestions = async (keywords: string) => {
        try {
          const response = await fetch(`/api/ticker-search?keywords=${encodeURIComponent(keywords)}`);
          const data = await response.json();
          // The API returns a "bestMatches" array
          if (data && data.bestMatches) {
            setSuggestions(data.bestMatches);
          } else {
            setSuggestions([]);
          }
        } catch (error) {
          console.error('Error fetching ticker suggestions:', error);
          setSuggestions([]);
        }
      };
      fetchSuggestions(message);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [message]);

  // Clear suggestions immediately when typing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessage(value);
    if (value.trim().length < 1) {
      setSuggestions([]);
    }
  };

  // When user clicks a suggestion, set that as the search query and trigger the search
  const handleSuggestionClick = (suggestion: SymbolSuggestion) => {
    const query = suggestion["1. symbol"];
    setMessage(query);
    setSuggestions([]);
    handleSendMessage(query);
  };

  const handleSendMessage = async (searchQuery?: string) => {
    const query = searchQuery ?? message;
    if (query.trim() === '') return;
    setLoading(true);
    try {
      const response = await fetch('/api/search-bar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query }),
      });
      const data = await response.json();
      if (response.ok) {
        setResult(data.answer); // set the result state
      } else {
        console.error(data.error);
        setResult("Error fetching result.");
      }
    } catch (error) {
      console.error('Error sending search query:', error);
      setResult("An error occurred.");
    }
    setLoading(false);
    setMessage('');
    setSuggestions([]);
  };

  return (
    <div className="text-center mb-12">
      <h3 className="text-xl font-semibold mb-4">Try it free!</h3>

      {/* Render the response result if available */}
      {result && (
        <div className="mb-4 p-4 border rounded-md bg-white-50 whitespace-pre-wrap">
          {result}
        </div>
      )}
      
      <input
        type="text"
        value={message}
        onChange={handleInputChange}
        placeholder="Search…"
        className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-400"
      />
      {suggestions.length > 0 && (
        <ul className="mt-4 border border-gray-200 rounded-md p-2">
          {suggestions.map((item, i) => (
            <li 
              key={i} 
              className="p-1 cursor-pointer hover:bg-black-100"
              onClick={() => handleSuggestionClick(item)}
            >
              <strong>{item["1. symbol"]}</strong> - {item["2. name"]}
            </li>
          ))}
        </ul>
      )}
      <button 
        onClick={() => handleSendMessage()} 
        disabled={loading}
        className="ml-4 bg-emerald-500 text-white px-4 py-2 rounded-md hover:bg-emerald-600 transition-colors"
      >
        {loading ? 'Loading...' : 'Go'}
      </button>
    </div>
  );
};

export default SearchBar;