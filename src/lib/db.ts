import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DB_DIR, "whenpop.db");

if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS polls (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    creator_name TEXT NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
  );

  CREATE TABLE IF NOT EXISTS options (
    id TEXT PRIMARY KEY,
    poll_id TEXT NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS participants (
    id TEXT PRIMARY KEY,
    poll_id TEXT NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
  );

  CREATE TABLE IF NOT EXISTS votes (
    participant_id TEXT NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
    option_id TEXT NOT NULL REFERENCES options(id) ON DELETE CASCADE,
    value TEXT NOT NULL CHECK(value IN ('yes','maybe','no')),
    PRIMARY KEY (participant_id, option_id)
  );
`);

export default db;

export interface Poll {
  id: string;
  title: string;
  description: string | null;
  creator_name: string;
  created_at: number;
}

export interface Option {
  id: string;
  poll_id: string;
  label: string;
  sort_order: number;
}

export interface Participant {
  id: string;
  poll_id: string;
  name: string;
  created_at: number;
}

export interface Vote {
  participant_id: string;
  option_id: string;
  value: "yes" | "maybe" | "no";
}
