import fs from 'fs/promises';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'roles.json');

const seed = [
  { id: 1, roleName: 'Менеджер по продажам', preferredZodiacSigns: ['Aries','Leo','Sagittarius'], preferredBirthMonths: [3,7,8,11], minAge: 23, maxAge: 35, zodiacWeight: 40, ageWeight: 40, monthWeight: 20 },
  { id: 2, roleName: 'Бухгалтер', preferredZodiacSigns: ['Taurus','Virgo','Capricorn'], preferredBirthMonths: [1,4,9,12], minAge: 25, maxAge: 45, zodiacWeight: 45, ageWeight: 45, monthWeight: 10 },
  { id: 3, roleName: 'HR-специалист', preferredZodiacSigns: ['Gemini','Libra','Aquarius'], preferredBirthMonths: [2,5,10], minAge: 23, maxAge: 40, zodiacWeight: 40, ageWeight: 40, monthWeight: 20 }
];

export async function readRoles() {
  try {
    const content = await fs.readFile(DB_PATH, 'utf-8');
    const data = JSON.parse(content || '[]');
    if (!Array.isArray(data) || data.length === 0) {
      await writeRoles(seed);
      return seed;
    }
    return data;
  } catch {
    await writeRoles(seed);
    return seed;
  }
}

export async function writeRoles(roles) {
  await fs.writeFile(DB_PATH, JSON.stringify(roles, null, 2));
}

export function validateRoleInput(payload) {
  if (!payload.roleName?.trim()) return 'Название вакансии обязательно';
  if (payload.minAge < 18 || payload.maxAge > 100 || payload.minAge > payload.maxAge) return 'Некорректный возрастной диапазон';
  const sum = Number(payload.zodiacWeight) + Number(payload.ageWeight) + Number(payload.monthWeight);
  if (sum !== 100) return 'Сумма весов должна быть равна 100';
  return null;
}
