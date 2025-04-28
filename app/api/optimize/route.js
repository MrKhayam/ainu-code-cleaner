// app/api/optimize/route.js
import { NextResponse } from "next/server";

export async function POST(request) {
  const { code, language } = await request.json();

  if (!code || !/[\w\s(){}[\];=+\-*/]/.test(code)) {
    return NextResponse.json(
      { error: "Invalid input: Please provide valid code." },
      { status: 400 }
    );
  }

  const prompt = `Given the following ${language} code, optimize it for performance and brevity while ensuring it produces the same output. Return the optimized code wrapped in markdown code blocks (e.g., \`\`\`${language}\n<optimized_code>\n\`\`\`) without any explanations or additional text outside the code block:\n${code}`;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1000,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || "Failed to optimize code");
    }

    const optimizedCode = data.choices[0].message.content.trim();
    return NextResponse.json({ result: optimizedCode });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to optimize code" },
      { status: 500 }
    );
  }
}