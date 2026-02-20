import { useMemo } from 'react';
import { CJMMStep } from '../../types/master';

interface AnalyticsDashboardProps {
    history: any[];
    onExit: () => void;
    theme: 'light' | 'dark';
}

const CJMM_LABELS: Record<CJMMStep, string> = {
    recognizeCues: 'Recognize Cues',
    analyzeCues: 'Analyze Cues',
    prioritizeHypotheses: 'Prioritize Hypotheses',
    generateSolutions: 'Generate Solutions',
    takeAction: 'Take Action',
    evaluateOutcomes: 'Evaluate Outcomes',
};

export default function AnalyticsDashboard({ history, onExit, theme }: AnalyticsDashboardProps) {
    // --- Data Aggregation ---
    const stats = useMemo(() => {
        if (history.length === 0) return null;

        const avgScore = history.reduce((a, b) => a + b.score, 0) / history.length;

        // Aggregate CJMM Profile
        const cjmmAgg: Record<string, number> = {
            recognizeCues: 0, analyzeCues: 0, prioritizeHypotheses: 0,
            generateSolutions: 0, takeAction: 0, evaluateOutcomes: 0
        };
        const counts: Record<string, number> = { ...cjmmAgg };

        history.forEach(h => {
            if (h.cjmmProfile) {
                Object.entries(h.cjmmProfile).forEach(([key, val]) => {
                    if (val as number > 0) {
                        cjmmAgg[key] += (val as number);
                        counts[key]++;
                    }
                });
            }
        });

        const finalCjmm = Object.keys(cjmmAgg).map(key => ({
            key,
            label: CJMM_LABELS[key as CJMMStep],
            value: counts[key] > 0 ? (cjmmAgg[key] / counts[key]) * 100 : 0
        }));

        return { avgScore, finalCjmm };
    }, [history]);

    // Mastery Data
    const mastery = useMemo(() => {
        const saved = localStorage.getItem('nclex_mastery');
        if (!saved) return { mastered: 0, inProgress: 0, total: 0 };
        try {
            const data = JSON.parse(saved);
            const vals = Object.values(data) as any[];
            return {
                mastered: vals.filter(v => v.correct >= 2).length,
                inProgress: vals.filter(v => v.correct < 2).length,
                total: vals.length
            };
        } catch (e) {
            return { mastered: 0, inProgress: 0, total: 0 };
        }
    }, []);

    return (
        <div className={`analytics-dashboard ${theme === 'dark' ? 'dark' : ''}`}>
            <header className="analytics-header">
                <div className="a-brand">
                    <button className="back-btn" onClick={onExit}>← Back</button>
                    <h1>Clinical <span className="highlight">Analytics</span> Engine</h1>
                </div>
                <div className="a-meta">Comprehensive performance telemetry across {history.length} sessions</div>
            </header>

            {!stats ? (
                <div className="empty-state">
                    <h2>Insufficient Data</h2>
                    <p>Complete at least one clinical case to generate performance insights.</p>
                </div>
            ) : (
                <main className="analytics-grid">
                    {/* Hero Stats */}
                    <div className="stat-card hero-card">
                        <div className="hero-stat">
                            <span className="hero-val">{Math.round(stats.avgScore * 100)}%</span>
                            <span className="hero-label">Avg. Pass Probability</span>
                        </div>
                        <div className="hero-subtext">Operating at a {stats.avgScore >= 0.7 ? 'High' : 'Moderate'} clinical readiness level.</div>
                    </div>

                    <div className="stat-card mastery-card">
                        <h3>Item Mastery (Spaced Repetiton)</h3>
                        <div className="mastery-viz">
                            <div className="m-bar-container">
                                <div className="m-bar-fill m-mastered" style={{ width: `${mastery.total > 0 ? (mastery.mastered / mastery.total) * 100 : 0}%` }} />
                                <div className="m-bar-fill m-progress" style={{ width: `${mastery.total > 0 ? (mastery.inProgress / mastery.total) * 100 : 0}%`, left: `${mastery.total > 0 ? (mastery.mastered / mastery.total) * 100 : 0}%` }} />
                            </div>
                            <div className="m-legend">
                                <span><i className="dot d-mastered" /> Mastered: {mastery.mastered}</span>
                                <span><i className="dot d-progress" /> Learning: {mastery.inProgress}</span>
                            </div>
                        </div>
                    </div>

                    {/* CJMM Domain Analysis */}
                    <div className="stat-card cjmm-domain-card">
                        <h3>NCJMM Clinical Readiness profile</h3>
                        <div className="cjmm-bars">
                            {stats.finalCjmm.map(d => (
                                <div key={d.key} className="cjmm-domain-row">
                                    <div className="d-label-row">
                                        <span className="d-name">{d.label}</span>
                                        <span className="d-val">{Math.round(d.value)}%</span>
                                    </div>
                                    <div className="d-bar-bg">
                                        <div
                                            className="d-bar-fill"
                                            style={{
                                                width: `${d.value}%`,
                                                background: d.value >= 75 ? 'var(--success)' : d.value >= 50 ? 'var(--primary)' : 'var(--error)'
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Growth Chart (Mockup representation of recent scores) */}
                    <div className="stat-card growth-card">
                        <h3>Clinical Growth Trajectory</h3>
                        <div className="chart-area">
                            <svg viewBox="0 0 400 150" className="growth-svg">
                                <polyline
                                    fill="none"
                                    stroke="var(--primary)"
                                    strokeWidth="3"
                                    points={history.reverse().map((h, i) => `${(i / (history.length - 1)) * 360 + 20},${130 - (h.score * 100)}`).join(' ')}
                                />
                                {history.map((h, i) => (
                                    <circle
                                        key={i}
                                        cx={(i / (history.length - 1)) * 360 + 20}
                                        cy={130 - (h.score * 100)}
                                        r="4"
                                        fill="var(--primary)"
                                    />
                                ))}
                            </svg>
                            <div className="chart-labels">
                                <span>Past Sessions</span>
                                <span>Latest →</span>
                            </div>
                        </div>
                    </div>

                    {/* Time Analysis */}
                    <div className="stat-card session-list-card">
                        <h3>Recent Simulation Telemetry</h3>
                        <div className="a-history-list">
                            {history.slice(0, 5).map((h, i) => (
                                <div key={i} className="a-history-row">
                                    <div className="a-h-info">
                                        <div className="a-h-title">{h.title}</div>
                                        <div className="a-h-date">{new Date(h.date).toLocaleDateString()}</div>
                                    </div>
                                    <div className="a-h-metrics">
                                        <div className="a-h-score">{Math.round(h.score * 100)}%</div>
                                        <div className="a-h-time">{Math.round(h.duration / 60)}m</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
            )}

            <style>{analyticsStyles}</style>
        </div>
    );
}

const analyticsStyles = `
    .analytics-dashboard {
        min-height: 100vh;
        background: var(--bg);
        color: var(--text);
        padding: 40px;
        font-family: 'Inter', system-ui, sans-serif;
    }

    .analytics-header { margin-bottom: 40px; }
    .a-brand { display: flex; align-items: center; gap: 24px; margin-bottom: 8px; }
    .back-btn {
        padding: 8px 16px;
        background: rgba(255,255,255,0.05);
        border: 1px solid var(--border);
        border-radius: 8px;
        color: var(--muted-text);
        cursor: pointer;
        font-weight: 700;
    }
    .a-brand h1 { font-size: 1.8rem; font-weight: 900; }
    .a-meta { color: var(--muted-text); font-size: 0.9rem; }

    .analytics-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 24px;
        max-width: 1400px;
        margin: 0 auto;
    }

    .stat-card {
        background: var(--bg-card);
        border: 1px solid var(--border);
        border-radius: 20px;
        padding: 24px;
        transition: all 0.3s ease;
    }

    .hero-card {
        grid-column: span 1;
        background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(99, 102, 241, 0.1));
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
    }

    .hero-stat { display: flex; flex-direction: column; }
    .hero-val { font-size: 4rem; font-weight: 900; color: var(--primary); line-height: 1; }
    .hero-label { font-size: 0.9rem; font-weight: 700; color: var(--muted-text); text-transform: uppercase; margin-top: 8px; }
    .hero-subtext { margin-top: 16px; font-size: 0.9rem; color: var(--muted-text); }

    .mastery-card h3, .cjmm-domain-card h3, .growth-card h3, .session-list-card h3 {
        font-size: 0.8rem;
        font-weight: 800;
        color: var(--muted-text);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: 24px;
    }

    .mastery-viz { margin-top: 12px; }
    .m-bar-container {
        height: 12px;
        background: var(--bg);
        border-radius: 6px;
        position: relative;
        overflow: hidden;
        margin-bottom: 16px;
    }
    .m-bar-fill { height: 100%; position: absolute; transition: width 1s ease-out; }
    .m-mastered { background: var(--success); }
    .m-progress { background: var(--primary); opacity: 0.6; }

    .m-legend { display: flex; gap: 16px; font-size: 0.75rem; font-weight: 600; color: var(--muted-text); }
    .dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 4px; }
    .d-mastered { background: var(--success); }
    .d-progress { background: var(--primary); }

    .cjmm-bars { display: flex; flex-direction: column; gap: 16px; }
    .cjmm-domain-row { display: flex; flex-direction: column; gap: 6px; }
    .d-label-row { display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 600; }
    .d-name { color: var(--text); }
    .d-val { color: var(--muted-text); }
    .d-bar-bg { height: 6px; background: var(--bg); border-radius: 3px; overflow: hidden; }
    .d-bar-fill { height: 100%; border-radius: 3px; transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1); }

    .growth-svg { width: 100%; height: 120px; overflow: visible; }
    .chart-labels { display: flex; justify-content: space-between; font-size: 0.7rem; color: var(--muted-text); margin-top: 8px; font-weight: 700; }

    .a-history-list { display: flex; flex-direction: column; gap: 12px; }
    .a-history-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px;
        background: var(--bg);
        border-radius: 12px;
        border: 1px solid var(--border);
    }
    .a-h-title { font-size: 0.85rem; font-weight: 700; }
    .a-h-date { font-size: 0.7rem; color: var(--muted-text); }
    .a-h-metrics { text-align: right; }
    .a-h-score { font-size: 0.9rem; font-weight: 800; color: var(--primary); }
    .a-h-time { font-size: 0.7rem; color: var(--muted-text); }

    .empty-state { text-align: center; padding: 100px 40px; color: var(--muted-text); }
    .empty-state h2 { font-size: 2rem; margin-bottom: 12px; color: var(--text); }

    @media (max-width: 1100px) {
        .analytics-grid { grid-template-columns: 1fr 1fr; }
    }
    @media (max-width: 768px) {
        .analytics-grid { grid-template-columns: 1fr; }
    }
`;
