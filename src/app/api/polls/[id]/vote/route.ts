import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { nanoid } from "nanoid";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: pollId } = await params;
  const body = await req.json();
  const { name, votes } = body as {
    name: string;
    votes: Record<string, "yes" | "maybe" | "no">;
  };

  if (!name?.trim() || !votes || typeof votes !== "object") {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const poll = db.prepare(`SELECT id FROM polls WHERE id = ?`).get(pollId);
  if (!poll) return NextResponse.json({ error: "Poll not found" }, { status: 404 });

  const participantId = nanoid(8);

  db.transaction(() => {
    db.prepare(`INSERT INTO participants (id, poll_id, name) VALUES (?, ?, ?)`).run(
      participantId,
      pollId,
      name.trim()
    );

    const insertVote = db.prepare(
      `INSERT INTO votes (participant_id, option_id, value) VALUES (?, ?, ?)`
    );
    for (const [optionId, value] of Object.entries(votes)) {
      if (["yes", "maybe", "no"].includes(value)) {
        insertVote.run(participantId, optionId, value);
      }
    }
  })();

  return NextResponse.json({ success: true, participantId }, { status: 201 });
}
