import { NextResponse } from "next/server";
import { OpenAI } from "openai";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPEN_ROUTER_API_KEY,
});

async function getStockQuote(symbol: string) {
  const alphaApiKey = process.env.ALPHA_VANTAGE_API_KEY;
  const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${alphaApiKey}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Alpha Vantage API error: ${res.status}`);
  }
  const data = await res.json();
  return data["Global Quote"] || null;
}

async function searchTickerByCompanyName(keywords: string): Promise<string | null> {
  const alphaApiKey = process.env.ALPHA_VANTAGE_API_KEY;
  const url = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(
    keywords
  )}&apikey=${alphaApiKey}`;
  const res = await fetch(url);
  if (!res.ok) {
    console.error(`Alpha Vantage SYMBOL_SEARCH error: ${res.status}`);
    return null;
  }
  const data = await res.json();
  if (data?.bestMatches && data.bestMatches.length > 0) {
    return data.bestMatches[0]["1. symbol"] || null;
  }
  return null;
}

export async function POST(request: Request) {
  try {
    const { message } = await request.json();
    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Invalid or missing search message." },
        { status: 400 }
      );
    }

    const lowerMessage = message.toLowerCase();
    let tickerSymbol: string | null = null;

    // First try to extract a ticker from the user's message using a simple regex.
    const tickerRegex = /\$([A-Z]{1,5})/;
    const tickerMatch = message.match(tickerRegex);
    if (tickerMatch) {
      tickerSymbol = tickerMatch[1];
    }
    // If no ticker was found, fall back to a company lookup.
    if (!tickerSymbol) {
      tickerSymbol = await searchTickerByCompanyName(message);
    }

    // If the user asks for a current stock price, return the Global Quote directly.
    if (lowerMessage.includes("current stock price") || lowerMessage.includes("stock price") ) {
      if (tickerSymbol) {
        const stockQuote = await getStockQuote(tickerSymbol);
        return NextResponse.json({
          answer: `Current stock price for ${tickerSymbol}:`,
          stockQuote,
          ticker: tickerSymbol,
        });
      } else {
        return NextResponse.json({
          error: "Could not determine ticker symbol for the requested stock price.",
        }, { status: 400 });
      }
    }
    
    // Otherwise, follow your normal prompt logic.
    const words = message.trim().split(/\s+/);
    const isCompanyQuery = words.length === 1 && !/\$/.test(message);
    
    let prompt: string;
    if (isCompanyQuery) {
      prompt = `Provide a detailed market summary for ${message} including its current stock price and its ticker symbol.`;
    } else {
      prompt = `
      You are an investment AI helping users maximise earning.
      If the user's question does not contain any of the words "invest", "investment", "portfolio", "stock", "stocks", "bonds", "ticker", "dividend", "market", or any similar finance-related keywords, respond ONLY with:
      "I'm Investment AI built to answer investment-related questions. Let's work on your portfolio."
      Otherwise, answer the following question in clear, well-structured sentences without using markdown:
      ${message}
    `;
    }
    
    const response = await openai.chat.completions.create({
      model: "meta-llama/llama-3.2-3b-instruct:free",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1500,
    });
    
    console.log("Full OpenAI response data:", JSON.stringify(response, null, 2));
    let answer = response?.choices?.[0]?.message?.content?.trim();
    if (!answer) {
      return NextResponse.json(
        { error: "No answer generated. Please try again." },
        { status: 500 }
      );
    }
    
    // Remove markdown formatting
    const cleanedAnswer = answer
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/^-+\s/gm, '')
      .replace(/^\s*-\s+/gm, '');
    
    let stockQuote = null;
    if (tickerSymbol) {
      try {
        const quoteData = await getStockQuote(tickerSymbol);
        if (quoteData) {
          stockQuote = quoteData;
        }
      } catch (tickerError) {
        console.error("Error fetching stock quote:", tickerError);
      }
    }
    
    return NextResponse.json({
      answer: cleanedAnswer,
      stockQuote,
      ticker: tickerSymbol,
    });
    
  } catch (error: unknown) {
    console.error("Error processing search query:", error);
    return NextResponse.json(
      { error: "Failed to process search query. Please try again later." },
      { status: 500 }
    );
  }
}