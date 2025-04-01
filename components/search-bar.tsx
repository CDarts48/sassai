import React, { useState } from 'react';

interface SearchBarProps {
  // A callback to process the returned answer from the API
  onResult: (answer: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onResult }) => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  const handleSendMessage = async () => {
    if (message.trim() === '') return;
    setLoading(true);
    try {
      const response = await fetch('/api/search-bar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      const data = await response.json();
      if (response.ok) {
        onResult(data.answer);
      } else {
        console.error(data.error);
      }
    } catch (error) {
      console.error('Error sending search query:', error);
    }
    setLoading(false);
    setMessage('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="text-center mb-12">
      <h3 className="text-xl font-semibold mb-4">Try it free!</h3>
      <input
        type="text"
        value={message}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder="Search.."
        className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-400"
      />
      <button
        onClick={handleSendMessage}
        disabled={loading}
        className="ml-4 bg-emerald-500 text-white px-4 py-2 rounded-md hover:bg-emerald-600 transition-colors"
      >
        {loading ? 'Loading...' : 'Go'}
      </button>
    </div>
  );
};

export default SearchBar;