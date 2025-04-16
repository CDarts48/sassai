"use client";

import { useEffect, useState } from 'react';
import { NewsArticle } from '../../types/newsTypes';
import fetchNews from '../../utils/fetchNews';

function Dashboard() {
  const [news, setNews] = useState<NewsArticle[]>([]);

  useEffect(() => {
    async function loadNews() {
      try {
        console.log('Fetching news...');
        const data = await fetchNews();
        setNews(data.news);
      } catch (error) {
        console.error('Error loading news:', error);
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
                {item.headline}
              </a>
              <p className="text-sm text-gray-600">{item.summary}</p>
              <p className="text-xs text-gray-500">Source: {item.source}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Dashboard;