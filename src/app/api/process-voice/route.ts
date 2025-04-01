import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { CATEGORIES } from "@/types";

// Initialize Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

export async function POST(req: NextRequest) {
  try {
    const { transcript, language } = await req.json();

    if (!transcript) {
      return NextResponse.json(
        { error: "Transcript is required" },
        { status: 400 }
      );
    }

    // Prepare the prompt for Gemini
    const prompt = `
      Extract expense information from the following voice transcript in ${language}:
      "${transcript}"
      
      Extract the following information:
      1. Amount (numeric value)
      2. Category (must be one of: ${CATEGORIES.join(", ")})
      3. Description (brief description of the expense)
      4. Date (if mentioned, otherwise use today's date)
      
      If the amount is not in the correct format or is missing, return an error message.
      If the category doesn't match any of the predefined categories, choose the closest match.
      
      Return the data in JSON format with the following structure:
      {
        "amount": "string representation of the amount",
        "category": "matched category",
        "description": "extracted description",
        "date": "YYYY-MM-DD format if mentioned, otherwise empty string"
      }
      
      Only respond with valid JSON, no additional text.
    `;

    // Call Gemini API with the correct model name
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    const result = await model.generateContent({
      contents: [{ parts: [{ text: prompt }] }]
    });
    
    const response = result.response;
    const content = response.text();
    
    if (!content) {
      throw new Error("Failed to get a response from Gemini");
    }

    // Extract JSON from the response
    let jsonMatch;
    try {
      // Try to parse the entire response as JSON first
      const parsedData = JSON.parse(content);
      return NextResponse.json(parsedData);
    } catch (e) {
      // If that fails, try to extract JSON using regex
      jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonStr = jsonMatch[0];
        const parsedData = JSON.parse(jsonStr);
        return NextResponse.json(parsedData);
      } else {
        throw new Error("Could not extract valid JSON from the response");
      }
    }
  } catch (error) {
    console.error("Error processing voice input:", error);
    return NextResponse.json(
      { error: `Failed to process voice input: ${error}` },
      { status: 500 }
    );
  }
}