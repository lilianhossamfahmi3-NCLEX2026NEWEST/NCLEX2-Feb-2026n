import { useMemo, useState, useCallback, useEffect } from 'react';
import EHRPanel from './components/ehr/EHRPanel';
import QuestionRenderer from './components/questions/QuestionRenderer';
import ExpertHUD from './components/hud/ExpertHUD';
import StudyCompanion from './components/study/StudyCompanion';
import { useSession } from './hooks/useSession';
import { useAudit } from './hooks/useAudit';
import { CaseStudy } from './types/master';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { StudentDashboard } from './components/dashboard/StudentDashboard';
import { SocraticAssistant } from './components/ai/SocraticAssistant';
import StudentPortal from './components/navigation/StudentPortal';
import ModeSelector from './components/navigation/ModeSelector';
import HomeScreen from './components/navigation/HomeScreen';
import AIBankPage from './components/navigation/AIBankPage';
import { getCaseStudyLibrary, getStandaloneNGNItemsAsync, wrapStandalone } from './services/caseStudyLibrary';
import { MasterItem } from './types/master';
import AnalyticsDashboard from './components/dashboard/AnalyticsDashboard';

/**
 * NCLEX-RN NGN Clinical Simulator — Professional Console
 * (c) 2024 Advanced Agentic Coding Team
 */

// Initialized inside App

function Simulator({ caseStudy, onExit, theme, onToggleTheme }: { caseStudy: CaseStudy; onExit: (state: any, score: number) => void; theme: 'light' | 'dark'; onToggleTheme: () => void }) {
  const { state, currentItem, progress, passProbability, submitAnswer, nextItem, completeSession, administerMed } = useSession(caseStudy);
  const { record, getSessionLog } = useAudit(state.id);
  // --- Timer Logic ---
  const [timeLeft, setTimeLeft] = useState(3600); // 60 minutes
  useEffect(() => {
    if (state.status !== 'active') return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          completeSession();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [state.status, completeSession]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // --- Resizable Panel Logic ---
  const [isResizing, setIsResizing] = useState(false);
  const [ehrWidth, setEhrWidth] = useState(546);

  const startResizing = useCallback(() => setIsResizing(true), []);
  const stopResizing = useCallback(() => setIsResizing(false), []);

  const resize = useCallback((e: MouseEvent) => {
    if (isResizing) {
      const newWidth = e.clientX;
      if (newWidth > 320 && newWidth < 900) setEhrWidth(newWidth);
    }
  }, [isResizing]);

  useEffect(() => {
    window.addEventListener('mousemove', resize);
    window.addEventListener('mouseup', stopResizing);
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [resize, stopResizing]);

  if (state.status === 'completed') {
    return (
      <StudentDashboard
        session={state}
        passProbability={passProbability}
        onExit={() => onExit(state, passProbability)}
      />
    );
  }

  return (
    <div className="console-shell" style={{ cursor: isResizing ? 'col-resize' : 'default' }}>
      <header className="console-header">
        <div className="brand">
          <div className="logo" onClick={() => onExit(state, 0)} style={{ cursor: 'pointer' }}>NGN</div>
          <div className="brand-text">
            <span className="system">Clinical Intelligence Console </span>
            <span className="case">Patient: {caseStudy.patient.name}</span>
          </div>
        </div>

        <div className="global-metrics">
          <div className="metric">
            <span className="m-label">Diagnostic Progress</span>
            <div className="m-bar"><div className="m-fill" style={{ width: `${progress}%` }} /></div>
          </div>
          <div className="metric">
            <span className="m-label">Item status</span>
            <span className="m-val">{state.currentItemIndex + 1} / {caseStudy.items.length}</span>
          </div>
          <div className="metric timer-metric">
            <span className="m-label">Clinical Time Remaining</span>
            <span className={`m-val ${timeLeft < 300 ? 'timer-warning' : ''}`}>{formatTime(timeLeft)}</span>
          </div>
          <div className="session-tag">Live Session</div>
          <button className="theme-toggle" onClick={onToggleTheme}>
            {theme === 'dark' ? '🌙 Wellness Mode' : '☀️ Clinical Mode'}
          </button>
        </div>
      </header>

      <main className="console-matrix">
        <aside className="gate-panel evidence-gate" style={{ width: ehrWidth }}>
          <EHRPanel
            patient={caseStudy.patient}
            clinicalData={caseStudy.clinicalData}
            administeredMeds={state.administeredMeds}
            onAdministerMed={administerMed}
            onTabChange={(tab) => record('tabChange', tab, currentItem.id)}
          />
        </aside>
        <div className="resize-handle" onMouseDown={startResizing} />
        <section className="gate-panel reasoning-gate">
          <div className="scroll-content">
            <QuestionRenderer
              item={currentItem}
              onSubmit={(id, ans) => {
                submitAnswer(id, ans);
                record('submit', id, id, { ans });
              }}
              isSubmitted={state.scores[currentItem.id] !== undefined}
              earnedScore={state.scores[currentItem.id]}
              userAnswer={state.answers[currentItem.id]}
            />
          </div>
          <footer className="action-footer">
            <div className="hint-text">Analyze clinical cues before proceeding.</div>
            <div className="actions">
              {state.currentItemIndex >= caseStudy.items.length - 1 ? (
                <button className="btn-action btn-complete" onClick={completeSession} disabled={state.scores[currentItem.id] === undefined}>
                  Finalize Case →
                </button>
              ) : (
                <button className="btn-action btn-next" onClick={nextItem} disabled={state.scores[currentItem.id] === undefined}>
                  Continue Evaluation →
                </button>
              )}
            </div>
          </footer>
        </section>
        <aside className="gate-panel hud-gate">
          <ExpertHUD session={state} passProbability={passProbability} progress={progress} />
        </aside>
      </main>

      <StudyCompanion items={caseStudy.items} scores={state.scores} />
      <SocraticAssistant stressState={state.stressState} currentItem={currentItem} administeredMeds={state.administeredMeds} auditEntries={getSessionLog()} />

    </div>
  );
}

export default function App() {
  const LIBRARY = useMemo(() => {
    try {
      return getCaseStudyLibrary();
    } catch (e) {
      console.error("Critical: Failed to load case library:", e);
      return [];
    }
  }, []);

  const [view, setView] = useState<'portal' | 'simulator' | 'analytics' | 'library' | 'mode-selection' | 'ai-bank'>('portal');
  const [viewStack, setViewStack] = useState<string[]>(['portal']);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('nclex_history');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error("Failed to parse history from localStorage:", e);
      return [];
    }
  });
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [vault, setVault] = useState<MasterItem[]>([]);

  // Load vault when needed (Bank or Deep Link)
  const preloadVault = useCallback(async () => {
    if (vault.length > 0) return;
    const items = await getStandaloneNGNItemsAsync();
    setVault(items);
  }, [vault.length]);

  useEffect(() => {
    if (view === 'ai-bank' || view === 'library' || (selectedCaseId && selectedCaseId.startsWith('standalone:'))) {
      preloadVault();
    }
  }, [view, selectedCaseId, preloadVault]);

  // Deep linking via Hash
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/item/')) {
        const itemId = hash.replace('#/item/', '');
        setSelectedCaseId(`standalone:${itemId}`);
        setView('simulator');
      } else if (hash === '#/bank') {
        setView('ai-bank');
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const navigateTo = useCallback((newView: any) => {
    setViewStack(prev => [...prev, newView]);
    setView(newView);
  }, []);

  const goBack = useCallback(() => {
    if (viewStack.length > 1) {
      const prevStack = [...viewStack];
      prevStack.pop();
      const lastView = prevStack[prevStack.length - 1];
      setViewStack(prevStack);
      setView(lastView as any);
    } else {
      setView('portal');
    }
  }, [viewStack]);

  const goHome = useCallback(() => {
    setView('portal');
    setViewStack(['portal']);
    setSelectedCaseId(null);
  }, []);

  const selectedCase = useMemo(() => {
    if (selectedCaseId?.startsWith('standalone:')) {
      const itemId = selectedCaseId.replace('standalone:', '');
      const item = vault.find(i => i.id === itemId);
      return item ? wrapStandalone(item) : (LIBRARY[0] || {} as CaseStudy);
    }
    return LIBRARY.find(c => c.id === selectedCaseId) || (LIBRARY[0] || {} as CaseStudy);
  }, [selectedCaseId, LIBRARY, vault]);

  const startCase = (id: string) => {
    if (id === 'ai-bank-view') {
      navigateTo('ai-bank');
      return;
    }
    setSelectedCaseId(id);
    navigateTo('mode-selection');
  };

  const handleStartMode = (mode: string) => {
    if (mode === 'case-library') navigateTo('library');
    else if (mode === 'analytics') navigateTo('analytics');
    else if (mode === 'cat') {
      const randomCase = LIBRARY[Math.floor(Math.random() * LIBRARY.length)];
      setSelectedCaseId(randomCase.id);
      navigateTo('simulator');
    }
    else {
      alert("This mode is part of the premium NGN expansion. Implementation in progress.");
    }
  };

  const handleExit = (session: any, score: number) => {
    if (score > 0) {
      const newEntry = {
        id: session.id,
        title: session.caseStudy.title,
        score,
        cjmmProfile: session.cjmmProfile,
        date: new Date().toISOString(),
        duration: (new Date().getTime() - new Date(session.startTime).getTime()) / 1000
      };

      const newHistory = [newEntry, ...history].slice(0, 10);
      setHistory(newHistory);
      localStorage.setItem('nclex_history', JSON.stringify(newHistory));

      // Update Mastery
      const savedMastery = localStorage.getItem('nclex_mastery');
      const mastery = savedMastery ? JSON.parse(savedMastery) : {};

      session.caseStudy.items.forEach((item: any) => {
        const itemScore = session.scores[item.id] || 0;
        const maxPoints = item.scoring?.maxPoints ?? 1;
        const isPerfect = itemScore >= maxPoints;

        if (!mastery[item.id]) mastery[item.id] = { correct: 0, total: 0, lastSeen: '' };
        mastery[item.id].total++;
        if (isPerfect) mastery[item.id].correct++;
        mastery[item.id].lastSeen = new Date().toISOString();
      });
      localStorage.setItem('nclex_mastery', JSON.stringify(mastery));
    }
    setView('portal');
    setSelectedCaseId(null);
  };

  useEffect(() => {
    document.body.className = theme === 'dark' ? 'dark' : '';
  }, [theme]);

  return (
    <ErrorBoundary>
      {view !== 'portal' && (
        <div className="global-nav-bar">
          <button className="nav-ctrl-btn" onClick={goHome} title="Return to Dashboard">
            <span className="nav-icon">🏠</span> Home
          </button>
          <div className="nav-divider" />
          <button className="nav-ctrl-btn" onClick={goBack} title="Go Back">
            <span className="nav-icon">←</span> Back
          </button>
          <div className="nav-divider" />
          <button className="nav-ctrl-btn theme-btn" onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} title="Toggle Light/Dark Mode">
            <span className="nav-icon">{theme === 'dark' ? '🌙' : '☀️'}</span> {theme === 'dark' ? 'Wellness' : 'Clinical'}
          </button>
        </div>
      )}

      {view === 'portal' ? (
        <StudentPortal
          library={LIBRARY}
          history={history}
          onStartMode={handleStartMode}
          onViewAnalytics={() => navigateTo('analytics')}
          theme={theme}
          onToggleTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
        />
      ) : view === 'library' ? (
        <HomeScreen
          library={LIBRARY}
          standaloneItems={vault}
          onSelectCase={startCase}
          onViewAnalytics={() => navigateTo('analytics')}
          history={history}
          theme={theme}
          onToggleTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
        />
      ) : view === 'mode-selection' ? (
        <ModeSelector
          onSelect={() => navigateTo('simulator')}
          onCancel={goBack}
        />
      ) : view === 'analytics' ? (
        <AnalyticsDashboard
          history={history}
          onExit={goHome}
          theme={theme}
        />
      ) : view === 'ai-bank' ? (
        <AIBankPage
          onExit={goBack}
          onSelectItem={(id) => {
            setSelectedCaseId(`standalone:${id}`);
            navigateTo('simulator');
          }}
          theme={theme}
          onToggleTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
        />
      ) : (
        <Simulator
          caseStudy={selectedCase}
          onExit={handleExit}
          theme={theme}
          onToggleTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
        />
      )}
      <style>{consoleStyles}</style>
    </ErrorBoundary>
  );
}

const consoleStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;700&display=swap');

  :root {
    --bg: #F8FAFC;
    --bg-card: #FFFFFF;
    --text: #0F172A;
    --muted-text: #64748B;
    --primary: #2563EB;
    --primary-rgb: 37, 99, 235;
    --primary-glow: rgba(37, 99, 235, 0.4);
    --secondary: #8B5CF6;
    --secondary-rgb: 139, 92, 246;
    --success: #10B981;
    --success-rgb: 16, 185, 129;
    --error: #EF4444;
    --error-rgb: 239, 68, 68;
    --warning: #F59E0B;
    --warning-rgb: 245, 158, 11;
    --border: #E2E8F0;
    --header-bg: #FFFFFF;
    --header-text: #0F172A;
    --panel-bg: #F1F5F9;
    --panel-bg-rgb: 241, 245, 249;
  }

  .dark {
    --bg: #030712;
    --bg-card: #111827;
    --text: #F8FAFC;
    --muted-text: #94A3B8;
    --primary: #3B82F6;
    --primary-rgb: 59, 130, 246;
    --primary-glow: rgba(59, 130, 246, 0.5);
    --secondary: #A78BFA;
    --secondary-rgb: 167, 139, 250;
    --success: #34D399;
    --success-rgb: 52, 211, 153;
    --error: #F87171;
    --error-rgb: 248, 113, 113;
    --warning: #FBBF24;
    --warning-rgb: 251, 191, 36;
    --border: #1F2937;
    --header-bg: rgba(17, 24, 39, 0.8);
    --header-text: #F8FAFC;
    --panel-bg: #0F172A;
    --panel-bg-rgb: 15, 23, 42;
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }
  
  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'Inter', system-ui, sans-serif;
    overflow-x: hidden;
    transition: background 0.4s ease, color 0.4s ease;
    -webkit-font-smoothing: antialiased;
    padding-top: 0;
  }

  .global-nav-bar {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 9999;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px;
    background: rgba(var(--panel-bg-rgb, 15, 23, 42), 0.8);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 100px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3), 0 0 20px rgba(var(--primary-rgb), 0.2);
    animation: navFloat 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
  }

  @keyframes navFloat { from { top: -60px; opacity: 0; } to { top: 20px; opacity: 1; } }

  .nav-ctrl-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    background: transparent;
    border: none;
    color: white;
    font-size: 0.8rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: 8px 16px;
    border-radius: 100px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .nav-ctrl-btn:hover {
    background: rgba(255,255,255,0.1);
    color: var(--primary);
  }

  .nav-divider {
    width: 1px;
    height: 20px;
    background: rgba(255,255,255,0.1);
  }

  .nav-icon { font-size: 1rem; }

  .console-shell {
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 100vw;
  }

  .console-header {
    height: 72px;
    background: var(--header-bg);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 32px;
    flex-shrink: 0;
    z-index: 100;
  }

  .brand { display: flex; align-items: center; gap: 20px; transition: transform 0.2s; }
  .brand:hover { transform: scale(1.02); }
  
  .logo {
    width: 44px; height: 44px;
    background: linear-gradient(135deg, var(--primary), var(--secondary));
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-weight: 900; color: white;
    box-shadow: 0 0 25px var(--primary-glow);
    font-size: 1.1rem;
    letter-spacing: -0.02em;
  }

  .brand-text { display: flex; flex-direction: column; }
  .system { font-size: 0.65rem; font-weight: 800; text-transform: uppercase; color: var(--muted-text); letter-spacing: 0.1em; }
  .case { font-size: 1rem; font-weight: 700; color: var(--header-text); }

  .global-metrics { display: flex; align-items: center; gap: 32px; }
  
  .metric { display: flex; flex-direction: column; gap: 4px; }
  .m-label { font-size: 0.6rem; color: var(--muted-text); text-transform: uppercase; font-weight: 800; letter-spacing: 0.08em; }
  .m-val { font-family: 'JetBrains Mono', monospace; font-size: 0.9rem; font-weight: 700; color: var(--primary); }
  
  .m-bar { width: 140px; height: 6px; background: var(--border); border-radius: 100px; overflow: hidden; }
  .m-fill { height: 100%; background: linear-gradient(90deg, var(--primary), var(--secondary)); border-radius: 100px; transition: width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1); }
  
  .session-tag {
    padding: 6px 14px;
    background: rgba(16, 185, 129, 0.1);
    border: 1px solid rgba(16, 185, 129, 0.2);
    border-radius: 100px;
    color: var(--success);
    font-size: 0.7rem;
    font-weight: 800;
    text-transform: uppercase;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .session-tag::before { content: ''; width: 6px; height: 6px; background: var(--success); border-radius: 50%; box-shadow: 0 0 10px var(--success); }

  .theme-toggle {
    padding: 8px 16px;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 10px;
    color: var(--text);
    font-size: 0.75rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    align-items: center;
    gap: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  }
  .theme-toggle:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0,0,0,0.1);
    border-color: var(--primary);
  }

  .console-matrix {
    flex: 1;
    display: flex;
    overflow: hidden;
    background: var(--bg);
  }

  .gate-panel {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transition: width 0.3s ease;
  }

  .evidence-gate {
    background: var(--panel-bg);
    border-right: 1px solid var(--border);
    padding: 20px;
  }

  .resize-handle {
    width: 2px;
    background: var(--border);
    cursor: col-resize;
    position: relative;
    z-index: 10;
    transition: all 0.2s;
  }
  .resize-handle:hover, .resize-handle:active {
    width: 6px;
    background: var(--primary);
    box-shadow: 0 0 15px var(--primary-glow);
  }

  .reasoning-gate {
    flex: 1;
    background: var(--bg-card);
    display: flex;
    flex-direction: column;
    box-shadow: inset 0 0 40px rgba(0,0,0,0.02);
  }

  .scroll-content {
    flex: 1;
    overflow-y: auto;
    padding: 48px;
  }
  .scroll-content::-webkit-scrollbar { width: 4px; }
  .scroll-content::-webkit-scrollbar-thumb { background: var(--border); border-radius: 10px; }

  .hud-gate {
    width: 360px;
    background: var(--panel-bg);
    border-left: 1px solid var(--border);
    padding: 20px;
  }

  .action-footer {
    height: 96px;
    background: var(--header-bg);
    backdrop-filter: blur(8px);
    border-top: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 48px;
    flex-shrink: 0;
  }

  .hint-text { font-size: 0.8rem; color: var(--muted-text); font-weight: 500; display: flex; align-items: center; gap: 8px; }
  .hint-text::before { content: '🛈'; font-size: 1rem; opacity: 0.6; }

  .btn-action {
    padding: 14px 40px;
    border-radius: 12px;
    border: none;
    font-size: 0.9rem;
    font-weight: 800;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    letter-spacing: 0.05em;
  }
  
  .btn-next { background: var(--primary); color: white; box-shadow: 0 10px 20px var(--primary-glow); }
  .btn-next:hover:not(:disabled) { transform: translateY(-3px) scale(1.02); box-shadow: 0 15px 30px var(--primary-glow); }
  .btn-next:active:not(:disabled) { transform: translateY(0) scale(0.98); }
  .btn-next:disabled { background: var(--border); color: var(--muted-text); cursor: not-allowed; box-shadow: none; }
  
  .btn-complete { background: var(--success); color: white; box-shadow: 0 10px 20px rgba(16, 185, 129, 0.3); }
  .btn-complete:hover { transform: translateY(-3px) scale(1.02); box-shadow: 0 15px 30px rgba(16, 185, 129, 0.4); }

  .timer-warning { color: var(--error) !important; animation: pulse 0.8s infinite; }
  @keyframes pulse { 0% { opacity: 1; transform: scale(1); } 50% { opacity: 0.7; transform: scale(1.05); } 100% { opacity: 1; transform: scale(1); } }

  /* Responsive Design */
  @media (max-width: 1400px) {
    .hud-gate { width: 320px; }
  }

  @media (max-width: 1200px) {
    .console-matrix { flex-direction: column; overflow-y: auto; }
    .evidence-gate, .hud-gate { width: 100% !important; border: none; height: auto; }
    .resize-handle { display: none; }
    .reasoning-gate { height: auto; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
    .scroll-content { overflow-y: visible; height: auto; padding: 24px; }
    .hud-gate { padding: 32px; }
    .action-footer { padding: 0 24px; }
  }

  @media (max-width: 768px) {
    .console-header { height: auto; padding: 20px; flex-direction: column; gap: 20px; }
    .global-metrics { flex-wrap: wrap; justify-content: center; gap: 16px; }
    .action-footer { flex-direction: column; height: auto; padding: 32px; gap: 24px; text-align: center; }
    .btn-action { width: 100%; }
  }
`;
