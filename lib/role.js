import { ZODIAC_SIGNS } from "@/lib/constants";

export function validateRolePayload(payload) {
  if (!payload || typeof payload !== "object") return { ok: false, message: "Некорректный формат данных." };
  const p = payload;
  const roleName = String(p.roleName ?? "").trim();
  const preferredZodiacSigns = Array.isArray(p.preferredZodiacSigns) ? p.preferredZodiacSigns : [];
  const preferredBirthMonths = Array.isArray(p.preferredBirthMonths) ? p.preferredBirthMonths : [];
  const minAge = Number(p.minAge);
  const maxAge = Number(p.maxAge);
  const zodiacWeight = Number(p.zodiacWeight);
  const ageWeight = Number(p.ageWeight);
  const monthWeight = Number(p.monthWeight);
  if (!roleName) return { ok: false, message: "Название вакансии обязательно." };
  if (!preferredZodiacSigns.every((item) => ZODIAC_SIGNS.includes(item))) return { ok: false, message: "Некорректные знаки зодиака." };
  if (!preferredBirthMonths.every((m) => Number.isInteger(m) && m >= 1 && m <= 12)) return { ok: false, message: "Некорректные месяцы рождения." };
  if (!Number.isInteger(minAge) || !Number.isInteger(maxAge) || minAge < 18 || maxAge < minAge) return { ok: false, message: "Некорректный возрастной диапазон." };
  if ([zodiacWeight, ageWeight, monthWeight].some((w) => !Number.isInteger(w) || w < 0 || w > 100)) return { ok: false, message: "Весы должны быть целыми числами 0..100." };
  if (zodiacWeight + ageWeight + monthWeight !== 100) return { ok: false, message: "Сумма весов должна быть равна 100." };
  return { ok: true, data: { roleName, preferredZodiacSigns, preferredBirthMonths, minAge, maxAge, weights: { zodiacWeight, ageWeight, monthWeight } } };
}
