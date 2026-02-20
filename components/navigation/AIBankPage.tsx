import { useState, useMemo, useEffect, useCallback } from 'react';
import { MasterItem } from '../../types/master';
import { getStandaloneNGNItemsAsync } from '../../services/caseStudyLibrary';
import { runBankQA, runItemQA, repairBank, QABankReport, QAItemReport, QADimension, QASeverity } from '../../validation/itemBankQA';

interface AIBankPageProps {
    onSelectItem: (itemId: string) => void;
    onExit: () => void;
    theme: 'light' | 'dark';
    onToggleTheme: () => void;
}

const DIMENSION_LABELS: Record<QADimension, { label: string; icon: string }> = {
    completeness: { label: 'Completeness', icon: '📋' },
    typeStructure: { label: 'Type Structure', icon: '🧩' },
    scoringAccuracy: { label: 'Scoring Accuracy', icon: '🎯' },
    pedagogy: { label: 'Pedagogy', icon: '🎓' },
    rationaleQuality: { label: 'Rationale Quality', icon: '📝' },
    optionLogic: { label: 'Option Logic', icon: '🔗' },
    dataReferences: { label: 'Data References', icon: '🗂️' },
    errorDetection: { label: 'Error Detection', icon: '🛡️' },
};

const SEVERITY_CONFIG: Record<QASeverity, { color: string; bg: string; label: string }> = {
    critical: { color: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)', label: 'CRITICAL' },
    warning: { color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)', label: 'WARNING' },
    info: { color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.1)', label: 'INFO' },
};

function scoreColor(score: number) {
    if (score >= 90) return '#10B981';
    if (score >= 70) return '#F59E0B';
    return '#EF4444';
}

export default function AIBankPage({ onSelectItem, onExit, theme, onToggleTheme }: AIBankPageProps) {
    const [items, setItems] = useState<MasterItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // ─── QA State ───
    const [bankReport, setBankReport] = useState<QABankReport | null>(null);
    const [qaScoreMap, setQaScoreMap] = useState<Map<string, QAItemReport>>(new Map());
    const [isScanning, setIsScanning] = useState(false);
    const [qaDetailItem, setQaDetailItem] = useState<QAItemReport | null>(null);

    useEffect(() => {
        async function load() {
            try {
                const raw = await getStandaloneNGNItemsAsync();
                const unique = new Map();
                raw.forEach(item => unique.set(item.id, item));
                setItems(Array.from(unique.values()));
            } catch (err) {
                console.error("Failed to load bank:", err);
            } finally {
                setIsLoading(false);
            }
        }
        load();
    }, []);

    // ─── QA Scan ───
    const runFullScan = useCallback(() => {
        if (items.length === 0) return;
        setIsScanning(true);
        setTimeout(() => {
            const report = runBankQA(items);
            setBankReport(report);
            const map = new Map<string, QAItemReport>();
            report.itemReports.forEach(r => map.set(r.itemId, r));
            setQaScoreMap(map);
            setIsScanning(false);
        }, 50);
    }, [items]);

    // Auto-scan when items load
    useEffect(() => {
        if (items.length > 0 && !bankReport) {
            runFullScan();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [items.length]);

    const runSingleItemQA = useCallback((item: MasterItem) => {
        const report = runItemQA(item);
        setQaDetailItem(report);
    }, []);

    const [search, setSearch] = useState('');
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>({ key: 'id', direction: 'asc' });

    // Filters
    const [filterType, setFilterType] = useState('All');
    const [filterDifficulty, setFilterDifficulty] = useState('All');
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterBloom, setFilterBloom] = useState('All');
    const [filterCJMM, setFilterCJMM] = useState('All');
    const [filterCategory, setFilterCategory] = useState('All');

    // Debug active filters
    console.log('Active Filter Type:', filterType);

    // Simplified Filters - Strict Equality to prevent casing mismatches
    const itemTypes = useMemo(() => ['All', ...Array.from(new Set(items.map(i => i?.type).filter(Boolean))) as string[]].sort(), [items]);
    const difficulties = useMemo(() => ['All', ...Array.from(new Set(items.map(i => i?.pedagogy?.difficulty?.toString()).filter(Boolean))) as string[]].sort(), [items]);
    const bloomLevels = useMemo(() => ['All', ...Array.from(new Set(items.map(i => i?.pedagogy?.bloomLevel).filter(Boolean))) as string[]].sort(), [items]);
    const cjmmSteps = useMemo(() => ['All', ...Array.from(new Set(items.map(i => i?.pedagogy?.cjmmStep).filter(Boolean))) as string[]].sort(), [items]);
    const categories = useMemo(() => ['All', ...Array.from(new Set(items.map(i => i?.pedagogy?.nclexCategory).filter(Boolean))) as string[]].sort(), [items]);

    const sortedItems = useMemo(() => {
        const filtered = items.filter(item => {
            if (!item) return false;

            const safeId = item.id || '';
            const searchLower = (search || '').toLowerCase();

            // Search Logic
            const matchesSearch = safeId.toLowerCase().includes(searchLower) ||
                (item.pedagogy?.topicTags || []).some(t => (t || '').toLowerCase().includes(searchLower));

            // Strict Filter Logic
            const itemType = item.type || '';
            let matchesType = filterType === 'All' || itemType === filterType;

            // Hotfix: Check for potential casing issues if strict match fails but looks similar
            if (!matchesType && filterType !== 'All' && itemType.toLowerCase() === filterType.toLowerCase()) {
                matchesType = true;
            }

            // DEBUG: Force re-verify match
            if (filterType !== 'All' && matchesType) {
                const strictMatch = itemType === filterType;
                const looseMatch = itemType.toLowerCase() === filterType.toLowerCase();

                if (!strictMatch && !looseMatch) {
                    console.error(`CRITICAL FILTER BUG: Item ${safeId} (Type: '${itemType}') passed filter '${filterType}' but SHOULD NOT HAVE.`);
                    matchesType = false;
                }
            }

            const matchesDifficulty = filterDifficulty === 'All' || item.pedagogy?.difficulty?.toString() === filterDifficulty;

            const itemStatus = items.indexOf(item) % 3 === 0 ? 'draft' : 'live';
            const matchesStatus = filterStatus === 'All' || itemStatus === filterStatus;

            const matchesBloom = filterBloom === 'All' || item.pedagogy?.bloomLevel === filterBloom;
            const matchesCJMM = filterCJMM === 'All' || item.pedagogy?.cjmmStep === filterCJMM;
            const matchesCategory = filterCategory === 'All' || item.pedagogy?.nclexCategory === filterCategory;

            return matchesSearch && matchesType && matchesDifficulty && matchesStatus && matchesBloom && matchesCJMM && matchesCategory;
        });

        if (!sortConfig) return filtered;

        return [...filtered].sort((a, b) => {
            let valA: any;
            let valB: any;

            switch (sortConfig.key) {
                case 'id': valA = a.id; valB = b.id; break;
                case 'type': valA = a.type; valB = b.type; break;
                case 'topic': valA = a.pedagogy?.topicTags?.[0] || ''; valB = b.pedagogy?.topicTags?.[0] || ''; break;
                case 'lvl': valA = a.pedagogy?.difficulty || 0; valB = b.pedagogy?.difficulty || 0; break;
                case 'cog': valA = a.pedagogy?.bloomLevel || ''; valB = b.pedagogy?.bloomLevel || ''; break;
                case 'proc': valA = a.pedagogy?.cjmmStep || ''; valB = b.pedagogy?.cjmmStep || ''; break;
                case 'comp': valA = a.pedagogy?.nclexCategory || ''; valB = b.pedagogy?.nclexCategory || ''; break;
                case 'status':
                    valA = items.indexOf(a) % 3 === 0 ? 'draft' : 'live';
                    valB = items.indexOf(b) % 3 === 0 ? 'draft' : 'live';
                    break;
                case 'date': valA = a.createdAt || ''; valB = b.createdAt || ''; break;
                default: valA = ''; valB = '';
            }

            if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
            if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [items, search, filterType, filterDifficulty, filterStatus, filterBloom, filterCJMM, filterCategory, sortConfig]);

    const handleSort = (key: string) => {
        setSortConfig(prev => {
            if (prev?.key === key) {
                return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
            }
            return { key, direction: 'asc' };
        });
    };

    const toggleSelect = (id: string) => {
        setSelectedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const toggleSelectAll = () => {
        if (selectedItems.length === sortedItems.length && sortedItems.length > 0) setSelectedItems([]);
        else setSelectedItems(sortedItems.map(i => i.id));
    };

    const handleDeleteSelected = () => {
        if (!window.confirm(`Are you sure you want to delete ${selectedItems.length} items?`)) return;
        setItems(prev => prev.filter(item => !selectedItems.includes(item.id)));
        setSelectedItems([]);
    };

    const handleAIChatFix = () => {
        alert(`AI Chat Fix initiated for ${selectedItems.length} items. Analyzing clinical logic...`);
    };

    const handleBulkQA = () => {
        const selectedCount = selectedItems.length;
        const subset = items.filter(i => selectedItems.includes(i.id));
        const report = runBankQA(subset);
        alert(`Bulk QA for ${selectedCount} items:
Score: ${report.overallScore}%
Passed: ${report.passed}
Warned: ${report.warned}
Failed: ${report.failed}`);
    };

    const handleBulkRepair = () => {
        const subset = items.filter(i => selectedItems.includes(i.id));
        if (!window.confirm(`Attempt Auto-Repair for ${subset.length} items?`)) return;

        const { repairedItems, totalChanges } = repairBank(subset);

        // Update local state
        const updatedItems = items.map(orig => {
            const found = repairedItems.find(r => r.id === orig.id);
            return found || orig;
        });

        setItems(updatedItems);
        alert(`Auto-Repair complete! ${totalChanges} structural issues healed.`);
        runFullScan(); // Re-scan to update scores
    };

    const handleRepairAll = () => {
        if (!window.confirm(`Initiate Global Bank Repair for all ${items.length} items? This will fix deterministic structural errors.`)) return;

        const { repairedItems, totalChanges } = repairBank(items);
        setItems(repairedItems);
        alert(`Global Repair Finished! Total ${totalChanges} issues corrected across the entire bank.`);
        runFullScan();
    };

    const refreshData = async () => {
        setIsLoading(true);
        const raw = await getStandaloneNGNItemsAsync();
        const unique = new Map();
        raw.forEach(item => unique.set(item.id, item));
        setItems(Array.from(unique.values()));
        setIsLoading(false);
    };

    return (
        <div className="bank-container">
            <div className="dashboard-summary">
                <div className="summary-card">
                    <div className="card-lbl">Total Items <span className="icon">📂</span></div>
                    <div className="card-val">{isLoading ? '...' : items.length.toLocaleString()}</div>
                    <div className="card-sub">{isLoading ? 'Loading clinical vault...' : '+8 from last week'}</div>
                </div>
                <div className="summary-card">
                    <div className="card-lbl">Library Status <span className="icon">📝</span></div>
                    <div className="card-val">{isLoading ? 'SYNCING' : 'READY'}</div>
                    <div className="card-sub">{isLoading ? 'Awaiting data stream...' : 'Optimized & Segmented'}</div>
                </div>
                <div className="summary-card qa-integrity-card">
                    <div className="card-lbl">SentinelQA Score <span className="icon">🛡️</span></div>
                    <div className="card-val" style={{ color: bankReport ? scoreColor(bankReport.overallScore) : undefined }}>
                        {isScanning ? '...' : bankReport ? `${bankReport.overallScore}%` : '—'}
                    </div>
                    <div className="card-sub">
                        {isScanning ? 'Scanning...' : bankReport
                            ? `✓${bankReport.passed}  ⚠${bankReport.warned}  ✕${bankReport.failed}`
                            : 'Click Scan QA to analyze'}
                    </div>
                    {bankReport && (
                        <div className="qa-mini-bar">
                            <div className="qa-mini-pass" style={{ width: `${(bankReport.passed / bankReport.totalItems) * 100}%` }} />
                            <div className="qa-mini-warn" style={{ width: `${(bankReport.warned / bankReport.totalItems) * 100}%` }} />
                            <div className="qa-mini-fail" style={{ width: `${(bankReport.failed / bankReport.totalItems) * 100}%` }} />
                        </div>
                    )}
                </div>
                <div className="summary-card">
                    <div className="card-lbl">Load Strategy <span className="icon">⚡</span></div>
                    <div className="card-val">LAZY</div>
                    <div className="card-sub">Segmented Bundle</div>
                </div>
            </div>

            <div className="bank-content-card">
                <header className="bank-header">
                    <div className="bank-title">
                        <button className="back-btn" onClick={onExit}>←</button>
                        <h1>Item Bank <span style={{ fontSize: '0.8rem', opacity: 0.5, marginLeft: '10px', fontWeight: 'normal' }}>Filter: {filterType}</span></h1>
                    </div>
                    <div className="bank-controls">
                        <div className="search-box">
                            <span className="search-icon">🔍</span>
                            <input
                                type="text"
                                placeholder="Search items..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            {search && <button className="clear-search" onClick={() => setSearch('')}>✕</button>}
                        </div>

                        <div className="header-actions">
                            <button className="action-btn theme-toggle-btn" onClick={onToggleTheme} title="Toggle Day/Night Mode">
                                {theme === 'dark' ? '☀️ Day Mode' : '🌙 Night Mode'}
                            </button>
                            <button className="action-btn refresh" onClick={refreshData} title="Refresh Data">🔄</button>
                            <button
                                className="qa-scan-btn"
                                onClick={runFullScan}
                                disabled={isScanning || items.length === 0}
                                title="Run SentinelQA Scan"
                            >
                                {isScanning ? '⏳ Scanning...' : '🛡️ Scan QA'}
                            </button>
                            <button className="repair-btn" onClick={handleRepairAll}>🪄 Repair All</button>
                            <button className="action-btn primary">+ New Item</button>
                        </div>

                        <div className="filter-group">
                            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="bank-filter">
                                <option value="All">All Types</option>
                                {itemTypes.filter(t => t !== 'All').map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                            <select value={filterDifficulty} onChange={(e) => setFilterDifficulty(e.target.value)} className="bank-filter">
                                <option value="All">All Levels</option>
                                {difficulties.filter(d => d !== 'All').map(d => <option key={d} value={d}>Level {d}</option>)}
                            </select>
                            <select value={filterBloom} onChange={(e) => setFilterBloom(e.target.value)} className="bank-filter">
                                <option value="All">All Cognitive Depths</option>
                                {bloomLevels.filter(b => b !== 'All').map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                            <select value={filterCJMM} onChange={(e) => setFilterCJMM(e.target.value)} className="bank-filter">
                                <option value="All">All Clinical Processes</option>
                                {cjmmSteps.filter(s => s !== 'All').map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="bank-filter">
                                <option value="All">All Competencies</option>
                                {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="bank-filter">
                                <option value="All">All Status</option>
                                <option value="draft">Draft</option>
                                <option value="live">Live</option>
                            </select>
                        </div>
                    </div>
                </header>

                {selectedItems.length > 0 && (
                    <div className="bulk-actions-bar">
                        <div className="selection-info">{selectedItems.length} items selected</div>
                        <div className="bulk-btns">
                            <button className="bulk-btn qa" onClick={handleBulkQA}>
                                <span className="icon">🛡️</span> Run QA
                            </button>
                            <button className="bulk-btn fix" onClick={handleBulkRepair}>
                                <span className="icon">🪄</span> Auto-Repair
                            </button>
                            <button className="bulk-btn chat" onClick={handleAIChatFix}>
                                <span className="icon">🤖</span> AI Chat Fix
                            </button>
                            <button className="bulk-btn delete" onClick={handleDeleteSelected}>
                                <span className="icon">🗑️</span> Delete Permanently
                            </button>
                        </div>
                    </div>
                )}

                <div className="table-wrapper">
                    {isLoading ? (
                        <div className="loading-overlay">
                            <div className="clinical-spinner"></div>
                            <p>Accessing Clinical Vault...</p>
                            <p className="text-xs opacity-50 mt-2">Processing 11MB medical corpus via lazy-segmentation</p>
                        </div>
                    ) : (
                        <table className="item-table">
                            <thead>
                                <tr>
                                    <th className="col-check">
                                        <input
                                            type="checkbox"
                                            checked={selectedItems.length === sortedItems.length && sortedItems.length > 0}
                                            onChange={toggleSelectAll}
                                        />
                                    </th>
                                    <th className="col-id sortable" onClick={() => handleSort('id')}>ID {sortConfig?.key === 'id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                                    <th className="col-type sortable" onClick={() => handleSort('type')}>TYPE {sortConfig?.key === 'type' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                                    <th className="col-topic sortable" onClick={() => handleSort('topic')}>TOPIC {sortConfig?.key === 'topic' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                                    <th className="col-lvl sortable" onClick={() => handleSort('lvl')}>LVL {sortConfig?.key === 'lvl' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                                    <th className="col-cog sortable" onClick={() => handleSort('cog')}>COGNITIVE DEPTH {sortConfig?.key === 'cog' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                                    <th className="col-proc sortable" onClick={() => handleSort('proc')}>CLINICAL PROCESS {sortConfig?.key === 'proc' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                                    <th className="col-comp sortable" onClick={() => handleSort('comp')}>PRIMARY COMPETENCY {sortConfig?.key === 'comp' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                                    <th className="col-date sortable" onClick={() => handleSort('date')}>ENTRY DATE {sortConfig?.key === 'date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                                    <th className="col-qi">QI</th>
                                    <th className="col-status sortable" onClick={() => handleSort('status')}>STATUS {sortConfig?.key === 'status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                                    <th className="col-actions">ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedItems.map((item) => (
                                    <tr key={item.id} className={selectedItems.includes(item.id) ? 'selected' : ''}>
                                        <td className="col-check">
                                            <input
                                                type="checkbox"
                                                checked={selectedItems.includes(item.id)}
                                                onChange={() => toggleSelect(item.id)}
                                            />
                                        </td>
                                        <td className="col-id">
                                            <a
                                                href={`#/item/${item.id}`}
                                                className="link-text"
                                                onClick={(e) => {
                                                    if (e.button === 0 && !e.ctrlKey && !e.metaKey) {
                                                        e.preventDefault();
                                                        onSelectItem(item.id);
                                                    }
                                                }}
                                            >
                                                {item.id.length > 15 ? item.id.substring(0, 12) + '...' : item.id}
                                            </a>
                                        </td>
                                        <td className="col-type">
                                            <span className="type-pill">{item.type}</span>
                                        </td>
                                        <td className="col-topic">{item.pedagogy?.topicTags?.[0] || 'Uncategorized'}</td>
                                        <td className="col-lvl">
                                            <span className="lvl-badge">{item.pedagogy?.difficulty || '?'}</span>
                                        </td>
                                        <td className="col-cog">
                                            <span className="cog-depth">{item.pedagogy?.bloomLevel || 'N/A'}</span>
                                        </td>
                                        <td className="col-proc">
                                            <span className="proc-text">{item.pedagogy?.cjmmStep || 'N/A'}</span>
                                        </td>
                                        <td className="col-comp">
                                            <span className="comp-text">{item.pedagogy?.nclexCategory || 'N/A'}</span>
                                        </td>
                                        <td className="col-date">
                                            <span className="date-text">{item.createdAt ? new Date(item.createdAt).toLocaleString() : '2/13/2026, 3:37 PM'}</span>
                                        </td>
                                        <td className="col-qi">
                                            {(() => {
                                                const itemReport = qaScoreMap.get(item.id);
                                                if (!itemReport) return <span className="qi-val" style={{ opacity: 0.4 }}>—</span>;
                                                return (
                                                    <span
                                                        className="qi-val qi-clickable"
                                                        style={{ color: scoreColor(itemReport.score), cursor: 'pointer' }}
                                                        onClick={(e) => { e.stopPropagation(); setQaDetailItem(itemReport); }}
                                                        title={`${itemReport.verdict.toUpperCase()} — click for details`}
                                                    >
                                                        {itemReport.score}
                                                        {itemReport.verdict === 'fail' && <span className="qi-verdict-dot fail">●</span>}
                                                        {itemReport.verdict === 'warn' && <span className="qi-verdict-dot warn">●</span>}
                                                        {itemReport.verdict === 'pass' && <span className="qi-verdict-dot pass">●</span>}
                                                    </span>
                                                );
                                            })()}
                                        </td>
                                        <td className="col-status">
                                            <span className={`status-pill ${items.indexOf(item) % 3 === 0 ? 'draft' : 'live'}`}>
                                                {items.indexOf(item) % 3 === 0 ? 'draft' : 'live'}
                                            </span>
                                        </td>
                                        <td className="col-actions">
                                            <div className="action-row">
                                                <button className="row-action edit" onClick={handleAIChatFix} title="AI Chat Fix">🤖</button>
                                                <button className="row-action view" onClick={() => onSelectItem(item.id)} title="View Item">👁️</button>
                                                <button
                                                    className="row-action qa"
                                                    onClick={(e) => { e.stopPropagation(); runSingleItemQA(item); }}
                                                    title="Run QA Check"
                                                >🛡️</button>
                                                <button className="row-action delete" onClick={() => {
                                                    if (window.confirm('Delete this item?')) {
                                                        setItems(prev => prev.filter(i => i.id !== item.id));
                                                    }
                                                }} title="Delete">🗑️</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* ═══ QA Detail Overlay ═══ */}
            {qaDetailItem && (
                <div className="qa-overlay" onClick={() => setQaDetailItem(null)}>
                    <div className="qa-panel" onClick={e => e.stopPropagation()}>
                        <div className="qa-panel-header">
                            <div>
                                <h2>{qaDetailItem.itemId}</h2>
                                <div className="qa-panel-meta">
                                    <span className="type-pill">{qaDetailItem.itemType}</span>
                                    <span className={`qa-verdict-badge ${qaDetailItem.verdict}`}>
                                        {qaDetailItem.verdict === 'pass' ? '✓ PASS' : qaDetailItem.verdict === 'warn' ? '⚠ WARN' : '✕ FAIL'}
                                    </span>
                                    <span className="qa-panel-score" style={{ color: scoreColor(qaDetailItem.score) }}>
                                        Score: {qaDetailItem.score}/100
                                    </span>
                                </div>
                            </div>
                            <div className="qa-panel-actions">
                                <button className="qa-preview-btn" onClick={() => { onSelectItem(qaDetailItem.itemId); setQaDetailItem(null); }}>
                                    ▶ Preview
                                </button>
                                <button className="qa-close-btn" onClick={() => setQaDetailItem(null)}>✕</button>
                            </div>
                        </div>

                        <div className="qa-dim-list">
                            {(Object.keys(DIMENSION_LABELS) as QADimension[]).map(dim => {
                                const dimScore = qaDetailItem.dimensionScores[dim];
                                const dimDiags = qaDetailItem.diagnostics.filter(d => d.dimension === dim);
                                return (
                                    <div key={dim} className="qa-dim-block">
                                        <div className="qa-dim-row">
                                            <span>{DIMENSION_LABELS[dim].icon} {DIMENSION_LABELS[dim].label}</span>
                                            <span style={{ color: scoreColor(dimScore), fontWeight: 900 }}>{dimScore}%</span>
                                        </div>
                                        <div className="qa-dim-bar-bg">
                                            <div className="qa-dim-bar-fill" style={{ width: `${dimScore}%`, background: scoreColor(dimScore) }} />
                                        </div>
                                        {dimDiags.length > 0 ? (
                                            <div className="qa-diag-list">
                                                {dimDiags.map((diag, i) => (
                                                    <div key={i} className="qa-diag-item" style={{ borderLeftColor: SEVERITY_CONFIG[diag.severity].color }}>
                                                        <span className="qa-diag-sev" style={{
                                                            background: SEVERITY_CONFIG[diag.severity].bg,
                                                            color: SEVERITY_CONFIG[diag.severity].color,
                                                        }}>{SEVERITY_CONFIG[diag.severity].label}</span>
                                                        <span className="qa-diag-code">{diag.code}</span>
                                                        <span className="qa-diag-msg">{diag.message}</span>
                                                        {diag.field && <span className="qa-diag-field">{diag.field}</span>}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="qa-dim-ok">✓ All checks passed</div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .bank-container {
                    background: var(--bg);
                    color: var(--text);
                    min-height: 100vh;
                    padding: 30px;
                    font-family: 'Inter', system-ui, sans-serif;
                    display: flex;
                    flex-direction: column;
                    gap: 25px;
                }
                
                /* Dashboard Summary Cards */
                .dashboard-summary {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
                    gap: 20px;
                }
                .summary-card {
                    background: var(--bg-card);
                    border: 1px solid var(--border);
                    border-radius: 20px;
                    padding: 24px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.03);
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    transition: transform 0.2s;
                }
                .summary-card:hover { transform: translateY(-5px); border-color: var(--primary); }
                .card-lbl { 
                    font-size: 0.85rem; 
                    font-weight: 700; 
                    color: var(--muted-text); 
                    text-transform: uppercase; 
                    letter-spacing: 0.05em;
                    display: flex;
                    justify-content: space-between;
                }
                .card-val { font-size: 2.2rem; font-weight: 900; color: var(--text); }
                .card-sub { font-size: 0.75rem; color: var(--muted-text); font-weight: 600; }

                .bank-content-card {
                    background: var(--bg-card);
                    border: 1px solid var(--border);
                    border-radius: 24px;
                    padding: 24px;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.04);
                }

                .bank-header {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    margin-bottom: 25px;
                }
                .bank-title { display: flex; align-items: center; gap: 15px; }
                .back-btn { 
                    background: var(--panel-bg); border: 1px solid var(--border); font-size: 1.2rem; 
                    color: var(--text); cursor: pointer; padding: 6px 12px;
                    border-radius: 12px; transition: all 0.2s;
                }
                .back-btn:hover { background: var(--border); }
                .bank-title h1 { font-size: 1.5rem; font-weight: 900; letter-spacing: -0.02em; }

                .bank-controls { 
                    display: flex; 
                    justify-content: space-between; 
                    align-items: center; 
                    gap: 20px;
                    flex-wrap: wrap; 
                }
                
                .search-box {
                    display: flex; align-items: center; gap: 10px;
                    background: var(--bg); border: 1.5px solid var(--border);
                    border-radius: 14px; padding: 10px 18px; min-width: 350px;
                    position: relative;
                }
                .search-box input { 
                    background: transparent; border: none; color: var(--text); 
                    width: 100%; outline: none; font-size: 0.95rem; font-weight: 500;
                }
                .clear-search {
                    background: transparent; border: none; color: var(--muted-text);
                    cursor: pointer; font-size: 1.1rem; padding: 4px;
                }

                .header-actions { display: flex; gap: 12px; }
                .repair-btn {
                    background: rgba(var(--primary-rgb), 0.05);
                    border: 1.5px solid rgba(var(--primary-rgb), 0.2);
                    color: var(--primary);
                    padding: 10px 20px;
                    border-radius: 12px;
                    font-weight: 800;
                    font-size: 0.9rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .repair-btn:hover { background: var(--primary); color: white; }

                .action-btn {
                    padding: 10px 24px; border-radius: 12px; font-weight: 800;
                    cursor: pointer; transition: all 0.2s; border: none;
                    font-size: 0.9rem;
                }
                .action-btn.refresh {
                    padding: 10px;
                    background: var(--bg);
                    border: 1.5px solid var(--border);
                    color: var(--text);
                }
                .action-btn.refresh:hover {
                    border-color: var(--primary);
                    color: var(--primary);
                    transform: rotate(180deg);
                }
                .action-btn.theme-toggle-btn {
                    background: var(--bg);
                    border: 1.5px solid var(--border);
                    color: var(--text);
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .action-btn.theme-toggle-btn:hover {
                    border-color: var(--primary);
                    background: var(--panel-bg);
                }
                .action-btn.primary { background: var(--primary); color: white; box-shadow: 0 4px 15px rgba(var(--primary-rgb), 0.3); }
                .action-btn:hover { transform: translateY(-2px); filter: brightness(1.1); }

                .filter-group { display: flex; gap: 10px; }
                .bank-filter {
                    background: var(--bg);
                    border: 1.5px solid var(--border);
                    border-radius: 12px;
                    padding: 10px 16px;
                    color: var(--text);
                    font-size: 0.85rem;
                    font-weight: 700;
                    outline: none;
                    cursor: pointer;
                }
                .bank-filter:hover { border-color: var(--primary); }

                /* Bulk Actions Bar */
                .bulk-actions-bar {
                    background: var(--primary);
                    color: white;
                    padding: 14px 28px;
                    border-radius: 18px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 25px;
                    animation: slideUp 0.3s ease-out;
                    box-shadow: 0 15px 35px rgba(var(--primary-rgb), 0.3);
                }
                @keyframes slideUp { from { transform: translateY(10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                .selection-info { font-weight: 900; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.08em; }
                .bulk-btns { display: flex; gap: 12px; }
                .bulk-btn {
                    padding: 10px 20px;
                    border-radius: 12px;
                    border: none;
                    font-weight: 850;
                    font-size: 0.85rem;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    transition: all 0.2s;
                }
                .bulk-btn.fix { background: white; color: var(--primary); }
                .bulk-btn.delete { background: #fee2e2; color: #dc2626; }
                .bulk-btn:hover { transform: translateY(-3px); box-shadow: 0 6px 15px rgba(0,0,0,0.15); }

                .table-wrapper {
                    background: var(--bg);
                    border: 1px solid var(--border);
                    border-radius: 20px;
                    overflow: auto;
                    max-height: calc(100vh - 400px);
                }

                .item-table {
                    width: 100%;
                    border-collapse: collapse;
                    text-align: left;
                    min-width: 1400px;
                }
                .item-table th {
                    background: var(--panel-bg);
                    padding: 20px 16px;
                    font-size: 0.7rem;
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    color: var(--muted-text);
                    border-bottom: 1.5px solid var(--border);
                    position: sticky;
                    top: 0;
                    z-index: 10;
                }
                .item-table th.sortable { cursor: pointer; user-select: none; transition: background 0.2s; }
                .item-table th.sortable:hover { background: var(--border); color: var(--primary); }

                .item-table td {
                    padding: 18px 16px;
                    border-bottom: 1px solid var(--border);
                    font-size: 0.88rem;
                    color: var(--text);
                    font-weight: 500;
                }
                .item-table tr:hover { background: rgba(var(--primary-rgb), 0.03); }
                .item-table tr.selected { background: rgba(var(--primary-rgb), 0.06); }

                .col-check { width: 60px; text-align: center; }
                .col-id { color: var(--primary); font-weight: 800; width: 140px; }
                .link-text { cursor: pointer; border-bottom: 1.5px solid transparent; transition: all 0.2s; }
                .link-text:hover { border-bottom-color: var(--primary); }
                
                .type-pill {
                    background: rgba(var(--primary-rgb), 0.08);
                    color: var(--primary);
                    padding: 5px 12px;
                    border-radius: 8px;
                    font-size: 0.75rem;
                    font-weight: 850;
                    text-transform: capitalize;
                }

                .lvl-badge {
                    background: var(--panel-bg);
                    padding: 5px 10px;
                    border-radius: 8px;
                    font-weight: 900;
                    font-size: 0.8rem;
                    border: 1px solid var(--border);
                }
                
                .cog-depth { color: var(--secondary); font-weight: 900; text-transform: uppercase; font-size: 0.7rem; letter-spacing: 0.05em; }
                .proc-text { color: var(--muted-text); font-weight: 700; font-size: 0.8rem; }
                .comp-text { color: var(--text); font-weight: 600; font-size: 0.8rem; opacity: 0.7; }

                .qi-val { font-weight: 900; font-family: 'JetBrains Mono', monospace; font-size: 1rem; position: relative; }
                .qi-clickable { transition: all 0.2s; }
                .qi-clickable:hover { transform: scale(1.15); filter: brightness(1.2); }
                .qi-verdict-dot { font-size: 0.55rem; margin-left: 3px; vertical-align: super; }
                .qi-verdict-dot.pass { color: #10B981; }
                .qi-verdict-dot.warn { color: #F59E0B; }
                .qi-verdict-dot.fail { color: #EF4444; }

                .status-pill {
                    padding: 5px 14px;
                    border-radius: 100px;
                    font-size: 0.7rem;
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                .status-pill.draft { background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; }
                .status-pill.live { background: rgba(var(--success-rgb), 0.1); color: var(--success); border: 1px solid rgba(var(--success-rgb), 0.2); }

                .action-row { display: flex; gap: 8px; }
                .row-action {
                    width: 36px;
                    height: 36px;
                    border-radius: 10px;
                    border: 1px solid var(--border);
                    background: var(--bg-card);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1rem;
                    transition: all 0.2s;
                }
                .row-action:hover { transform: translateY(-3px) scale(1.1); box-shadow: 0 4px 10px rgba(0,0,0,0.1); border-color: var(--primary); }
                .row-action.qa:hover { border-color: #8B5CF6; background: rgba(139,92,246,0.08); }
                .row-action.delete:hover { border-color: #ef4444; background: #fee2e2; color: #dc2626; }

                /* ─── QA Scan Button ─── */
                .qa-scan-btn {
                    padding: 10px 20px;
                    background: linear-gradient(135deg, #2563EB, #8B5CF6);
                    color: white;
                    border: none;
                    border-radius: 12px;
                    font-weight: 800;
                    font-size: 0.85rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    box-shadow: 0 4px 15px rgba(37,99,235,0.25);
                }
                .qa-scan-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(37,99,235,0.35); }
                .qa-scan-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }

                /* ─── QA Integrity Card Mini Bar ─── */
                .qa-integrity-card { position: relative; overflow: hidden; }
                .qa-mini-bar {
                    display: flex;
                    height: 4px;
                    border-radius: 4px;
                    overflow: hidden;
                    margin-top: 8px;
                }
                .qa-mini-pass { background: #10B981; transition: width 0.6s ease; }
                .qa-mini-warn { background: #F59E0B; transition: width 0.6s ease; }
                .qa-mini-fail { background: #EF4444; transition: width 0.6s ease; }

                /* ─── QA Detail Overlay ─── */
                .qa-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.55);
                    backdrop-filter: blur(10px);
                    z-index: 300;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 40px;
                    animation: fadeIn 0.2s ease;
                }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

                .qa-panel {
                    background: var(--bg-card);
                    border-radius: 24px;
                    border: 1px solid var(--border);
                    width: 100%;
                    max-width: 800px;
                    max-height: 85vh;
                    overflow-y: auto;
                    padding: 32px;
                    box-shadow: 0 40px 80px rgba(0,0,0,0.25);
                    animation: slideUp 0.3s ease;
                }
                @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

                .qa-panel-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 24px;
                    gap: 16px;
                }
                .qa-panel-header h2 {
                    font-size: 1.1rem;
                    font-weight: 900;
                    margin: 0 0 8px;
                    word-break: break-all;
                }
                .qa-panel-meta { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
                .qa-verdict-badge {
                    padding: 3px 10px;
                    border-radius: 6px;
                    font-size: 0.7rem;
                    font-weight: 900;
                    letter-spacing: 0.05em;
                }
                .qa-verdict-badge.pass { background: rgba(16,185,129,0.12); color: #10B981; }
                .qa-verdict-badge.warn { background: rgba(245,158,11,0.12); color: #F59E0B; }
                .qa-verdict-badge.fail { background: rgba(239,68,68,0.12); color: #EF4444; }
                .qa-panel-score { font-size: 0.85rem; font-weight: 900; }
                .qa-panel-actions { display: flex; gap: 8px; flex-shrink: 0; }
                .qa-preview-btn {
                    padding: 8px 16px;
                    background: linear-gradient(135deg, #2563EB, #8B5CF6);
                    color: white;
                    border: none;
                    border-radius: 10px;
                    font-weight: 700;
                    font-size: 0.75rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .qa-preview-btn:hover { transform: translateY(-2px); }
                .qa-close-btn {
                    width: 36px; height: 36px;
                    border-radius: 10px;
                    border: 1px solid var(--border);
                    background: var(--bg);
                    cursor: pointer;
                    font-size: 1rem;
                    color: var(--text);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .qa-close-btn:hover { background: var(--border); }

                /* ─── Dimension Blocks ─── */
                .qa-dim-list { display: flex; flex-direction: column; gap: 14px; }
                .qa-dim-block {
                    background: var(--bg);
                    border: 1px solid var(--border);
                    border-radius: 14px;
                    padding: 16px;
                }
                .qa-dim-row {
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.85rem;
                    font-weight: 700;
                    margin-bottom: 8px;
                }
                .qa-dim-bar-bg {
                    width: 100%;
                    height: 4px;
                    background: var(--border);
                    border-radius: 4px;
                    overflow: hidden;
                    margin-bottom: 8px;
                }
                .qa-dim-bar-fill {
                    height: 100%;
                    border-radius: 4px;
                    transition: width 0.5s ease;
                }
                .qa-dim-ok { font-size: 0.75rem; color: #10B981; font-weight: 700; }
                .qa-diag-list { display: flex; flex-direction: column; gap: 6px; }
                .qa-diag-item {
                    display: flex;
                    gap: 8px;
                    align-items: center;
                    padding: 6px 10px;
                    border-left: 3px solid;
                    border-radius: 6px;
                    background: var(--bg-card);
                    flex-wrap: wrap;
                }
                .qa-diag-sev {
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

                .loading-overlay {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 80px;
                    text-align: center;
                }
                .clinical-spinner {
                    width: 48px;
                    height: 48px;
                    border: 4px solid var(--panel-bg);
                    border-top: 4px solid var(--primary);
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin-bottom: 20px;
                }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                .text-xs { font-size: 0.7rem; }
            `}</style>
        </div>
    );
}
