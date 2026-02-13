import { promises as fs } from "fs";
import path from "path";
import { validateRolePayload } from "@/lib/role";

const storagePath = path.join(process.cwd(), "data", "roles.json");
export async function readRoles() { return JSON.parse(await fs.readFile(storagePath, "utf8")); }
export async function writeRoles(roles) { await fs.writeFile(storagePath, JSON.stringify(roles, null, 2), "utf8"); }
export async function createRole(payload) {
  const parsed = validateRolePayload(payload); if (!parsed.ok) throw new Error(parsed.message);
  const roles = await readRoles();
  if (roles.some((r) => r.roleName.toLowerCase() === parsed.data.roleName.toLowerCase())) throw new Error("Профиль с таким названием уже существует.");
  const next = { ...parsed.data, id: Math.max(0, ...roles.map((r) => r.id)) + 1 };
  roles.push(next); await writeRoles(roles); return next;
}
export async function updateRole(id, payload) {
  const parsed = validateRolePayload(payload); if (!parsed.ok) throw new Error(parsed.message);
  const roles = await readRoles(); const i = roles.findIndex((r) => r.id === id);
  if (i === -1) throw new Error("Профиль не найден.");
  if (roles.some((r) => r.id !== id && r.roleName.toLowerCase() === parsed.data.roleName.toLowerCase())) throw new Error("Профиль с таким названием уже существует.");
  roles[i] = { ...parsed.data, id }; await writeRoles(roles); return roles[i];
}
export async function deleteRole(id) { await writeRoles((await readRoles()).filter((r) => r.id !== id)); }
