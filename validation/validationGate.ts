/**
 * NCLEX-RN NGN Clinical Simulator — Validation Gate
 * Single entry point for data validation.
 */

import { ZodError } from 'zod';
import { MasterItem, CaseStudy } from '../types/master';
import { MasterItemSchema, CaseStudySchema } from './schemaRegistry';

export function validateItem(item: unknown): {
    success: boolean;
    data?: MasterItem;
    errors?: ZodError;
} {
    const result = MasterItemSchema.safeParse(item);
    if (result.success) {
        return { success: true, data: result.data as MasterItem };
    }
    return { success: false, errors: result.error };
}

export function validateCaseStudy(cs: unknown): {
    success: boolean;
    data?: CaseStudy;
    errors?: ZodError;
} {
    const result = CaseStudySchema.safeParse(cs);
    if (result.success) {
        return { success: true, data: result.data as CaseStudy };
    }
    return { success: false, errors: result.error };
}

export function validateAndCertify(cs: unknown): CaseStudy {
    return CaseStudySchema.parse(cs) as CaseStudy;
}
