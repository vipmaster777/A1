'use client';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ZODIAC_SIGNS } from '@/lib/types';

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const emptyForm = { roleName: '', preferredZodiacSigns: [], preferredBirthMonths: [], minAge: 23, maxAge: 40, zodiacWeight: 40, ageWeight: 40, monthWeight: 20 };

export default function RolesPage() {
  const params = useSearchParams();
  const [roles, setRoles] = useState([]); const [form, setForm] = useState(emptyForm); const [editingId, setEditingId] = useState(null); const [message, setMessage] = useState('');
  const loadRoles = async () => setRoles(await (await fetch('/api/roles')).json());
  useEffect(()=>{loadRoles(); const p = params.get('prefill'); if(p) setForm((prev)=>({...prev, roleName:p}));},[params]);
  const weightSum = useMemo(()=>Number(form.zodiacWeight)+Number(form.ageWeight)+Number(form.monthWeight),[form]);
  const toggle=(v,l)=>l.includes(v)?l.filter((i)=>i!==v):[...l,v];

  const saveRole = async () => {
    setMessage(''); if(!form.roleName.trim()) return setMessage('Название вакансии обязательно.'); if(weightSum!==100) return setMessage('Сумма весов должна быть 100.');
    const endpoint = editingId?`/api/roles/${editingId}`:'/api/roles'; const method = editingId?'PUT':'POST';
    const response = await fetch(endpoint,{method,headers:{'Content-Type':'application/json'},body:JSON.stringify({...form,roleName:form.roleName.trim(),minAge:Number(form.minAge),maxAge:Number(form.maxAge),zodiacWeight:Number(form.zodiacWeight),ageWeight:Number(form.ageWeight),monthWeight:Number(form.monthWeight)})});
    const data = await response.json(); if(!response.ok) return setMessage(data.error||'Ошибка сохранения');
    setForm(emptyForm); setEditingId(null); setMessage('Сохранено'); loadRoles();
  };

  return <div className="space-y-6"><section className="rounded-xl bg-white p-5 shadow"><h2 className="mb-4 text-lg font-semibold">Профили вакансий</h2><table className="w-full text-left text-sm"><thead><tr className="border-b"><th>Вакансия</th><th>Возраст</th><th>Weights</th><th /></tr></thead><tbody>{roles.map((role)=><tr key={role.id} className="border-b"><td className="py-2">{role.roleName}</td><td>{role.minAge}–{role.maxAge}</td><td>{role.zodiacWeight}/{role.ageWeight}/{role.monthWeight}</td><td className="space-x-2 py-2 text-right"><button className="text-blue-600" onClick={()=>{setEditingId(role.id);setForm(role)}}>Изм.</button><button className="text-red-600" onClick={async()=>{if(!window.confirm('Удалить профиль?'))return; await fetch(`/api/roles/${role.id}`,{method:'DELETE'}); loadRoles();}}>Удалить</button></td></tr>)}</tbody></table></section>
  <section className="rounded-xl bg-white p-5 shadow"><h3 className="mb-3 font-semibold">{editingId?'Редактирование профиля':'Создание профиля'}</h3><div className="grid gap-4 md:grid-cols-2"><input className="rounded border p-2" placeholder="Название вакансии" value={form.roleName} onChange={(e)=>setForm((p)=>({...p,roleName:e.target.value}))}/><div className="rounded border p-2 text-sm">Сумма весов: <b>{weightSum}</b>/100</div><div><p className="mb-2 text-sm font-medium">Предпочитаемые знаки</p><div className="flex flex-wrap gap-2 text-sm">{ZODIAC_SIGNS.map((z)=><label key={z} className="inline-flex items-center gap-1 rounded border px-2 py-1"><input type="checkbox" checked={form.preferredZodiacSigns.includes(z)} onChange={()=>setForm((p)=>({...p,preferredZodiacSigns:toggle(z,p.preferredZodiacSigns)}))}/>{z}</label>)}</div></div><div><p className="mb-2 text-sm font-medium">Предпочитаемые месяцы</p><div className="flex flex-wrap gap-2 text-sm">{MONTHS.map((m)=><label key={m} className="inline-flex items-center gap-1 rounded border px-2 py-1"><input type="checkbox" checked={form.preferredBirthMonths.includes(m)} onChange={()=>setForm((p)=>({...p,preferredBirthMonths:toggle(m,p.preferredBirthMonths)}))}/>{m}</label>)}</div></div>{['minAge','maxAge','zodiacWeight','ageWeight','monthWeight'].map((f)=><input key={f} type="number" className="rounded border p-2" value={form[f]} onChange={(e)=>setForm((p)=>({...p,[f]:Number(e.target.value)}))}/> )}</div>
  {message && <p className="mt-3 text-sm text-slate-700">{message}</p>}<div className="mt-4 flex gap-3"><button className="rounded bg-slate-900 px-4 py-2 text-white" onClick={saveRole}>Сохранить профиль</button><button className="rounded bg-indigo-600 px-4 py-2 text-white" onClick={async()=>{if(!form.roleName.trim()) return setMessage('Сначала введите название вакансии.'); const r=await fetch('/api/roles/suggest',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({roleName:form.roleName})}); const d=await r.json(); if(!r.ok) return setMessage(d.error||'Не удалось'); setForm((p)=>({...p,...d})); setMessage('Профиль сгенерирован, проверьте и сохраните.');}}>Сгенерировать профиль ИИ</button></div></section></div>;
}
