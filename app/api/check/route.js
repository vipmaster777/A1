import { NextResponse } from "next/server";
import { z } from "zod";
import { ZODIAC_SIGNS } from "@/lib/constants";
import { getAgeYears, getZodiacSign, parseBirthdate } from "@/lib/zodiac";
import { readRoles } from "@/lib/roles-store";

const requestSchema = z.object({
  fio: z.object({ last: z.string().min(1), first: z.string().min(1), patronymic: z.string().min(1) }),
  birthdate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  roleName: z.string().min(1),
});

export async function POST(request) {
  try {
    const body = requestSchema.parse(await request.json());
    const birthDate = parseBirthdate(body.birthdate);
    if (!birthDate) return NextResponse.json({ error: "Некорректная дата рождения." }, { status: 400 });

    const role = (await readRoles()).find((i) => i.roleName === body.roleName.trim());
    if (!role) return NextResponse.json({ error: "Профиль вакансии не найден." }, { status: 404 });

    const zodiacSign = getZodiacSign(birthDate.getMonth() + 1, birthDate.getDate());
    const ageYears = getAgeYears(birthDate);
    const birthMonth = birthDate.getMonth() + 1;

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "Не задан OPENAI_API_KEY в .env.local" }, { status: 500 });
    }

    const payload = {
      model: "gpt-4.1-mini",
      input: `Верни только JSON и соблюдай формулы. Candidate: ${body.fio.last} ${body.fio.first} ${body.fio.patronymic}; role=${role.roleName}; zodiac=${zodiacSign}; age=${ageYears}; month=${birthMonth}; prefZodiac=${JSON.stringify(role.preferredZodiacSigns)}; prefMonths=${JSON.stringify(role.preferredBirthMonths)}; minAge=${role.minAge}; maxAge=${role.maxAge}; weights=${JSON.stringify(role.weights)}. Правила scoring: zodiac входит=>zodiacWeight иначе round(0.2*zodiacWeight); month входит=>monthWeight иначе 0; age в диапазоне=>ageWeight иначе если расстояние<=2 года round(0.5*ageWeight) иначе 0; score=sum; level HIGH 80..100 MEDIUM 50..79 LOW 20..49 NO 0..19. Причины 2-4 на русском.`,
      text: {
        format: {
          type: "json_schema",
          name: "zodiac_hr_fit_result",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              full_name: { type: "string" },
              role_name: { type: "string" },
              zodiac_sign: { type: "string", enum: [...ZODIAC_SIGNS] },
              age_years: { type: "integer" },
              score: { type: "integer", minimum: 0, maximum: 100 },
              level: { type: "string", enum: ["HIGH", "MEDIUM", "LOW", "NO"] },
              breakdown: {
                type: "object",
                additionalProperties: false,
                properties: {
                  zodiac_points: { type: "integer" },
                  age_points: { type: "integer" },
                  month_points: { type: "integer" },
                },
                required: ["zodiac_points", "age_points", "month_points"],
              },
              reasons: { type: "array", minItems: 2, maxItems: 5, items: { type: "string" } },
            },
            required: ["full_name", "role_name", "zodiac_sign", "age_years", "score", "level", "breakdown", "reasons"],
          },
        },
      },
    };

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify(payload),
    });

    if (!response.ok) return NextResponse.json({ error: "Ошибка OpenAI API. Попробуйте позже." }, { status: 502 });

    const data = await response.json();
    return NextResponse.json(JSON.parse(data.output_text));
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Проверьте заполнение формы." }, { status: 400 });
    return NextResponse.json({ error: "Ошибка OpenAI API. Попробуйте позже." }, { status: 502 });
  }
}
