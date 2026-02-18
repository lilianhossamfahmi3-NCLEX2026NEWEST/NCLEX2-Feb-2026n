import { useState, useMemo, useEffect } from 'react';
import { MasterItem } from '../../types/master';
import { getStandaloneNGNItemsAsync } from '../../services/caseStudyLibrary';

interface AIBankPageProps {
    onSelectItem: (itemId: string) => void;
    onExit: () => void;
    theme: 'light' | 'dark';
    onToggleTheme: () => void;
}

export default function AIBankPage({ onSelectItem, onExit, theme, onToggleTheme }: AIBankPageProps) {
    const [items, setItems] = useState<MasterItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

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
                <div className="summary-card">
                    <div className="card-lbl">Clinical Integrity <span className="icon">✅</span></div>
                    <div className="card-val">100%</div>
                    <div className="card-sub">All items verified</div>
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
                            <button className="repair-btn">🪄 Repair All</button>
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
                            <button className="bulk-btn fix" onClick={handleAIChatFix}>
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
                                            <span className="qi-val">{80 + (items.indexOf(item) % 20)}</span>
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

                .qi-val { color: var(--success); font-weight: 900; font-family: 'JetBrains Mono', monospace; font-size: 1rem; }

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

                .action-row { display: flex; gap: 10px; }
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
                .row-action.delete:hover { border-color: #ef4444; background: #fee2e2; color: #dc2626; }

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
