/**
 * NCLEX-RN NGN Clinical Simulator — useAudit Hook
 * Provides audit trail recording and retrieval for components.
 */

import { useCallback, useRef } from 'react';
import { AuditEntry } from '../types/master';
import { auditService } from '../services/auditService';

export function useAudit(sessionId: string) {
    const sessionIdRef = useRef(sessionId);
    sessionIdRef.current = sessionId;

    const record = useCallback(
        (
            action: AuditEntry['action'],
            target: string,
            itemId?: string,
            metadata?: Record<string, unknown>
        ) => {
            return auditService.record(action, target, sessionIdRef.current, itemId, metadata);
        },
        []
    );

    const getSessionLog = useCallback(() => {
        return auditService.getEntriesForSession(sessionIdRef.current);
    }, []);

    const getRecentEntries = useCallback((windowMs?: number) => {
        return auditService.getRecentEntries(windowMs);
    }, []);

    return { record, getSessionLog, getRecentEntries };
}
