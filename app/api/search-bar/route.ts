import { NextResponse } from "next/server";
import { OpenAI } from "openai";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1", // Double-check this baseURL if needed
  apiKey: process.env.OPEN_ROUTER_API_KEY,
});

// Helper function to fetch stock quote from Alpha Vantage API
async function getStockQuote(symbol: string) {
  const alphaApiKey = process.env.ALPHA_VANTAGE_API_KEY;
  const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${alphaApiKey}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Alpha Vantage API error: ${res.status}`);
  }
  const data = await res.json();
  // Return the "Global Quote" data or null if not available.
  return data["Global Quote"] || null;
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
    
    // Build the prompt with the new rules.
    const prompt = `
    You are an investment AI helping users maximise earning.
    If the user's question does not contain any of the words "invest", "investment", "portfolio", "stocks", "bonds", "ticker", "dividend", "market", or any similar finance-related keywords, respond ONLY with:
    "I'm Investment AI built to answer investment-related questions. Let's work on your portfolio."
    Otherwise, answer the following question in clear, well-structured sentences without using markdown:
    ${message}
  `;
    
    // Call the AI model
    const response = await openai.chat.completions.create({
      model: "meta-llama/llama-3.2-3b-instruct:free", // Verify that this model is accessible and enabled
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });
    
    // Log the full response for debugging
    console.log("Full OpenAI response data:", JSON.stringify(response, null, 2));
    
    // Extract the answer from the response object
    const answer = response?.choices?.[0]?.message?.content?.trim();
    if (!answer) {
      return NextResponse.json(
        { error: "No answer generated. Please try again." },
        { status: 500 }
      );
    }
    
    // Use regex to check for a ticker symbol.
    // First, look in the user's message for a "$" followed by 1-5 uppercase letters.
    const tickerRegex = /\$([A-Z]{1,5})/;
    let tickerMatch = message.match(tickerRegex);
    
    // If no match in the input, also try to extract from the answer using a pattern like "(AAPL)".
    if (!tickerMatch) {
      const answerTickerRegex = /\(([A-Z]{1,5})\)/;
      tickerMatch = answer.match(answerTickerRegex);
    }
    
    let stockQuote = null;
    let tickerSymbol: string | null = null; // declare tickerSymbol
    if (tickerMatch) {
      const symbol = tickerMatch[1];
      try {
        const quoteData = await getStockQuote(symbol);
        if (quoteData) {
          // Set the full quote data
          stockQuote = quoteData;
          // Extract the ticker symbol (Alpha Vantage typically returns it as "01. symbol")
          tickerSymbol = quoteData["01. symbol"] || null;
        }
      } catch (tickerError) {
        console.error("Error fetching stock quote:", tickerError);
      }
    }
    
    // Return both the AI answer and the stock quote (if found)
    return NextResponse.json({
      answer,
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