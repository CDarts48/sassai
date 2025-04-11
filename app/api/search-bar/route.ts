import { NextResponse } from "next/server";
import { OpenAI } from "openai";
import { PrismaClient } from "@prisma/client";
import type { ChatCompletion } from "openai/resources";

// Create Prisma Client with direct connection for serverless
const prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'production' ? ['query', 'error', 'warn'] : ['error'],
});

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

        let answerToReturn: string | null = null;

        // General branch for all investment queries.
        let prompt: string;
        const words = message.trim().split(/\s+/);
        const isCompanyQuery = words.length === 1 && !/\$/.test(message);
        const isInvestmentQuestion = /invest|short|buy|sell|stock|market|portfolio|stocks|bonds|crypto|futures|commodities|real estate|etf|dividend|fund|trading|asset|financial|hedge|yield|security|securities|cryptocurrency|blockchain|nft|mutual fund|index|dow|nasdaq|sp500|s&p|passive income/i.test(message);

        if (isCompanyQuery || isInvestmentQuestion) {
            prompt = `You are an Investment AI built to answer investment-related questions with both quantitative data and qualitative insights.
Please provide a detailed analysis of ${message} including:
  - A discussion of the pros and cons of investing in ${message} (consider factors such as growth potential, risks, competition, and market sentiment).
  - Relevant market trends and future outlook.
  - If applicable, discuss how this investment relates to stocks, bonds, crypto, futures, commodities, and real estate markets.`;
        } else {
            prompt = `
          You are an Investment AI built to answer investment-related questions.
          If the user's question does not contain any finance-related keywords (such as invest, stocks, bonds, crypto, futures, commodities, real estate, etc.), respond with:
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

            // Return the answer and ensure DB logging completes
            const responsePayload = { answer: answerToReturn };

            // Always await the database operation in production to ensure it completes
            try {
                console.log("Starting database logging operation");
                const result = await prisma.searchBar.upsert({
                    where: { request_response: { request: message, response: answerToReturn } },
                    update: {},
                    create: { request: message, response: answerToReturn },
                });
                console.log("Database operation successful:", JSON.stringify(result, null, 2));
            } catch (dbError) {
                console.error("Database operation failed:", dbError);
                // Log the error but don't fail the request
            }

            return NextResponse.json(responsePayload);
        } catch (openaiError) {
            console.error("OpenAI API error:", openaiError);
            return NextResponse.json(
                { error: "Failed to get response from AI service. Please try again." },
                { status: 500 }
            );
        }
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : "Unknown error";
        console.error("Error processing search query:", errorMsg);
        return NextResponse.json(
            { error: errorMsg },
            { status: 500 }
        );
    } finally {
        try {
            // Explicitly disconnect from Prisma to prevent connection hanging
            await prisma.$disconnect();
        } catch (disconnectError) {
            console.error("Error disconnecting from Prisma:", disconnectError);
        }
    }
}