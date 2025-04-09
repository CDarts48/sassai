import { NextResponse } from "next/server";
import { OpenAI } from "openai";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const openai = new OpenAI({
    baseURL: "https://api.openai.com/v1",
    apiKey: process.env.OPENAI_API_KEY,
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

            const model = isCompanyQuery ? "gpt-4" : "gpt-4-turbo";
            const openaiResponse = await openai.chat.completions.create({
                model,
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
        }

        // Log the query and its response.
        try {
            await prisma.searchBar.upsert({
                where: { request_response: { request: message, response: answerToReturn } },
                update: {},
                create: { request: message, response: answerToReturn },
            });
        } catch (dbError) {
            console.error("Database upsert error:", dbError);
        }

        return NextResponse.json({ answer: answerToReturn });
    } catch (error: unknown) {
        console.error("Error processing search query:", error);
        return NextResponse.json(
            { error: "Failed to process search query. Please try again later." },
            { status: 500 }
        );
    }
}