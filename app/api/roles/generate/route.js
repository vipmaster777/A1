import { NextResponse } from "next/server";
import { ZODIAC_SIGNS } from "@/lib/constants";

export async function POST(request) {
  try {
    const { roleName } = await request.json();
    if (!roleName) return NextResponse.json({ error: "Укажите roleName." }, { status: 400 });
    if (!process.env.OPENAI_API_KEY) return NextResponse.json({ error: "Не задан OPENAI_API_KEY в .env.local" }, { status: 500 });

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: `Сгенерируй профиль вакансии ${roleName}. Верни только JSON с полями preferredZodiacSigns (3-5 из ${ZODIAC_SIGNS.join(",")}), preferredBirthMonths (3-5 чисел 1..12), minAge, maxAge, zodiacWeight, ageWeight, monthWeight, сумма весов=100`,
        text: { format: { type: "json_schema", name: "role_profile", strict: true, schema: { type: "object", additionalProperties: false, properties: { preferredZodiacSigns: { type: "array", items: { type: "string", enum: [...ZODIAC_SIGNS] } }, preferredBirthMonths: { type: "array", items: { type: "integer", minimum: 1, maximum: 12 } }, minAge: { type: "integer" }, maxAge: { type: "integer" }, zodiacWeight: { type: "integer" }, ageWeight: { type: "integer" }, monthWeight: { type: "integer" } }, required: ["preferredZodiacSigns","preferredBirthMonths","minAge","maxAge","zodiacWeight","ageWeight","monthWeight"] } } }
      })
    });
    if (!response.ok) return NextResponse.json({ error: "Не удалось сгенерировать профиль через ИИ." }, { status: 502 });
    const data = await response.json();
    return NextResponse.json(JSON.parse(data.output_text));
  } catch {
    return NextResponse.json({ error: "Не удалось сгенерировать профиль через ИИ." }, { status: 502 });
  }
}
