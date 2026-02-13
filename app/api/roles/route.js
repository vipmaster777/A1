import { NextResponse } from "next/server";
import { createRole, readRoles } from "@/lib/roles-store";

export async function GET() { return NextResponse.json(await readRoles()); }
export async function POST(request) {
  try { return NextResponse.json(await createRole(await request.json()), { status: 201 }); }
  catch (error) { return NextResponse.json({ error: error.message }, { status: 400 }); }
}
