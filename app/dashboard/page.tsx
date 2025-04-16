"use client";

import { useEffect, useState } from 'react';
import { NewsArticle } from '../../types/newsTypes';
import sanitizeText from '../../utils/sanitizeText';

function Dashboard() {
  const [news, setNews] = useState<NewsArticle[]>([]);

  useEffect(() => {
    async function loadNews() {
      try {
        console.log('Fetching news...');
        const response = await fetch('/api/alpaca-news');
        const data = await response.json();

        if (data && Array.isArray(data.news)) {
          setNews(data.news);
        } else {
          console.error('Unexpected API response:', data);
          setNews([]); // Fallback to an empty array
        }
      } catch (error) {
        console.error('Error loading news:', error);
        setNews([]); // Fallback to an empty array
      }
    }

    loadNews();
  }, []);

  return (
    <div className="px-4 py-8 sm:py-12 lg:py-16 max-w-7xl mx-auto">
      <h1>Dashboard</h1>
      <p>Welcome to the dashboard!</p>
      <div className="mt-8">
        <h2>Real-Time News</h2>
        <ul>
          {news.map((item) => (
            <li key={item.id} className="mb-4">
              <a href={item.url || '#'} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                {sanitizeText(item.headline)}
              </a>
              <p className="text-sm text-gray-600">{sanitizeText(item.summary)}</p>
              <p className="text-xs text-gray-500">Source: {sanitizeText(item.source)}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Dashboard;