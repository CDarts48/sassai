import { NextResponse } from "next/server";
import { OpenAI } from "openai";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPEN_ROUTER_API_KEY,
});

async function getStockQuote(symbol: string): Promise<Record<string, any> | null> {
  try {
    const alphaApiKey = process.env.ALPHA_VANTAGE_API_KEY;
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${alphaApiKey}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Alpha Vantage API error: ${res.status}`);
    }
    const data = await res.json();
    return data["Global Quote"] || null;
  } catch (error) {
    console.error("getStockQuote error:", error);
    return null;
  }
}

async function getTimeSeriesIntraday(symbol: string): Promise<Record<string, any> | null> {
  try {
    const alphaApiKey = process.env.ALPHA_VANTAGE_API_KEY;
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=5min&outputsize=compact&apikey=${alphaApiKey}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Alpha Vantage TIME_SERIES_INTRADAY error: ${res.status}`);
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("getTimeSeriesIntraday error:", error);
    return null;
  }
}

async function getCompanyOverview(symbol: string): Promise<Record<string, any> | null> {
  try {
    const alphaApiKey = process.env.ALPHA_VANTAGE_API_KEY;
    const url = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${alphaApiKey}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Alpha Vantage OVERVIEW API error: ${res.status}`);
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("getCompanyOverview error:", error);
    return null;
  }
}

async function searchTickerByCompanyName(keywords: string): Promise<string | null> {
  try {
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
  } catch (error) {
    console.error("searchTickerByCompanyName error:", error);
    return null;
  }
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
    const tickerRegex = /\$([A-Z]{1,5})/;
    const tickerMatch = message.match(tickerRegex);
    if (tickerMatch) {
      tickerSymbol = tickerMatch[1];
    }
    if (!tickerSymbol) {
      tickerSymbol = await searchTickerByCompanyName(message);
    }
    
    let answerToReturn: string | null = null;
    let stockQuote: Record<string, any> | null = null;
    let companyOverview: Record<string, any> | null = null;
    
    // Pure market data lookup.
    if (lowerMessage.includes("current stock price") || lowerMessage.includes("stock price")) {
      if (tickerSymbol) {
        stockQuote = await getStockQuote(tickerSymbol);
        companyOverview = await getCompanyOverview(tickerSymbol);
        const currentPrice = stockQuote ? stockQuote["05. price"] || "N/A" : "N/A";
        const marketCap = companyOverview ? companyOverview["MarketCapitalization"] || "N/A" : "N/A";
        answerToReturn = `Current stock price for ${tickerSymbol}: ${currentPrice}\nMarket Capitalization: ${marketCap}`;
      } else {
        return NextResponse.json(
          { error: "Could not determine ticker symbol for the requested stock price." },
          { status: 400 }
        );
      }
    }
    // Investment queries: return both natural language analysis and market data.
    else if (lowerMessage.includes("should i invest") || lowerMessage.includes("invest in")) {
      const prompt = `You are an expert investment advisor. Answer the following investment question in clear, natural language:
"${message}"`;
      const openaiResponse = await openai.chat.completions.create({
        model: "meta-llama/llama-3.2-3b-instruct:free",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 1500,
      });
      const openaiAnswer = openaiResponse?.choices?.[0]?.message?.content?.trim();
      if (!openaiAnswer) {
        return NextResponse.json(
          { error: "No answer generated. Please try again." },
          { status: 500 }
        );
      }
      // Natural language response.
      answerToReturn = openaiAnswer
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .replace(/\*(.*?)\*/g, "$1")
        .replace(/^-+\s/gm, "")
        .replace(/^\s*-\s+/gm, "");
      
      // Append detailed Alpha Vantage market data if ticker symbol is found.
      if (tickerSymbol) {
        stockQuote = await getStockQuote(tickerSymbol);
        companyOverview = await getCompanyOverview(tickerSymbol);
        let detailedMarketData = `\n\nAlpha Vantage Market Data for ${tickerSymbol}:\n`;
        if (stockQuote) {
          detailedMarketData += `Current Market Performance:\n`;
          detailedMarketData += `  - Price: ${stockQuote["05. price"] || "N/A"}\n`;
          detailedMarketData += `  - Open: ${stockQuote["02. open"] || "N/A"}\n`;
          detailedMarketData += `  - High: ${stockQuote["03. high"] || "N/A"}\n`;
          detailedMarketData += `  - Low: ${stockQuote["04. low"] || "N/A"}\n`;
          detailedMarketData += `  - Volume: ${stockQuote["06. volume"] || "N/A"}\n`;
        }
        if (companyOverview) {
          detailedMarketData += `\nCompany Overview:\n`;
          detailedMarketData += `  - Market Capitalization: ${companyOverview["MarketCapitalization"] || "N/A"}\n`;
          detailedMarketData += `  - EBITDA: ${companyOverview["EBITDA"] || "N/A"}\n`;
          detailedMarketData += `  - P/E Ratio: ${companyOverview["PERatio"] || "N/A"}\n`;
        }
        answerToReturn += detailedMarketData;
      }
    }
    // General market summary with qualitative insights.
    else {
      let prompt: string;
      const words = message.trim().split(/\s+/);
      const isCompanyQuery = words.length === 1 && !/\$/.test(message);
      
      if (isCompanyQuery) {
        prompt = `You are an Investment AI built to answer investment-related questions with both quantitative data and qualitative insights.
Please provide a detailed analysis of investing in ${message} including:
  - The current market performance and stock price trends.
  - A discussion of the pros and cons of investing in ${message} (consider factors such as growth potential, risks, competition, and market sentiment).
  - Relevant market trends and future outlook.
Conclude with "I'm Investment AI built to answer investment-related questions. Let's work on your portfolio."`;
      } else {
        prompt = `
          You are an Investment AI built to answer investment-related questions.
          If the user's question does not contain any finance-related keywords, respond with:
          "I'm Investment AI built to answer investment-related questions. Let's work on your portfolio."
          Otherwise, answer the following question in clear language:
          ${message}
        `;
      }
      const openaiResponse = await openai.chat.completions.create({
        model: "meta-llama/llama-3.2-3b-instruct:free",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 1500,
      });
      console.log("Full OpenAI response data:", JSON.stringify(openaiResponse, null, 2));
      const openaiAnswer = openaiResponse?.choices?.[0]?.message?.content?.trim();
      if (!openaiAnswer) {
        return NextResponse.json(
          { error: "No answer generated. Please try again." },
          { status: 500 }
        );
      }
      answerToReturn = openaiAnswer
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .replace(/\*(.*?)\*/g, "$1")
        .replace(/^-+\s/gm, "")
        .replace(/^\s*-\s+/gm, "");
      
      // Optionally attach supplemental market data if available.
      if (tickerSymbol) {
        stockQuote = await getStockQuote(tickerSymbol);
      }
    }
    
    let timeSeries: Record<string, any> | null = null;
    if (tickerSymbol) {
      timeSeries = await getTimeSeriesIntraday(tickerSymbol);
    }
    
    // Upsert to store the query and its response.
    try {
      await prisma.searchBar.upsert({
        where: { request_response: { request: message, response: answerToReturn } },
        update: {},
        create: { request: message, response: answerToReturn }
      });
    } catch (dbError) {
      console.error("Database upsert error:", dbError);
    }
    
    return NextResponse.json({
      answer: answerToReturn,
      stockQuote,
      timeSeries,
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