/**
 * NCLEX-RN NGN Clinical Simulator — Clinical Helpers
 * Pure functions — no side effects, no DOM access.
 */

import { VitalSign, LabResult, ClinicalData } from '../types/master';

// ═══════════════════════════════════════════════════════════
//  MEWS — Modified Early Warning Score
// ═══════════════════════════════════════════════════════════

export function calculateMEWS(vital: VitalSign): number {
    let score = 0;

    // Heart Rate
    if (vital.hr < 40) score += 2;
    else if (vital.hr <= 50) score += 1;
    else if (vital.hr >= 51 && vital.hr <= 100) score += 0;
    else if (vital.hr >= 101 && vital.hr <= 110) score += 1;
    else if (vital.hr >= 111 && vital.hr <= 129) score += 2;
    else if (vital.hr >= 130) score += 3;

    // Systolic BP
    if (vital.sbp < 70) score += 3;
    else if (vital.sbp <= 80) score += 2;
    else if (vital.sbp <= 100) score += 1;
    else if (vital.sbp <= 199) score += 0;
    else if (vital.sbp >= 200) score += 2;

    // Respiratory Rate
    if (vital.rr < 9) score += 2;
    else if (vital.rr <= 14) score += 0;
    else if (vital.rr <= 20) score += 1;
    else if (vital.rr <= 29) score += 2;
    else if (vital.rr >= 30) score += 3;

    // Temperature (°F)
    if (vital.temp < 95) score += 2;
    else if (vital.temp <= 96.7) score += 1;
    else if (vital.temp <= 100.3) score += 0;
    else if (vital.temp <= 101.2) score += 1;
    else if (vital.temp > 101.2) score += 2;

    // Consciousness (AVPU)
    switch (vital.consciousness) {
        case 'Alert': score += 0; break;
        case 'Voice': score += 1; break;
        case 'Pain': score += 2; break;
        case 'Unresponsive': score += 3; break;
    }

    return score;
}

// ═══════════════════════════════════════════════════════════
//  MAP — Mean Arterial Pressure
// ═══════════════════════════════════════════════════════════

export function calculateMAP(sbp: number, dbp: number): number {
    return Math.round((dbp + (sbp - dbp) / 3) * 10) / 10;
}

// ═══════════════════════════════════════════════════════════
//  Lab Flag
// ═══════════════════════════════════════════════════════════

const CRITICAL_THRESHOLDS: Record<string, { low?: number; high?: number }> = {
    potassium: { low: 2.5, high: 6.5 },
    sodium: { low: 120, high: 160 },
    glucose: { low: 40, high: 500 },
    hemoglobin: { low: 7 },
    platelets: { low: 50000, high: 1000000 },
    ph: { low: 7.2, high: 7.6 },
    troponin: { high: 0.4 },
};

export function flagLab(lab: LabResult): 'H' | 'L' | 'C' | 'N' {
    const nameKey = lab.name.toLowerCase();

    // Check critical thresholds first
    for (const [key, thresholds] of Object.entries(CRITICAL_THRESHOLDS)) {
        if (nameKey.includes(key)) {
            if (thresholds.low !== undefined && lab.value < thresholds.low) return 'C';
            if (thresholds.high !== undefined && lab.value > thresholds.high) return 'C';
        }
    }

    // Standard high/low
    if (lab.value < lab.refLow) return 'L';
    if (lab.value > lab.refHigh) return 'H';
    return 'N';
}

// ═══════════════════════════════════════════════════════════
//  Vital Color
// ═══════════════════════════════════════════════════════════

type VitalColor = 'green' | 'yellow' | 'red';

function rangeColor(value: number, greenLow: number, greenHigh: number, yellowLow: number, yellowHigh: number): VitalColor {
    if (value >= greenLow && value <= greenHigh) return 'green';
    if ((value >= yellowLow && value < greenLow) || (value > greenHigh && value <= yellowHigh)) return 'yellow';
    return 'red';
}

export function getVitalColor(vital: VitalSign): Record<string, VitalColor> {
    return {
        hr: rangeColor(vital.hr, 60, 100, 50, 120),
        sbp: rangeColor(vital.sbp, 100, 139, 90, 159),
        dbp: rangeColor(vital.dbp, 60, 89, 50, 99),
        rr: rangeColor(vital.rr, 12, 20, 10, 24),
        temp: rangeColor(vital.temp, 97.0, 99.5, 96.0, 100.3),
        spo2: vital.spo2 >= 95 ? 'green' : vital.spo2 >= 90 ? 'yellow' : 'red',
        pain: vital.pain <= 3 ? 'green' : vital.pain <= 6 ? 'yellow' : 'red',
    };
}

// ═══════════════════════════════════════════════════════════
//  High Alert Check
// ═══════════════════════════════════════════════════════════

export function checkHighAlert(clinicalData: ClinicalData): string[] {
    const alerts: string[] = [];

    if (clinicalData.vitals.length === 0) return alerts;

    const latest = clinicalData.vitals[clinicalData.vitals.length - 1];
    const mews = calculateMEWS(latest);
    const map = calculateMAP(latest.sbp, latest.dbp);

    if (mews >= 5) alerts.push(`MEWS Score ${mews}: Rapid response recommended`);
    if (map < 65) alerts.push(`MAP ${map}: Hypotension alert`);
    if (map > 110) alerts.push(`MAP ${map}: Hypertensive crisis alert`);
    if (latest.spo2 < 90) alerts.push(`SpO2 ${latest.spo2}%: Hypoxemia alert`);
    if (latest.hr > 150 || latest.hr < 40) alerts.push(`Heart rate ${latest.hr}: Arrhythmia alert`);
    if (latest.rr > 30 || latest.rr < 8) alerts.push(`Respiratory rate ${latest.rr}: Ventilation alert`);
    if (latest.temp > 103 || latest.temp < 94) alerts.push(`Temperature ${latest.temp}°F: Thermoregulation alert`);

    // Critical labs
    for (const lab of clinicalData.labs) {
        if (flagLab(lab) === 'C') {
            alerts.push(`CRITICAL: ${lab.name} = ${lab.value} ${lab.unit}`);
        }
    }

    return alerts;
}
