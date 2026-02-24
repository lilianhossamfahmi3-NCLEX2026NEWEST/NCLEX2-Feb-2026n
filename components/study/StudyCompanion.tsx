/**
 * NCLEX-RN NGN Clinical Simulator — Study Companion Sidebar
 * A collapsible drawer that aggregates Clinical Pearls, Question Traps,
 * and Mnemonics encountered during the session — the student's living notebook.
 */

import { useState, useMemo } from 'react';
import { MasterItem, Mnemonic, QuestionTrap } from '../../types/master';

interface StudyCompanionProps {
    items: MasterItem[];
    scores: Record<string, number>;
}

type CompanionTab = 'pearls' | 'traps' | 'mnemonics';

interface CollectedTrap {
    itemIndex: number;
    stem: string;
    trap: QuestionTrap;
    wasCorrect: boolean;
}

interface CollectedMnemonic {
    itemIndex: number;
    mnemonic: Mnemonic;
    flipped: boolean;
}

export default function StudyCompanion({ items, scores }: StudyCompanionProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<CompanionTab>('pearls');
    const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());

    // Collect data from answered items
    const answeredItems = useMemo(() =>
        items.filter(item => scores[item.id] !== undefined),
        [items, scores]
    );

    const allPearls = useMemo(() => {
        const pearls: { itemIndex: number; pearl: string }[] = [];
        answeredItems.forEach((item, i) => {
            item.rationale?.clinicalPearls?.forEach(pearl => {
                pearls.push({ itemIndex: i + 1, pearl });
            });
        });
        return pearls;
    }, [answeredItems]);

    const allTraps = useMemo((): CollectedTrap[] => {
        return answeredItems
            .filter(item => item.rationale?.questionTrap)
            .map((item, i) => ({
                itemIndex: i + 1,
                stem: item.stem.substring(0, 80) + (item.stem.length > 80 ? '...' : ''),
                trap: item.rationale!.questionTrap!,
                wasCorrect: scores[item.id] >= item.scoring.maxPoints,
            }));
    }, [answeredItems, scores]);

    const allMnemonics = useMemo((): CollectedMnemonic[] => {
        return answeredItems
            .filter(item => item.rationale?.mnemonic)
            .map((item, i) => ({
                itemIndex: i + 1,
                mnemonic: item.rationale!.mnemonic!,
                flipped: false,
            }));
    }, [answeredItems]);

    const toggleFlip = (idx: number) => {
        setFlippedCards(prev => {
            const next = new Set(prev);
            next.has(idx) ? next.delete(idx) : next.add(idx);
            return next;
        });
    };

    const totalCount = allPearls.length + allTraps.length + allMnemonics.length;

    return (
        <>
            {/* Floating Toggle Button */}
            <button
                className="sc-toggle"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle Study Companion"
            >
                <span className="sc-toggle-icon">📖</span>
                {totalCount > 0 && <span className="sc-badge">{totalCount}</span>}
            </button>

            {/* Drawer */}
            <div className={`sc-drawer ${isOpen ? 'sc-drawer--open' : ''}`}>
                <div className="sc-header">
                    <h3 className="sc-title">📖 Study Companion</h3>
                    <button className="sc-close" onClick={() => setIsOpen(false)}>✕</button>
                </div>

                {/* Tabs */}
                <div className="sc-tabs">
                    <button
                        className={`sc-tab ${activeTab === 'pearls' ? 'sc-tab--active' : ''}`}
                        onClick={() => setActiveTab('pearls')}
                    >
                        💎 Pearls
                        {allPearls.length > 0 && <span className="sc-count">{allPearls.length}</span>}
                    </button>
                    <button
                        className={`sc-tab ${activeTab === 'traps' ? 'sc-tab--active' : ''}`}
                        onClick={() => setActiveTab('traps')}
                    >
                        ⚠️ Traps
                        {allTraps.length > 0 && <span className="sc-count">{allTraps.length}</span>}
                    </button>
                    <button
                        className={`sc-tab ${activeTab === 'mnemonics' ? 'sc-tab--active' : ''}`}
                        onClick={() => setActiveTab('mnemonics')}
                    >
                        🧠 Mnemonics
                        {allMnemonics.length > 0 && <span className="sc-count">{allMnemonics.length}</span>}
                    </button>
                </div>

                {/* Content */}
                <div className="sc-content">
                    {totalCount === 0 && (
                        <div className="sc-empty">
                            <div className="sc-empty-icon">📝</div>
                            <p>Answer questions to build your study notes.</p>
                            <p className="sc-empty-sub">Pearls, traps, and mnemonics will appear here as you progress.</p>
                        </div>
                    )}

                    {/* Pearls Tab */}
                    {activeTab === 'pearls' && allPearls.length > 0 && (
                        <div className="sc-pearls-list">
                            {allPearls.map((p, i) => (
                                <div key={i} className="sc-pearl-card">
                                    <span className="sc-pearl-num">Q{p.itemIndex}</span>
                                    <p className="sc-pearl-text">{p.pearl}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Traps Tab */}
                    {activeTab === 'traps' && allTraps.length > 0 && (
                        <div className="sc-traps-list">
                            {allTraps.map((t, i) => (
                                <div key={i} className={`sc-trap-card ${t.wasCorrect ? 'sc-trap--avoided' : 'sc-trap--caught'}`}>
                                    <div className="sc-trap-verdict">
                                        <span className={`sc-trap-badge ${t.wasCorrect ? 'sc-trap-badge--ok' : 'sc-trap-badge--fail'}`}>
                                            {t.wasCorrect ? '✅ Avoided' : '❌ Caught'}
                                        </span>
                                        <span className="sc-trap-ref">Q{t.itemIndex}</span>
                                    </div>
                                    <div className="sc-trap-label">🚫 The Trap</div>
                                    <p className="sc-trap-text">{t.trap.trap}</p>
                                    <div className="sc-trap-label sc-trap-label--fix">✅ Strategy</div>
                                    <p className="sc-trap-text">{t.trap.howToOvercome}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Mnemonics Tab */}
                    {activeTab === 'mnemonics' && allMnemonics.length > 0 && (
                        <div className="sc-mnemonics-list">
                            <p className="sc-mnemonic-hint">Click a card to test your recall!</p>
                            {allMnemonics.map((m, i) => (
                                <div
                                    key={i}
                                    className={`sc-mnemonic-card ${flippedCards.has(i) ? 'sc-mnemonic--flipped' : ''}`}
                                    onClick={() => toggleFlip(i)}
                                >
                                    {!flippedCards.has(i) ? (
                                        <div className="sc-mnemonic-front">
                                            <div className="sc-mnemonic-title">{m.mnemonic.title}</div>
                                            <div className="sc-mnemonic-tap">tap to reveal</div>
                                        </div>
                                    ) : (
                                        <div className="sc-mnemonic-back">
                                            <div className="sc-mnemonic-title-sm">{m.mnemonic.title}</div>
                                            <div className="sc-mnemonic-expansion">{m.mnemonic.expansion}</div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <style>{studyCompanionStyles}</style>
        </>
    );
}

const studyCompanionStyles = `
    /* Toggle Button */
    .sc-toggle {
        position: fixed;
        bottom: 24px;
        right: 24px;
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background: var(--sidebar-bg);
        border: 2px solid var(--border);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        transition: all 0.3s;
        box-shadow: 0 4px 20px rgba(0,0,0,0.4);
    }
    .sc-toggle:hover {
        border-color: var(--primary);
        transform: scale(1.08);
        box-shadow: 0 4px 30px rgba(59, 130, 246, 0.3);
    }
    .sc-toggle-icon {
        font-size: 1.4rem;
    }
    .sc-badge {
        position: absolute;
        top: -4px;
        right: -4px;
        min-width: 20px;
        height: 20px;
        background: var(--primary);
        color: white;
        font-size: 0.65rem;
        font-weight: 800;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 5px;
    }

    /* Drawer */
    .sc-drawer {
        position: fixed;
        top: 0;
        right: -400px;
        width: 380px;
        height: 100vh;
        background: var(--bg);
        border-left: 1px solid var(--border);
        z-index: 999;
        display: flex;
        flex-direction: column;
        transition: right 0.35s cubic-bezier(0.22, 1, 0.36, 1);
        box-shadow: -8px 0 40px rgba(0,0,0,0.5);
    }
    .sc-drawer--open {
        right: 0;
    }

    .sc-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 20px;
        border-bottom: 1px solid var(--border);
        background: var(--sidebar-bg);
    }
    .sc-title {
        font-size: 1.1rem;
        font-weight: 900;
        color: var(--sidebar-text);
    }
    .sc-close {
        background: none;
        border: none;
        color: var(--muted-text);
        font-size: 1.1rem;
        cursor: pointer;
        padding: 4px 8px;
        border-radius: 4px;
        transition: all 0.2s;
    }
    .sc-close:hover {
        background: rgba(239, 68, 68, 0.1);
        color: #f87171;
    }

    /* Tabs */
    .sc-tabs {
        display: flex;
        border-bottom: 1px solid var(--border);
        background: var(--sidebar-bg);
    }
    .sc-tab {
        flex: 1;
        padding: 10px 8px;
        background: none;
        border: none;
        border-bottom: 2px solid transparent;
        color: var(--muted-text);
        font-size: 0.85rem;
        font-weight: 800;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 5px;
    }
    .sc-tab:hover { color: #94a3b8; }
    .sc-tab--active {
        color: var(--sidebar-text);
        border-bottom-color: var(--primary);
    }
    .sc-count {
        background: rgba(59, 130, 246, 0.15);
        color: #60a5fa;
        font-size: 0.6rem;
        font-weight: 800;
        padding: 1px 6px;
        border-radius: 8px;
    }

    /* Content */
    .sc-content {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
    }
    .sc-content::-webkit-scrollbar { width: 4px; }
    .sc-content::-webkit-scrollbar-track { background: transparent; }
    .sc-content::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

    /* Empty State */
    .sc-empty {
        text-align: center;
        padding: 48px 20px;
    }
    .sc-empty-icon {
        font-size: 2.5rem;
        margin-bottom: 16px;
        opacity: 0.5;
    }
    .sc-empty p {
        color: var(--text);
        font-size: 0.85rem;
        font-weight: 600;
    }
    .sc-empty-sub {
        color: #475569 !important;
        font-size: 0.75rem !important;
        margin-top: 8px;
    }

    /* Pearl Cards */
    .sc-pearls-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
    .sc-pearl-card {
        padding: 16px;
        background: rgba(245, 158, 11, 0.08);
        border: 2.5px solid rgba(245, 158, 11, 0.2);
        border-left: 5px solid #f59e0b;
        border-radius: 0 12px 12px 0;
        position: relative;
    }
    .sc-pearl-num {
        position: absolute;
        top: 8px;
        right: 8px;
        font-size: 0.6rem;
        font-weight: 800;
        color: #92400e;
        background: rgba(245, 158, 11, 0.1);
        padding: 1px 6px;
        border-radius: 4px;
    }
    .sc-pearl-text {
        font-size: 1.05rem;
        line-height: 1.6;
        color: var(--text);
        font-weight: 600;
        padding-right: 36px;
    }

    /* Trap Cards */
    .sc-traps-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }
    .sc-trap-card {
        padding: 14px;
        border-radius: 8px;
        border: 1px solid var(--border);
    }
    .sc-trap--avoided {
        border-color: rgba(var(--success-rgb), 0.2);
        background: rgba(var(--success-rgb), 0.02);
    }
    .sc-trap--caught {
        border-color: rgba(var(--error-rgb), 0.2);
        background: rgba(var(--error-rgb), 0.02);
    }
    .sc-trap-verdict {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
    }
    .sc-trap-badge {
        font-size: 0.7rem;
        font-weight: 800;
        padding: 3px 8px;
        border-radius: 4px;
    }
    .sc-trap-badge--ok {
        background: rgba(var(--success-rgb), 0.1);
        color: var(--success);
    }
    .sc-trap-badge--fail {
        background: rgba(var(--error-rgb), 0.1);
        color: var(--error);
    }
    .sc-trap-ref {
        font-size: 0.65rem;
        color: var(--muted-text);
        font-weight: 700;
    }
    .sc-trap-label {
        font-size: 0.75rem;
        font-weight: 950;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--error);
        margin-bottom: 6px;
    }
    .sc-trap-label--fix {
        color: var(--success);
        margin-top: 14px;
    }
    .sc-trap-text {
        font-size: 0.95rem;
        line-height: 1.6;
        color: var(--text);
        font-weight: 700;
    }

    /* Mnemonic Flashcards */
    .sc-mnemonics-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }
    .sc-mnemonic-hint {
        font-size: 0.7rem;
        color: #64748b;
        text-align: center;
        margin-bottom: 4px;
        font-style: italic;
    }
    .sc-mnemonic-card {
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.3s;
        border: 1px solid rgba(139, 92, 246, 0.2);
        overflow: hidden;
        min-height: 100px;
    }
    .sc-mnemonic-card:hover {
        border-color: rgba(139, 92, 246, 0.4);
        box-shadow: 0 0 20px rgba(139, 92, 246, 0.1);
    }
    .sc-mnemonic-front {
        padding: 24px 20px;
        text-align: center;
        background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.02));
    }
    .sc-mnemonic-title {
        font-size: 1.8rem;
        font-weight: 900;
        letter-spacing: 0.25em;
        color: #c4b5fd;
        text-shadow: 0 0 20px rgba(139, 92, 246, 0.4);
    }
    .sc-mnemonic-tap {
        font-size: 0.65rem;
        color: #7c3aed;
        margin-top: 8px;
        font-style: italic;
        text-transform: uppercase;
        letter-spacing: 0.1em;
    }
    .sc-mnemonic-back {
        padding: 24px;
        background: rgba(139, 92, 246, 0.1);
        animation: fadeInMnemonic 0.3s ease;
    }
    .sc-mnemonic-title-sm {
        font-size: 1.2rem;
        font-weight: 900;
        letter-spacing: 0.2em;
        color: var(--primary);
        margin-bottom: 12px;
    }
    .sc-mnemonic-expansion {
        font-size: 1.1rem;
        line-height: 1.7;
        color: var(--text);
        font-weight: 700;
    }
    @keyframes fadeInMnemonic {
        from { opacity: 0; transform: translateY(-4px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
