import { NextResponse } from "next/server";
import { OpenAI } from "openai";
import { PrismaClient } from "@prisma/client";
import type { ChatCompletion } from "openai/resources";

// Create Prisma Client with connection pooling options for serverless environment
const prisma = new PrismaClient();

const openai = new OpenAI({
    baseURL: "https://api.openai.com/v1",
    apiKey: process.env.OPENAI_API_KEY,
});

// Set a reasonable timeout for OpenAI requests
const OPENAI_TIMEOUT = 25000; // 25 seconds

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
        let answerToReturn: string | null = null;

        // Market data branch error.
        if (
            lowerMessage.includes("current stock price") ||
            lowerMessage.includes("stock price")
        ) {
            return NextResponse.json(
                { error: "Market data functionality has moved to /api/ticker-search." },
                { status: 400 }
            );
        } else {
            // General branch for all investment queries.
            let prompt: string;
            const words = message.trim().split(/\s+/);
            const isCompanyQuery = words.length === 1 && !/\$/.test(message);
            const isInvestmentQuestion = /invest|short|buy|sell|stock|market|portfolio/i.test(message);

            if (isCompanyQuery || isInvestmentQuestion) {
                prompt = `You are an Investment AI built to answer investment-related questions with both quantitative data and qualitative insights.
Please provide a detailed analysis of investing in ${message} including:
  - A discussion of the pros and cons of investing in ${message} (consider factors such as growth potential, risks, competition, and market sentiment).
  - Relevant market trends and future outlook.`;
            } else {
                prompt = `
          You are an Investment AI built to answer investment-related questions.
          If the user's question does not contain any finance-related keywords, respond with:
          "I'm Investment AI built to answer investment-related questions. Let's work on your portfolio."
          Otherwise, answer the following question in clear language:
          ${message}
        `;
            }

            // Use a more efficient model for deployment to reduce latency
            const model = "gpt-3.5-turbo"; // Using a faster model in production

            try {
                // Implement timeout for OpenAI request
                const openaiPromise = openai.chat.completions.create({
                    model,
                    messages: [{ role: "user", content: prompt }],
                    temperature: 0.7,
                    max_tokens: 1000, // Reduced token count
                });

                const timeoutPromise = new Promise<never>((_, reject) =>
                    setTimeout(() => reject(new Error("OpenAI request timeout")), OPENAI_TIMEOUT)
                );

                const openaiResponse = await Promise.race([openaiPromise, timeoutPromise]) as ChatCompletion;

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

                // Return the answer first, then log to DB asynchronously
                const responsePayload = { answer: answerToReturn };

                // Fire and forget DB logging
                logToDatabase(message, answerToReturn).catch(error => {
                    console.error("Background DB logging failed:", error);
                });

                return NextResponse.json(responsePayload);
            } catch (openaiError) {
                console.error("OpenAI API error:", openaiError);
                return NextResponse.json(
                    { error: "Failed to get response from AI service. Please try again." },
                    { status: 500 }
                );
            }
        }
    } catch (error: unknown) {
        console.error("Error processing search query:", error);
        return NextResponse.json(
            { error: "Failed to process search query. Please try again later." },
            { status: 500 }
        );
    } finally {
        // No need to disconnect in serverless - connection pooling handles this
    }
}

// Separate function for database logging
async function logToDatabase(message: string, response: string | null) {
    try {
        await prisma.searchBar.upsert({
            where: { request_response: { request: message, response: response } },
            update: {},
            create: { request: message, response: response },
        });
    } catch (dbError) {
        console.error("Database upsert error:", dbError);
        // Don't throw - we want this to fail silently from the user's perspective
    }
}