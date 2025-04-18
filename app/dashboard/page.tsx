"use client";

import { useEffect, useState } from 'react';
import { NewsArticle } from '../../types/newsTypes';
import sanitizeText from '../../utils/sanitizeText';

function Dashboard() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [portfolio] = useState([]);
  const [account, setAccount] = useState(null);

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

  // useEffect(() => {
  //   async function loadPortfolio() {
  //     try {
  //       console.log('Fetching portfolio...');
  //       const response = await fetch('/api/portfolio');
  //       const data = await response.json();

  //       if (Array.isArray(data)) {
  //         setPortfolio(data);
  //       } else {
  //         console.error('Unexpected portfolio response:', data);
  //         setPortfolio([]); // Fallback to an empty array
  //       }
  //     } catch (error) {
  //       console.error('Error loading portfolio:', error);
  //       setPortfolio([]); // Fallback to an empty array
  //     }
  //   }

  //   loadPortfolio();
  // }, []);

  useEffect(() => {
    async function loadAccount() {
      try {
        console.log('Fetching account information...');
        const response = await fetch('/api/account');
        const data = await response.json();
        setAccount(data);
      } catch (error) {
        console.error('Error loading account information:', error);
      }
    }

    loadAccount();
  }, []);

  return (
    <div className="px-4 py-8 sm:py-12 lg:py-16 max-w-7xl mx-auto">
      <section>
        <h2>Portfolio</h2>
        <ul>
          {portfolio.map((item, index) => (
            <li key={index} className="mb-4">
              <p className="text-sm text-gray-600">{JSON.stringify(item)}</p>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <div className="mt-8">
          <h2>Account Information</h2>
          {account ? (
            <div className="text-sm text-gray-600">
              <p>Buying Power: ${account.buying_power || 'N/A'}</p>
              <p>Equity: ${account.equity || 'N/A'}</p>
              <p>Status: {account.status || 'N/A'}</p>
            </div>
          ) : (
            <p>Loading account information...</p>
          )}
        </div>
      </section>
      <section>
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
      </section>
    </div>
  );
}

export default Dashboard;