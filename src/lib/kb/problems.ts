// Splits a merged ticket into the problems its reports describe.
// causes.ts places a report by its tenant. That covers two bugs (`parser`, `hint`). A third shape
// never fits either: the date moves by one day instead of flipping day and month. The desk already
// lists those reports in desk-notes.json (`oneDayMove`); here they get their own problem instead of
// a footnote under `parser`.
import { causeOf, uniqueById, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = 'parser' | 'hint' | 'one-day' | 'unplaced';
export const PROBLEMS: readonly Problem[] = ['parser', 'hint', 'one-day', 'unplaced'];

export function problemOf(r: Report, t: Tenant | undefined, oneDayMove: readonly string[]): Problem {
  if (oneDayMove.includes(r.id)) return 'one-day';
  return causeOf(r, t) ?? 'unplaced';
}

export type ProblemGroup = {
  problem: Problem;
  reports: Report[];
  tenants: string[];
  channels: Record<string, number>;
  taggedAs: Record<string, number>;
  firstSeen: string;
  lastSeen: string;
};

const tally = (rs: Report[], key: (r: Report) => string) =>
  rs.reduce<Record<string, number>>((n, r) => ({ ...n, [key(r)]: (n[key(r)] ?? 0) + 1 }), {});

export function splitTicket(
  all: Report[],
  ticket: number,
  tenantOf: (r: Report) => Tenant | undefined,
  oneDayMove: readonly string[],
): { merged: Report[]; rows: number; groups: ProblemGroup[] } {
  const merged = uniqueById(all).filter((r) => r.mergedInto === ticket);
  const by = new Map<Problem, Report[]>();
  for (const r of merged) {
    const p = problemOf(r, tenantOf(r), oneDayMove);
    by.set(p, [...(by.get(p) ?? []), r]);
  }
  const groups = PROBLEMS.filter((p) => by.has(p)).map((problem) => {
    const rs = by.get(problem)!;
    const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
    return {
      problem,
      reports: rs,
      tenants: [...new Set(rs.map((r) => r.tenant))].sort(),
      channels: tally(rs, (r) => r.channel),
      taggedAs: tally(rs, (r) => r.meta.intakeTag),
      firstSeen: days[0],
      lastSeen: days[days.length - 1],
    };
  });
  return { merged, rows: all.filter((r) => r.mergedInto === ticket).length, groups };
}
