import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  const rows = await sql`SELECT COUNT(*) as total FROM polls`;
  const total = Number(rows[0].total);
  return NextResponse.json({ totalPolls: total });
}
