import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { nanoid } from "nanoid";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, description, creator_name, options } = body as {
    title: string;
    description?: string;
    creator_name: string;
    options: string[];
  };

  if (!title?.trim() || !creator_name?.trim() || !options?.length) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const pollId = nanoid(10);

  await sql`
    INSERT INTO polls (id, title, description, creator_name)
    VALUES (${pollId}, ${title.trim()}, ${description?.trim() || null}, ${creator_name.trim()})
  `;

  for (let i = 0; i < options.length; i++) {
    await sql`
      INSERT INTO options (id, poll_id, label, sort_order)
      VALUES (${nanoid(8)}, ${pollId}, ${options[i]}, ${i})
    `;
  }

  return NextResponse.json({ id: pollId }, { status: 201 });
}
