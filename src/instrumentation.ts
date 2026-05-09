export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { sql } = await import("./lib/db");
    await sql`
      CREATE TABLE IF NOT EXISTS polls (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        creator_name TEXT NOT NULL,
        created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS options (
        id TEXT PRIMARY KEY,
        poll_id TEXT NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
        label TEXT NOT NULL,
        sort_order INTEGER NOT NULL DEFAULT 0
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS participants (
        id TEXT PRIMARY KEY,
        poll_id TEXT NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS votes (
        participant_id TEXT NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
        option_id TEXT NOT NULL REFERENCES options(id) ON DELETE CASCADE,
        value TEXT NOT NULL CHECK(value IN ('yes','maybe','no')),
        PRIMARY KEY (participant_id, option_id)
      )
    `;
  }
}
