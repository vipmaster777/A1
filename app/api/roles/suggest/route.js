import { NextResponse } from 'next/server';
import { ZODIAC_SIGNS } from '@/lib/types';

export async function POST(request) {
  const { roleName } = await request.json();
  if (!roleName?.trim()) return NextResponse.json({ error: 'Укажите название вакансии' }, { status: 400 });
  if (!process.env.OPENAI_API_KEY) return NextResponse.json({ error: 'OPENAI_API_KEY не настроен на сервере' }, { status: 500 });

  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        input: [{ role: 'user', content: `Сгенерируй HR-профиль для вакансии: ${roleName}` }],
        text: {
          format: {
            type: 'json_schema',
            name: 'role_suggestion',
            strict: true,
            schema: {
              type: 'object',
              additionalProperties: false,
              properties: {
                preferredZodiacSigns: { type: 'array', minItems: 1, maxItems: 6, items: { type: 'string', enum: [...ZODIAC_SIGNS] } },
                preferredBirthMonths: { type: 'array', minItems: 2, maxItems: 12, items: { type: 'integer', minimum: 1, maximum: 12 } },
                minAge: { type: 'integer' },
                maxAge: { type: 'integer' },
                zodiacWeight: { type: 'integer' },
                ageWeight: { type: 'integer' },
                monthWeight: { type: 'integer' }
              },
              required: ['preferredZodiacSigns','preferredBirthMonths','minAge','maxAge','zodiacWeight','ageWeight','monthWeight']
            }
          }
        }
      })
    });
    if (!response.ok) return NextResponse.json({ error: 'Ошибка OpenAI API' }, { status: 500 });
    const data = await response.json();
    return NextResponse.json(JSON.parse(data.output_text));
  } catch {
    return NextResponse.json({ error: 'Не удалось сгенерировать профиль через OpenAI' }, { status: 500 });
  }
}
