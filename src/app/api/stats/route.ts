import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  const row = db.prepare(`SELECT COUNT(*) as total FROM polls`).get() as { total: number };
  return NextResponse.json({ totalPolls: row.total });
}
