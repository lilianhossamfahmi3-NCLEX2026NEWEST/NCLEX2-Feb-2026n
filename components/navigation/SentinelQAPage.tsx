/**
 * NCLEX-RN NGN Clinical Simulator — SentinelQA Dashboard
 * Premium Item Bank Quality Assurance Interface
 */

import { useState, useMemo, useEffect } from 'react';
import { MasterItem } from '../../types/master';
import { runBankQA, QABankReport, QAItemReport, QADimension, QASeverity } from '../../validation/itemBankQA';

interface SentinelQAPageProps {
    items: MasterItem[];
    onExit: () => void;
    theme: 'light' | 'dark';
    onSelectItem?: (id: string) => void;
}

const DIMENSION_LABELS: Record<QADimension, { label: string; icon: string; desc: string }> = {
    completeness: { label: 'Completeness', icon: '📋', desc: 'All required fields present' },
    typeStructure: { label: 'Type Structure', icon: '🧩', desc: 'Schema matches item type' },
    scoringAccuracy: { label: 'Scoring Accuracy', icon: '🎯', desc: 'Scoring rules & maxPoints consistent' },
    pedagogy: { label: 'Pedagogy', icon: '🎓', desc: 'Bloom, CJMM, NCLEX metadata valid' },
    rationaleQuality: { label: 'Rationale Quality', icon: '📝', desc: 'Explanations present & non-generic' },
    optionLogic: { label: 'Option Logic', icon: '🔗', desc: 'Options, IDs, blanks are coherent' },
    dataReferences: { label: 'Data References', icon: '🗂️', desc: 'Clinical data availability' },
    errorDetection: { label: 'Error Detection', icon: '🛡️', desc: 'No error patterns or artifacts' },
};

const SEVERITY_CONFIG: Record<QASeverity, { color: string; bg: string; label: string }> = {
    critical: { color: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)', label: 'CRITICAL' },
    warning: { color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)', label: 'WARNING' },
    info: { color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.1)', label: 'INFO' },
};

export default function SentinelQAPage({ items, onExit, theme: _theme, onSelectItem }: SentinelQAPageProps) {
    const [report, setReport] = useState<QABankReport | null>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [selectedItem, setSelectedItem] = useState<QAItemReport | null>(null);
    const [filterVerdict, setFilterVerdict] = useState<'all' | 'pass' | 'warn' | 'fail'>('all');
    const [filterType, setFilterType] = useState<string>('all');
    const [filterDimension, setFilterDimension] = useState<QADimension | 'all'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'score' | 'id' | 'type'>('score');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

    const runQA = () => {
        setIsRunning(true);
        setSelectedItem(null);
        // Run in microtask to avoid UI freeze
        setTimeout(() => {
            const result = runBankQA(items);
            setReport(result);
            setIsRunning(false);
        }, 100);
    };

    // Auto-run on mount if items are available
    useEffect(() => {
        if (items.length > 0 && !report) {
            runQA();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [items.length]);

    const filteredReports = useMemo(() => {
        if (!report) return [];
        return report.itemReports
            .filter(r => filterVerdict === 'all' || r.verdict === filterVerdict)
            .filter(r => filterType === 'all' || r.itemType === filterType)
            .filter(r => {
                if (filterDimension === 'all') return true;
                return r.dimensionScores[filterDimension] < 100;
            })
            .filter(r => {
                if (!searchQuery) return true;
                return r.itemId.toLowerCase().includes(searchQuery.toLowerCase());
            })
            .sort((a, b) => {
                let cmp = 0;
                if (sortBy === 'score') cmp = a.score - b.score;
                else if (sortBy === 'id') cmp = a.itemId.localeCompare(b.itemId);
                else if (sortBy === 'type') cmp = a.itemType.localeCompare(b.itemType);
                return sortDir === 'desc' ? -cmp : cmp;
            });
    }, [report, filterVerdict, filterType, filterDimension, searchQuery, sortBy, sortDir]);

    const scoreColor = (score: number) => {
        if (score >= 90) return '#10B981';
        if (score >= 70) return '#F59E0B';
        return '#EF4444';
    };

    const verdictBadge = (verdict: string) => {
        const config = verdict === 'pass'
            ? { bg: 'rgba(16, 185, 129, 0.12)', color: '#10B981', label: '✓ PASS' }
            : verdict === 'warn'
                ? { bg: 'rgba(245, 158, 11, 0.12)', color: '#F59E0B', label: '⚠ WARN' }
                : { bg: 'rgba(239, 68, 68, 0.12)', color: '#EF4444', label: '✕ FAIL' };
        return (
            <span style={{
                padding: '3px 10px',
                borderRadius: 6,
                fontSize: '0.7rem',
                fontWeight: 900,
                background: config.bg,
                color: config.color,
                letterSpacing: '0.05em',
            }}>{config.label}</span>
        );
    };

    return (
        <div className="sentinel-qa-page">
            {/* ═══ Header ═══ */}
            <header className="qa-header">
                <div className="qa-header-brand">
                    <div className="qa-logo">
                        <span className="qa-logo-icon">🛡️</span>
                        <div>
                            <h1>SentinelQA</h1>
                            <p>Item Bank Integrity Verification System</p>
                        </div>
                    </div>
                </div>
                <div className="qa-header-actions">
                    <button className="qa-btn-run" onClick={runQA} disabled={isRunning || items.length === 0}>
                        {isRunning ? '⏳ Scanning...' : '🔄 Re-Scan Bank'}
                    </button>
                    <button className="qa-btn-exit" onClick={onExit}>← Back</button>
                </div>
            </header>

            {/* ═══ Loading State ═══ */}
            {isRunning && (
                <div className="qa-loading">
                    <div className="qa-spinner" />
                    <h2>Scanning {items.length} items across 8 quality dimensions...</h2>
                    <p>Analyzing completeness, type structure, scoring accuracy, pedagogy, rationale quality, option logic, data references, and error patterns.</p>
                </div>
            )}

            {/* ═══ Report Dashboard ═══ */}
            {report && !isRunning && (
                <div className="qa-dashboard">
                    {/* ─── Global Score Ring ─── */}
                    <section className="qa-scorecard">
                        <div className="qa-ring-wrapper">
                            <svg viewBox="0 0 120 120" className="qa-ring-svg">
                                <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                                <circle
                                    cx="60" cy="60" r="52" fill="none"
                                    stroke={scoreColor(report.overallScore)}
                                    strokeWidth="8"
                                    strokeDasharray={`${report.overallScore * 3.27} 327`}
                                    strokeDashoffset="0"
                                    strokeLinecap="round"
                                    transform="rotate(-90 60 60)"
                                    style={{ transition: 'stroke-dasharray 1s ease' }}
                                />
                            </svg>
                            <div className="qa-ring-value" style={{ color: scoreColor(report.overallScore) }}>
                                {report.overallScore}
                            </div>
                            <div className="qa-ring-label">Overall QA Score</div>
                        </div>

                        <div className="qa-summary-stats">
                            <div className="qa-stat passed">
                                <div className="qa-stat-num">{report.passed}</div>
                                <div className="qa-stat-label">Passed</div>
                                <div className="qa-stat-bar" style={{ width: `${report.totalItems > 0 ? (report.passed / report.totalItems) * 100 : 0}%`, background: '#10B981' }} />
                            </div>
                            <div className="qa-stat warned">
                                <div className="qa-stat-num">{report.warned}</div>
                                <div className="qa-stat-label">Warnings</div>
                                <div className="qa-stat-bar" style={{ width: `${report.totalItems > 0 ? (report.warned / report.totalItems) * 100 : 0}%`, background: '#F59E0B' }} />
                            </div>
                            <div className="qa-stat failed">
                                <div className="qa-stat-num">{report.failed}</div>
                                <div className="qa-stat-label">Failed</div>
                                <div className="qa-stat-bar" style={{ width: `${report.totalItems > 0 ? (report.failed / report.totalItems) * 100 : 0}%`, background: '#EF4444' }} />
                            </div>
                            <div className="qa-stat total">
                                <div className="qa-stat-num">{report.totalItems}</div>
                                <div className="qa-stat-label">Total Items</div>
                            </div>
                        </div>
                    </section>

                    {/* ─── Dimension Matrix ─── */}
                    <section className="qa-dimensions-grid">
                        <h2>Quality Dimensions</h2>
                        <div className="qa-dim-cards">
                            {(Object.keys(DIMENSION_LABELS) as QADimension[]).map(dim => {
                                const info = DIMENSION_LABELS[dim];
                                const summary = report.dimensionSummary[dim];
                                const pct = report.totalItems > 0 ? Math.round((summary.passed / report.totalItems) * 100) : 0;
                                const isActive = filterDimension === dim;
                                return (
                                    <div
                                        key={dim}
                                        className={`qa-dim-card ${isActive ? 'active' : ''}`}
                                        onClick={() => setFilterDimension(isActive ? 'all' : dim)}
                                    >
                                        <div className="qa-dim-icon">{info.icon}</div>
                                        <div className="qa-dim-info">
                                            <div className="qa-dim-name">{info.label}</div>
                                            <div className="qa-dim-desc">{info.desc}</div>
                                        </div>
                                        <div className="qa-dim-score" style={{ color: scoreColor(pct) }}>{pct}%</div>
                                        <div className="qa-dim-bar-bg">
                                            <div className="qa-dim-bar" style={{ width: `${pct}%`, background: scoreColor(pct) }} />
                                        </div>
                                        <div className="qa-dim-counts">
                                            <span style={{ color: '#10B981' }}>✓{summary.passed}</span>
                                            <span style={{ color: '#F59E0B' }}>⚠{summary.warned}</span>
                                            <span style={{ color: '#EF4444' }}>✕{summary.failed}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* ─── Type Distribution ─── */}
                    <section className="qa-type-dist">
                        <h2>Item Type Distribution</h2>
                        <div className="qa-type-pills">
                            <button
                                className={`qa-pill ${filterType === 'all' ? 'active' : ''}`}
                                onClick={() => setFilterType('all')}
                            >All ({report.totalItems})</button>
                            {Object.entries(report.typeDistribution)
                                .sort((a, b) => b[1] - a[1])
                                .map(([type, count]) => (
                                    <button
                                        key={type}
                                        className={`qa-pill ${filterType === type ? 'active' : ''}`}
                                        onClick={() => setFilterType(filterType === type ? 'all' : type)}
                                    >{type} ({count})</button>
                                ))}
                        </div>
                    </section>

                    {/* ─── Filters & Table ─── */}
                    <section className="qa-items-section">
                        <div className="qa-items-controls">
                            <div className="qa-search-bar">
                                <span className="qa-search-icon">🔍</span>
                                <input
                                    type="text"
                                    placeholder="Search item IDs..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="qa-verdict-pills">
                                {(['all', 'pass', 'warn', 'fail'] as const).map(v => (
                                    <button
                                        key={v}
                                        className={`qa-vpill ${filterVerdict === v ? 'active' : ''} ${v}`}
                                        onClick={() => setFilterVerdict(v)}
                                    >{v === 'all' ? `All (${report.totalItems})` : v === 'pass' ? `✓ Pass (${report.passed})` : v === 'warn' ? `⚠ Warn (${report.warned})` : `✕ Fail (${report.failed})`}</button>
                                ))}
                            </div>
                        </div>

                        <div className="qa-items-table">
                            <div className="qa-table-header">
                                <div className="qa-th qa-th-status">Status</div>
                                <div className="qa-th qa-th-id" onClick={() => { setSortBy('id'); setSortDir(d => d === 'asc' ? 'desc' : 'asc'); }}>
                                    Item ID {sortBy === 'id' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                                </div>
                                <div className="qa-th qa-th-type" onClick={() => { setSortBy('type'); setSortDir(d => d === 'asc' ? 'desc' : 'asc'); }}>
                                    Type {sortBy === 'type' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                                </div>
                                <div className="qa-th qa-th-score" onClick={() => { setSortBy('score'); setSortDir(d => d === 'asc' ? 'desc' : 'asc'); }}>
                                    Score {sortBy === 'score' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                                </div>
                                <div className="qa-th qa-th-issues">Issues</div>
                                <div className="qa-th qa-th-action">Details</div>
                            </div>

                            <div className="qa-table-body">
                                {filteredReports.length === 0 && (
                                    <div className="qa-empty-row">No items match the current filters.</div>
                                )}
                                {filteredReports.slice(0, 200).map(r => (
                                    <div
                                        key={r.itemId}
                                        className={`qa-table-row ${selectedItem?.itemId === r.itemId ? 'selected' : ''}`}
                                        onClick={() => setSelectedItem(r)}
                                    >
                                        <div className="qa-td qa-td-status">{verdictBadge(r.verdict)}</div>
                                        <div className="qa-td qa-td-id">
                                            <span className="qa-item-id">{r.itemId}</span>
                                        </div>
                                        <div className="qa-td qa-td-type">
                                            <span className="qa-type-badge">{r.itemType}</span>
                                        </div>
                                        <div className="qa-td qa-td-score">
                                            <span style={{ color: scoreColor(r.score), fontWeight: 900 }}>{r.score}</span>
                                        </div>
                                        <div className="qa-td qa-td-issues">
                                            <span className="qa-issues-count">
                                                {r.diagnostics.filter(d => d.severity === 'critical').length > 0 && (
                                                    <span style={{ color: '#EF4444' }}>●{r.diagnostics.filter(d => d.severity === 'critical').length}</span>
                                                )}
                                                {r.diagnostics.filter(d => d.severity === 'warning').length > 0 && (
                                                    <span style={{ color: '#F59E0B' }}>●{r.diagnostics.filter(d => d.severity === 'warning').length}</span>
                                                )}
                                                {r.diagnostics.filter(d => d.severity === 'info').length > 0 && (
                                                    <span style={{ color: '#3B82F6' }}>●{r.diagnostics.filter(d => d.severity === 'info').length}</span>
                                                )}
                                            </span>
                                        </div>
                                        <div className="qa-td qa-td-action">
                                            <button className="qa-detail-btn" onClick={(e) => { e.stopPropagation(); setSelectedItem(r); }}>→</button>
                                        </div>
                                    </div>
                                ))}
                                {filteredReports.length > 200 && (
                                    <div className="qa-more-row">Showing 200 of {filteredReports.length} items. Refine filters to see more.</div>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* ─── Detail Panel ─── */}
                    {selectedItem && (
                        <div className="qa-detail-overlay" onClick={() => setSelectedItem(null)}>
                            <div className="qa-detail-panel" onClick={e => e.stopPropagation()}>
                                <div className="qa-detail-header">
                                    <div>
                                        <h2>{selectedItem.itemId}</h2>
                                        <div className="qa-detail-meta">
                                            <span className="qa-type-badge">{selectedItem.itemType}</span>
                                            {verdictBadge(selectedItem.verdict)}
                                            <span className="qa-detail-score" style={{ color: scoreColor(selectedItem.score) }}>
                                                Score: {selectedItem.score}/100
                                            </span>
                                        </div>
                                    </div>
                                    <div className="qa-detail-actions">
                                        {onSelectItem && (
                                            <button className="qa-btn-preview" onClick={() => onSelectItem(selectedItem.itemId)}>
                                                ▶ Preview Item
                                            </button>
                                        )}
                                        <button className="qa-btn-close" onClick={() => setSelectedItem(null)}>✕</button>
                                    </div>
                                </div>

                                {/* Dimension Heatmap */}
                                <div className="qa-detail-dims">
                                    {(Object.keys(DIMENSION_LABELS) as QADimension[]).map(dim => {
                                        const score = selectedItem.dimensionScores[dim];
                                        const dimDiags = selectedItem.diagnostics.filter(d => d.dimension === dim);
                                        return (
                                            <div key={dim} className="qa-detail-dim">
                                                <div className="qa-dd-header">
                                                    <span>{DIMENSION_LABELS[dim].icon} {DIMENSION_LABELS[dim].label}</span>
                                                    <span style={{ color: scoreColor(score), fontWeight: 900 }}>{score}%</span>
                                                </div>
                                                <div className="qa-dd-bar-bg">
                                                    <div className="qa-dd-bar" style={{ width: `${score}%`, background: scoreColor(score) }} />
                                                </div>
                                                {dimDiags.length > 0 && (
                                                    <div className="qa-dd-diags">
                                                        {dimDiags.map((diag, i) => (
                                                            <div key={i} className="qa-diag-row" style={{ borderLeftColor: SEVERITY_CONFIG[diag.severity].color }}>
                                                                <span className="qa-diag-badge" style={{
                                                                    background: SEVERITY_CONFIG[diag.severity].bg,
                                                                    color: SEVERITY_CONFIG[diag.severity].color,
                                                                }}>{SEVERITY_CONFIG[diag.severity].label}</span>
                                                                <span className="qa-diag-code">{diag.code}</span>
                                                                <span className="qa-diag-msg">{diag.message}</span>
                                                                {diag.field && <span className="qa-diag-field">{diag.field}</span>}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                {dimDiags.length === 0 && (
                                                    <div className="qa-dd-ok">✓ All checks passed</div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ═══ Empty State ═══ */}
            {!report && !isRunning && items.length === 0 && (
                <div className="qa-empty-state">
                    <div className="qa-empty-icon">🔍</div>
                    <h2>No items in the vault</h2>
                    <p>Load items from the AI Bank or Supabase to begin quality assurance scanning.</p>
                </div>
            )}

            <style>{sentinelStyles}</style>
        </div>
    );
}

const sentinelStyles = `
    .sentinel-qa-page {
        min-height: 100vh;
        background: var(--bg);
        color: var(--text);
        font-family: 'Inter', system-ui, sans-serif;
        padding-bottom: 80px;
    }

    /* ═══ Header ═══ */
    .qa-header {
        padding: 24px 48px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid var(--border);
        background: var(--bg-card);
        backdrop-filter: blur(20px);
        position: sticky;
        top: 48px;
        z-index: 90;
    }
    .qa-logo {
        display: flex;
        align-items: center;
        gap: 16px;
    }
    .qa-logo-icon {
        font-size: 2rem;
        width: 56px;
        height: 56px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #2563EB, #8B5CF6);
        border-radius: 16px;
        box-shadow: 0 8px 24px rgba(37, 99, 235, 0.3);
    }
    .qa-logo h1 {
        font-size: 1.4rem;
        font-weight: 900;
        margin: 0;
        background: linear-gradient(135deg, #2563EB, #8B5CF6);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }
    .qa-logo p {
        font-size: 0.75rem;
        color: var(--muted-text);
        font-weight: 600;
        margin: 2px 0 0 0;
    }
    .qa-header-actions {
        display: flex;
        gap: 12px;
    }
    .qa-btn-run {
        padding: 10px 20px;
        background: linear-gradient(135deg, #2563EB, #8B5CF6);
        color: white;
        border: none;
        border-radius: 12px;
        font-weight: 800;
        font-size: 0.8rem;
        cursor: pointer;
        transition: all 0.2s;
    }
    .qa-btn-run:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(37,99,235,0.3); }
    .qa-btn-run:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
    .qa-btn-exit {
        padding: 10px 20px;
        background: var(--bg);
        color: var(--text);
        border: 1px solid var(--border);
        border-radius: 12px;
        font-weight: 700;
        font-size: 0.8rem;
        cursor: pointer;
    }

    /* ═══ Loading ═══ */
    .qa-loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 120px 40px;
        text-align: center;
    }
    .qa-loading h2 { font-size: 1.3rem; font-weight: 800; margin: 24px 0 8px; }
    .qa-loading p { color: var(--muted-text); font-size: 0.85rem; max-width: 500px; }
    .qa-spinner {
        width: 48px; height: 48px;
        border: 4px solid var(--border);
        border-top-color: #2563EB;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* ═══ Dashboard ═══ */
    .qa-dashboard {
        max-width: 1400px;
        margin: 0 auto;
        padding: 32px 48px;
    }

    /* ─── Score Card ─── */
    .qa-scorecard {
        display: flex;
        gap: 48px;
        align-items: center;
        background: var(--bg-card);
        border: 1px solid var(--border);
        border-radius: 24px;
        padding: 40px;
        margin-bottom: 32px;
    }
    .qa-ring-wrapper {
        position: relative;
        width: 160px;
        height: 160px;
        flex-shrink: 0;
    }
    .qa-ring-svg {
        width: 100%;
        height: 100%;
    }
    .qa-ring-value {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -60%);
        font-size: 2.8rem;
        font-weight: 900;
    }
    .qa-ring-label {
        position: absolute;
        bottom: 18px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 0.65rem;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--muted-text);
        font-weight: 800;
        white-space: nowrap;
    }
    .qa-summary-stats {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 20px;
        flex: 1;
    }
    .qa-stat {
        text-align: center;
        padding: 20px;
        background: var(--bg);
        border-radius: 16px;
        border: 1px solid var(--border);
        position: relative;
        overflow: hidden;
    }
    .qa-stat-num { font-size: 2rem; font-weight: 900; }
    .qa-stat.passed .qa-stat-num { color: #10B981; }
    .qa-stat.warned .qa-stat-num { color: #F59E0B; }
    .qa-stat.failed .qa-stat-num { color: #EF4444; }
    .qa-stat.total .qa-stat-num { color: var(--primary); }
    .qa-stat-label {
        font-size: 0.7rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--muted-text);
        font-weight: 800;
        margin-top: 4px;
    }
    .qa-stat-bar {
        position: absolute;
        bottom: 0;
        left: 0;
        height: 3px;
        border-radius: 3px;
        transition: width 0.8s ease;
    }

    /* ─── Dimensions Grid ─── */
    .qa-dimensions-grid {
        margin-bottom: 32px;
    }
    .qa-dimensions-grid h2 {
        font-size: 1.2rem;
        font-weight: 800;
        margin-bottom: 16px;
    }
    .qa-dim-cards {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 16px;
    }
    .qa-dim-card {
        background: var(--bg-card);
        border: 1px solid var(--border);
        border-radius: 16px;
        padding: 20px;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        align-items: center;
    }
    .qa-dim-card:hover { border-color: var(--primary); transform: translateY(-2px); }
    .qa-dim-card.active { border-color: var(--primary); background: rgba(37,99,235,0.04); box-shadow: 0 4px 12px rgba(37,99,235,0.15); }
    .qa-dim-icon { font-size: 1.5rem; }
    .qa-dim-info { flex: 1; min-width: 140px; }
    .qa-dim-name { font-weight: 800; font-size: 0.85rem; }
    .qa-dim-desc { font-size: 0.7rem; color: var(--muted-text); margin-top: 2px; }
    .qa-dim-score { font-size: 1.2rem; font-weight: 900; }
    .qa-dim-bar-bg {
        width: 100%;
        height: 4px;
        background: var(--border);
        border-radius: 4px;
        overflow: hidden;
    }
    .qa-dim-bar {
        height: 100%;
        border-radius: 4px;
        transition: width 0.8s ease;
    }
    .qa-dim-counts {
        display: flex;
        gap: 12px;
        font-size: 0.7rem;
        font-weight: 800;
        width: 100%;
    }

    /* ─── Type Distribution ─── */
    .qa-type-dist { margin-bottom: 32px; }
    .qa-type-dist h2 { font-size: 1.2rem; font-weight: 800; margin-bottom: 12px; }
    .qa-type-pills { display: flex; gap: 8px; flex-wrap: wrap; }
    .qa-pill {
        padding: 6px 14px;
        border-radius: 100px;
        border: 1px solid var(--border);
        background: var(--bg-card);
        font-size: 0.72rem;
        font-weight: 700;
        cursor: pointer;
        color: var(--text);
        transition: all 0.2s;
    }
    .qa-pill.active { background: var(--primary); color: white; border-color: var(--primary); }
    .qa-pill:hover:not(.active) { border-color: var(--primary); }

    /* ─── Items Section ─── */
    .qa-items-section { margin-bottom: 60px; }
    .qa-items-controls {
        display: flex;
        gap: 16px;
        margin-bottom: 16px;
        flex-wrap: wrap;
        align-items: center;
    }
    .qa-search-bar {
        display: flex;
        align-items: center;
        gap: 8px;
        background: var(--bg-card);
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 8px 16px;
        flex: 1;
        min-width: 220px;
    }
    .qa-search-icon { font-size: 0.9rem; }
    .qa-search-bar input {
        border: none;
        background: transparent;
        outline: none;
        font-size: 0.8rem;
        font-weight: 600;
        color: var(--text);
        width: 100%;
    }
    .qa-verdict-pills { display: flex; gap: 8px; }
    .qa-vpill {
        padding: 6px 14px;
        border-radius: 100px;
        border: 1px solid var(--border);
        background: var(--bg-card);
        font-size: 0.7rem;
        font-weight: 700;
        cursor: pointer;
        color: var(--text);
        transition: all 0.2s;
    }
    .qa-vpill.active { border-color: var(--primary); background: rgba(37,99,235,0.08); }
    .qa-vpill.active.pass { border-color: #10B981; background: rgba(16,185,129,0.08); color: #10B981; }
    .qa-vpill.active.warn { border-color: #F59E0B; background: rgba(245,158,11,0.08); color: #F59E0B; }
    .qa-vpill.active.fail { border-color: #EF4444; background: rgba(239,68,68,0.08); color: #EF4444; }

    /* ─── Table ─── */
    .qa-items-table {
        background: var(--bg-card);
        border: 1px solid var(--border);
        border-radius: 16px;
        overflow: hidden;
    }
    .qa-table-header {
        display: grid;
        grid-template-columns: 90px 1fr 140px 80px 120px 60px;
        padding: 14px 20px;
        background: var(--bg);
        border-bottom: 1px solid var(--border);
        font-size: 0.68rem;
        font-weight: 900;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--muted-text);
    }
    .qa-th { cursor: pointer; user-select: none; }
    .qa-table-body { max-height: 500px; overflow-y: auto; }
    .qa-table-row {
        display: grid;
        grid-template-columns: 90px 1fr 140px 80px 120px 60px;
        padding: 12px 20px;
        border-bottom: 1px solid var(--border);
        cursor: pointer;
        transition: background 0.15s;
        align-items: center;
    }
    .qa-table-row:hover { background: rgba(37,99,235,0.03); }
    .qa-table-row.selected { background: rgba(37,99,235,0.06); border-left: 3px solid var(--primary); }
    .qa-item-id { font-weight: 700; font-size: 0.78rem; word-break: break-all; }
    .qa-type-badge {
        padding: 3px 10px;
        border-radius: 6px;
        font-size: 0.68rem;
        font-weight: 700;
        background: var(--bg);
        border: 1px solid var(--border);
    }
    .qa-issues-count { display: flex; gap: 8px; font-weight: 800; font-size: 0.75rem; }
    .qa-detail-btn {
        width: 32px; height: 32px;
        border-radius: 8px;
        border: 1px solid var(--border);
        background: var(--bg);
        cursor: pointer;
        font-weight: 900;
        font-size: 0.8rem;
        color: var(--text);
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .qa-detail-btn:hover { background: var(--primary); color: white; }
    .qa-empty-row, .qa-more-row {
        padding: 40px;
        text-align: center;
        color: var(--muted-text);
        font-weight: 600;
        font-size: 0.85rem;
    }

    /* ─── Detail Panel ─── */
    .qa-detail-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.5);
        backdrop-filter: blur(8px);
        z-index: 200;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 40px;
    }
    .qa-detail-panel {
        background: var(--bg-card);
        border-radius: 24px;
        border: 1px solid var(--border);
        width: 100%;
        max-width: 800px;
        max-height: 85vh;
        overflow-y: auto;
        padding: 32px;
        box-shadow: 0 40px 80px rgba(0,0,0,0.2);
    }
    .qa-detail-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 24px;
    }
    .qa-detail-header h2 {
        font-size: 1.1rem;
        font-weight: 900;
        margin: 0 0 8px;
        word-break: break-all;
    }
    .qa-detail-meta { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
    .qa-detail-score { font-size: 0.85rem; font-weight: 900; }
    .qa-detail-actions { display: flex; gap: 8px; }
    .qa-btn-preview {
        padding: 8px 16px;
        background: linear-gradient(135deg, #2563EB, #8B5CF6);
        color: white;
        border: none;
        border-radius: 10px;
        font-weight: 700;
        font-size: 0.75rem;
        cursor: pointer;
    }
    .qa-btn-close {
        width: 36px;
        height: 36px;
        border-radius: 10px;
        border: 1px solid var(--border);
        background: var(--bg);
        cursor: pointer;
        font-size: 1rem;
        color: var(--text);
    }

    /* Dimension Details */
    .qa-detail-dims { display: flex; flex-direction: column; gap: 16px; }
    .qa-detail-dim {
        background: var(--bg);
        border: 1px solid var(--border);
        border-radius: 14px;
        padding: 16px;
    }
    .qa-dd-header {
        display: flex;
        justify-content: space-between;
        font-size: 0.85rem;
        font-weight: 700;
        margin-bottom: 8px;
    }
    .qa-dd-bar-bg {
        width: 100%;
        height: 4px;
        background: var(--border);
        border-radius: 4px;
        overflow: hidden;
        margin-bottom: 8px;
    }
    .qa-dd-bar { height: 100%; border-radius: 4px; transition: width 0.5s ease; }
    .qa-dd-ok { font-size: 0.75rem; color: #10B981; font-weight: 700; }
    .qa-dd-diags { display: flex; flex-direction: column; gap: 6px; }
    .qa-diag-row {
        display: flex;
        gap: 8px;
        align-items: center;
        padding: 6px 10px;
        border-left: 3px solid;
        border-radius: 6px;
        background: var(--bg-card);
        flex-wrap: wrap;
    }
    .qa-diag-badge {
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 0.6rem;
        font-weight: 900;
        letter-spacing: 0.04em;
        flex-shrink: 0;
    }
    .qa-diag-code {
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.68rem;
        font-weight: 700;
        color: var(--muted-text);
        flex-shrink: 0;
    }
    .qa-diag-msg {
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--text);
        flex: 1;
        min-width: 200px;
    }
    .qa-diag-field {
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.62rem;
        color: var(--muted-text);
        background: var(--bg);
        padding: 2px 6px;
        border-radius: 4px;
    }

    /* ═══ Empty State ═══ */
    .qa-empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 160px 40px;
        text-align: center;
    }
    .qa-empty-icon { font-size: 4rem; margin-bottom: 24px; }
    .qa-empty-state h2 { font-weight: 800; margin-bottom: 8px; }
    .qa-empty-state p { color: var(--muted-text); }

    @media (max-width: 900px) {
        .qa-header { padding: 16px 24px; flex-direction: column; gap: 12px; }
        .qa-dashboard { padding: 24px 16px; }
        .qa-scorecard { flex-direction: column; padding: 24px; }
        .qa-summary-stats { grid-template-columns: repeat(2, 1fr); }
        .qa-table-header, .qa-table-row { grid-template-columns: 70px 1fr 100px 60px; }
        .qa-th-issues, .qa-td-issues, .qa-th-action, .qa-td-action { display: none; }
        .qa-dim-cards { grid-template-columns: 1fr; }
    }
`;
