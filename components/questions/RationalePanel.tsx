/**
 * NCLEX-RN NGN Clinical Simulator — Rationale & Pedagogy Panel v3
 * Complete overhaul: Evidence table, inline answer status, scoring methodology.
 */

import { useState } from 'react';
import { Rationale, Pedagogy, CJMMStep } from '../../types/master';

interface RationalePanelProps {
    rationale: Rationale;
    pedagogy: Pedagogy;
    earnedPoints: number;
    maxPoints: number;
    isCorrect: boolean;
    itemType: string;
    item?: any;       // Full item for answer extraction
    userAnswer?: any;  // User's submitted answer
}

const BLOOM_LABELS: Record<string, { label: string; color: string; icon: string }> = {
    remember: { label: 'Remember', color: '#60a5fa', icon: '🧠' },
    understand: { label: 'Understand', color: '#34d399', icon: '💡' },
    apply: { label: 'Apply', color: '#fbbf24', icon: '🔧' },
    analyze: { label: 'Analyze', color: '#f97316', icon: '🔬' },
    evaluate: { label: 'Evaluate', color: '#a78bfa', icon: '⚖️' },
    create: { label: 'Create', color: '#f472b6', icon: '🏗️' },
};

const CJMM_LABELS: Record<CJMMStep, string> = {
    recognizeCues: 'Recognize Cues',
    analyzeCues: 'Analyze Cues',
    prioritizeHypotheses: 'Prioritize Hypotheses',
    generateSolutions: 'Generate Solutions',
    takeAction: 'Take Action',
    evaluateOutcomes: 'Evaluate Outcomes',
};

// NGN Scoring methodology descriptions
const SCORING_METHODS: Record<string, { name: string; description: string }> = {
    multipleChoice: { name: 'Dichotomous (0/1)', description: 'All-or-nothing: 1 point if correct, 0 if incorrect. No partial credit.' },
    priorityAction: { name: 'Dichotomous (0/1)', description: 'All-or-nothing: 1 point if the highest-priority action is selected.' },
    selectAll: { name: 'Polytomous (+/−)', description: '+1 for each correct selection, −1 for each incorrect selection. Minimum score is 0 (no negative totals).' },
    selectN: { name: 'Polytomous (0/1 per)', description: '+1 for each correct selection within the N required. No penalty for incorrect selections.' },
    orderedResponse: { name: 'Dichotomous (0/1)', description: 'All-or-nothing: 1 point only if the entire sequence matches exactly.' },
    matrixMatch: { name: 'Polytomous (0/1 per row)', description: '+1 for each row correctly classified. No penalty for incorrect column selections.' },
    clozeDropdown: { name: 'Polytomous (0/1 per blank)', description: '+1 for each blank filled correctly. Each blank is independently scored.' },
    dragAndDropCloze: { name: 'Polytomous (0/1 per blank)', description: '+1 for each blank filled with the correct token. No penalty for incorrect placements.' },
    bowtie: { name: 'Polytomous (0/1 per element)', description: '5 possible points: 2 Actions (1 each) + 1 Condition + 2 Parameters (1 each). Each element scored independently.' },
    trend: { name: 'Dichotomous (0/1)', description: 'All-or-nothing based on correct interpretation of the clinical trajectory.' },
    highlight: { name: 'Polytomous (+/−)', description: '+1 for each correct highlight, −1 for each incorrect highlight. Minimum score is 0.' },
    hotspot: { name: 'Polytomous (+/−)', description: '+1 for each correct region identified, −1 for each incorrect region. Min 0.' },
    graphic: { name: 'Dichotomous (0/1)', description: 'All-or-nothing based on image stimulus analysis.' },
    audioVideo: { name: 'Dichotomous (0/1)', description: 'All-or-nothing based on media content interpretation.' },
    chartExhibit: { name: 'Dichotomous (0/1)', description: 'All-or-nothing based on exhibit/chart data interpretation.' },
};

export default function RationalePanel({ rationale, pedagogy, earnedPoints, maxPoints, isCorrect, itemType, item, userAnswer }: RationalePanelProps) {
    const [expandedUnit, setExpandedUnit] = useState<number | null>(null);
    const [showScoringInfo, setShowScoringInfo] = useState(false);

    // SAFETY: Fallback for missing rationale/pedagogy
    if (!rationale) {
        rationale = { correct: "Data structure missing.", incorrect: "Please report this item ID.", reviewUnits: [] };
    }
    if (!pedagogy) {
        pedagogy = { bloomLevel: 'analyze', cjmmStep: 'recognizeCues', nclexCategory: 'General Nursing' as any, difficulty: 3, topicTags: [] };
    }

    const pct = maxPoints > 0 ? Math.round((earnedPoints / maxPoints) * 100) : 0;
    const bloom = BLOOM_LABELS[pedagogy.bloomLevel] || { label: pedagogy.bloomLevel || 'Analyze', color: '#94a3b8', icon: '🔬' };
    const scoringInfo = SCORING_METHODS[itemType] || { name: 'Standard', description: 'Standard NCSBN scoring methodology.' };

    // Build evidence rows from item data + user answer
    const evidenceRows = buildEvidenceRows(item, itemType, userAnswer, rationale);

    return (
        <div className="rationale-panel-v3">
            {/* ═══════ VERDICT BANNER ═══════ */}
            <div className={`rp3-verdict ${isCorrect ? 'rp3-verdict--pass' : 'rp3-verdict--fail'}`}>
                <div className="rp3-verdict-icon-wrap">
                    <div className="rp3-verdict-icon">{isCorrect ? '✓' : '✗'}</div>
                    <div className="rp3-verdict-pulse" />
                </div>
                <div className="rp3-verdict-info">
                    <h2 className="rp3-verdict-title">{isCorrect ? 'Clinical Validation Success' : 'Evidence Discrepancy Detected'}</h2>
                    <div className="rp3-verdict-meta">
                        <span className="rp3-score-pill">{earnedPoints}/{maxPoints} pts</span>
                        <span className="rp3-score-pct">{pct}%</span>
                        <span className="rp3-score-method">{scoringInfo.name}</span>
                    </div>
                </div>
                <div className="rp3-score-ring">
                    <svg viewBox="0 0 40 40" className="rp3-ring-svg">
                        <circle cx="20" cy="20" r="16" className="rp3-ring-bg" />
                        <circle cx="20" cy="20" r="16" className="rp3-ring-fill"
                            style={{ strokeDasharray: `${pct} ${100 - pct}`, stroke: isCorrect ? 'var(--success)' : 'var(--error)' }}
                        />
                    </svg>
                    <span className="rp3-ring-label">{pct}%</span>
                </div>
            </div>

            {/* ═══════ EVIDENCE TABLE ═══════ */}
            {evidenceRows.length > 0 && (
                <div className="rp3-evidence-section">
                    <div className="rp3-section-header">
                        <span className="rp3-section-icon">📋</span>
                        <span>Clinical Evidence Analysis</span>
                    </div>
                    <div className="rp3-evidence-table-wrap">
                        <table className="rp3-evidence-table">
                            <thead>
                                <tr>
                                    <th className="rp3-th-status">Status</th>
                                    <th className="rp3-th-option">Option</th>
                                    <th className="rp3-th-rationale">Clinical Rationale</th>
                                    <th className="rp3-th-yours">Your Answer</th>
                                </tr>
                            </thead>
                            <tbody>
                                {evidenceRows.map((row, i) => (
                                    <tr key={i} className={`rp3-evidence-row rp3-evidence-row--${row.status}`}>
                                        <td className="rp3-td-status">
                                            <div className={`rp3-status-badge rp3-status-badge--${row.status}`}>
                                                {row.status === 'correct' && <span className="rp3-badge-icon">✓</span>}
                                                {row.status === 'incorrect' && <span className="rp3-badge-icon">✗</span>}
                                                {row.status === 'missed' && <span className="rp3-badge-icon">⚠</span>}
                                                {row.status === 'distractor' && <span className="rp3-badge-icon">○</span>}
                                                {row.status === 'neutral' && <span className="rp3-badge-icon">─</span>}
                                                <span className="rp3-badge-text">
                                                    {row.status === 'correct' && 'Correct Answer and Selected'}
                                                    {row.status === 'missed' && 'Correct Answer But Not Selected'}
                                                    {row.status === 'incorrect' && 'Incorrect Answer and Selected'}
                                                    {row.status === 'distractor' && 'Incorrect Answer But Not Selected'}
                                                    {row.status === 'neutral' && 'N/A'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="rp3-td-option">
                                            <span className="rp3-option-label">{row.label}</span>
                                            {row.optionText && <span className="rp3-option-text">{row.optionText}</span>}
                                        </td>
                                        <td className="rp3-td-rationale">{row.rationale}</td>
                                        <td className="rp3-td-yours">
                                            {row.wasSelected ? (
                                                <span className={`rp3-yours-badge ${row.status === 'correct' ? 'rp3-yours--correct' : 'rp3-yours--wrong'}`}>
                                                    {row.status === 'correct' ? '✓ Your Answer' : '✗ Your Answer'}
                                                </span>
                                            ) : row.status === 'missed' ? (
                                                <span className="rp3-yours-badge rp3-yours--missed">⚠ Not Selected</span>
                                            ) : row.status === 'distractor' ? (
                                                <span className="rp3-yours-badge rp3-yours--distractor">Correctly Omitted</span>
                                            ) : (
                                                <span className="rp3-yours-badge rp3-yours--na">—</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ═══════ SCORING METHODOLOGY ═══════ */}
            <div className="rp3-scoring-section">
                <button className="rp3-scoring-toggle" onClick={() => setShowScoringInfo(!showScoringInfo)}>
                    <div className="rp3-scoring-toggle-left">
                        <span className="rp3-section-icon">📊</span>
                        <span>NGN Scoring Methodology</span>
                    </div>
                    <div className="rp3-scoring-toggle-right">
                        <span className="rp3-score-summary">{earnedPoints} of {maxPoints} • {scoringInfo.name}</span>
                        <span className="rp3-chevron">{showScoringInfo ? '−' : '+'}</span>
                    </div>
                </button>
                {showScoringInfo && (
                    <div className="rp3-scoring-detail">
                        <div className="rp3-scoring-grid">
                            <div className="rp3-scoring-card">
                                <span className="rp3-scoring-card-label">Method</span>
                                <span className="rp3-scoring-card-value">{scoringInfo.name}</span>
                            </div>
                            <div className="rp3-scoring-card">
                                <span className="rp3-scoring-card-label">Points Earned</span>
                                <span className="rp3-scoring-card-value rp3-scoring-earned">{earnedPoints}</span>
                            </div>
                            <div className="rp3-scoring-card">
                                <span className="rp3-scoring-card-label">Max Possible</span>
                                <span className="rp3-scoring-card-value">{maxPoints}</span>
                            </div>
                            <div className="rp3-scoring-card">
                                <span className="rp3-scoring-card-label">Accuracy</span>
                                <span className={`rp3-scoring-card-value ${pct >= 80 ? 'rp3-scoring-good' : pct >= 50 ? 'rp3-scoring-mid' : 'rp3-scoring-low'}`}>{pct}%</span>
                            </div>
                        </div>
                        <p className="rp3-scoring-desc">{scoringInfo.description}</p>
                        <p className="rp3-scoring-source">Based on NCSBN Next Generation NCLEX (NGN) scoring rules, effective April 2026.</p>
                    </div>
                )}
            </div>

            {/* ═══════ SCIENTIFIC RATIONALE ═══════ */}
            <div className="rp3-rationale-grid">
                <div className="rp3-rationale-card rp3-rationale-card--correct">
                    <div className="rp3-rationale-card-header">
                        <span className="rp3-rationale-dot rp3-dot--correct" />
                        <span>Why This Is Correct</span>
                    </div>
                    <p className="rp3-rationale-body">{rationale.correct || "Rationale pending."}</p>
                </div>
                <div className="rp3-rationale-card rp3-rationale-card--incorrect">
                    <div className="rp3-rationale-card-header">
                        <span className="rp3-rationale-dot rp3-dot--incorrect" />
                        <span>Why Others Are Incorrect</span>
                    </div>
                    <p className="rp3-rationale-body">{rationale.incorrect || "Risk analysis pending."}</p>
                </div>
            </div>

            {/* ═══════ MNEMONIC ═══════ */}
            {rationale.mnemonic && (
                <div className="rp3-mnemonic-section">
                    <div className="rp3-mnemonic-card">
                        <span className="rp3-mnemonic-emoji">💡</span>
                        <div className="rp3-mnemonic-content">
                            <span className="rp3-mnemonic-title">{rationale.mnemonic.title}</span>
                            <span className="rp3-mnemonic-expansion">{rationale.mnemonic.expansion}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════ REVIEW UNITS ═══════ */}
            {rationale.reviewUnits && rationale.reviewUnits.length > 0 && (
                <div className="rp3-review-section">
                    <div className="rp3-section-header">
                        <span className="rp3-section-icon">📚</span>
                        <span>Continuous Learning Modules</span>
                    </div>
                    {rationale.reviewUnits.map((unit, i) => (
                        <div key={i} className="rp3-review-unit">
                            <button
                                className={`rp3-review-btn ${expandedUnit === i ? 'rp3-review-btn--active' : ''}`}
                                onClick={() => setExpandedUnit(expandedUnit === i ? null : i)}
                            >
                                <span>{unit.heading || "Clinical Unit"}</span>
                                <span className="rp3-chevron">{expandedUnit === i ? '−' : '+'}</span>
                            </button>
                            {expandedUnit === i && (
                                <div className="rp3-review-content">
                                    <p>{unit.body}</p>
                                    {unit.source && <cite className="rp3-review-source">Source: {unit.source}</cite>}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* ═══════ PEDAGOGY STRIP ═══════ */}
            <div className="rp3-pedagogy-strip">
                <div className="rp3-ped-item">
                    <span className="rp3-ped-label">Cognitive Depth</span>
                    <span className="rp3-ped-value" style={{ color: bloom.color }}>{bloom.icon} {bloom.label}</span>
                </div>
                <div className="rp3-ped-item">
                    <span className="rp3-ped-label">Clinical Process</span>
                    <span className="rp3-ped-value">{CJMM_LABELS[pedagogy.cjmmStep] || pedagogy.cjmmStep}</span>
                </div>
                <div className="rp3-ped-item">
                    <span className="rp3-ped-label">NCLEX Intensity</span>
                    <span className="rp3-ped-value">{'✦'.repeat(pedagogy.difficulty || 3)}{'✧'.repeat(5 - (pedagogy.difficulty || 3))}</span>
                </div>
                <div className="rp3-ped-item">
                    <span className="rp3-ped-label">Primary Competency</span>
                    <span className="rp3-ped-value">{pedagogy.nclexCategory || "Clinical Practice"}</span>
                </div>
            </div>

            <style>{rationaleStyles}</style>
        </div>
    );
}


// ═══════════════════════════════════════════════════════════
//  Evidence Row Builder — adapts per item type
// ═══════════════════════════════════════════════════════════

interface EvidenceRow {
    label: string;
    optionText?: string;
    rationale: string;
    status: 'correct' | 'incorrect' | 'missed' | 'distractor' | 'neutral';
    wasSelected: boolean;
}

function buildEvidenceRows(item: any, itemType: string, userAnswer: any, rationale: Rationale): EvidenceRow[] {
    const rows: EvidenceRow[] = [];
    if (!item) return fromBreakdown(rationale);
    const breakdown = rationale?.answerBreakdown || [];

    const getBD = (label: string, text?: string) => {
        return breakdown.find(b =>
            b.label?.toLowerCase() === label.toLowerCase() ||
            (text && b.label?.toLowerCase() === text.toLowerCase()) ||
            (text && b.content?.toLowerCase().includes(text.toLowerCase().substring(0, 20)))
        );
    };

    // ─── MC / Priority / Trend / Graphic / AudioVideo / ChartExhibit ───
    if (['multipleChoice', 'priorityAction', 'trend', 'graphic', 'audioVideo', 'chartExhibit', 'singleSelect'].includes(itemType)) {
        const correctId = item.correctOptionId;
        const userSelected = userAnswer as string;
        (item.options || []).forEach((opt: any, idx: number) => {
            const letter = String.fromCharCode(65 + idx);
            const isCorrectOption = opt.id === correctId;
            const wasUserPick = opt.id === userSelected;
            let status: EvidenceRow['status'] = 'neutral';

            if (isCorrectOption) status = wasUserPick ? 'correct' : 'missed';
            else status = wasUserPick ? 'incorrect' : 'distractor';

            const bd = getBD(letter, opt.text);
            rows.push({
                label: letter,
                optionText: opt.text,
                rationale: bd?.content || (isCorrectOption ? 'This is the evidence-based priority intervention.' : 'This selection does not address the immediate clinical need.'),
                status,
                wasSelected: wasUserPick,
            });
        });
    }

    // ─── Select All / Select N ───
    else if (['selectAll', 'selectN'].includes(itemType)) {
        const correctIds = new Set(item.correctOptionIds || []);
        const userSelected = new Set(userAnswer as string[] || []);
        (item.options || []).forEach((opt: any, idx: number) => {
            const letter = String.fromCharCode(65 + idx);
            const isCorrectOption = correctIds.has(opt.id);
            const wasUserPick = userSelected.has(opt.id);
            let status: EvidenceRow['status'] = 'neutral';

            if (isCorrectOption) status = wasUserPick ? 'correct' : 'missed';
            else status = wasUserPick ? 'incorrect' : 'distractor';

            const bd = getBD(letter, opt.text);
            rows.push({
                label: letter,
                optionText: opt.text,
                rationale: bd?.content || (isCorrectOption ? 'Clinically relevant finding that requires monitoring or action.' : 'Non-essential or non-specific finding for this acute scenario.'),
                status,
                wasSelected: wasUserPick,
            });
        });
    }

    // ─── Cloze Dropdown / Drag Drop ───
    else if (['clozeDropdown', 'dragAndDropCloze'].includes(itemType)) {
        (item.blanks || []).forEach((blank: any, idx: number) => {
            const userVal = userAnswer?.[blank.id];
            const isCorrectOption = userVal === blank.correctOption;
            const label = `Blank ${idx + 1}`;
            const bd = getBD(label, blank.id);
            rows.push({
                label,
                optionText: blank.correctOption,
                rationale: bd?.content || (isCorrectOption ? `✓ Correct clinical decision.` : `✗ Expected "${blank.correctOption}".`),
                status: isCorrectOption ? 'correct' : (userVal ? 'incorrect' : 'missed'),
                wasSelected: !!userVal,
            });
        });
    }

    // ─── Matrix Match ───
    else if (itemType === 'matrixMatch') {
        const correctMatches = item.correctMatches || {};
        const colMap: Record<string, string> = {};
        (item.columns || []).forEach((c: any) => { colMap[c.id] = c.text; });

        (item.rows || []).forEach((row: any) => {
            const userVal = userAnswer?.[row.id];
            const correctCol = correctMatches[row.id];
            const isCorrectOption = userVal === correctCol;
            const bd = getBD(row.text);
            rows.push({
                label: row.text,
                optionText: `Correct: ${colMap[correctCol] || correctCol}`,
                rationale: bd?.content || (isCorrectOption ? `✓ Correctly classified.` : `✗ Should be "${colMap[correctCol] || correctCol}".`),
                status: isCorrectOption ? 'correct' : (userVal ? 'incorrect' : 'missed'),
                wasSelected: !!userVal,
            });
        });
    }

    // ─── Bowtie ───
    else if (itemType === 'bowtie') {
        const correctActions = new Set(item.correctActionIds || []);
        const correctParams = new Set(item.correctParameterIds || []);
        const userActions = new Set(userAnswer?.actions || []);
        const userParams = new Set(userAnswer?.parameters || []);
        const userCondition = userAnswer?.condition;

        // Condition
        const condBD = getBD('🎯 Condition', 'Condition');
        rows.push({
            label: '🎯 Condition',
            optionText: item.condition,
            rationale: condBD?.content || (userCondition === item.condition ? '✓ Correct condition identified.' : '✗ Inaccurate differential diagnosis.'),
            status: userCondition === item.condition ? 'correct' : (userCondition ? 'incorrect' : 'missed'),
            wasSelected: !!userCondition,
        });

        // Actions
        (item.actions || []).forEach((a: any) => {
            const isCorrectOption = correctActions.has(a.id);
            const wasUserPick = userActions.has(a.id);
            let status: EvidenceRow['status'] = 'neutral';

            if (isCorrectOption) status = wasUserPick ? 'correct' : 'missed';
            else status = wasUserPick ? 'incorrect' : 'distractor';

            const bd = getBD('⚡ Action', a.text);
            rows.push({
                label: `⚡ Action`,
                optionText: a.text,
                rationale: bd?.content || (isCorrectOption ? 'Evidence-based priority action.' : 'Secondary or inappropriate action.'),
                status,
                wasSelected: wasUserPick,
            });
        });

        // Parameters
        (item.parameters || []).forEach((p: any) => {
            const isCorrectOption = correctParams.has(p.id);
            const wasUserPick = userParams.has(p.id);
            let status: EvidenceRow['status'] = 'neutral';

            if (isCorrectOption) status = wasUserPick ? 'correct' : 'missed';
            else status = wasUserPick ? 'incorrect' : 'distractor';

            const bd = getBD('📊 Parameter', p.text);
            rows.push({
                label: `📊 Parameter`,
                optionText: p.text,
                rationale: bd?.content || (isCorrectOption ? 'Critical monitoring parameter.' : 'Non-specific monitoring parameter.'),
                status,
                wasSelected: wasUserPick,
            });
        });
    }

    // ─── Ordered Response ───
    else if (itemType === 'orderedResponse') {
        const correctOrder = item.correctOrder || [];
        const userOrder = (userAnswer as string[]) || [];
        const optMap: Record<string, string> = {};
        (item.options || []).forEach((o: any) => { optMap[o.id] = o.text; });

        correctOrder.forEach((id: string, idx: number) => {
            const userPosId = userOrder[idx];
            const isCorrectOption = userPosId === id;
            const label = `Step ${idx + 1}`;
            const bd = getBD(label, optMap[id]);
            rows.push({
                label,
                optionText: optMap[id] || id,
                rationale: bd?.content || (isCorrectOption ? `✓ Correct sequence.` : `✗ Incorrect sequence position.`),
                status: isCorrectOption ? 'correct' : 'incorrect',
                wasSelected: true,
            });
        });
    }

    // ─── Highlight ───
    else if (itemType === 'highlight') {
        const correctIndices: number[] = item.correctSpanIndices || [];
        const userIndices: number[] = (userAnswer as number[]) || [];
        const correctSet = new Set(correctIndices);
        const userSet = new Set(userIndices);
        const sentences = (item.passage || '').split(/(?<=[.!?])\s+/);

        correctIndices.forEach((idx: number) => {
            const label = `Cue ${idx + 1}`;
            const bd = getBD(label, "Critical Cues");
            rows.push({
                label,
                optionText: sentences[idx]?.substring(0, 80) + (sentences[idx]?.length > 80 ? '…' : '') || `Phrase #${idx + 1}`,
                rationale: bd?.content || (userSet.has(idx) ? '✓ Correct clinical cue.' : '⚠ Missed critical cue.'),
                status: userSet.has(idx) ? 'correct' : 'missed',
                wasSelected: userSet.has(idx),
            });
        });

        // Show incorrect highlights
        userIndices.forEach((idx: number) => {
            if (!correctSet.has(idx)) {
                rows.push({
                    label: `Selection`,
                    optionText: sentences[idx]?.substring(0, 80) + (sentences[idx]?.length > 80 ? '…' : '') || `Phrase #${idx + 1}`,
                    rationale: '✗ This is not a primary clinical cue.',
                    status: 'incorrect',
                    wasSelected: true,
                });
            }
        });
    }

    if (rows.length === 0) return fromBreakdown(rationale);
    return rows;
}

function fromBreakdown(rationale: Rationale): EvidenceRow[] {
    if (!rationale?.answerBreakdown?.length) return [];
    return rationale.answerBreakdown.map(b => ({
        label: b.label,
        optionText: undefined,
        rationale: b.content,
        status: b.isCorrect === true ? 'correct' : b.isCorrect === false ? 'incorrect' : 'neutral',
        wasSelected: false,
    }));
}


// ═══════════════════════════════════════════════════════════
//  Styles (Self-Contained — Premium Dark/Light Adaptive)
// ═══════════════════════════════════════════════════════════

const rationaleStyles = `
    .rationale-panel-v3 {
        margin-top: 32px;
        border-radius: 24px;
        overflow: hidden;
        background: var(--bg-card);
        border: 1px solid var(--border);
        box-shadow: 0 20px 60px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.03);
        animation: rp3SlideIn 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
    }
    @keyframes rp3SlideIn { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }

    /* ─── Verdict Banner ─── */
    .rp3-verdict {
        display: flex;
        align-items: center;
        gap: 24px;
        padding: 28px 32px;
        border-bottom: 1px solid var(--border);
        position: relative;
        overflow: hidden;
    }
    .rp3-verdict--pass { background: linear-gradient(135deg, rgba(var(--success-rgb), 0.1) 0%, transparent 60%); }
    .rp3-verdict--fail { background: linear-gradient(135deg, rgba(var(--error-rgb), 0.1) 0%, transparent 60%); }

    .rp3-verdict-icon-wrap { position: relative; flex-shrink: 0; }
    .rp3-verdict-icon {
        width: 56px; height: 56px;
        border-radius: 16px;
        display: flex; align-items: center; justify-content: center;
        font-size: 1.8rem; font-weight: 950;
    }
    .rp3-verdict--pass .rp3-verdict-icon { background: rgba(var(--success-rgb), 0.15); color: var(--success); border: 2px solid rgba(var(--success-rgb), 0.4); }
    .rp3-verdict--fail .rp3-verdict-icon { background: rgba(var(--error-rgb), 0.15); color: var(--error); border: 2px solid rgba(var(--error-rgb), 0.4); }
    .rp3-verdict-pulse {
        position: absolute; inset: -4px; border-radius: 20px;
        animation: rp3Pulse 2s ease-out infinite;
    }
    .rp3-verdict--pass .rp3-verdict-pulse { border: 2px solid rgba(var(--success-rgb), 0.3); }
    .rp3-verdict--fail .rp3-verdict-pulse { border: 2px solid rgba(var(--error-rgb), 0.3); }
    @keyframes rp3Pulse { 0% { opacity: 1; transform: scale(1); } 100% { opacity: 0; transform: scale(1.3); } }

    .rp3-verdict-info { flex: 1; }
    .rp3-verdict-title { font-size: 1.4rem; font-weight: 950; letter-spacing: -0.03em; color: var(--text); margin: 0 0 8px 0; }
    .rp3-verdict-meta { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
    .rp3-score-pill {
        padding: 4px 14px; border-radius: 100px; font-size: 0.8rem; font-weight: 900;
        font-family: 'JetBrains Mono', monospace; letter-spacing: 0.02em;
    }
    .rp3-verdict--pass .rp3-score-pill { background: rgba(var(--success-rgb), 0.15); color: var(--success); }
    .rp3-verdict--fail .rp3-score-pill { background: rgba(var(--error-rgb), 0.15); color: var(--error); }
    .rp3-score-pct { font-size: 0.85rem; font-weight: 900; color: var(--muted-text); font-family: 'JetBrains Mono', monospace; }
    .rp3-score-method { font-size: 0.7rem; font-weight: 800; color: var(--muted-text); text-transform: uppercase; letter-spacing: 0.08em; padding: 3px 10px; background: rgba(var(--primary-rgb), 0.08); border-radius: 6px; }

    .rp3-score-ring { flex-shrink: 0; width: 60px; height: 60px; position: relative; }
    .rp3-ring-svg { width: 100%; height: 100%; transform: rotate(-90deg); }
    .rp3-ring-bg { fill: none; stroke: var(--border); stroke-width: 3; }
    .rp3-ring-fill { fill: none; stroke-width: 3; stroke-linecap: round; stroke-dashoffset: 0; transition: stroke-dasharray 1s ease; }
    .rp3-ring-label { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 950; color: var(--text); font-family: 'JetBrains Mono', monospace; }

    /* ─── Section Headers ─── */
    .rp3-section-header {
        display: flex; align-items: center; gap: 10px;
        font-size: 0.78rem; font-weight: 950; text-transform: uppercase; letter-spacing: 0.1em;
        color: var(--primary); padding: 20px 32px 12px; 
    }
    .rp3-section-icon { font-size: 1rem; }

    /* ─── Evidence Table ─── */
    .rp3-evidence-section { border-bottom: 1px solid var(--border); }
    .rp3-evidence-table-wrap { padding: 0 20px 20px; overflow-x: auto; }
    .rp3-evidence-table {
        width: 100%; border-collapse: separate; border-spacing: 0;
        border-radius: 16px; overflow: hidden; border: 1px solid var(--border);
        font-size: 0.9rem;
    }
    .rp3-evidence-table thead { background: var(--panel-bg); }
    .rp3-evidence-table th {
        padding: 14px 16px; text-align: left; font-size: 0.68rem; font-weight: 950;
        text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted-text);
        border-bottom: 2px solid var(--border);
    }
    .rp3-th-status { width: 220px; text-align: center; }
    .rp3-th-option { width: 30%; }
    .rp3-th-rationale { }
    .rp3-th-yours { width: 110px; text-align: center; }

    .rp3-evidence-row td {
        padding: 14px 16px; border-bottom: 1px solid rgba(var(--border-rgb, 128,128,128), 0.3);
        vertical-align: middle; transition: background 0.2s;
    }
    .rp3-evidence-row:last-child td { border-bottom: none; }
    .rp3-evidence-row:hover td { background: rgba(var(--primary-rgb), 0.02); }

    .rp3-evidence-row--correct td { background: rgba(var(--success-rgb), 0.03); }
    .rp3-evidence-row--incorrect td { background: rgba(var(--error-rgb), 0.03); }
    .rp3-evidence-row--missed td { background: rgba(245, 158, 11, 0.04); }
    .rp3-evidence-row--distractor td { background: rgba(var(--primary-rgb), 0.015); }

    .rp3-td-status { text-align: center; }
    .rp3-status-badge {
        display: inline-flex; align-items: center; gap: 6px;
        padding: 6px 14px; border-radius: 8px; font-size: 0.65rem; font-weight: 950;
        text-transform: uppercase; letter-spacing: 0.04em; line-height: 1.3;
    }
    .rp3-status-badge--correct { background: rgba(var(--success-rgb), 0.12); color: var(--success); }
    .rp3-status-badge--incorrect { background: rgba(var(--error-rgb), 0.12); color: var(--error); }
    .rp3-status-badge--missed { background: rgba(245, 158, 11, 0.12); color: #f59e0b; }
    .rp3-status-badge--distractor { background: rgba(var(--primary-rgb), 0.1); color: var(--muted-text); border: 1px solid rgba(var(--primary-rgb), 0.2); }
    .rp3-status-badge--neutral { background: rgba(var(--primary-rgb), 0.06); color: var(--muted-text); }
    .rp3-badge-icon { font-size: 0.85rem; font-weight: 950; }

    .rp3-td-option { }
    .rp3-option-label { font-size: 0.75rem; font-weight: 950; color: var(--primary); display: block; margin-bottom: 2px; letter-spacing: 0.02em; }
    .rp3-option-text { font-size: 0.88rem; font-weight: 650; color: var(--text); line-height: 1.5; display: block; }
    .rp3-td-rationale { font-size: 0.88rem; line-height: 1.6; color: var(--text); font-weight: 500; opacity: 0.9; }
    .rp3-td-yours { text-align: center; }

    .rp3-yours-badge {
        display: inline-flex; align-items: center; gap: 4px;
        padding: 4px 10px; border-radius: 6px; font-size: 0.65rem; font-weight: 900;
        text-transform: uppercase; letter-spacing: 0.04em; white-space: nowrap;
    }
    .rp3-yours--correct { background: rgba(var(--success-rgb), 0.1); color: var(--success); }
    .rp3-yours--wrong { background: rgba(var(--error-rgb), 0.1); color: var(--error); }
    .rp3-yours--missed { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
    .rp3-yours--distractor { background: rgba(var(--primary-rgb), 0.05); color: var(--muted-text); opacity: 0.8; }
    .rp3-yours--na { color: var(--muted-text); opacity: 0.5; font-weight: 700; }

    /* ─── Scoring Methodology ─── */
    .rp3-scoring-section { border-bottom: 1px solid var(--border); }
    .rp3-scoring-toggle {
        width: 100%; padding: 18px 32px; display: flex; justify-content: space-between; align-items: center;
        background: transparent; border: none; color: var(--text); cursor: pointer; transition: background 0.2s;
    }
    .rp3-scoring-toggle:hover { background: rgba(var(--primary-rgb), 0.03); }
    .rp3-scoring-toggle-left { display: flex; align-items: center; gap: 10px; font-size: 0.78rem; font-weight: 950; text-transform: uppercase; letter-spacing: 0.1em; color: var(--primary); }
    .rp3-scoring-toggle-right { display: flex; align-items: center; gap: 12px; }
    .rp3-score-summary { font-size: 0.75rem; font-weight: 800; color: var(--muted-text); font-family: 'JetBrains Mono', monospace; }
    .rp3-chevron { font-size: 1.2rem; font-weight: 900; color: var(--primary); }

    .rp3-scoring-detail { padding: 0 32px 24px; animation: rp3SlideDown 0.3s ease-out; }
    @keyframes rp3SlideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }

    .rp3-scoring-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px; }
    .rp3-scoring-card {
        padding: 16px; border-radius: 14px; background: var(--panel-bg); border: 1px solid var(--border);
        display: flex; flex-direction: column; gap: 6px; text-align: center;
    }
    .rp3-scoring-card-label { font-size: 0.6rem; font-weight: 950; text-transform: uppercase; letter-spacing: 0.12em; color: var(--muted-text); }
    .rp3-scoring-card-value { font-size: 1.1rem; font-weight: 950; color: var(--text); font-family: 'JetBrains Mono', monospace; }
    .rp3-scoring-earned { color: var(--primary); }
    .rp3-scoring-good { color: var(--success); }
    .rp3-scoring-mid { color: #f59e0b; }
    .rp3-scoring-low { color: var(--error); }
    .rp3-scoring-desc { font-size: 0.88rem; line-height: 1.7; color: var(--text); font-weight: 500; margin: 0 0 8px; }
    .rp3-scoring-source { font-size: 0.75rem; color: var(--primary); font-weight: 700; font-style: italic; opacity: 0.8; margin: 0; }

    /* ─── Rationale Grid ─── */
    .rp3-rationale-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0; border-bottom: 1px solid var(--border); }
    .rp3-rationale-card { padding: 28px 32px; }
    .rp3-rationale-card--correct { border-right: 1px solid var(--border); background: rgba(var(--success-rgb), 0.02); }
    .rp3-rationale-card--incorrect { background: rgba(var(--error-rgb), 0.02); }
    .rp3-rationale-card-header {
        display: flex; align-items: center; gap: 10px;
        font-size: 0.72rem; font-weight: 950; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 14px;
    }
    .rp3-rationale-card--correct .rp3-rationale-card-header { color: var(--success); }
    .rp3-rationale-card--incorrect .rp3-rationale-card-header { color: var(--error); }
    .rp3-rationale-dot { width: 10px; height: 10px; border-radius: 50%; box-shadow: 0 0 8px currentColor; }
    .rp3-dot--correct { background: var(--success); }
    .rp3-dot--incorrect { background: var(--error); }
    .rp3-rationale-body { font-size: 0.95rem; line-height: 1.7; color: var(--text); font-weight: 500; margin: 0; }

    /* ─── Mnemonic ─── */
    .rp3-mnemonic-section { padding: 20px 32px; border-bottom: 1px solid var(--border); }
    .rp3-mnemonic-card {
        display: flex; align-items: center; gap: 20px;
        padding: 20px 28px; border-radius: 16px;
        background: linear-gradient(135deg, rgba(var(--primary-rgb), 0.06), transparent);
        border: 1.5px solid rgba(var(--primary-rgb), 0.2);
    }
    .rp3-mnemonic-emoji { font-size: 2rem; flex-shrink: 0; }
    .rp3-mnemonic-content { display: flex; flex-direction: column; gap: 4px; }
    .rp3-mnemonic-title { font-size: 1.3rem; font-weight: 950; color: var(--primary); letter-spacing: 0.05em; }
    .rp3-mnemonic-expansion { font-size: 0.9rem; font-weight: 600; color: var(--text); line-height: 1.5; }

    /* ─── Review Units ─── */
    .rp3-review-section { padding: 0 0 8px; border-bottom: 1px solid var(--border); }
    .rp3-review-unit { margin: 0 20px 8px; border-radius: 12px; overflow: hidden; border: 1px solid var(--border); }
    .rp3-review-btn {
        width: 100%; padding: 14px 20px; display: flex; justify-content: space-between; align-items: center;
        background: var(--panel-bg); border: none; color: var(--text); font-size: 0.88rem; font-weight: 800;
        cursor: pointer; transition: all 0.2s;
    }
    .rp3-review-btn:hover { background: rgba(var(--primary-rgb), 0.05); }
    .rp3-review-btn--active { background: rgba(var(--primary-rgb), 0.08); border-bottom: 1px solid var(--border); }
    .rp3-review-content { padding: 20px; background: rgba(var(--primary-rgb), 0.03); animation: rp3SlideDown 0.3s ease-out; }
    .rp3-review-content p { font-size: 0.9rem; line-height: 1.7; color: var(--text); margin: 0 0 12px; }
    .rp3-review-source { font-size: 0.78rem; color: var(--primary); font-weight: 700; font-style: italic; display: block; }

    /* ─── Pedagogy Strip ─── */
    .rp3-pedagogy-strip { display: flex; background: var(--panel-bg); }
    .rp3-ped-item { flex: 1; padding: 20px; border-right: 1px solid var(--border); text-align: center; }
    .rp3-ped-item:last-child { border-right: none; }
    .rp3-ped-label { font-size: 0.6rem; font-weight: 950; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted-text); margin-bottom: 6px; display: block; }
    .rp3-ped-value { font-size: 0.82rem; font-weight: 850; color: var(--text); font-family: 'JetBrains Mono', monospace; }

    /* ─── Responsive ─── */
    @media (max-width: 900px) {
        .rp3-rationale-grid { grid-template-columns: 1fr; }
        .rp3-rationale-card--correct { border-right: none; border-bottom: 1px solid var(--border); }
        .rp3-scoring-grid { grid-template-columns: repeat(2, 1fr); }
        .rp3-pedagogy-strip { flex-wrap: wrap; }
        .rp3-ped-item { min-width: 50%; }
        .rp3-verdict { flex-wrap: wrap; }
    }
    @media (max-width: 600px) {
        .rp3-evidence-table { font-size: 0.8rem; }
        .rp3-th-yours, .rp3-td-yours { display: none; }
        .rp3-scoring-grid { grid-template-columns: 1fr 1fr; }
    }
`;
