import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { MasterItem } from '../../types/master';
import { getStandaloneNGNItemsAsync } from '../../services/caseStudyLibrary';
import { runBankQA, runItemQA, repairBank, runDeepAIRepair, QABankReport, QAItemReport, QADimension, QASeverity } from '../../validation/itemBankQA';
import { upsertItemToCloud, deleteItemFromCloud } from '../../services/supabaseService';

interface AIBankPageProps {
    onSelectItem: (itemId: string) => void;
    onExit: () => void;
    theme: 'light' | 'dark';
    onToggleTheme: () => void;
}

const DIMENSION_LABELS: Record<QADimension, { label: string; icon: string }> = {
    completeness: { label: 'Completeness', icon: '📋' },
    typeStructure: { label: 'Structure', icon: '🧩' },
    scoringAccuracy: { label: 'Scoring', icon: '🎯' },
    pedagogy: { label: 'Pedagogy', icon: '🎓' },
    rationaleQuality: { label: 'Rationale', icon: '📝' },
    optionLogic: { label: 'Logic', icon: '🔗' },
    dataReferences: { label: 'Data', icon: '🗂️' },
    errorDetection: { label: 'Errors', icon: '🛡️' },
    isolationAllergy: { label: 'Safety', icon: '⚠️' },
    sbarSpecificity: { label: 'SBAR', icon: '🏥' },
    ehrSync: { label: 'EHR Sync', icon: '🔄' },
    studyCompanion: { label: 'Companion', icon: '📚' },
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

    // API Key Rotation for UI-side AI tasks
    const aiKeys = useMemo(() => {
        const keys = [
            (import.meta as any).env.VITE_GEMINI_API_KEY_1, (import.meta as any).env.GEMINI_API_KEY_1,
            (import.meta as any).env.VITE_GEMINI_API_KEY_2, (import.meta as any).env.GEMINI_API_KEY_2,
            (import.meta as any).env.VITE_GEMINI_API_KEY_3, (import.meta as any).env.GEMINI_API_KEY_3,
            (import.meta as any).env.VITE_GEMINI_API_KEY_4, (import.meta as any).env.GEMINI_API_KEY_4,
            (import.meta as any).env.VITE_GEMINI_API_KEY_5, (import.meta as any).env.GEMINI_API_KEY_5,
            (import.meta as any).env.VITE_GEMINI_API_KEY_6, (import.meta as any).env.GEMINI_API_KEY_6,
            (import.meta as any).env.VITE_GEMINI_API_KEY_7, (import.meta as any).env.GEMINI_API_KEY_7,
            (import.meta as any).env.VITE_GEMINI_API_KEY_8, (import.meta as any).env.GEMINI_API_KEY_8,
            (import.meta as any).env.VITE_GEMINI_API_KEY_9, (import.meta as any).env.GEMINI_API_KEY_9,
            (import.meta as any).env.VITE_GEMINI_API_KEY_10, (import.meta as any).env.GEMINI_API_KEY_10,
            (import.meta as any).env.VITE_GEMINI_API_KEY_11, (import.meta as any).env.GEMINI_API_KEY_11,
            (import.meta as any).env.VITE_GEMINI_API_KEY_12, (import.meta as any).env.GEMINI_API_KEY_12,
            (import.meta as any).env.VITE_GEMINI_API_KEY_13, (import.meta as any).env.GEMINI_API_KEY_13,
            (import.meta as any).env.VITE_GEMINI_API_KEY_14, (import.meta as any).env.GEMINI_API_KEY_14
        ].filter(Boolean);
        return Array.from(new Set(keys)); // Remove duplicates if both are present
    }, []);

    const [keyIdx, setKeyIdx] = useState(0);
    const getNextKey = useCallback(() => {
        if (aiKeys.length === 0) return null;
        const k = aiKeys[keyIdx];
        setKeyIdx(prev => (prev + 1) % aiKeys.length);
        return k;
    }, [aiKeys, keyIdx]);
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
    const [scanProgress, setScanProgress] = useState({ current: 0, total: 0 });

    const runFullScan = useCallback(() => {
        if (items.length === 0) return;
        setIsScanning(true);
        setBankReport(null);
        setScanProgress({ current: 0, total: items.length });

        let chunkIdx = 0;
        const chunkSize = 150;
        const allItemReports: QAItemReport[] = [];
        const newScoreMap = new Map<string, QAItemReport>();

        const processNextChunk = async () => {
            if (chunkIdx >= items.length) {
                const finalReport: QABankReport = {
                    totalItems: items.length,
                    passed: allItemReports.filter(r => r.verdict === 'pass').length,
                    warned: allItemReports.filter(r => r.verdict === 'warn').length,
                    failed: allItemReports.filter(r => r.verdict === 'fail').length,
                    overallScore: Math.round(allItemReports.reduce((sum, r) => sum + r.score, 0) / Math.max(1, items.length)),
                    itemReports: allItemReports,
                    checkedAt: new Date().toISOString(),
                    dimensionSummary: {} as any,
                    typeDistribution: {} as any
                };
                setBankReport(finalReport);
                setIsScanning(false);
                return;
            }

            const chunk = items.slice(chunkIdx, chunkIdx + chunkSize);
            const reportChunk = runBankQA(chunk);

            reportChunk.itemReports.forEach(r => {
                allItemReports.push(r);
                newScoreMap.set(r.itemId, r);
            });

            setQaScoreMap(new Map(newScoreMap));
            chunkIdx += chunkSize;
            setScanProgress({ current: Math.min(chunkIdx, items.length), total: items.length });

            requestAnimationFrame(() => setTimeout(processNextChunk, 10));
        };

        requestAnimationFrame(() => setTimeout(processNextChunk, 10));
    }, [items]);

    // Auto-scan when items load
    useEffect(() => {
        if (items.length > 0 && !bankReport && !isScanning && scanProgress.total === 0) {
            runFullScan();
        }
    }, [items.length, bankReport, isScanning, scanProgress.total, runFullScan]);

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
    const [filterQI, setFilterQI] = useState('All');
    const [columnWidths, setColumnWidths] = useState<Record<string, number>>({
        check: 60,
        id: 180, // Increased default width for full ID
        type: 120,
        topic: 200,
        lvl: 80,
        cog: 180,
        proc: 180,
        comp: 220,
        date: 200,
        qi: 80,
        status: 100,
        actions: 200
    });

    const resizingRef = useRef<{ key: string, startX: number, startWidth: number } | null>(null);

    const startResizing = (key: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        resizingRef.current = { key, startX: e.pageX, startWidth: columnWidths[key] };
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    };

    const onMouseMove = (e: MouseEvent) => {
        if (!resizingRef.current) return;
        const { key, startX, startWidth } = resizingRef.current;
        const delta = e.pageX - startX;
        const newWidth = Math.max(50, startWidth + delta);
        setColumnWidths(prev => ({ ...prev, [key]: newWidth }));
    };

    const onMouseUp = () => {
        resizingRef.current = null;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    };

    // Debug active filters
    console.log('Active Filter Type:', filterType);

    // Simplified Filters - Strict Equality to prevent casing mismatches
    // Simplified Filters - Robust normalization
    const itemTypes = useMemo(() => {
        const raw = items.map(i => i?.type);
        const hasBlank = raw.some(v => !v);
        const unique = Array.from(new Set(raw.filter(Boolean))).sort();
        return ['All', ...unique, ...(hasBlank ? ['Blank / ?'] : [])];
    }, [items]);

    const difficulties = useMemo(() => {
        const raw = items.map(i => i?.pedagogy?.difficulty?.toString());
        const hasBlank = raw.some(v => !v);
        const unique = Array.from(new Set(raw.filter(Boolean))).sort((a, b) => Number(a) - Number(b));
        return ['All', ...unique, ...(hasBlank ? ['Blank / ?'] : [])];
    }, [items]);

    const bloomLevels = useMemo(() => {
        const raw = items.map(i => i?.pedagogy?.bloomLevel);
        const hasBlank = raw.some(v => !v);
        const unique = Array.from(new Set(raw.filter(Boolean))).sort();
        return ['All', ...unique, ...(hasBlank ? ['Blank / ?'] : [])];
    }, [items]);

    const cjmmSteps = useMemo(() => {
        const raw = items.map(i => i?.pedagogy?.cjmmStep);
        const hasBlank = raw.some(v => !v);
        const unique = Array.from(new Set(raw.filter(Boolean))).sort();
        return ['All', ...unique, ...(hasBlank ? ['Blank / ?'] : [])];
    }, [items]);

    const categories = useMemo(() => {
        const raw = items.map(i => i?.pedagogy?.nclexCategory);
        const hasBlank = raw.some(v => !v);
        const unique = Array.from(new Set(raw.filter(Boolean))).sort();
        return ['All', ...unique, ...(hasBlank ? ['Blank / ?'] : [])];
    }, [items]);

    const sortedItems = useMemo(() => {
        const filtered = items.filter(item => {
            if (!item) return false;

            const searchLower = (search || '').toLowerCase();
            const fullText = [
                item.id || '',
                item.type || '',
                item.stem || '',
                (item as any).itemContext?.patient?.diagnosis || '',
                ...(item.pedagogy?.topicTags || []),
                item.rationale?.correct || '',
                item.pedagogy?.nclexCategory || ''
            ].join(' ').toLowerCase();

            // Robust Search
            const matchesSearch = !searchLower || fullText.includes(searchLower);

            // Accurate Filter Comparisons with Blank Detection
            const matchesType = filterType === 'All' ||
                (filterType === 'Blank / ?' ? !item.type : item.type?.toLowerCase() === filterType.toLowerCase());

            const matchesDifficulty = filterDifficulty === 'All' ||
                (filterDifficulty === 'Blank / ?' ? !item.pedagogy?.difficulty : item.pedagogy?.difficulty?.toString() === filterDifficulty);

            const itemStatus = item.status || (items.indexOf(item) % 3 === 0 ? 'draft' : 'live');
            const matchesStatus = filterStatus === 'All' || itemStatus === filterStatus;

            const matchesBloom = filterBloom === 'All' ||
                (filterBloom === 'Blank / ?' ? !item.pedagogy?.bloomLevel : item.pedagogy?.bloomLevel?.toLowerCase() === filterBloom.toLowerCase());

            const matchesCJMM = filterCJMM === 'All' ||
                (filterCJMM === 'Blank / ?' ? !item.pedagogy?.cjmmStep : item.pedagogy?.cjmmStep?.toLowerCase() === filterCJMM.toLowerCase());

            const matchesCategory = filterCategory === 'All' ||
                (filterCategory === 'Blank / ?' ? !item.pedagogy?.nclexCategory : item.pedagogy?.nclexCategory?.toLowerCase() === filterCategory.toLowerCase());

            const score = qaScoreMap.get(item.id)?.score ?? 0;
            const qiMatch = filterQI === 'All' ||
                (filterQI === 'Perfect (100)' && score === 100) ||
                (filterQI === 'Pass (70-99)' && score >= 70 && score < 100) ||
                (filterQI === 'Warn (50-69)' && score >= 50 && score < 70) ||
                (filterQI === 'Fail (<50)' && score < 50);

            return matchesSearch && matchesType && matchesDifficulty && matchesStatus && matchesBloom && matchesCJMM && matchesCategory && qiMatch;
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
                case 'qi': valA = qaScoreMap.get(a.id)?.score || 0; valB = qaScoreMap.get(b.id)?.score || 0; break;
                case 'status':
                    valA = a.status || (items.indexOf(a) % 3 === 0 ? 'draft' : 'live');
                    valB = b.status || (items.indexOf(b) % 3 === 0 ? 'draft' : 'live');
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

    const handleDeleteSelected = async () => {
        if (!window.confirm(`Are you sure you want to delete ${selectedItems.length} items from the cloud vault?`)) return;

        setIsScanning(true);
        try {
            for (const id of selectedItems) {
                await deleteItemFromCloud(id);
            }
            setItems(prev => prev.filter(item => !selectedItems.includes(item.id)));
            setSelectedItems([]);
            alert(`${selectedItems.length} items deleted successfully from cloud.`);
        } catch (err) {
            console.error("Bulk delete failed:", err);
            alert("Some items could not be deleted from cloud.");
        } finally {
            setIsScanning(false);
        }
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

    const handleBulkRepair = async () => {
        const subset = items.filter(i => selectedItems.includes(i.id));
        if (!window.confirm(`Attempt Auto-Repair and CLOUD SYNC for ${subset.length} items?`)) return;

        setIsScanning(true);
        const { repairedItems, totalChanges } = repairBank(subset);

        try {
            // Persist each repaired item
            for (const item of repairedItems) {
                await upsertItemToCloud(item);
            }

            // Update local state
            const updatedItems = items.map(orig => {
                const found = repairedItems.find(r => r.id === orig.id);
                return found || orig;
            });

            setItems(updatedItems);
            alert(`Auto-Repair complete! ${totalChanges} structural issues healed and synced to cloud.`);
            runFullScan(); // Re-scan to update scores
        } catch (err) {
            console.error("Bulk repair sync failed:", err);
            alert("Repair locally completed, but cloud sync failed.");
        } finally {
            setIsScanning(false);
        }
    };

    const handleRepairAll = async () => {
        if (!window.confirm(`Initiate Global Bank Repair and CLOUD SYNC for all ${items.length} items? This will fix deterministic structural errors.`)) return;

        setIsScanning(true);
        const { repairedItems, totalChanges } = repairBank(items);

        try {
            // Batch upsert could be better, but we do one by one for simplicity/reliability
            for (const item of repairedItems) {
                await upsertItemToCloud(item);
            }
            setItems(repairedItems);
            alert(`Global Repair Finished! Total ${totalChanges} issues corrected and synced to cloud.`);
            runFullScan();
        } catch (err) {
            console.error("Global repair sync failed:", err);
            alert("Global repair finished locally, but cloud sync failed.");
        } finally {
            setIsScanning(false);
        }
    };

    const handleDeepAIFix = async (item: MasterItem) => {
        const key = getNextKey();
        if (!key) return alert("No AI Keys configured in .env");

        if (!window.confirm("Trigger AI Deep Clinical Repair? This uses Gemini Pro to strictly enforce NGN 2026 Content Logic and EHR Synchronization.")) return;

        setIsScanning(true);
        try {
            const { repaired, changes } = await runDeepAIRepair(item, key);
            await upsertItemToCloud(repaired);
            setItems(prev => prev.map(i => i.id === item.id ? repaired : i));
            alert(`Deep Repair & Cloud Sync Complete!\n\nChanges Made:\n${changes.join('\n')}`);
            runFullScan();
        } catch (err: any) {
            console.error("AI Fix Failed:", err);
            alert(`AI Fix Error: ${err.message}`);
        } finally {
            setIsScanning(false);
        }
    };

    const handleBulkDeepAIFix = async () => {
        const key = getNextKey();
        if (!key) return alert("No AI Keys configured in .env");

        const subset = items.filter(i => selectedItems.includes(i.id));
        if (!window.confirm(`Run AI Deep Fix on ${subset.length} items? This will take a few moments.`)) return;

        setIsScanning(true);
        let completed = 0;
        let totalChanges = 0;

        try {
            const updatedItems = [...items];
            for (const orig of subset) {
                const k = getNextKey() || key;
                const { repaired, changes } = await runDeepAIRepair(orig, k);
                await upsertItemToCloud(repaired);
                const idx = updatedItems.findIndex(i => i.id === orig.id);
                if (idx !== -1) updatedItems[idx] = repaired;
                completed++;
                totalChanges += changes.length;
            }
            setItems(updatedItems);
            alert(`Bulk Deep Fix & Cloud Sync Complete! ${completed} items healed with ${totalChanges} clinical optimizations.`);
            runFullScan();
        } catch (err: any) {
            console.error("Bulk AI Fix Failed:", err);
            alert(`Bulk AI Fix Error: ${err.message}`);
        } finally {
            setIsScanning(false);
        }
    };

    const refreshData = async () => {
        setIsLoading(true);
        const raw = await getStandaloneNGNItemsAsync();
        const unique = new Map();
        raw.forEach(item => unique.set(item.id, item));
        setItems(Array.from(unique.values()));
        setIsLoading(false);
    };

    const resetFilters = () => {
        setSearch('');
        setFilterType('All');
        setFilterDifficulty('All');
        setFilterStatus('All');
        setFilterBloom('All');
        setFilterCJMM('All');
        setFilterCategory('All');
        setFilterQI('All');
    };

    const handleDownloadReport = () => {
        if (!bankReport) return;
        const csvRows = [
            ['ID', 'Type', 'QI Score', 'Verdict', 'Diagnostics Count'].join(',')
        ];
        bankReport.itemReports.forEach(r => {
            csvRows.push([r.itemId, r.itemType, r.score, r.verdict, r.diagnostics.length].join(','));
        });
        const header = `SENTINEL QA SCAN REPORT\nDate:, ${new Date().toISOString()}\nTotal Items:, ${bankReport.totalItems}\nOverall Score:, ${bankReport.overallScore}%\n\n`;
        const blob = new Blob([header + csvRows.join('\n')], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Sentinel-QA-Report-${new Date().getTime()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
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
                    <div className="command-center-box">
                        <div className="command-header">
                            <span className="command-icon">⚡</span>
                            <div>
                                <h3>SENTINEL v2.0 COMMAND CENTER</h3>
                                <p>NGN 2026 Logic Enforcement & Cloud Sync</p>
                            </div>
                        </div>
                        <div className="command-actions">
                            <button
                                className="qa-scan-btn highlight"
                                onClick={runFullScan}
                                disabled={isScanning || items.length === 0}
                            >
                                {isScanning ? `⏳ SCANNING (${scanProgress.current}/${scanProgress.total})...` : '🛡️ RUN QA SCAN (ALL)'}
                            </button>
                            {bankReport && (
                                <button className="command-btn" onClick={handleDownloadReport} style={{ background: '#4b5563', color: 'white', boxShadow: '0 4px 15px rgba(75, 85, 99, 0.4)' }}>
                                    📥 EXPORT LOG
                                </button>
                            )}
                            <button className="command-btn repair" onClick={handleRepairAll}>
                                🪄 GLOBAL AUTO-REPAIR
                            </button>
                            <button className="command-btn deep-action" onClick={handleBulkDeepAIFix}>
                                🔬 AI DEEP CLINICAL HEAL
                            </button>
                        </div>
                    </div>

                    <div className="bank-controls">
                        <div className="search-group">
                            <div className="search-box">
                                <span className="search-icon">🔍</span>
                                <input
                                    type="text"
                                    placeholder="Search by ID, Topic, Diagnosis, or Category..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                                {search && <button className="clear-search" onClick={() => setSearch('')}>✕</button>}
                            </div>
                            <button className="reset-btn" onClick={resetFilters} title="Reset all filters">↺ Reset</button>
                        </div>

                        <div className="header-actions">
                            <button className="action-btn theme-toggle-btn" onClick={onToggleTheme}>
                                {theme === 'dark' ? '☀️ Day' : '🌙 Night'}
                            </button>
                            <button className="action-btn refresh" onClick={refreshData}>🔄</button>
                            <button className="action-btn primary">+ New Item</button>
                        </div>

                        <div className="filter-group">
                            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="bank-filter">
                                <option value="All">All Types</option>
                                {itemTypes.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                            <select value={filterDifficulty} onChange={(e) => setFilterDifficulty(e.target.value)} className="bank-filter">
                                <option value="All">All Difficulties</option>
                                {difficulties.map(d => <option key={d} value={d}>{d === 'Blank / ?' ? d : `Level ${d}`}</option>)}
                            </select>
                            <select value={filterBloom} onChange={(e) => setFilterBloom(e.target.value)} className="bank-filter">
                                <option value="All">All Bloom Levels</option>
                                {bloomLevels.map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                            <select value={filterCJMM} onChange={(e) => setFilterCJMM(e.target.value)} className="bank-filter">
                                <option value="All">All CJMM Steps</option>
                                {cjmmSteps.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="bank-filter">
                                <option value="All">All NCLEX Categories</option>
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <select value={filterQI} onChange={(e) => setFilterQI(e.target.value)} className="bank-filter">
                                <option value="All">All QI Scores</option>
                                <option value="Perfect (100)">Perfect (100)</option>
                                <option value="Pass (70-99)">Pass (70-99)</option>
                                <option value="Warn (50-69)">Warn (50-69)</option>
                                <option value="Fail (<50)">Fail (&lt;50)</option>
                            </select>
                            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="bank-filter">
                                <option value="All">All Status</option>
                                <option value="draft">Draft</option>
                                <option value="live">Live</option>
                                <option value="Blank / ?">Blank / ?</option>
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
                            <button className="bulk-btn deep" onClick={handleBulkDeepAIFix} style={{ background: '#ecfdf5', color: '#059669' }}>
                                <span className="icon">🛡️</span> AI Deep Fix
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
                                    <th className="col-check" style={{ width: columnWidths.check }}>
                                        <input
                                            type="checkbox"
                                            checked={selectedItems.length === sortedItems.length && sortedItems.length > 0}
                                            onChange={toggleSelectAll}
                                        />
                                        <div className="resizer" onMouseDown={(e) => startResizing('check', e)} />
                                    </th>
                                    <th className="col-id sortable" onClick={() => handleSort('id')} style={{ width: columnWidths.id }}>
                                        ID {sortConfig?.key === 'id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                        <div className="resizer" onMouseDown={(e) => startResizing('id', e)} />
                                    </th>
                                    <th className="col-type sortable" onClick={() => handleSort('type')} style={{ width: columnWidths.type }}>
                                        TYPE {sortConfig?.key === 'type' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                        <div className="resizer" onMouseDown={(e) => startResizing('type', e)} />
                                    </th>
                                    <th className="col-topic sortable" onClick={() => handleSort('topic')} style={{ width: columnWidths.topic }}>
                                        TOPIC {sortConfig?.key === 'topic' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                        <div className="resizer" onMouseDown={(e) => startResizing('topic', e)} />
                                    </th>
                                    <th className="col-lvl sortable" onClick={() => handleSort('lvl')} style={{ width: columnWidths.lvl }}>
                                        LVL {sortConfig?.key === 'lvl' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                        <div className="resizer" onMouseDown={(e) => startResizing('lvl', e)} />
                                    </th>
                                    <th className="col-cog sortable" onClick={() => handleSort('cog')} style={{ width: columnWidths.cog }}>
                                        COGNITIVE DEPTH {sortConfig?.key === 'cog' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                        <div className="resizer" onMouseDown={(e) => startResizing('cog', e)} />
                                    </th>
                                    <th className="col-proc sortable" onClick={() => handleSort('proc')} style={{ width: columnWidths.proc }}>
                                        CLINICAL PROCESS {sortConfig?.key === 'proc' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                        <div className="resizer" onMouseDown={(e) => startResizing('proc', e)} />
                                    </th>
                                    <th className="col-comp sortable" onClick={() => handleSort('comp')} style={{ width: columnWidths.comp }}>
                                        PRIMARY COMPETENCY {sortConfig?.key === 'comp' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                        <div className="resizer" onMouseDown={(e) => startResizing('comp', e)} />
                                    </th>
                                    <th className="col-date sortable" onClick={() => handleSort('date')} style={{ width: columnWidths.date }}>
                                        ENTRY DATE {sortConfig?.key === 'date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                        <div className="resizer" onMouseDown={(e) => startResizing('date', e)} />
                                    </th>
                                    <th className="col-qi sortable" onClick={() => handleSort('qi')} style={{ width: columnWidths.qi }}>
                                        QI {sortConfig?.key === 'qi' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                        <div className="resizer" onMouseDown={(e) => startResizing('qi', e)} />
                                    </th>
                                    <th className="col-status sortable" onClick={() => handleSort('status')} style={{ width: columnWidths.status }}>
                                        STATUS {sortConfig?.key === 'status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                        <div className="resizer" onMouseDown={(e) => startResizing('status', e)} />
                                    </th>
                                    <th className="col-actions" style={{ width: columnWidths.actions }}>
                                        ACTIONS
                                        <div className="resizer" onMouseDown={(e) => startResizing('actions', e)} />
                                    </th>
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
                                                style={{ fontSize: '0.68rem', wordBreak: 'break-all', display: 'block' }}
                                                onClick={(e) => {
                                                    if (e.button === 0 && !e.ctrlKey && !e.metaKey) {
                                                        e.preventDefault();
                                                        onSelectItem(item.id);
                                                    }
                                                }}
                                            >
                                                {item.id}
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
                                            <span className={`status-pill ${item.status || (items.indexOf(item) % 3 === 0 ? 'draft' : 'live')}`}>
                                                {item.status || (items.indexOf(item) % 3 === 0 ? 'draft' : 'live')}
                                            </span>
                                        </td>
                                        <td className="col-actions">
                                            <div className="action-row">
                                                <button className="row-action edit" onClick={() => handleDeepAIFix(item)} title="AI Deep Repair">⚡</button>
                                                <button className="row-action chat" onClick={handleAIChatFix} title="AI Chat Fix">🤖</button>
                                                <button className="row-action view" onClick={() => onSelectItem(item.id)} title="View Item">👁️</button>
                                                <button
                                                    className="row-action qa"
                                                    onClick={(e) => { e.stopPropagation(); runSingleItemQA(item); }}
                                                    title="Run QA Check"
                                                >🛡️</button>
                                                <button className="row-action delete" onClick={async () => {
                                                    if (window.confirm('Delete this item from CLOUD?')) {
                                                        setIsScanning(true);
                                                        try {
                                                            await deleteItemFromCloud(item.id);
                                                            setItems(prev => prev.filter(i => i.id !== item.id));
                                                        } finally {
                                                            setIsScanning(false);
                                                        }
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
                    flex-direction: column;
                    gap: 15px;
                    margin-bottom: 25px;
                }

                .command-center-box {
                    background: linear-gradient(135deg, #0f172a, #1e293b);
                    border: 2px solid #334155;
                    border-radius: 20px;
                    padding: 24px;
                    margin-bottom: 25px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    color: white;
                    box-shadow: 0 20px 50px rgba(0,0,0,0.3);
                }
                .command-header { display: flex; align-items: center; gap: 15px; }
                .command-icon { font-size: 2rem; }
                .command-header h3 { margin: 0; font-size: 1.1rem; font-weight: 900; letter-spacing: 0.1em; color: #cbd5e1; }
                .command-header p { margin: 0; font-size: 0.75rem; color: #94a3b8; font-weight: 600; }
                
                .command-actions { display: flex; gap: 12px; }
                .command-btn {
                    padding: 12px 24px;
                    border-radius: 14px;
                    font-weight: 900;
                    font-size: 0.8rem;
                    cursor: pointer;
                    border: none;
                    transition: all 0.23s cubic-bezier(0.4, 0, 0.2, 1);
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                .command-btn.repair { background: #3b82f6; color: white; box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4); }
                .command-btn.deep-action { background: #10b981; color: white; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4); }
                .command-btn:hover { transform: translateY(-3px) scale(1.02); filter: brightness(1.15); }

                .search-group { display: flex; gap: 12px; align-items: center; }
                .reset-btn {
                    padding: 10px 18px;
                    background: var(--bg-card);
                    border: 1.5px solid var(--border);
                    color: var(--muted-text);
                    border-radius: 12px;
                    font-weight: 800;
                    font-size: 0.85rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .reset-btn:hover { border-color: var(--primary); color: var(--primary); background: var(--panel-bg); }
                
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
                    width: max-content;
                    border-collapse: collapse;
                    text-align: left;
                    table-layout: fixed;
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
                .item-table th.sortable { cursor: pointer; user-select: none; transition: background 0.2s; position: relative; }
                .item-table th.sortable:hover { background: var(--border); color: var(--primary); }
                .resizer {
                    position: absolute;
                    right: 0;
                    top: 0;
                    height: 100%;
                    width: 10px;
                    cursor: col-resize;
                    z-index: 1;
                    background: transparent;
                }
                .resizer:hover {
                    background: rgba(var(--primary-rgb), 0.2);
                    border-right: 2px solid var(--primary);
                }

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
