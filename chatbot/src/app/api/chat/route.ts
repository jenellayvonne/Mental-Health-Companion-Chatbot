import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { message } = await req.json();

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: message }] }],
        }),
      }
    );

    const data = await response.json();
    console.log("🧠 Gemini raw response:", data);

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I'm here to listen 💬";

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("❌ Gemini API error:", err);
    return NextResponse.json({
      reply: "Sorry, there was an error connecting to Gemini.",
    });
  }
}
