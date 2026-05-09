import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import type { Poll, Option, Participant, Vote } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const polls = await sql`SELECT * FROM polls WHERE id = ${id}`;
  const poll = polls[0] as Poll | undefined;
  if (!poll) return NextResponse.json({ error: "Poll not found" }, { status: 404 });

  const options = await sql`
    SELECT * FROM options WHERE poll_id = ${id} ORDER BY sort_order
  ` as Option[];

  const participants = await sql`
    SELECT * FROM participants WHERE poll_id = ${id} ORDER BY created_at
  ` as Participant[];

  const votes = await sql`
    SELECT v.* FROM votes v
    JOIN participants p ON p.id = v.participant_id
    WHERE p.poll_id = ${id}
  ` as Vote[];

  return NextResponse.json({ poll, options, participants, votes });
}
