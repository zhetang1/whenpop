import { neon } from "@neondatabase/serverless";

export const sql = neon(process.env.DATABASE_URL!);

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
