'use client';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

const levelMap = { HIGH: '🟢 HIGH', MEDIUM: '🟡 MEDIUM', LOW: '🟠 LOW', NO: '🔴 NO' };

export default function HomePage() {
  const [roles, setRoles] = useState([]);
  const [manualRole, setManualRole] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [form, setForm] = useState({ last: '', first: '', patronymic: '', birthdate: '' });

  useEffect(() => { fetch('/api/roles').then(async (res) => setRoles(await res.json())); }, []);
  const resolvedRole = useMemo(() => manualRole.trim() || selectedRole, [manualRole, selectedRole]);

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setResult(null);
    if (!form.last.trim() || !form.first.trim() || !form.patronymic.trim() || !form.birthdate) return setError('Заполните все обязательные поля.');
    if (!resolvedRole) return setError('Выберите вакансию или введите её вручную.');
    if (manualRole.trim() && !roles.some((r) => r.roleName.toLowerCase() === manualRole.trim().toLowerCase())) return setError('Профиль вакансии не найден. Создайте его перед проверкой.');
    setLoading(true);
    const response = await fetch('/api/check', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fio: form, birthdate: form.birthdate, roleName: resolvedRole }) });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) return setError(data.error || 'Ошибка при проверке');
    setResult(data);
  };

  const copyResult = async () => {
    if (!result) return;
    const text = `Кандидат: ${result.full_name}\nДата рождения: ${result.birthdate} (${result.age_years} лет)\nВакансия: ${result.role_name}\nЗнак: ${result.zodiac_sign}\nСовместимость: ${result.score}% (${levelMap[result.level]})\n\nРазбор:\n• Знак: ${result.breakdown.zodiac_points}/${result.weights.zodiacWeight}\n• Возраст: ${result.breakdown.age_points}/${result.weights.ageWeight}\n• Месяц: ${result.breakdown.month_points}/${result.weights.monthWeight}\n\nПричины:\n${result.reasons.map((reason) => `- ${reason}`).join('\n')}`;
    await navigator.clipboard.writeText(text);
  };

  return <div className="grid gap-6 md:grid-cols-2">{/* same as before */}
    <form className="rounded-xl bg-white p-5 shadow" onSubmit={submit}>
      <h2 className="mb-4 text-lg font-semibold">Проверка кандидата</h2>
      <div className="space-y-3">
        {['last','first','patronymic'].map((key)=> <input key={key} className="w-full rounded border p-2" placeholder={key==='last'?'Фамилия':key==='first'?'Имя':'Отчество'} value={form[key]} onChange={(e)=>setForm((p)=>({...p,[key]:e.target.value}))} />)}
        <input type="date" className="w-full rounded border p-2" value={form.birthdate} onChange={(e)=>setForm((p)=>({...p,birthdate:e.target.value}))} />
        <select className="w-full rounded border p-2" value={selectedRole} onChange={(e)=>{setSelectedRole(e.target.value);setManualRole('')}}><option value="">Выберите вакансию</option>{roles.map((r)=><option key={r.id} value={r.roleName}>{r.roleName}</option>)}</select>
        <input className="w-full rounded border p-2" placeholder="Или введите вакансию вручную" value={manualRole} onChange={(e)=>{setManualRole(e.target.value);setSelectedRole('')}} />
        {manualRole && !roles.some((r)=>r.roleName.toLowerCase()===manualRole.trim().toLowerCase()) && <Link href={`/roles?prefill=${encodeURIComponent(manualRole)}`} className="text-sm text-blue-600 underline">Создать профиль вакансии</Link>}
      </div>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      <button className="mt-4 rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-60" disabled={loading}>{loading?'Проверяем...':'Проверить'}</button>
    </form>
    <section className="rounded-xl bg-white p-5 shadow"><h2 className="mb-4 text-lg font-semibold">Результат</h2>{!result?<p className="text-sm text-slate-500">Заполните форму и нажмите «Проверить».</p>:<div className="space-y-3 text-sm"><p className="text-base font-semibold">{result.full_name}</p><p>Вакансия: {result.role_name}</p><p>Знак: {result.zodiac_sign}</p><p>Возраст: {result.age_years}</p><div className="flex items-center justify-between"><span>Совместимость: {result.score}%</span><span className="rounded-full bg-slate-100 px-3 py-1 font-medium">{levelMap[result.level]}</span></div><div className="h-2 rounded bg-slate-200"><div className="h-2 rounded bg-emerald-500" style={{width:`${result.score}%`}}/></div><div className="space-y-1 rounded bg-slate-50 p-3"><p>Знак: {result.breakdown.zodiac_points}</p><p>Возраст: {result.breakdown.age_points}</p><p>Месяц: {result.breakdown.month_points}</p></div><ul className="list-disc space-y-1 pl-5">{result.reasons.map((reason)=><li key={reason}>{reason}</li>)}</ul><button onClick={copyResult} className="rounded bg-blue-600 px-4 py-2 text-white">Скопировать результат</button></div>}</section>
  </div>;
}
