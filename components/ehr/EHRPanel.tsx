/**
 * NCLEX-RN NGN Clinical Simulator — Professional EHR Console
 * Tabbed clinical data viewer: SBAR Notes, Vitals, Labs, Physical Exam, Orders.
 * (c) 2024 Advanced Agentic Coding Team
 */

import { useState, useMemo, useEffect } from 'react';
import {
    ClinicalData, Patient, VitalSign, ImagingResult, SBARNote, LabResult
} from '../../types/master';
import { calculateMEWS, calculateMAP, flagLab, getVitalColor } from '../../engine/clinicalHelpers';

interface EHRPanelProps {
    patient: Patient;
    clinicalData: ClinicalData;
    administeredMeds: Record<string, any>;
    onAdministerMed: (medId: string, rights: string[], nurseName: string) => void;
    onTabChange?: (tab: string) => void;
}

type EHRTab = 'notes' | 'vitals' | 'labs' | 'physicalExam' | 'imaging' | 'orders' | 'mar';

const TAB_CONFIG: Record<EHRTab, { label: string; icon: string }> = {
    notes: { label: 'Clinical Feed', icon: '📝' },
    vitals: { label: 'Vitals & Telemetry', icon: '📊' },
    labs: { label: 'Lab Diagnostics', icon: '🧪' },
    physicalExam: { label: 'Physical Exam', icon: '🩺' },
    imaging: { label: 'Radiology', icon: '🩻' },
    orders: { label: 'Care Plan', icon: '📋' },
    mar: { label: 'MAR Console', icon: '💊' },
};

export default function EHRPanel({ patient, clinicalData, administeredMeds, onAdministerMed, onTabChange }: EHRPanelProps) {
    const visibleTabs = useMemo(() => {
        return (Object.keys(TAB_CONFIG) as EHRTab[]).filter(tabKey => {
            switch (tabKey) {
                case 'notes': return clinicalData.notes?.length > 0;
                case 'vitals': return clinicalData.vitals?.length > 0;
                case 'labs': return clinicalData.labs?.length > 0;
                case 'physicalExam': return clinicalData.physicalExam?.length > 0;
                case 'imaging': return clinicalData.imaging?.length > 0;
                case 'orders': return clinicalData.orders?.length > 0;
                case 'mar': return clinicalData.medications?.length > 0;
                default: return false;
            }
        });
    }, [clinicalData]);

    const [activeTab, setActiveTab] = useState<EHRTab>(visibleTabs[0] || 'notes');

    // Auto-switch away from hidden tabs if data changes
    useEffect(() => {
        if (visibleTabs.length > 0 && !visibleTabs.includes(activeTab)) {
            setActiveTab(visibleTabs[0]);
        }
    }, [visibleTabs, activeTab]);

    const handleTabChange = (tab: EHRTab) => {
        setActiveTab(tab);
        onTabChange?.(tab);
    };

    // Global latest stats
    const latestVital = useMemo(() => {
        if (!clinicalData.vitals || clinicalData.vitals.length === 0) return null;
        return clinicalData.vitals[clinicalData.vitals.length - 1];
    }, [clinicalData.vitals]);

    return (
        <div className="ehr-panel-v3">
            {/* Command Header: Patient Identity */}
            <header className="ehr-header">
                <div className="patient-brand">
                    <div className="avatar-shield">
                        <span className="avatar-icon">{patient.sex === 'F' ? '👩‍💼' : '👨‍💼'}</span>
                    </div>
                    <div className="patient-meta">
                        <h2 className="patient-name">{patient.name}</h2>
                        <div className="patient-pills">
                            <span className="pill age">{patient.age}Y • {patient.sex === 'F' ? 'Female' : 'Male'}</span>
                            <span className={`pill code ${patient.codeStatus.includes('DNR') ? 'dnr' : 'full'}`}>
                                {patient.codeStatus}
                            </span>
                            <span className="pill iso">Isolation: {patient.iso}</span>
                            {patient.allergies.length > 0 && (
                                <span className={`pill allergy ${patient.allergies.some(a => a.toLowerCase() !== 'none') ? 'glowing' : ''}`}>
                                    Allergy Alert: {patient.allergies.join(', ')}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Tactical Navigation: Only show what's relevant */}
            <nav className="ehr-nav" role="tablist">
                {visibleTabs.map(tab => (
                    <button
                        key={tab}
                        role="tab"
                        aria-selected={activeTab === tab}
                        className={`nav-btn ${activeTab === tab ? 'active' : ''}`}
                        onClick={() => handleTabChange(tab)}
                    >
                        <span className="tab-icon">{TAB_CONFIG[tab].icon}</span>
                        <span className="tab-label">{TAB_CONFIG[tab].label}</span>
                    </button>
                ))}
            </nav>

            {/* Content Matrix Area */}
            <main className="ehr-viewport">
                <div className="viewport-scroll">
                    <div className="viewport-content">
                        {activeTab === 'notes' && <NotesTab notes={clinicalData.notes} />}
                        {activeTab === 'vitals' && (
                            <div className="vitals-matrix-container">
                                {latestVital && <ClinicalStatusBar vital={latestVital} />}
                                <VitalsTab vitals={clinicalData.vitals} />
                            </div>
                        )}
                        {activeTab === 'labs' && <LabsTab labs={clinicalData.labs} />}
                        {activeTab === 'physicalExam' && <PhysicalExamTab exam={clinicalData.physicalExam} />}
                        {activeTab === 'imaging' && <ImagingTab imaging={clinicalData.imaging} />}
                        {activeTab === 'orders' && <OrdersTab orders={clinicalData.orders} />}
                        {activeTab === 'mar' && (
                            <MARTab
                                medications={clinicalData.medications}
                                administeredMeds={administeredMeds}
                                onAdminister={onAdministerMed}
                            />
                        )}
                    </div>
                </div>
            </main>

            <style>{`
                .ehr-panel-v3 {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    background: var(--bg-card);
                    color: var(--text);
                    overflow: hidden;
                    border-radius: 24px;
                    border: 1px solid var(--border);
                    box-shadow: 0 10px 40px rgba(0,0,0,0.2);
                    backdrop-filter: blur(10px);
                }

                /* Header: Premium Identity */
                .ehr-header {
                    padding: 24px 32px;
                    background: linear-gradient(135deg, rgba(var(--primary-rgb), 0.05), transparent);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid var(--border);
                }

                .patient-brand { display: flex; align-items: center; gap: 20px; }
                .avatar-shield {
                    width: 60px; height: 60px;
                    background: var(--panel-bg);
                    border-radius: 18px;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 2rem;
                    border: 1px solid var(--border);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                }

                .patient-name { font-size: 1.6rem; font-weight: 950; letter-spacing: -0.04em; color: var(--text); }
                .patient-pills { display: flex; gap: 8px; margin-top: 8px; align-items: center; }
                .pill {
                    padding: 6px 14px;
                    border-radius: 10px;
                    font-size: 0.65rem;
                    font-weight: 900;
                    text-transform: uppercase;
                    background: var(--bg);
                    border: 1.5px solid var(--border);
                    color: var(--text);
                    letter-spacing: 0.03em;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
                .pill.dnr { background: rgba(239, 68, 68, 0.1); color: var(--error); border-color: rgba(239, 68, 68, 0.3); }
                .pill.full { background: rgba(16, 185, 129, 0.1); color: var(--success); border-color: rgba(16, 185, 129, 0.3); }
                
                .pill.allergy { 
                    background: rgba(239,68,68,0.05); border-color: rgba(239,68,68,0.2); 
                    color: var(--muted-text);
                }
                .pill.allergy.glowing {
                    background: rgba(239, 68, 68, 0.15);
                    border-color: var(--error);
                    color: var(--error);
                    animation: alertGlow 2s infinite;
                    box-shadow: 0 0 10px rgba(239, 68, 68, 0.3);
                }
                @keyframes alertGlow { 0%, 100% { box-shadow: 0 0 5px var(--error); } 50% { box-shadow: 0 0 15px var(--error); } }

                /* Navigation: Tactical Grid - 2 Rows for Clinical Precision */
                .ehr-nav {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    background: var(--bg-card);
                    border-bottom: 2px solid var(--border);
                    gap: 1px;
                    background: var(--border); /* Grid lines */
                }
                .nav-btn {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 14px 4px;
                    background: var(--bg-card);
                    border: none;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                    overflow: hidden;
                }
                .nav-btn::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: var(--primary);
                    opacity: 0;
                    transition: opacity 0.3s;
                }
                .nav-btn:hover { background: var(--panel-bg); }
                .nav-btn.active { 
                    color: var(--primary); 
                    background: linear-gradient(to bottom, rgba(var(--primary-rgb), 0.08), transparent);
                }
                .nav-btn.active::after {
                    content: '';
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    height: 4px;
                    background: var(--primary);
                    box-shadow: 0 0 15px var(--primary-glow);
                }
                .tab-icon { 
                    font-size: 1.4rem; 
                    z-index: 1;
                    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
                    transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
                }
                .nav-btn.active .tab-icon { transform: scale(1.2) translateY(-2px); }
                .tab-label { 
                    font-size: 0.65rem; 
                    font-weight: 950; 
                    text-transform: uppercase; 
                    letter-spacing: 0.08em; 
                    color: var(--text);
                    line-height: 1.2;
                    text-align: center;
                    z-index: 1;
                    opacity: 0.8;
                }
                .nav-btn.active .tab-label { opacity: 1; color: var(--primary); }

                /* Viewport: Dynamic Content */
                .ehr-viewport { flex: 1; overflow: hidden; position: relative; }
                .viewport-scroll { height: 100%; overflow-y: auto; padding: 32px; scroll-behavior: smooth; }
                .viewport-scroll::-webkit-scrollbar { width: 6px; }
                .viewport-scroll::-webkit-scrollbar-thumb { background: var(--border); border-radius: 10px; }
                
                .viewport-content { animation: contentReveal 0.5s cubic-bezier(0.2, 0.8, 0.2, 1); }
                @keyframes contentReveal { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }

                /* Integrated Clinical Status */
                .vital-status-bar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px 28px;
                    border-radius: 16px;
                    margin-bottom: 28px;
                    font-family: 'JetBrains Mono', monospace;
                    box-shadow: 0 8px 20px rgba(0,0,0,0.1);
                    border: 2px solid transparent;
                }
                .vsb-left { display: flex; gap: 20px; align-items: center; }
                .vsb-right { display: flex; gap: 10px; align-items: center; }
                .vsb-label { font-weight: 900; font-size: 1.2rem; }
                .vsb-desc { font-weight: 700; font-size: 0.9rem; letter-spacing: 0.05em; }
                .vsb-map-label { opacity: 0.6; font-size: 0.8rem; font-weight: 800; }
                .vsb-map-val { font-weight: 900; font-size: 1.2rem; }

                .vsb--low { background: linear-gradient(135deg, rgba(var(--success-rgb), 0.15), rgba(var(--success-rgb), 0.05)); border: 1px solid rgba(var(--success-rgb), 0.5); color: var(--success); }
                .vsb--medium { background: linear-gradient(135deg, rgba(var(--warning-rgb), 0.15), rgba(var(--warning-rgb), 0.05)); border: 1px solid rgba(var(--warning-rgb), 0.5); color: var(--warning); }
                .vsb--high { 
                    background: linear-gradient(135deg, rgba(var(--error-rgb), 0.2), rgba(var(--error-rgb), 0.05)); 
                    border: 1px solid var(--error); 
                    color: var(--error); 
                    animation: riskPulse 2s infinite ease-in-out; 
                }
                @keyframes riskPulse { 0%, 100% { box-shadow: 0 0 15px rgba(var(--error-rgb), 0.4); } 50% { box-shadow: 0 0 30px rgba(var(--error-rgb), 0.6); } }

                .telemetry-val.red { color: var(--error); font-weight: 950; text-shadow: 0 0 8px rgba(var(--error-rgb), 0.3); }
                .telemetry-val.yellow { color: var(--warning); font-weight: 900; }
                .telemetry-val.green { color: var(--success); font-weight: 800; }

                /* Clinical Cards & Feed */
                .clinical-card {
                    background: var(--bg-card);
                    border-radius: 20px;
                    border: 1px solid var(--border);
                    margin-bottom: 24px;
                    overflow: hidden;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                    transition: transform 0.3s, border-color 0.3s;
                }
                .clinical-card:hover { transform: translateY(-3px); border-color: var(--primary); }
                
                .card-header {
                    padding: 16px 24px;
                    background: var(--panel-bg);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid var(--border);
                }
                .author-tag { display: flex; align-items: center; gap: 10px; font-weight: 750; font-size: 0.8rem; color: var(--primary); }
                .timestamp-tag { font-size: 0.75rem; color: var(--muted-text); font-family: 'JetBrains Mono', monospace; font-weight: 600; }

                .matrix-grid { display: grid; grid-template-columns: 140px 1fr; border-top: 1px solid var(--border); }
                .matrix-cell-label {
                    background: var(--panel-bg);
                    padding: 8px 16px;
                    font-size: 0.55rem;
                    font-weight: 950;
                    text-transform: uppercase;
                    color: var(--muted-text);
                    border-right: 1px solid var(--border);
                    border-bottom: 1px solid var(--border);
                    display: flex; align-items: flex-start;
                    letter-spacing: 0.1em;
                    opacity: 0.7;
                }
                .matrix-cell-value {
                    background: var(--bg-card);
                    padding: 8px 16px;
                    font-size: 0.85rem;
                    line-height: 1.5;
                    color: var(--text);
                    border-bottom: 1px solid var(--border);
                }
                .matrix-cell-value.strong { font-weight: 700; color: var(--primary); font-size: 0.95rem; }

                /* Data Matrix (Tables) */
                .data-surface { 
                    width: 100%; border-collapse: separate; border-spacing: 0; 
                    background: var(--bg-card); border-radius: 20px; overflow: hidden;
                    border: 1.5px solid var(--border);
                    box-shadow: 0 10px 30px rgba(0,0,0,0.05);
                }
                .data-surface th {
                    padding: 16px; background: var(--panel-bg); color: var(--muted-text);
                    font-size: 0.65rem; font-weight: 950; text-transform: uppercase; letter-spacing: 0.1em;
                    text-align: left; border-bottom: 2px solid var(--border);
                }
                .data-surface td { padding: 14px 16px; border-bottom: 1px solid var(--border); font-size: 0.95rem; }
                .data-surface tr:last-child td { border-bottom: none; }
                .data-surface tr:hover td { background: rgba(var(--primary-rgb), 0.03); }

                /* Status Pills */
                .telemetry-val { font-family: 'JetBrains Mono', monospace; font-weight: 850; font-size: 1rem; color: var(--primary); }
                .indicator-dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; margin-right: 8px; }
                .indicator-dot.danger { background: var(--error); box-shadow: 0 0 8px var(--error); }
                .indicator-dot.safe { background: var(--success); opacity: 0.4; }

                /* Modern Lab Grid */
                .lab-system-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px; }
                .lab-group-box { background: var(--bg-card); border-radius: 20px; border: 1px solid var(--border); overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,0.1); }
                .lab-group-header { padding: 14px 20px; background: var(--panel-bg); border-bottom: 1px solid var(--border); font-size: 0.75rem; font-weight: 900; text-transform: uppercase; color: var(--primary); letter-spacing: 0.05em; }

                /* Interactive Physical Grid */
                .exam-system-deck { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
                .exam-card-tactical {
                    display: flex; gap: 18px; padding: 20px;
                    background: var(--bg-card); border: 1.5px solid var(--border); border-radius: 20px;
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
                .exam-card-tactical:hover { 
                    transform: translateY(-5px) scale(1.02); 
                    border-color: var(--primary); 
                    box-shadow: 0 15px 30px rgba(0,0,0,0.15); 
                }
                .system-icon-shell { 
                    font-size: 2rem; width: 50px; height: 50px; 
                    display: flex; align-items: center; justify-content: center; 
                    background: var(--panel-bg); border-radius: 14px; border: 1px solid var(--border);
                }

                .mar-tactical-entry {
                    border: 1px solid var(--border); border-radius: 18px; padding: 20px;
                    display: flex; justify-content: space-between; align-items: center;
                    background: var(--bg-card); margin-bottom: 16px;
                    transition: border-color 0.3s, transform 0.3s;
                }
                .mar-tactical-entry:hover { border-color: var(--primary); transform: translateX(5px); }
                .mar-launch-btn {
                    padding: 10px 24px; background: var(--primary); color: white;
                    border: none; border-radius: 12px; font-size: 0.8rem; font-weight: 850;
                    cursor: pointer; box-shadow: 0 5px 15px rgba(var(--primary-rgb), 0.4);
                }
                
                .empty-viewport { 
                    padding: 80px; text-align: center; color: var(--muted-text); 
                    border: 2px dashed var(--border); border-radius: 24px; font-style: italic; 
                    font-size: 1.1rem; opacity: 0.6;
                }

                /* Mobile/Small Screen Accommodations */
                 @media (max-width: 800px) {
                    .matrix-grid { grid-template-columns: 1fr; }
                    .matrix-cell-label { border-right: none; padding: 8px 20px; }
                 }
            `}</style>
        </div>
    );
}

// ─── Sub-Components ──────────────────────────────────────

function NotesTab({ notes }: { notes: SBARNote[] }) {
    if (!notes || notes.length === 0) return <div className="empty-viewport">No clinical reports filed for this patient.</div>;
    return (
        <div className="feed-container">
            {notes.map((note, i) => (
                <div key={i} className="clinical-card" style={{ animationDelay: `${i * 0.15}s` }}>
                    <div className="card-header" style={{ padding: '12px 20px' }}>
                        <div className="author-tag">🧑‍⚕️ {note.author} <span style={{ opacity: 0.6 }}>• {note.authorRole || 'RN'}</span></div>
                        <div className="timestamp-tag">{note.timestamp.includes(':') && !note.timestamp.includes('-') ? note.timestamp : new Date(note.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</div>
                    </div>
                    <div className="matrix-grid">
                        <div className="matrix-cell-label">Situation</div>
                        <div className="matrix-cell-value strong">{note.situation}</div>
                        <div className="matrix-cell-label">Background</div>
                        <div className="matrix-cell-value">{note.background}</div>
                        <div className="matrix-cell-label">Assessment</div>
                        <div className="matrix-cell-value">{note.assessment}</div>
                        <div className="matrix-cell-label">Request</div>
                        <div className="matrix-cell-value">{note.recommendation}</div>
                    </div>
                </div>
            ))}
        </div>
    );
}

function VitalsTab({ vitals }: { vitals: VitalSign[] }) {
    const data = useMemo(() => {
        if (!vitals) return [];
        return [...vitals].map(v => ({
            v, mews: calculateMEWS(v), colors: getVitalColor(v)
        }));
    }, [vitals]);

    if (!vitals || vitals.length === 0) return <div className="empty-viewport">Awaiting initial biometric telemetry.</div>;

    return (
        <div style={{ overflowX: 'auto', borderRadius: '20px' }}>
            <table className="data-surface">
                <thead>
                    <tr>
                        <th style={{ width: '120px' }}>Entry Time</th>
                        <th>HR</th>
                        <th>BP (mmHg)</th>
                        <th>RR</th>
                        <th>Temp</th>
                        <th>SpO₂</th>
                        <th>Pain</th>
                        <th>MEWS</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, i) => {
                        // Fix for HH:mm time format
                        let formattedTime = row.v.time;
                        if (row.v.time.length === 5 && row.v.time.includes(':')) {
                            formattedTime = row.v.time;
                        } else {
                            const date = new Date(row.v.time);
                            formattedTime = isNaN(date.getTime()) ? row.v.time : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        }

                        return (
                            <tr key={i}>
                                <td className="timestamp-tag" style={{ color: 'var(--primary)', fontWeight: 800 }}>{formattedTime}</td>
                                <td className={`telemetry-val ${row.colors.hr}`}>{row.v.hr}</td>
                                <td className={`telemetry-val ${row.colors.sbp}`}>{row.v.sbp}/{row.v.dbp}</td>
                                <td className={`telemetry-val ${row.colors.rr}`}>{row.v.rr}</td>
                                <td className={`telemetry-val ${row.colors.temp}`}>
                                    <div>{row.v.temp}°F</div>
                                    <div style={{ fontSize: '0.65rem', opacity: 0.6 }}>({((row.v.temp - 32) * 5 / 9).toFixed(1)}°C)</div>
                                </td>
                                <td className={`telemetry-val ${row.colors.spo2}`}>
                                    <div>{row.v.spo2}%</div>
                                    {row.v.spo2Source && <div style={{ fontSize: '0.65rem', opacity: 0.6, textTransform: 'uppercase' }}>{row.v.spo2Source}</div>}
                                </td>
                                <td className="telemetry-val" style={{ fontWeight: 700 }}>{row.v.pain}/10</td>
                                <td>
                                    <span className={`mews-badge ${row.mews >= 5 ? 'v-danger' : row.mews >= 3 ? 'v-warning' : 'v-success'}`}>
                                        {row.mews}
                                    </span>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

function LabsTab({ labs }: { labs: LabResult[] }) {
    if (!labs || labs.length === 0) return <div className="empty-viewport">Diagnostic results pending laboratory verification.</div>;

    const categorized = {
        'Hematic Profile': labs.filter(l => ['hemoglobin', 'platelets', 'wbc', 'hct', 'inr'].some(k => l.name.toLowerCase().includes(k))),
        'Metabolic Panel': labs.filter(l => ['sodium', 'potassium', 'glucose', 'bun', 'creatinine', 'calcium'].some(k => l.name.toLowerCase().includes(k))),
        'Cardiac Markers': labs.filter(l => ['troponin', 'bnp', 'ck-mb'].some(k => l.name.toLowerCase().includes(k))),
        'Enzymes & Other': labs.filter(l => !['hemoglobin', 'platelets', 'wbc', 'hct', 'inr', 'sodium', 'potassium', 'glucose', 'bun', 'creatinine', 'calcium', 'troponin', 'bnp', 'ck-mb'].some(k => l.name.toLowerCase().includes(k)))
    };

    return (
        <div className="lab-system-grid">
            {Object.entries(categorized).map(([cat, items]) => items.length > 0 && (
                <div key={cat} className="lab-group-box">
                    <header className="lab-group-header">{cat}</header>
                    <table className="data-surface" style={{ border: 'none' }}>
                        <tbody>
                            {items.map((lab, i) => (
                                <tr key={i}>
                                    <td style={{ fontWeight: 700, fontSize: '0.85rem' }}>{lab.name}</td>
                                    <td className="telemetry-val" style={{ textAlign: 'right' }}>
                                        {lab.value} <span style={{ fontSize: '0.65rem', opacity: 0.5 }}>{lab.unit}</span>
                                    </td>
                                    <td style={{ width: '40px' }}>
                                        <span className={`lab-badge lab-badge--${flagLab(lab)}`}>{flagLab(lab)}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ))}
        </div>
    );
}

function PhysicalExamTab({ exam }: { exam: any[] }) {
    if (!exam || exam.length === 0) return <div className="empty-viewport">Comprehensive physical assessment required.</div>;

    const SYSTEM_MAP: Record<string, string> = {
        'Respiratory': '🫁', 'Cardiovascular': '🫀', 'Neurological': '🧠',
        'Gastrointestinal': '🍕', 'Integumentary': '🧤', 'Musculoskeletal': '🦴',
        'Genitourinary': '💧', 'General': '👤'
    };

    return (
        <div className="exam-system-deck">
            {exam.map((finding, i) => (
                <div key={i} className="exam-card-tactical">
                    <div className="system-icon-shell">{SYSTEM_MAP[finding.system] || '🩺'}</div>
                    <div className="card-tactical-info">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                            <span className={`indicator-dot ${finding.isAbnormal ? 'danger' : 'safe'}`} />
                            <span style={{ fontSize: '0.75rem', fontWeight: 950, textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '0.05em' }}>
                                {finding.system}
                            </span>
                        </div>
                        <p style={{ fontSize: '1rem', color: 'var(--text)', lineHeight: 1.5, fontWeight: 500 }}>{finding.findings}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}

function ImagingTab({ imaging }: { imaging: ImagingResult[] }) {
    if (!imaging || imaging.length === 0) return <div className="empty-viewport">No radiology images currently available in system.</div>;
    return (
        <div className="imaging-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24 }}>
            {imaging.map((study, i) => (
                <div key={i} className="clinical-card">
                    <div className="card-header">
                        <div className="author-tag">☢️ {study.type}</div>
                        <span className="pill" style={{ background: 'var(--primary)', color: 'white', borderColor: 'transparent' }}>{study.status}</span>
                    </div>
                    <div style={{ padding: 24 }}>
                        <label style={{ fontSize: '0.65rem', fontWeight: 950, color: 'var(--muted-text)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Clinical Impression</label>
                        <div style={{ fontSize: '1.2rem', fontWeight: 850, color: 'var(--primary)', marginTop: 4 }}>{study.impression}</div>
                        <div style={{ height: '1px', background: 'var(--border)', margin: '16px 0' }} />
                        <p style={{ fontSize: '0.95rem', opacity: 0.9, lineHeight: 1.6 }}>{study.findings}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}

function OrdersTab({ orders }: { orders: any[] }) {
    if (!orders || orders.length === 0) return <div className="empty-viewport">No clinical orders found in the treatment plan.</div>;

    const groupedOrders = {
        'Immediate Action (STAT)': orders.filter(o => o.priority === 'stat' || o.priority === 'urgent'),
        'Scheduled Interventions': orders.filter(o => o.priority === 'routine' || !o.priority),
        'As Needed (PRN)': orders.filter(o => o.priority === 'prn' || o.priority === 'standing')
    };

    return (
        <div className="lab-system-grid">
            {Object.entries(groupedOrders).map(([level, items]) => items.length > 0 && (
                <div key={level} className="lab-group-box">
                    <header className="lab-group-header" style={{ color: level.includes('STAT') ? 'var(--error)' : 'var(--primary)' }}>{level}</header>
                    <div style={{ padding: '0 20px' }}>
                        {items.map((order, i) => (
                            <div key={i} style={{ padding: '16px 0', borderBottom: i < items.length - 1 ? '1px solid var(--border)' : 'none' }}>
                                <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text)' }}>{order.description}</div>
                                <div style={{ display: 'flex', gap: 12, marginTop: 4, fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', opacity: 0.6 }}>
                                    <span>{order.type}</span>
                                    <span>•</span>
                                    <span>{order.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

function ClinicalStatusBar({ vital }: { vital: VitalSign }) {
    const mews = calculateMEWS(vital);
    const map = calculateMAP(vital.sbp, vital.dbp);
    const risk = mews >= 5 ? 'SYSTEMIC COLLAPSE RISK' : mews >= 3 ? 'MODEREATE DECOMPENSATION' : 'PHYSIOLOGICAL EQUILIBRIUM';
    const statusClass = mews >= 5 ? 'high' : mews >= 3 ? 'medium' : 'low';

    return (
        <div className={`vital-status-bar vsb--${statusClass}`}>
            <div className="vsb-left">
                <span className="vsb-label">MEWS SCORE: {mews}</span>
                <span className="vsb-desc">STATUS: {risk}</span>
            </div>
            <div className="vsb-right">
                <span className="vsb-map-label">ARTERIAL MEAN (MAP):</span>
                <span className="vsb-map-val">{map} <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>mmHg</span></span>
            </div>
        </div>
    );
}

function MARTab({ medications, administeredMeds, onAdminister }: any) {
    const [selectedMedId, setSelectedMedId] = useState<string | null>(null);
    if (!medications) return <div className="empty-viewport">No medications currently active.</div>;
    const activeMed = medications.find((m: any) => m.id === selectedMedId);

    return (
        <div className="mar-surface">
            {medications.map((med: any) => {
                const admin = administeredMeds[med.id];
                return (
                    <div key={med.id} className="mar-tactical-entry">
                        <div className="med-details">
                            <div style={{ fontWeight: 900, fontSize: '1.2rem', color: 'var(--primary)' }}>{med.name}</div>
                            <div className="telemetry-val" style={{ fontSize: '0.85rem', marginTop: 4 }}>
                                {med.dose} {med.route} • {med.frequency}
                            </div>
                            {med.indication && (
                                <div style={{ fontSize: '0.75rem', marginTop: 8, opacity: 0.7, fontStyle: 'italic' }}>
                                    Indication: {med.indication}
                                </div>
                            )}
                        </div>
                        <div className="med-actions">
                            {admin ? (
                                <div style={{ textAlign: 'right' }}>
                                    <span className="pill full">✓ Digitally Signed</span>
                                    <div className="timestamp-tag" style={{ marginTop: 6 }}>{new Date(admin.timestamp).toLocaleTimeString()}</div>
                                </div>
                            ) : (
                                <button className="mar-launch-btn" onClick={() => setSelectedMedId(med.id)}>Verify Rights</button>
                            )}
                        </div>
                    </div>
                );
            })}
            {activeMed && (
                <MedicationModal
                    med={activeMed}
                    onClose={() => setSelectedMedId(null)}
                    onConfirm={(rights: string[]) => {
                        onAdminister(activeMed.id, rights, 'Clinician Student');
                        setSelectedMedId(null);
                    }}
                />
            )}
        </div>
    );
}

const FIFTEEN_RIGHTS = ['Right Patient', 'Right Medication', 'Right Dose', 'Right Route', 'Right Time', 'Right Documentation', 'Right Reason', 'Right Response', 'Right Form', 'Right to Refuse', 'Right Education', 'Right Assessment', 'Right Evaluation', 'Right Expiry', 'Right Compatibility'];

function MedicationModal({ med, onClose, onConfirm }: any) {
    const [checked, setChecked] = useState<string[]>([]);
    const toggle = (r: string) => setChecked(c => c.includes(r) ? c.filter(x => x !== r) : [...c, r]);

    return (
        <div className="med-modal-overlay">
            <div className="med-modal">
                <header className="mm-header">
                    <div style={{ fontSize: '0.7rem', fontWeight: 950, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Pharmacological Safety Protocol</div>
                    <div className="patient-name" style={{ fontSize: '1.8rem', marginTop: 10 }}>{med.name}</div>
                    <div className="telemetry-val" style={{ fontSize: '1rem', marginTop: 5 }}>{med.dose} {med.route} {med.frequency}</div>
                </header>
                <div className="mm-body">
                    <div className="rights-grid">
                        {FIFTEEN_RIGHTS.map(right => (
                            <div key={right} className={`right-item ${checked.includes(right) ? 'checked' : ''}`} onClick={() => toggle(right)}>
                                <span className="check-box">{checked.includes(right) ? '✓' : ''}</span>
                                {right}
                            </div>
                        ))}
                    </div>
                </div>
                <footer className="mm-footer">
                    <button className="mar-launch-btn" style={{ background: 'var(--panel-bg)', color: 'var(--text)', boxShadow: 'none' }} onClick={onClose}>Abort Intervention</button>
                    <button className="mar-launch-btn" disabled={checked.length < 15} onClick={() => onConfirm(checked)}>
                        Commit Sign-off ({checked.length}/15)
                    </button>
                </footer>
            </div>
            <style>{`
                .check-box { 
                    width: 20px; height: 20px; border: 2px solid var(--border); border-radius: 6px; 
                    display: flex; align-items: center; justify-content: center; font-weight: 900; 
                    background: var(--bg);
                }
                .right-item.checked .check-box { background: var(--success); border-color: var(--success); color: white; }
            `}</style>
        </div>
    );
}
