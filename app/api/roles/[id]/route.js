import { NextResponse } from "next/server";
import { deleteRole, updateRole } from "@/lib/roles-store";

export async function PUT(request, { params }) {
  try { return NextResponse.json(await updateRole(Number(params.id), await request.json())); }
  catch (error) { return NextResponse.json({ error: error.message }, { status: 400 }); }
}
export async function DELETE(_, { params }) { await deleteRole(Number(params.id)); return NextResponse.json({ ok: true }); }
