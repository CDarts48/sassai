"use client";

import { useEffect, useState } from 'react';
import { NewsArticle } from '../../types/newsTypes';
import sanitizeText from '../../utils/sanitizeText';
import styles from './dashboard.module.css';

function Dashboard() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [account, setAccount] = useState(null);
  const [positions, setPositions] = useState([]);

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


  useEffect(() => {
    async function loadAccount() {
      try {
        console.log('Fetching account information...');
        const response = await fetch('/api/account');
        const data = await response.json();
        setAccount(data);
        console.log('Account data:', data);
      } catch (error) {
        console.error('Error loading account information:', error);
      }
    }

    loadAccount();
  }, []);

  useEffect(() => {
    async function loadPositions() {
      try {
        console.log('Fetching positions...');
        const response = await fetch('/api/positions');

        if (!response.ok) {
          console.error('API response not ok:', response.status, response.statusText);
          return;
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          console.error('Response is not JSON:', text);
          return;
        }

        const data = await response.json();
        console.log('Positions data received:', data);
        setPositions(data);
      } catch (error) {
        console.error('Error loading positions:', error);
      }
    }

    loadPositions();
  }, []);

  return (
    <div className={styles.container}>
      <section className={styles.section}>
        <div className="mt-8">
          <h2 className={styles.heading}>Account Overview</h2>

          {/* Account Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-700">Account Information</h3>
            {account ? (
              <div className={styles.accountInfo}>
                <p>Buying Power: ${account.buying_power || 'N/A'}</p>
                <p>Equity: ${account.equity || 'N/A'}</p>
                <p>Status: {account.status || 'N/A'}</p>
              </div>
            ) : (
              <p>Loading account information...</p>
            )}
          </div>

          {/* Positions */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-700">Current Positions</h3>
            {positions && positions.length > 0 ? (
              <ul className={styles.portfolioList}>
                {positions.map((position, index) => (
                  <li key={index} className={styles.portfolioItem}>
                    <p><strong>Symbol:</strong> {position.symbol || 'N/A'}</p>
                    <p><strong>Quantity:</strong> {position.qty || 'N/A'}</p>
                    <p><strong>Market Value:</strong> ${position.market_value || 'N/A'}</p>
                    <p><strong>Current Price:</strong> ${position.current_price || 'N/A'}</p>
                    <p><strong>Unrealized P&L:</strong> ${position.unrealized_pl || 'N/A'}</p>
                    <p><strong>Asset Class:</strong> {position.asset_class || 'N/A'}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No positions found or loading...</p>
            )}
          </div>
        </div>
      </section>
      <section className={styles.section}>
        <div className="mt-8">
          <h2 className={styles.heading}>Real-Time News</h2>
          <ul className={styles.newsList}>
            {news.map((item) => (
              <li key={item.id} className={styles.newsItem}>
                <a href={item.url || '#'} target="_blank" rel="noopener noreferrer" className={styles.newsHeadline}>
                  {sanitizeText(item.headline)}
                </a>
                <p className="text-sm text-gray-600">{sanitizeText(item.summary)}</p>
                <p className={styles.newsSource}>Source: {sanitizeText(item.source)}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;