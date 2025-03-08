// app/api/clean/route.js
import { NextResponse } from "next/server";

export async function POST(request) {
  const { code, language } = await request.json();

  if (!code || !/[\w\s(){}[\];=+\-*/]/.test(code)) {
    return NextResponse.json(
      { error: "Invalid input: Please provide valid code." },
      { status: 400 }
    );
  }

  const prompt = `Given the following ${language} code, remove unnecessary whitespace, comments, and redundant lines while preserving functionality. Return the cleaned code wrapped in markdown code blocks (e.g., \`\`\`${language}\n<cleaned_code>\n\`\`\`) without any explanations or additional text outside the code block:\n${code}`;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "qwen-2.5-coder-32b",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1000,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || "Failed to clean code");
    }

    const cleanedCode = data.choices[0].message.content.trim();
    return NextResponse.json({ result: cleanedCode });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to clean code" },
      { status: 500 }
    );
  }
}