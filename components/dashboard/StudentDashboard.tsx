/**
 * NCLEX-RN NGN Clinical Simulator — Student Dashboard (Post-Simulation)
 * Comprehensive results: score summary, CJMM domain analysis,
 * per-question review with answer breakdown, study recommendations.
 */

import { useState } from 'react';
import { CJMMStep, SessionState, MasterItem } from '../../types/master';

interface StudentDashboardProps {
    session: SessionState;
    passProbability: number;
    onExit: () => void;
}

const CJMM_LABELS: Record<CJMMStep, string> = {
    recognizeCues: 'Recognize Cues',
    analyzeCues: 'Analyze Cues',
    prioritizeHypotheses: 'Prioritize Hypotheses',
    generateSolutions: 'Generate Solutions',
    takeAction: 'Take Action',
    evaluateOutcomes: 'Evaluate Outcomes',
};

const CJMM_ICONS: Record<CJMMStep, string> = {
    recognizeCues: '🔍',
    analyzeCues: '🧩',
    prioritizeHypotheses: '📊',
    generateSolutions: '💡',
    takeAction: '⚡',
    evaluateOutcomes: '✅',
};

function formatType(type: string): string {
    return type.replace(/([A-Z])/g, ' $1').trim();
}

export function StudentDashboard({ session, passProbability, onExit }: StudentDashboardProps) {
    const [expandedItem, setExpandedItem] = useState<string | null>(null);

    const totalEarned = Object.values(session.scores).reduce((a, b) => a + b, 0);
    const totalMax = session.caseStudy.items.reduce((a, i) => a + i.scoring.maxPoints, 0);
    const pct = totalMax > 0 ? Math.round((totalEarned / totalMax) * 100) : 0;
    const passed = passProbability >= 0.5;

    // Items answered correctly
    const correctCount = session.caseStudy.items.filter(item => {
        const earned = session.scores[item.id];
        return earned !== undefined && earned >= item.scoring.maxPoints;
    }).length;

    // Weak CJMM domains (< 70%)
    const weakDomains = (Object.keys(CJMM_LABELS) as CJMMStep[])
        .filter(step => session.cjmmProfile[step] < 0.7 && session.cjmmProfile[step] > 0);

    return (
        <div className="sd-dashboard">
            <div className="sd-inner">
                {/* ── Hero Section ──────────────────────────────── */}
                <section className="sd-hero">
                    <div className="sd-hero-actions">
                        <button className="exit-btn" onClick={onExit}>← Exit to Library</button>
                        <button className="print-btn" onClick={() => window.print()}>🖨️ Print Report</button>
                    </div>
                    <div className={`sd-verdict-ring ${passed ? 'sd-ring--pass' : 'sd-ring--fail'}`}>
                        <span className="sd-verdict-pct">{pct}%</span>
                    </div>
                    <h1 className="sd-verdict-title">
                        {passed ? 'Case Study Passed' : 'Needs Improvement'}
                    </h1>
                    <p className="sd-verdict-subtitle">
                        {session.caseStudy.title} — {session.caseStudy.patient.name}
                    </p>
                </section>

                {/* ── Summary Cards ─────────────────────────────── */}
                <section className="sd-stats-row">
                    <div className="sd-stat-card">
                        <div className="sd-stat-value">{pct}%</div>
                        <div className="sd-stat-label">Overall Score</div>
                        <div className="sd-stat-bar">
                            <div className="sd-stat-fill" style={{
                                width: `${pct}%`,
                                background: pct >= 70 ? '#4ade80' : pct >= 50 ? '#fbbf24' : '#ef4444',
                            }} />
                        </div>
                    </div>
                    <div className="sd-stat-card">
                        <div className="sd-stat-value">{totalEarned}<span className="sd-stat-denom">/{totalMax}</span></div>
                        <div className="sd-stat-label">Points Earned</div>
                        <div className="sd-stat-detail">
                            {correctCount} of {session.caseStudy.items.length} items correct
                        </div>
                    </div>
                    <div className="sd-stat-card">
                        <div className="sd-stat-value" style={{ color: passed ? '#4ade80' : '#ef4444' }}>
                            {(passProbability * 100).toFixed(1)}%
                        </div>
                        <div className="sd-stat-label">Pass Probability</div>
                        <div className="sd-stat-detail" style={{ color: passed ? '#4ade80' : '#ef4444' }}>
                            {passed ? '✓ Above threshold' : '✗ Below threshold'}
                        </div>
                    </div>
                </section>

                {/* ── CJMM Domain Analysis ─────────────────────── */}
                <section className="sd-section">
                    <h2 className="sd-section-title">🧠 Clinical Judgment Competency Map</h2>
                    <p className="sd-section-desc">
                        Your performance across the 6 NCSBN Clinical Judgment Measurement Model domains.
                    </p>
                    <div className="sd-cjmm-grid">
                        {(Object.keys(CJMM_LABELS) as CJMMStep[]).map(step => {
                            const val = Math.round(session.cjmmProfile[step] * 100);
                            const color = val >= 70 ? '#4ade80' : val >= 40 ? '#fbbf24' : '#ef4444';
                            const hasSample = val > 0;
                            return (
                                <div key={step} className="sd-cjmm-row">
                                    <span className="sd-cjmm-icon">{CJMM_ICONS[step]}</span>
                                    <span className="sd-cjmm-label">{CJMM_LABELS[step]}</span>
                                    <div className="sd-cjmm-track">
                                        <div
                                            className="sd-cjmm-fill"
                                            style={{ width: hasSample ? `${Math.max(val, 3)}%` : '0%', background: color }}
                                        />
                                    </div>
                                    <span className="sd-cjmm-pct" style={{ color: hasSample ? color : '#334155' }}>
                                        {hasSample ? `${val}%` : '—'}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* ── Clinical Workflow & Safety ───────────────── */}
                <section className="sd-section">
                    <h2 className="sd-section-title">🏥 Clinical Workflow & Safety</h2>
                    <p className="sd-section-desc">
                        Performance on non-item interactions and safety protocols.
                    </p>
                    <div className="sd-workflow-grid">
                        {session.caseStudy.clinicalData.medications.map(med => {
                            const admin = session.administeredMeds[med.id];
                            return (
                                <div key={med.id} className={`sd-workflow-card ${admin ? 'sd-wf--success' : 'sd-wf--neutral'}`}>
                                    <div className="sd-wf-main">
                                        <div className="sd-wf-med">{med.name} ({med.dose})</div>
                                        <div className="sd-wf-status">
                                            {admin ? `✓ Administered @ Item ${admin.itemIndex + 1}` : '✗ Not Administered'}
                                        </div>
                                    </div>
                                    {admin && (
                                        <div className="sd-wf-rights">
                                            Safety Check: {admin.rightsChecked.length}/15 Rights Verified
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* ── Per-Question Review ───────────────────────── */}
                <section className="sd-section">
                    <h2 className="sd-section-title">📋 Question-by-Question Review</h2>
                    <p className="sd-section-desc">
                        Click any question to expand the detailed answer breakdown and rationale.
                    </p>
                    <div className="sd-questions">
                        {session.caseStudy.items.map((item, idx) => {
                            const earned = session.scores[item.id] ?? 0;
                            const max = item.scoring.maxPoints;
                            const correct = earned >= max;
                            const isExpanded = expandedItem === item.id;

                            return (
                                <div key={item.id} className={`sd-q-card ${correct ? 'sd-q--correct' : 'sd-q--incorrect'}`}>
                                    <button
                                        className="sd-q-header"
                                        onClick={() => setExpandedItem(isExpanded ? null : item.id)}
                                    >
                                        <div className="sd-q-left">
                                            <span className={`sd-q-badge ${correct ? 'sd-badge--correct' : 'sd-badge--incorrect'}`}>
                                                {correct ? '✓' : '✗'}
                                            </span>
                                            <span className="sd-q-num">Q{idx + 1}</span>
                                            <span className="sd-q-type">{formatType(item.type)}</span>
                                        </div>
                                        <div className="sd-q-right">
                                            <span className="sd-q-score">{earned}/{max}</span>
                                            <span className="sd-q-chevron">{isExpanded ? '▾' : '▸'}</span>
                                        </div>
                                    </button>
                                    {isExpanded && (
                                        <QuestionReview item={item} earned={earned} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* ── Study Recommendations ─────────────────────── */}
                {weakDomains.length > 0 && (
                    <section className="sd-section">
                        <h2 className="sd-section-title">📚 Recommended Study Focus</h2>
                        <div className="sd-recs">
                            {weakDomains.map(step => {
                                const val = Math.round(session.cjmmProfile[step] * 100);
                                return (
                                    <div key={step} className="sd-rec-card">
                                        <span className="sd-rec-icon">{CJMM_ICONS[step]}</span>
                                        <div className="sd-rec-content">
                                            <div className="sd-rec-domain">{CJMM_LABELS[step]}</div>
                                            <div className="sd-rec-detail">
                                                Scored {val}% — {getRecommendation(step)}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* ── Session Info & Actions ────────────────────── */}
                <section className="sd-footer">
                    <div className="sd-session-meta">
                        <span>Session ID: {session.id.slice(0, 8)}…</span>
                        <span>Started: {new Date(session.startTime).toLocaleString()}</span>
                        {session.endTime && <span>Completed: {new Date(session.endTime).toLocaleString()}</span>}
                    </div>
                    <button className="sd-btn-restart" onClick={() => window.location.reload()}>
                        🔄 Start New Session
                    </button>
                </section>
            </div>

            <style>{`
                ${dashboardStyles}
                .exit-btn {
                    position: absolute;
                    top: 40px;
                    left: 40px;
                    padding: 8px 16px;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 8px;
                    color: var(--muted-text);
                    font-size: 0.8rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s;
                    z-index: 100;
                }
                .exit-btn:hover {
                    background: rgba(255,255,255,0.1);
                    color: #fff;
                }
                .print-btn {
            position: absolute;
            top: 40px;
            right: 40px;
            padding: 8px 16px;
            background: var(--primary);
            border: none;
            border-radius: 8px;
            color: #fff;
            font-size: 0.8rem;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s;
        }
        .print-btn:hover { opacity: 0.9; transform: translateY(-1px); }

        @media print {
            .exit-btn, .print-btn, .sd-btn-restart { display: none !important; }
            .sd-dashboard { padding: 0 !important; background: #fff !important; color: #000 !important; }
            .sd-inner { max-width: 100% !important; }
        }
    `}</style>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════
//  Per-Question Expanded Review
// ═══════════════════════════════════════════════════════════

function QuestionReview({ item, earned }: { item: MasterItem; earned: number }) {
    const r = item.rationale;
    const max = item.scoring?.maxPoints ?? 0;

    if (!r) {
        return (
            <div className="sd-q-review">
                <p className="sd-q-stem">{item.stem}</p>
                <div className="sd-q-rat-block sd-rat--incorrect">
                    <div className="sd-rat-heading">⚠️ Data Missing</div>
                    <p>Rationale data is not available for this item.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="sd-q-review">
            <div className="sd-q-header-meta">
                <span className="sd-q-score-detail">Score: {earned} / {max} points</span>
            </div>
            <p className="sd-q-stem">{item.stem}</p>

            {/* Answer Breakdown */}
            {r.answerBreakdown && r.answerBreakdown.length > 0 && (
                <div className="sd-q-breakdown">
                    <div className="sd-q-breakdown-title">Answer Breakdown</div>
                    {r.answerBreakdown.map((ab, i) => (
                        <div
                            key={i}
                            className={`sd-ab-item ${ab.isCorrect === true ? 'sd-ab--correct' : ab.isCorrect === false ? 'sd-ab--incorrect' : 'sd-ab--neutral'}`}
                        >
                            <span className="sd-ab-badge">
                                {ab.isCorrect === true ? '✓' : ab.isCorrect === false ? '✗' : '•'}
                            </span>
                            <div className="sd-ab-body">
                                <strong className="sd-ab-label">{ab.label}</strong>
                                <span className="sd-ab-content">{ab.content}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Rationale Summary */}
            <div className="sd-q-rationale-row">
                <div className="sd-q-rat-block sd-rat--correct">
                    <div className="sd-rat-heading">✓ Why Correct</div>
                    <p>{r.correct}</p>
                </div>
                <div className="sd-q-rat-block sd-rat--incorrect">
                    <div className="sd-rat-heading">✗ Common Misconception</div>
                    <p>{r.incorrect}</p>
                </div>
            </div>

            {/* Quick Mnemonic / Trap */}
            <div className="sd-q-extras">
                {r.mnemonic && (
                    <div className="sd-q-extra sd-extra--mnemonic">
                        <span className="sd-extra-badge">🧠 {r.mnemonic.title}</span>
                        <span>{r.mnemonic.expansion}</span>
                    </div>
                )}
                {r.questionTrap && (
                    <div className="sd-q-extra sd-extra--trap">
                        <span className="sd-extra-badge">⚠️ Question Trap</span>
                        <span>{r.questionTrap.trap}</span>
                    </div>
                )}
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════
//  Recommendations Generator
// ═══════════════════════════════════════════════════════════

function getRecommendation(step: CJMMStep): string {
    const recs: Record<CJMMStep, string> = {
        recognizeCues: 'Practice identifying abnormal lab values, vital sign patterns, and assessment findings. Focus on knowing normal ranges cold.',
        analyzeCues: 'Work on grouping related findings into clinical clusters. Ask: "What pattern do these findings create together?"',
        prioritizeHypotheses: 'Drill ABCs/Maslow\'s hierarchy. Practice ranking competing problems by threat level. Use the "What will kill the patient first?" method.',
        generateSolutions: 'Study nursing interventions for common conditions. Focus on independent nursing actions vs. collaborative/dependent actions.',
        takeAction: 'Memorize priority interventions for emergencies. Practice "first action" questions using NCLEX decision frameworks.',
        evaluateOutcomes: 'Study expected outcomes for common treatments. Practice "which finding indicates improvement?" style questions.',
    };
    return recs[step];
}

// ═══════════════════════════════════════════════════════════
//  Styles
// ═══════════════════════════════════════════════════════════

const dashboardStyles = `
    .sd-dashboard {
        min-height: 100vh;
        background: var(--bg);
        color: var(--text);
        font-family: 'Inter', system-ui, sans-serif;
        overflow-y: auto;
    }
    .sd-inner {
        max-width: 900px;
        margin: 0 auto;
        padding: 48px 24px 80px;
    }

    /* Hero */
    .sd-hero {
        text-align: center;
        margin-bottom: 48px;
        animation: sdFadeIn 0.6s ease-out;
        padding: 40px;
        background: var(--sidebar-bg);
        border: 1px solid var(--border);
        border-radius: 20px;
    }
    .sd-verdict-ring {
        width: 140px;
        height: 140px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 24px;
        position: relative;
    }
    .sd-ring--pass {
        background: radial-gradient(circle at center, rgba(74, 222, 128, 0.08), transparent 70%);
        border: 4px solid rgba(74, 222, 128, 0.4);
        box-shadow: 0 0 40px rgba(74, 222, 128, 0.15), inset 0 0 30px rgba(74, 222, 128, 0.05);
    }
    .sd-ring--fail {
        background: radial-gradient(circle at center, rgba(239, 68, 68, 0.08), transparent 70%);
        border: 4px solid rgba(239, 68, 68, 0.4);
        box-shadow: 0 0 40px rgba(239, 68, 68, 0.15), inset 0 0 30px rgba(239, 68, 68, 0.05);
    }
    .sd-verdict-pct {
        font-size: 2.5rem;
        font-weight: 900;
        color: var(--primary);
        font-family: 'JetBrains Mono', monospace;
    }
    .sd-ring--pass .sd-verdict-pct { color: #4ade80; }
    .sd-ring--fail .sd-verdict-pct { color: #f87171; }
    .sd-verdict-title {
        font-size: 2rem;
        font-weight: 900;
        margin-bottom: 8px;
        color: var(--sidebar-text);
    }
    .sd-verdict-subtitle {
        color: var(--muted-text);
        font-weight: 500;
    }

    /* Stats */
    .sd-stats-row {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 16px;
        margin-bottom: 48px;
        animation: sdFadeIn 0.7s ease-out;
    }
    .sd-stat-card {
        background: rgba(255,255,255,0.03);
        border: 1px solid #1e293b;
        border-radius: 16px;
        padding: 24px;
        text-align: center;
    }
    .sd-stat-value {
        font-size: 2rem;
        font-weight: 900;
        color: #a5b4fc;
        font-family: 'JetBrains Mono', monospace;
    }
    .sd-stat-denom {
        font-size: 1.1rem;
        color: #64748b;
    }
    .sd-stat-label {
        font-size: 0.75rem;
        font-weight: 800;
        text-transform: uppercase;
        color: var(--muted-text);
        letter-spacing: 0.05em;
    }
    .sd-stat-detail {
        margin-top: 12px;
        font-size: 0.8rem;
        font-weight: 600;
        color: var(--muted-text);
    }
    .sd-stat-bar {
        height: 4px;
        background: rgba(255,255,255,0.06);
        border-radius: 2px;
        margin-top: 12px;
        overflow: hidden;
    }
    .sd-stat-fill {
        height: 100%;
        border-radius: 2px;
        transition: width 1s ease;
    }

    /* Sections */
    .sd-section {
        background: var(--bg-card);
        border: 1px solid var(--border);
        border-radius: 16px;
        padding: 32px;
        margin-bottom: 32px;
        animation: sdFadeIn 0.8s ease-out;
    }
    .sd-section-title {
        font-size: 1.25rem;
        font-weight: 800;
        color: var(--text);
        margin-bottom: 8px;
    }
    .sd-section-desc {
        color: var(--muted-text);
        font-size: 0.95rem;
        margin-bottom: 24px;
    }

    /* CJMM */
    .sd-cjmm-grid {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }
    .sd-cjmm-row {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 16px;
        background: rgba(255,255,255,0.02);
        border-radius: 10px;
        border: 1px solid rgba(255,255,255,0.04);
    }
    .sd-cjmm-icon { font-size: 1.1rem; flex-shrink: 0; }
    .sd-cjmm-label {
        min-width: 180px;
        font-size: 0.95rem;
        font-weight: 600;
        color: var(--text);
    }
    .sd-cjmm-track {
        flex: 1;
        height: 10px;
        background: var(--bg);
        border-radius: 5px;
        overflow: hidden;
    }
    .sd-cjmm-fill {
        height: 100%;
        border-radius: 4px;
        transition: width 1.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .sd-cjmm-pct {
        min-width: 42px;
        text-align: right;
        font-size: 0.8rem;
        font-weight: 700;
        font-family: 'JetBrains Mono', monospace;
    }

    /* Workflow */
    .sd-workflow-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
    }
    .sd-workflow-card {
        padding: 16px;
        background: rgba(255,255,255,0.02);
        border: 1px solid #1e293b;
        border-radius: 12px;
    }
    .sd-wf--success { border-left: 3px solid #10b981; }
    .sd-wf--neutral { border-left: 3px solid #64748b; opacity: 0.7; }
    .sd-wf-main { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .sd-wf-med { font-size: 0.85rem; font-weight: 700; color: #f1f5f9; }
    .sd-wf-status { font-size: 0.75rem; font-weight: 600; color: #94a3b8; }
    .sd-wf-rights { font-size: 0.7rem; color: #64748b; font-family: 'JetBrains Mono', monospace; }

    /* Question Review */
    .sd-questions {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    .sd-q-card {
        border-radius: 10px;
        overflow: hidden;
        border: 1px solid #1e293b;
        transition: border-color 0.2s;
    }
    .sd-q-card:hover {
        border-color: #334155;
    }
    .sd-q--correct { border-left: 3px solid rgba(74, 222, 128, 0.4); }
    .sd-q--incorrect { border-left: 3px solid rgba(239, 68, 68, 0.3); }

    .sd-q-header {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 20px 24px;
        background: var(--bg-card);
        border: none;
        cursor: pointer;
        transition: background 0.2s;
        text-align: left;
    }
    .sd-q-header:hover {
        background: rgba(255,255,255,0.04);
    }
    .sd-q-left { display: flex; align-items: center; gap: 10px; }
    .sd-q-right { display: flex; align-items: center; gap: 12px; }
    .sd-q-badge {
        width: 24px; height: 24px;
        border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        font-size: 0.7rem; font-weight: 900;
    }
    .sd-badge--correct { background: rgba(74, 222, 128, 0.15); color: #4ade80; }
    .sd-badge--incorrect { background: rgba(239, 68, 68, 0.12); color: #f87171; }
    .sd-q-num {
        font-weight: 800;
        color: var(--text);
        margin-right: 12px;
    }
    .sd-q-type {
        padding: 2px 8px;
        background: rgba(99, 102, 241, 0.1);
        border: 1px solid rgba(99, 102, 241, 0.15);
        border-radius: 4px;
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        color: var(--muted-text);
        letter-spacing: 0.05em;
    }
    .sd-q-score {
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.8rem;
        font-weight: 800;
        color: var(--text);
        font-variant-numeric: tabular-nums;
        margin-right: 16px;
    }
    .sd-q-chevron {
        color: var(--muted-text);
        font-size: 0.9rem;
    }

    /* Expanded Review */
    .sd-q-review {
        padding: 20px;
        background: rgba(0,0,0,0.2);
        border-top: 1px solid #1e293b;
        animation: sdSlideDown 0.3s ease-out;
    }
    .sd-q-stem {
        font-size: 0.88rem;
        line-height: 1.6;
        color: #94a3b8;
        margin-bottom: 16px;
        padding-left: 12px;
        border-left: 2px solid #334155;
    }

    .sd-q-breakdown {
        margin-bottom: 16px;
    }
    .sd-q-breakdown-title {
        font-size: 0.7rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: #64748b;
        margin-bottom: 10px;
    }
    .sd-ab-item {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        padding: 10px 12px;
        border-radius: 6px;
        margin-bottom: 6px;
        border-left: 3px solid;
    }
    .sd-ab--correct {
        background: rgba(74, 222, 128, 0.03);
        border-color: rgba(74, 222, 128, 0.3);
    }
    .sd-ab--incorrect {
        background: rgba(239, 68, 68, 0.03);
        border-color: rgba(239, 68, 68, 0.2);
    }
    .sd-ab--neutral {
        background: rgba(59, 130, 246, 0.03);
        border-color: rgba(59, 130, 246, 0.2);
    }
    .sd-ab-badge {
        width: 20px; height: 20px;
        border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        font-size: 0.65rem; font-weight: 900;
        flex-shrink: 0;
        margin-top: 1px;
    }
    .sd-ab--correct .sd-ab-badge { background: rgba(74,222,128,0.15); color: #4ade80; }
    .sd-ab--incorrect .sd-ab-badge { background: rgba(239,68,68,0.12); color: #f87171; }
    .sd-ab--neutral .sd-ab-badge { background: rgba(59,130,246,0.12); color: #60a5fa; }
    .sd-ab-body { flex: 1; }
    .sd-ab-label {
        font-size: 0.78rem;
        font-weight: 700;
        color: #e2e8f0;
        display: block;
        margin-bottom: 2px;
    }
    .sd-ab-content {
        font-size: 0.8rem;
        line-height: 1.5;
        color: #94a3b8;
    }

    /* Rationale summary */
    .sd-q-rationale-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
        margin-bottom: 12px;
    }
    .sd-q-rat-block {
        padding: 12px;
        border-radius: 8px;
        border: 1px solid #1e293b;
    }
    .sd-rat--correct { background: rgba(74, 222, 128, 0.03); }
    .sd-rat--incorrect { background: rgba(239, 68, 68, 0.03); }
    .sd-rat-heading {
        font-size: 0.68rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: #94a3b8;
        margin-bottom: 6px;
    }
    .sd-q-rat-block p {
        font-size: 0.8rem;
        line-height: 1.55;
        color: #94a3b8;
    }

    /* Extras */
    .sd-q-extras {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    .sd-q-extra {
        padding: 10px 14px;
        border-radius: 8px;
        font-size: 0.8rem;
        line-height: 1.5;
        color: #94a3b8;
    }
    .sd-extra--mnemonic {
        background: rgba(139, 92, 246, 0.04);
        border: 1px solid rgba(139, 92, 246, 0.12);
    }
    .sd-extra--trap {
        background: rgba(245, 158, 11, 0.04);
        border: 1px solid rgba(245, 158, 11, 0.12);
    }
    .sd-extra-badge {
        display: inline-block;
        font-weight: 800;
        font-size: 0.7rem;
        margin-right: 8px;
        color: #e2e8f0;
    }

    /* Recommendations */
    .sd-recs {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
    .sd-rec-card {
        display: flex;
        align-items: flex-start;
        gap: 14px;
        padding: 16px;
        background: rgba(59, 130, 246, 0.03);
        border: 1px solid rgba(59, 130, 246, 0.1);
        border-radius: 10px;
    }
    .sd-rec-icon {
        font-size: 1.3rem;
        flex-shrink: 0;
        margin-top: 2px;
    }
    .sd-rec-domain {
        font-size: 0.85rem;
        font-weight: 700;
        color: #e2e8f0;
        margin-bottom: 4px;
    }
    .sd-rec-detail {
        font-size: 0.8rem;
        line-height: 1.5;
        color: #94a3b8;
    }

    /* Footer */
    .sd-footer {
        text-align: center;
        padding-top: 32px;
        border-top: 1px solid #1e293b;
    }
    .sd-session-meta {
        display: flex;
        justify-content: center;
        gap: 24px;
        flex-wrap: wrap;
        margin-bottom: 24px;
        font-size: 0.7rem;
        color: #475569;
    }
    .sd-btn-restart {
        padding: 14px 36px;
        background: linear-gradient(135deg, #3b82f6, #6366f1);
        color: white;
        border: none;
        border-radius: 10px;
        font-size: 0.9rem;
        font-weight: 800;
        cursor: pointer;
        transition: all 0.2s;
        box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);
    }
    .sd-btn-restart:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(59, 130, 246, 0.4);
    }

    @keyframes sdFadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    @keyframes sdSlideDown {
        from { opacity: 0; max-height: 0; }
        to { opacity: 1; max-height: 2000px; }
    }
`;
