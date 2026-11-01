<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import type { Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';
  import { splitTicket, type Problem } from '#lib/kb/problems';

  // `tickets`: where each problem is tracked now, problem → { label, href }.
  let {
    ticket,
    tickets = {},
  }: { ticket: number; tickets?: Partial<Record<Problem, { label: string; href: string }>> } = $props();

  const split = $derived(splitTicket(reports as Report[], ticket, tenantOf, notes.oneDayMove));
  const counted = $derived(split.groups.reduce((n, g) => n + g.reports.length, 0));
  const list = (n: Record<string, number>) =>
    Object.entries(n)
      .sort((a, b) => b[1] - a[1])
      .map(([k, v]) => `${k} ×${v}`)
      .join(' · ');
</script>

<p class="sum">
  <strong>{split.merged.length}</strong> reports in #{ticket} ({split.rows} export rows, {split.rows - split.merged.length}
  repeated across export pages) · <strong>{split.groups.length}</strong>
  {split.groups.length === 1 ? 'problem' : 'problems'}
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>tenants</th><th>came in by</th><th>intake tagged</th><th>seen</th><th>ticket</th></tr>
  </thead>
  <tbody>
    {#each split.groups as g (g.problem)}
      <tr>
        <td><code>{g.problem}</code></td>
        <td><b>{g.reports.length}</b></td>
        <td>{g.tenants.length}</td>
        <td class="muted">{list(g.channels)}</td>
        <td class="muted">{list(g.taggedAs)}</td>
        <td>{g.firstSeen} → {g.lastSeen}</td>
        <td>
          {#if tickets[g.problem]}<a href={tickets[g.problem]!.href}>{tickets[g.problem]!.label}</a>{:else}<span class="none">none</span>{/if}
        </td>
      </tr>
    {/each}
  </tbody>
  <tfoot>
    <tr><td>total</td><td><b>{counted}</b></td><td colspan="5" class="muted">{counted === split.merged.length ? 'every report placed once' : `${split.merged.length - counted} reports not placed`}</td></tr>
  </tfoot>
</table>

{#each split.groups as g (g.problem)}
  <details>
    <summary><code>{g.problem}</code>: tenants</summary>
    <p class="muted">{g.tenants.join(', ')}</p>
  </details>
{/each}

<style>
  .sum { font-size: 1.1rem; }
  .muted { color: var(--muted); font-size: 0.85em; }
  .none { color: var(--warn); font-weight: 600; }
  tfoot td { border-bottom: 0; }
  details { margin: 0.25rem 0; font-size: 0.9rem; }
</style>
