import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
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

  const polls = await sql`SELECT id FROM polls WHERE id = ${pollId}`;
  if (!polls[0]) return NextResponse.json({ error: "Poll not found" }, { status: 404 });

  const participantId = nanoid(8);
  await sql`
    INSERT INTO participants (id, poll_id, name) VALUES (${participantId}, ${pollId}, ${name.trim()})
  `;

  for (const [optionId, value] of Object.entries(votes)) {
    if (["yes", "maybe", "no"].includes(value)) {
      await sql`
        INSERT INTO votes (participant_id, option_id, value) VALUES (${participantId}, ${optionId}, ${value})
      `;
    }
  }

  return NextResponse.json({ success: true, participantId }, { status: 201 });
}
