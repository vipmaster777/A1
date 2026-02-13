"use client";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MONTHS, ZODIAC_SIGNS } from "@/lib/constants";

const initialForm = { id: 0, roleName: "", preferredZodiacSigns: [], preferredBirthMonths: [], minAge: 23, maxAge: 35, zodiacWeight: 40, ageWeight: 40, monthWeight: 20 };

export default function RolesManager() {
  const searchParams = useSearchParams();
  const [roles, setRoles] = useState([]); const [form, setForm] = useState(initialForm); const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  const loadRoles = async () => setRoles(await (await fetch("/api/roles")).json());
  useEffect(() => { loadRoles(); const p = searchParams.get("prefill"); if (p) setForm((f)=>({ ...f, roleName: p })); }, [searchParams]);
  const weightsSum = useMemo(() => Number(form.zodiacWeight)+Number(form.ageWeight)+Number(form.monthWeight), [form]);
  const reset = () => setForm(initialForm);
  const submit = async (e) => { e.preventDefault(); setError(""); if (weightsSum !== 100) return setError("Сумма весов должна быть равна 100."); setLoading(true);
    const payload = { roleName: form.roleName, preferredZodiacSigns: form.preferredZodiacSigns, preferredBirthMonths: form.preferredBirthMonths, minAge: Number(form.minAge), maxAge: Number(form.maxAge), zodiacWeight: Number(form.zodiacWeight), ageWeight: Number(form.ageWeight), monthWeight: Number(form.monthWeight) };
    const res = await fetch(form.id ? `/api/roles/${form.id}` : "/api/roles", { method: form.id ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const data = await res.json(); if (!res.ok) setError(data.error || "Не удалось сохранить профиль."); else { await loadRoles(); reset(); } setLoading(false);
  };
  const removeRole = async (id) => { if (!confirm("Удалить профиль вакансии?")) return; const res = await fetch(`/api/roles/${id}`, { method: "DELETE" }); if (res.ok) loadRoles(); };
  const editRole = (role) => setForm({ id: role.id, roleName: role.roleName, preferredZodiacSigns: role.preferredZodiacSigns, preferredBirthMonths: role.preferredBirthMonths, minAge: role.minAge, maxAge: role.maxAge, zodiacWeight: role.weights.zodiacWeight, ageWeight: role.weights.ageWeight, monthWeight: role.weights.monthWeight });
  const generateByAi = async () => { if (!form.roleName.trim()) return setError("Введите название вакансии перед AI-генерацией."); setLoading(true); setError(""); const res = await fetch("/api/roles/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ roleName: form.roleName.trim() }) }); const data = await res.json(); if (!res.ok) setError(data.error || "Ошибка AI генерации."); else setForm((prev) => ({ ...prev, ...data })); setLoading(false); };

  return <div className="space-y-6"><section className="rounded-xl bg-white p-5 shadow-sm"><h2 className="mb-3 text-lg font-semibold">Профили вакансий</h2><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b text-slate-500"><th className="py-2">Название</th><th>Возраст</th><th>Весы</th><th/></tr></thead><tbody>{roles.map((r)=><tr key={r.id} className="border-b"><td className="py-2">{r.roleName}</td><td>{r.minAge}-{r.maxAge}</td><td>{r.weights.zodiacWeight}/{r.weights.ageWeight}/{r.weights.monthWeight}</td><td className="space-x-2 text-right"><button className="bg-slate-100" onClick={()=>editRole(r)}>Ред.</button><button className="bg-red-100 text-red-700" onClick={()=>removeRole(r.id)}>Удалить</button></td></tr>)}</tbody></table></div></section>
  <form onSubmit={submit} className="rounded-xl bg-white p-5 shadow-sm space-y-3"><h3 className="text-lg font-semibold">{form.id ? "Редактирование" : "Новый профиль"}</h3><input placeholder="Название вакансии" value={form.roleName} onChange={(e)=>setForm({ ...form, roleName: e.target.value })} />
  <div><p className="mb-1 text-sm">Предпочтительные знаки</p><div className="grid grid-cols-2 gap-1 md:grid-cols-4">{ZODIAC_SIGNS.map((s)=><label key={s} className="flex items-center gap-2 text-sm"><input className="w-auto" type="checkbox" checked={form.preferredZodiacSigns.includes(s)} onChange={(e)=>setForm({ ...form, preferredZodiacSigns: e.target.checked ? [...form.preferredZodiacSigns, s] : form.preferredZodiacSigns.filter((i)=>i!==s) })} />{s}</label>)}</div></div>
  <div><p className="mb-1 text-sm">Предпочтительные месяцы</p><div className="grid grid-cols-6 gap-1 md:grid-cols-12">{MONTHS.map((m)=><label key={m} className="flex items-center gap-1 text-sm"><input className="w-auto" type="checkbox" checked={form.preferredBirthMonths.includes(m)} onChange={(e)=>setForm({ ...form, preferredBirthMonths: e.target.checked ? [...form.preferredBirthMonths, m] : form.preferredBirthMonths.filter((i)=>i!==m) })} />{m}</label>)}</div></div>
  <div className="grid gap-2 md:grid-cols-2"><input type="number" min={18} value={form.minAge} onChange={(e)=>setForm({ ...form, minAge: Number(e.target.value) })} /><input type="number" min={18} value={form.maxAge} onChange={(e)=>setForm({ ...form, maxAge: Number(e.target.value) })} /></div>
  <div className="grid gap-2 md:grid-cols-3"><input type="number" min={0} max={100} value={form.zodiacWeight} onChange={(e)=>setForm({ ...form, zodiacWeight: Number(e.target.value) })} /><input type="number" min={0} max={100} value={form.ageWeight} onChange={(e)=>setForm({ ...form, ageWeight: Number(e.target.value) })} /><input type="number" min={0} max={100} value={form.monthWeight} onChange={(e)=>setForm({ ...form, monthWeight: Number(e.target.value) })} /></div>
  <p className={`text-sm ${weightsSum === 100 ? "text-green-700" : "text-red-700"}`}>Сумма весов: {weightsSum}</p>{error && <p className="text-sm text-red-700">{error}</p>}
  <div className="flex gap-2"><button disabled={loading} type="submit" className="bg-blue-600 text-white">Сохранить</button><button disabled={loading} type="button" className="bg-violet-600 text-white" onClick={generateByAi}>Сгенерировать профиль ИИ</button>{form.id>0 && <button type="button" className="bg-slate-200" onClick={reset}>Отмена</button>}</div></form></div>;
}
