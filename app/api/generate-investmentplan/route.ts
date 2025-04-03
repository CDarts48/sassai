// app/api/generate-investmentplan/route.ts

import { NextResponse } from "next/server";
import { OpenAI } from "openai";

const openai = new OpenAI({
  baseURL: "https://api.openai.com/v1", // Changed to OpenAI API base URL
  apiKey: process.env.OPENAI_API_KEY,    // Use your OpenAI API key here
});

export async function POST(request: Request) {
  try {
    // Extract investment parameters from the request body
    const { 
      investmentGoal, 
      riskTolerance, 
      investmentConstraints, 
      preferredMarkets, 
      includeAlternatives 
    } = await request.json();

    const prompt = `
      You are a professional financial advisor. Create a 7-day investment strategy plan for an individual with the following details:
      
      Investment Goal: ${investmentGoal}
      Risk Tolerance (1-10): ${riskTolerance}
      Investment Constraints: ${investmentConstraints || "none"}
      Preferred Markets: ${preferredMarkets || "no preference"}
      ${includeAlternatives ? "Include suggestions for alternative investment strategies if applicable." : ""}
      
      For each day, provide recommended strategies for:
        - Morning (e.g., analyzing pre-market trends, setting entry points)
        - Afternoon (e.g., monitoring positions, adjusting stops)
        - Evening (e.g., reviewing performance, planning for the next day)
        ${includeAlternatives ? "- Alternative strategies (if applicable)" : ""}
      
      Structure the response as a JSON object where each day is a key, and under each day include the strategies with keys "Morning", "Afternoon", "Evening" ${includeAlternatives ? ', and "Alternative"' : ""}. Example:
      
      {
        "Monday": {
          "Morning": "Review pre-market analysis and watch key indicators.",
          "Afternoon": "Monitor positions and adjust stop-loss orders.",
          "Evening": "Evaluate daily performance and plan adjustments.",
          "Alternative": "Consider options strategies in volatile markets."
        },
        "Tuesday": {
          "Morning": "Analyze global market trends and set entry points.",
          "Afternoon": "Rebalance portfolio based on midday data.",
          "Evening": "Review economic news for insight.",
          "Alternative": "Diversify with forex market insights."
        }
        // ...and so on for each day
      }

      Return just the JSON with no extra commentaries and no backticks.
    `;

    // Send the prompt to the AI model
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Ensure this model is accessible and suitable
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

// eslint-disable-next-line prefer-const
    let aiContent = response.choices[0].message.content.trim();
    console.log("Raw AI content:", aiContent);

    // Find the JSON object boundaries
    const jsonStart = aiContent.indexOf("{");
    const jsonEnd = aiContent.lastIndexOf("}");

    if (jsonStart === -1 || jsonEnd === -1) {
      console.error("No JSON object detected in the AI response.");
      return NextResponse.json(
        { error: "Failed to extract investment plan JSON. Please try again." },
        { status: 500 }
      );
    }

    // Extract and clean the JSON substring
    const jsonSubstring = aiContent.substring(jsonStart, jsonEnd + 1);
    console.log("Extracted JSON substring:", jsonSubstring);

    // Attempt to parse the extracted JSON
    let parsedInvestmentPlan: { [day: string]: DailyInvestmentPlan };
    try {
      parsedInvestmentPlan = JSON.parse(jsonSubstring);
    } catch (parseError) {
      console.error("Error parsing extracted JSON:", parseError);
      return NextResponse.json(
        { error: "Failed to parse investment plan. Please try again." },
        { status: 500 }
      );
    }

    // Basic validation of the parsed object
    if (typeof parsedInvestmentPlan !== "object" || parsedInvestmentPlan === null) {
      console.error("Invalid investment plan format received from AI.");
      return NextResponse.json(
        { error: "Invalid investment plan format received from AI." },
        { status: 500 }
      );
    }

    // Return the validated investment plan as JSON
    return NextResponse.json({ investmentPlan: parsedInvestmentPlan });
  } catch (error) {
    console.error("Error generating investment plan:", error);
    return NextResponse.json(
      { error: "Failed to generate investment plan. Please try again later." },
      { status: 500 }
    );
  }
}

// Define the DailyInvestmentPlan interface for investment strategies
interface DailyInvestmentPlan {
  Morning?: string;
  Afternoon?: string;
  Evening?: string;
  Alternative?: string;
}