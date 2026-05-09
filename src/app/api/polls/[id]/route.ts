import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import type { Poll, Option, Participant, Vote } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const poll = db.prepare(`SELECT * FROM polls WHERE id = ?`).get(id) as Poll | undefined;
  if (!poll) return NextResponse.json({ error: "Poll not found" }, { status: 404 });

  const options = db
    .prepare(`SELECT * FROM options WHERE poll_id = ? ORDER BY sort_order`)
    .all(id) as Option[];

  const participants = db
    .prepare(`SELECT * FROM participants WHERE poll_id = ? ORDER BY created_at`)
    .all(id) as Participant[];

  const votes = db
    .prepare(
      `SELECT v.* FROM votes v
       JOIN participants p ON p.id = v.participant_id
       WHERE p.poll_id = ?`
    )
    .all(id) as Vote[];

  return NextResponse.json({ poll, options, participants, votes });
}
