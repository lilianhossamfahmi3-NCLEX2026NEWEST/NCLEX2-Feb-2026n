/**
 * NCLEX-RN NGN Clinical Simulator — Audit Service
 * Timestamped action logging — immutable append-only log.
 */

import { AuditEntry } from '../types/master';

class AuditServiceImpl {
    private log: AuditEntry[] = [];

    record(
        action: AuditEntry['action'],
        target: string,
        sessionId: string,
        itemId?: string,
        metadata?: Record<string, unknown>
    ): AuditEntry {
        const entry: AuditEntry = {
            timestamp: new Date().toISOString(),
            action,
            target,
            sessionId,
            itemId,
            metadata,
        };
        this.log.push(entry);
        return entry;
    }

    getLog(): ReadonlyArray<AuditEntry> {
        return this.log;
    }

    getEntriesForSession(sessionId: string): AuditEntry[] {
        return this.log.filter(e => e.sessionId === sessionId);
    }

    getEntriesForItem(itemId: string): AuditEntry[] {
        return this.log.filter(e => e.itemId === itemId);
    }

    getRecentEntries(windowMs: number = 60_000): AuditEntry[] {
        const cutoff = Date.now() - windowMs;
        return this.log.filter(e => new Date(e.timestamp).getTime() >= cutoff);
    }

    clear(): void {
        this.log = [];
    }
}

export const auditService = new AuditServiceImpl();
