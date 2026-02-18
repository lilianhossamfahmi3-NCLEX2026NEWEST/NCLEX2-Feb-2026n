/**
 * NCLEX-RN NGN Clinical Simulator — Stress Detection Engine
 * Pure function — stateless analysis of audit entries.
 */

import { AuditEntry, StressState } from '../types/master';

const DEFAULT_WINDOW_MS = 60_000;

export function detectStress(
    auditEntries: AuditEntry[],
    windowMs: number = DEFAULT_WINDOW_MS
): StressState {
    if (auditEntries.length === 0) return 'focused';

    // Find the most recent timestamp as "now"
    const sortedByTime = [...auditEntries].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    const now = new Date(sortedByTime[sortedByTime.length - 1].timestamp).getTime();

    // Filter to entries within the window
    const recent = sortedByTime.filter(
        e => now - new Date(e.timestamp).getTime() < windowMs
    );

    if (recent.length === 0) return 'focused';

    // ─── Metrics ───────────────────────────────────────────

    // Answer changes
    const answerChanges = recent.filter(
        e => e.action === 'answerSelect' || e.action === 'answerDeselect'
    ).length;

    // Tab switches
    const tabSwitches = recent.filter(e => e.action === 'tabChange').length;

    // Click rate (actions / window duration in seconds)
    const windowDurationSec = windowMs / 1000;
    const clickRate = recent.length / windowDurationSec;

    // Time since last action
    const lastActionTime = new Date(recent[recent.length - 1].timestamp).getTime();
    const timeSinceLastAction = now - lastActionTime;

    // Unique targets in last 5 seconds
    const fiveSecsAgo = now - 5000;
    const recentFive = recent.filter(
        e => new Date(e.timestamp).getTime() >= fiveSecsAgo
    );
    const uniqueTargets5s = new Set(recentFive.map(e => e.target)).size;

    // Average gap between actions
    let totalGap = 0;
    for (let i = 1; i < recent.length; i++) {
        totalGap += new Date(recent[i].timestamp).getTime() - new Date(recent[i - 1].timestamp).getTime();
    }
    const avgGap = recent.length > 1 ? totalGap / (recent.length - 1) : 0;

    // ─── Detection (priority order) ───────────────────────

    // Paralysis: no interaction for > 30 seconds
    if (timeSinceLastAction > 30_000) return 'paralysis';

    // Panic: rapid changes, high click rate, erratic navigation
    if (answerChanges > 6 || clickRate > 2 || uniqueTargets5s > 3) return 'panic';

    // Hesitant: moderate indecision
    if (answerChanges >= 3 && (tabSwitches > 5 || avgGap > 8000)) return 'hesitant';

    return 'focused';
}
