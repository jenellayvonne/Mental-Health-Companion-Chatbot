
import { NextResponse } from "next/server";
// API route to handle chat messages and interact with Gemini API
export async function POST(req: Request) { 
  const { message } = await req.json(); 

  try {
    const apiKey = process.env.GEMINI_API_KEY;

    // Define Dr. Chatty's personality and boundaries
    const systemPrompt = `
    You are Dr. Chatty, a warm and empathetic AI mental health companion.
    Your purpose is to listen, comfort, and offer general emotional support.
    You are **not a doctor**, and you must never give medical, legal, or financial advice.
    If the user asks for something unrelated to emotional well-being or mental health
    (for example: math, coding, news, trivia, or random facts),
    politely explain that this chatbot is meant only for mental health support and
    encourage the user to return to a relevant topic.

    Always reply in a calm, kind, and conversational tone.
    Offer short, supportive responses — around 2–4 sentences, unless the user asks for more detail.
        `;

    //send the message to the Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            { parts: [{ text: systemPrompt }] }, // Set behavior/personality
            { parts: [{ text: message }] },      // User's message
          ],
          generationConfig: {
            temperature: 0.7,
            top_p: 0.9,
            top_k: 40,
            max_output_tokens: 800,
          },
        }),
      }
    );
    //parse the response from Gemini
    const data = await response.json();
    console.log("🧠 Gemini raw response:", data);

    //extract the reply text
    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I'm here to listen 💬";

    //send the reply back to the client  
    return NextResponse.json({ reply });

    //handle errors from the Gemini API
  } catch (err) {
    console.error("❌ Gemini API error:", err);
    return NextResponse.json({
      reply: "Sorry, there was an error connecting to Gemini.",
    });
  }
}
