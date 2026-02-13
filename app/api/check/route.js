import { NextResponse } from 'next/server';
import { readRoles } from '@/lib/rolesStore';
import { getAgeYears, getZodiacSign, parseBirthdate } from '@/lib/zodiac';
import { ZODIAC_SIGNS } from '@/lib/types';

export async function POST(request) {
  const { fio, birthdate, roleName } = await request.json();
  if (!fio?.last?.trim() || !fio?.first?.trim() || !fio?.patronymic?.trim() || !roleName?.trim()) {
    return NextResponse.json({ error: 'Заполните все поля формы' }, { status: 400 });
  }

  const birth = parseBirthdate(birthdate);
  if (!birth) return NextResponse.json({ error: 'Некорректная дата рождения' }, { status: 400 });
  const roles = await readRoles();
  const role = roles.find((r) => r.roleName.toLowerCase() === roleName.trim().toLowerCase());
  if (!role) return NextResponse.json({ error: 'Профиль вакансии не найден' }, { status: 404 });
  if (!process.env.OPENAI_API_KEY) return NextResponse.json({ error: 'OPENAI_API_KEY не настроен на сервере' }, { status: 500 });

  const zodiac_sign = getZodiacSign(birth);
  const age_years = getAgeYears(birth);
  const birth_month = birth.getUTCMonth() + 1;
  const full_name = `${fio.last.trim()} ${fio.first.trim()} ${fio.patronymic.trim()}`;

  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        input: [{ role: 'user', content: JSON.stringify({ full_name, role_name: role.roleName, zodiac_sign, age_years, birth_month, role_profile: role }) }],
        text: {
          format: {
            type: 'json_schema',
            name: 'zodiac_fit_result',
            strict: true,
            schema: {
              type: 'object',
              additionalProperties: false,
              properties: {
                full_name: { type: 'string' },
                role_name: { type: 'string' },
                zodiac_sign: { type: 'string', enum: [...ZODIAC_SIGNS] },
                age_years: { type: 'integer' },
                score: { type: 'integer', minimum: 0, maximum: 100 },
                level: { type: 'string', enum: ['HIGH', 'MEDIUM', 'LOW', 'NO'] },
                breakdown: {
                  type: 'object', additionalProperties: false,
                  properties: { zodiac_points: { type: 'integer' }, age_points: { type: 'integer' }, month_points: { type: 'integer' } },
                  required: ['zodiac_points','age_points','month_points']
                },
                reasons: { type: 'array', minItems: 2, maxItems: 5, items: { type: 'string' } }
              },
              required: ['full_name','role_name','zodiac_sign','age_years','score','level','breakdown','reasons']
            }
          }
        }
      })
    });
    if (!response.ok) return NextResponse.json({ error: 'Ошибка OpenAI API. Попробуйте позже.' }, { status: 500 });
    const data = await response.json();
    const parsed = JSON.parse(data.output_text);
    return NextResponse.json({ ...parsed, birthdate, weights: { zodiacWeight: role.zodiacWeight, ageWeight: role.ageWeight, monthWeight: role.monthWeight } });
  } catch {
    return NextResponse.json({ error: 'Ошибка OpenAI API. Попробуйте позже.' }, { status: 500 });
  }
}
