import { NextResponse } from 'next/server';
import { readRoles, validateRoleInput, writeRoles } from '@/lib/rolesStore';

export async function GET() {
  const roles = await readRoles();
  return NextResponse.json(roles.sort((a,b)=>a.roleName.localeCompare(b.roleName,'ru')));
}

export async function POST(request) {
  const payload = await request.json();
  const error = validateRoleInput(payload);
  if (error) return NextResponse.json({ error }, { status: 400 });
  const roles = await readRoles();
  if (roles.some((role) => role.roleName.toLowerCase() === payload.roleName.trim().toLowerCase())) {
    return NextResponse.json({ error: 'Профиль с таким названием уже существует' }, { status: 409 });
  }
  const created = { ...payload, roleName: payload.roleName.trim(), id: Math.max(0, ...roles.map((r)=>r.id)) + 1 };
  roles.push(created);
  await writeRoles(roles);
  return NextResponse.json(created, { status: 201 });
}
