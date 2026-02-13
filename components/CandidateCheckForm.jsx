"use client";

import { useEffect, useMemo, useState } from "react";
import { LEVEL_BADGES } from "@/lib/constants";

export default function CandidateCheckForm() {
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [manualRole, setManualRole] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [last, setLast] = useState("");
  const [first, setFirst] = useState("");
  const [patronymic, setPatronymic] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { (async () => { const res = await fetch("/api/roles"); const data = await res.json(); setRoles(data); if (data.length) setSelectedRole(data[0].roleName); })(); }, []);
  const effectiveRole = manualRole.trim() || selectedRole;
  const roleExists = useMemo(() => roles.some((r) => r.roleName.toLowerCase() === manualRole.trim().toLowerCase()), [manualRole, roles]);
  const roleForBreakdown = roles.find((r) => r.roleName === result?.role_name);

  const submit = async (e) => {
    e.preventDefault(); setError(""); setResult(null);
    if (!last.trim() || !first.trim() || !patronymic.trim()) return setError("Заполните полностью ФИО.");
    if (!birthdate) return setError("Укажите дату рождения.");
    if (!effectiveRole) return setError("Выберите или введите вакансию.");
    if (manualRole.trim() && !roleExists) return setError("Такой профиль вакансии не найден. Создайте его на странице профилей.");
    setLoading(true);
    const res = await fetch("/api/check", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fio: { last, first, patronymic }, birthdate, roleName: effectiveRole }) });
    const data = await res.json();
    if (!res.ok) setError(data.error || "Ошибка проверки."); else setResult(data);
    setLoading(false);
  };

  const copyResult = async () => {
    if (!result) return;
    const w = roleForBreakdown?.weights || {};
    const text = `Кандидат: ${result.full_name}\nДата рождения: ${birthdate} (${result.age_years} лет)\nВакансия: ${result.role_name}\nЗнак: ${result.zodiac_sign}\nСовместимость: ${result.score}% (${LEVEL_BADGES[result.level]})\n\nРазбор:\n• Знак: ${result.breakdown.zodiac_points}/${w.zodiacWeight ?? "?"}\n• Возраст: ${result.breakdown.age_points}/${w.ageWeight ?? "?"}\n• Месяц: ${result.breakdown.month_points}/${w.monthWeight ?? "?"}\n\nПричины:\n${result.reasons.map((r) => `- ${r}`).join("\n")}`;
    await navigator.clipboard.writeText(text);
  };

  return <div className="space-y-6"><form onSubmit={submit} className="rounded-xl bg-white p-5 shadow-sm space-y-4"><h2 className="text-lg font-semibold">Проверка кандидата</h2><div className="grid gap-3 md:grid-cols-3"><input placeholder="Фамилия" value={last} onChange={(e)=>setLast(e.target.value)} /><input placeholder="Имя" value={first} onChange={(e)=>setFirst(e.target.value)} /><input placeholder="Отчество" value={patronymic} onChange={(e)=>setPatronymic(e.target.value)} /></div><div className="grid gap-3 md:grid-cols-2"><div><label className="mb-1 block text-sm text-slate-600">Дата рождения</label><input type="date" value={birthdate} onChange={(e)=>setBirthdate(e.target.value)} /></div><div><label className="mb-1 block text-sm text-slate-600">Вакансия (из списка)</label><select value={selectedRole} onChange={(e)=>setSelectedRole(e.target.value)}>{roles.map((role)=><option key={role.id} value={role.roleName}>{role.roleName}</option>)}</select></div></div><div><label className="mb-1 block text-sm text-slate-600">Или ввести вручную</label><input value={manualRole} onChange={(e)=>setManualRole(e.target.value)} /></div>{error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}{manualRole.trim() && !roleExists && <a className="ml-2 font-medium underline" href={`/roles?prefill=${encodeURIComponent(manualRole.trim())}`}>Создать профиль вакансии</a>}</div>}<button type="submit" disabled={loading} className="bg-blue-600 text-white">{loading ? "Проверяем..." : "Проверить"}</button></form>
  {result && <section className="rounded-xl bg-white p-5 shadow-sm space-y-4"><div className="flex items-center justify-between"><h3 className="text-lg font-semibold">Результат</h3><span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold">{LEVEL_BADGES[result.level]}</span></div><div className="text-sm space-y-1"><p><strong>{result.full_name}</strong></p><p>Вакансия: {result.role_name}</p><p>Знак: {result.zodiac_sign}</p><p>Возраст: {result.age_years}</p><p>Совместимость: <strong>{result.score}%</strong></p></div><div className="h-3 overflow-hidden rounded-full bg-slate-200"><div className="h-full bg-blue-500" style={{ width: `${result.score}%` }} /></div><div className="rounded-lg border border-slate-200 p-3 text-sm"><p>Знак: {result.breakdown.zodiac_points}</p><p>Возраст: {result.breakdown.age_points}</p><p>Месяц: {result.breakdown.month_points}</p></div><ul className="list-disc pl-5 text-sm space-y-1">{result.reasons.map((reason)=><li key={reason}>{reason}</li>)}</ul><button onClick={copyResult} className="bg-slate-800 text-white">Скопировать результат</button></section>}</div>;
}
