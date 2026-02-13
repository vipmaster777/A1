import { NextResponse } from 'next/server';
import { readRoles, validateRoleInput, writeRoles } from '@/lib/rolesStore';

export async function PUT(request, { params }) {
  const payload = await request.json();
  const error = validateRoleInput(payload);
  if (error) return NextResponse.json({ error }, { status: 400 });
  const id = Number(params.id);
  const roles = await readRoles();
  const index = roles.findIndex((role) => role.id === id);
  if (index < 0) return NextResponse.json({ error: 'Профиль не найден' }, { status: 404 });
  roles[index] = { ...payload, roleName: payload.roleName.trim(), id };
  await writeRoles(roles);
  return NextResponse.json(roles[index]);
}

export async function DELETE(_, { params }) {
  const id = Number(params.id);
  const roles = await readRoles();
  const filtered = roles.filter((role) => role.id !== id);
  await writeRoles(filtered);
  return NextResponse.json({ ok: true });
}
