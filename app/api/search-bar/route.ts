import { NextResponse } from "next/server";
import { OpenAI } from "openai";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1", // Double-check this baseURL if you intend to use OpenRouter
  apiKey: process.env.OPEN_ROUTER_API_KEY,
});

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
    "I'm investment built to answer investment-related questions. Let's work on your investment ideas."
    Otherwise, answer the following question in clear, well-structured sentences without using markdown:
    ${message}
  `;
    
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
    
    // Log the full response to review its structure
    console.log("Full OpenAI response data:", JSON.stringify(response, null, 2));
    
    // Extract the answer from the response object
    const answer = response?.choices?.[0]?.message?.content?.trim();
    if (!answer) {
      return NextResponse.json(
        { error: "No answer generated. Please try again." },
        { status: 500 }
      );
    }
    
    // Return only the generated answer so it can be rendered on the page
      return NextResponse.json({ answer })
        } catch (error: unknown) {
    console.error("Error processing search query:", error);
    return NextResponse.json(
      { error: "Failed to process search query. Please try again later." },
      { status: 500 }
    );
  }
}