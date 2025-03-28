// app/api/generate-investmentplan/route.ts

import { NextResponse } from "next/server";
import { OpenAI } from "openai";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1", // Ensure this is the correct baseURL for your API
  apiKey: process.env.OPEN_ROUTER_API_KEY,
});

export async function POST(request: Request) {
  try {
    // Extract parameters from the request body
    const { dietType, calories, allergies, cuisine, snacks } =
      await request.json();

    const prompt = `
      You are a professional nutritionist. Create a 7-day investment plan for an individual following a ${dietType} diet aiming for ${calories} calories per day.
      
      Allergies or restrictions: ${allergies || "none"}.
      Preferred cuisine: ${cuisine || "no preference"}.
      Snacks included: ${snacks ? "yes" : "no"}.
      
      For each day, provide:
        - Breakfast
        - Lunch
        - Dinner
        ${snacks ? "- Snacks" : ""}
      
      Use simple ingredients and provide brief instructions. Include approximate calorie counts for each investment.
      
      Structure the response as a JSON object where each day is a key, and each investment (Breakfast, Lunch, Dinner, Snacks) is a sub-key. Example:
      
      {
        "Monday": {
          "Breakfast": "Oatinvestment with fruits - 350 calories",
          "Lunch": "Grilled chicken salad - 500 calories",
          "Dinner": "Steamed vegetables with quinoa - 600 calories",
          "Snacks": "Greek yogurt - 150 calories"
        },
        "Tuesday": {
          "Breakfast": "Smoothie bowl - 300 calories",
          "Lunch": "Turkey sandwich - 450 calories",
          "Dinner": "Baked salmon with asparagus - 700 calories",
          "Snacks": "Almonds - 200 calories"
        }
        // ...and so on for each day
      }

      Return just the JSON with no extra commentaries and no backticks.
    `;

    // Send the prompt to the AI model
    const response = await openai.chat.completions.create({
      model: "meta-llama/llama-3.2-3b-instruct:free", // Ensure this model is accessible and suitable
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7, // Adjust for creativity vs. consistency
      max_tokens: 1500, // Adjust based on expected response length
    });

    // Extract the AI's response and remove any markdown formatting
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
    let parsedinvestmentPlan: { [day: string]: DailyinvestmentPlan };
    try {
      parsedinvestmentPlan = JSON.parse(jsonSubstring);
    } catch (parseError) {
      console.error("Error parsing extracted JSON:", parseError);
      return NextResponse.json(
        { error: "Failed to parse investment plan. Please try again." },
        { status: 500 }
      );
    }

    // Basic validation of the parsed object
    if (typeof parsedinvestmentPlan !== "object" || parsedinvestmentPlan === null) {
      console.error("Invalid investment plan format received from AI.");
      return NextResponse.json(
        { error: "Invalid investment plan format received from AI." },
        { status: 500 }
      );
    }

    // Return the validated investment plan as JSON
    return NextResponse.json({ investmentPlan: parsedinvestmentPlan });
  } catch (error) {
    console.error("Error generating investment plan:", error);
    return NextResponse.json(
      { error: "Failed to generate investment plan. Please try again later." },
      { status: 500 }
    );
  }
}

// Define the DailyinvestmentPlan interface
interface DailyinvestmentPlan {
  Breakfast?: string;
  Lunch?: string;
  Dinner?: string;
  Snacks?: string;
}