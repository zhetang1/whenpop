"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import type { Poll, Option, Participant, Vote } from "@/lib/db";

type VoteValue = "yes" | "maybe" | "no";

interface PollData {
  poll: Poll;
  options: Option[];
  participants: Participant[];
  votes: Vote[];
}

const VOTE_CONFIG: Record<VoteValue, { label: string; emoji: string; bg: string; text: string; border: string }> = {
  yes: { label: "Yes", emoji: "✓", bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-400" },
  maybe: { label: "If needed", emoji: "~", bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-400" },
  no: { label: "No", emoji: "✕", bg: "bg-red-100", text: "text-red-600", border: "border-red-400" },
};

export default function PollPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<PollData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [voterName, setVoterName] = useState("");
  const [myVotes, setMyVotes] = useState<Record<string, VoteValue>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const [copied, setCopied] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/polls/${id}`);
      if (!res.ok) throw new Error("Poll not found");
      const json = await res.json();
      setData(json);
    } catch {
      setError("Could not load this poll.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function setVote(optionId: string, value: VoteValue) {
    setMyVotes((prev) => ({ ...prev, [optionId]: value }));
  }

  async function submitVotes(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError("");
    if (!voterName.trim()) return setSubmitError("Please enter your name.");
    const allVoted = data?.options.every((o) => myVotes[o.id]);
    if (!allVoted) return setSubmitError("Please vote on every option.");

    setSubmitting(true);
    try {
      const res = await fetch(`/api/polls/${id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: voterName.trim(), votes: myVotes }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setSubmitted(true);
      await fetchData();
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  async function copyLink() {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) return <div className="text-center text-slate-500 py-20">Loading…</div>;
  if (error || !data) return <div className="text-center text-red-500 py-20">{error || "Poll not found."}</div>;

  const { poll, options, participants, votes } = data;

  // Tally votes per option
  const tally = options.map((opt) => {
    const optVotes = votes.filter((v) => v.option_id === opt.id);
    return {
      opt,
      yes: optVotes.filter((v) => v.value === "yes").length,
      maybe: optVotes.filter((v) => v.value === "maybe").length,
      no: optVotes.filter((v) => v.value === "no").length,
    };
  });

  const maxYes = Math.max(...tally.map((t) => t.yes), 0);

  return (
    <div className="space-y-6">
      {/* Poll header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{poll.title}</h1>
            {poll.description && (
              <p className="text-slate-500 mt-1 text-sm">{poll.description}</p>
            )}
            <p className="text-xs text-slate-400 mt-2">Created by {poll.creator_name}</p>
          </div>
          <button
            onClick={copyLink}
            className="flex items-center gap-2 text-sm bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium px-4 py-2 rounded-lg transition-colors shrink-0"
          >
            {copied ? "✓ Copied!" : "🔗 Copy link"}
          </button>
        </div>
      </div>

      {/* Results table */}
      {participants.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-700">
              Results · {participants.length} {participants.length === 1 ? "response" : "responses"}
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-6 py-3 text-slate-500 font-medium w-40">Participant</th>
                  {options.map((opt) => (
                    <th key={opt.id} className="px-3 py-3 text-center text-slate-600 font-medium min-w-[110px]">
                      {opt.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {participants.map((p) => (
                  <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="px-6 py-3 font-medium text-slate-700">{p.name}</td>
                    {options.map((opt) => {
                      const v = votes.find(
                        (vote) => vote.participant_id === p.id && vote.option_id === opt.id
                      );
                      const val = v?.value as VoteValue | undefined;
                      const cfg = val ? VOTE_CONFIG[val] : null;
                      return (
                        <td key={opt.id} className="px-3 py-3 text-center">
                          {cfg ? (
                            <span
                              className={`inline-block w-8 h-8 rounded-full text-base font-bold leading-8 ${cfg.bg} ${cfg.text}`}
                            >
                              {cfg.emoji}
                            </span>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
                {/* Tally row */}
                <tr className="bg-slate-50 border-t border-slate-200">
                  <td className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Yes / If needed / No
                  </td>
                  {tally.map(({ opt, yes, maybe, no }) => (
                    <td key={opt.id} className="px-3 py-3 text-center">
                      <div className={`inline-flex flex-col items-center gap-0.5 rounded-lg px-2 py-1 ${yes === maxYes && maxYes > 0 ? "bg-emerald-100 ring-2 ring-emerald-400" : ""}`}>
                        <span className="text-emerald-600 font-bold text-base">{yes}</span>
                        <span className="text-[10px] text-slate-400">{maybe} · {no}</span>
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Vote form */}
      {!submitted ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="font-semibold text-slate-700 mb-4">Add your availability</h2>
          <form onSubmit={submitVotes} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                Your name <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full max-w-xs border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="Your name"
                value={voterName}
                onChange={(e) => setVoterName(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              {options.map((opt) => {
                const current = myVotes[opt.id];
                return (
                  <div key={opt.id} className="flex items-center gap-3 flex-wrap">
                    <span className="text-sm text-slate-700 font-medium w-48 shrink-0">
                      {opt.label}
                    </span>
                    <div className="flex gap-2">
                      {(["yes", "maybe", "no"] as VoteValue[]).map((val) => {
                        const cfg = VOTE_CONFIG[val];
                        const active = current === val;
                        return (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setVote(opt.id, val)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all ${
                              active
                                ? `${cfg.bg} ${cfg.text} ${cfg.border}`
                                : "bg-white text-slate-400 border-slate-200 hover:border-slate-300"
                            }`}
                          >
                            {cfg.emoji} {cfg.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {submitError && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {submitError}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold rounded-lg px-6 py-2.5 text-sm transition-colors"
            >
              {submitting ? "Saving…" : "Save my votes"}
            </button>
          </form>
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center">
          <div className="text-2xl mb-2">🎉</div>
          <p className="font-semibold text-emerald-700">Your votes are saved!</p>
          <button
            onClick={() => { setSubmitted(false); setMyVotes({}); setVoterName(""); }}
            className="mt-3 text-sm text-emerald-600 underline"
          >
            Add another response
          </button>
        </div>
      )}

      {/* Legend */}
      <div className="flex gap-4 justify-center text-xs text-slate-500 flex-wrap">
        {(Object.entries(VOTE_CONFIG) as [VoteValue, typeof VOTE_CONFIG[VoteValue]][]).map(([, cfg]) => (
          <span key={cfg.label} className="flex items-center gap-1">
            <span className={`inline-block w-5 h-5 rounded-full text-center leading-5 font-bold ${cfg.bg} ${cfg.text}`}>
              {cfg.emoji}
            </span>
            {cfg.label}
          </span>
        ))}
      </div>
    </div>
  );
}
