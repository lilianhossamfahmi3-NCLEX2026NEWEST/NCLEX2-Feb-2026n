/**
 * NCLEX-RN NGN Clinical Simulator — Question Renderer
 * Routes each MasterItem.type to the appropriate renderer.
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { MasterItem } from '../../types/master';
import RationalePanel from './RationalePanel';

interface QuestionRendererProps {
    item: MasterItem;
    onSubmit: (itemId: string, answer: unknown) => void;
    isSubmitted?: boolean;
    earnedScore?: number;
    userAnswer?: unknown;
}

export default function QuestionRenderer({ item, onSubmit, isSubmitted, earnedScore, userAnswer }: QuestionRendererProps) {
    // Safety check for scoring which might be missing or nested in older data
    const scoring = item.scoring || (item.rationale as any)?.scoring || { method: 'polytomous', maxPoints: 1 };
    const maxPoints = scoring.maxPoints || 1;
    const isCorrect = earnedScore !== undefined && earnedScore >= maxPoints;

    return (
        <div className="question-renderer">
            <div className="question-stem">
                <span className="item-type-badge">{formatType(item.type)}</span>
                <p className="stem-text">{item.stem}</p>
            </div>
            <div className="question-body">
                <ItemBody item={item} onSubmit={onSubmit} isSubmitted={isSubmitted} userAnswer={userAnswer} />
            </div>

            {isSubmitted && earnedScore !== undefined && (
                <RationalePanel
                    rationale={item.rationale}
                    pedagogy={item.pedagogy}
                    earnedPoints={earnedScore}
                    maxPoints={maxPoints}
                    isCorrect={isCorrect}
                    itemType={item.type}
                    item={item}
                    userAnswer={userAnswer}
                />
            )}
            <style>{`
        .question-renderer {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 20px 50px rgba(0,0,0,0.15);
          animation: slideUpReveal 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
          backdrop-filter: blur(10px);
        }
        @keyframes slideUpReveal { 
            from { transform: translateY(30px); opacity: 0; } 
            to { transform: translateY(0); opacity: 1; } 
        }

        .question-stem {
          padding: 40px 48px;
          border-bottom: 1px solid var(--border);
          background: linear-gradient(to bottom, rgba(var(--primary-rgb), 0.03), transparent);
        }
        .item-type-badge {
          display: inline-flex;
          align-items: center;
          padding: 8px 16px;
          background: var(--panel-bg);
          color: var(--primary);
          border: 1.5px solid var(--border);
          border-radius: 100px;
          font-size: 0.65rem;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          margin-bottom: 24px;
          font-family: 'JetBrains Mono', monospace;
          box-shadow: 0 4px 10px rgba(0,0,0,0.05);
        }
        .stem-text {
          font-size: 1.3rem;
          line-height: 1.6;
          color: var(--text);
          font-weight: 700;
          letter-spacing: -0.02em;
        }
        .question-body {
          padding: 48px;
        }
        .option-btn {
          display: flex;
          align-items: center;
          width: 100%;
          padding: 22px 28px;
          margin-bottom: 16px;
          background: var(--bg);
          border: 1.5px solid var(--border);
          border-radius: 16px;
          color: var(--text);
          font-size: 1rem;
          text-align: left;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          font-family: inherit;
          position: relative;
          overflow: hidden;
        }
        .option-btn:hover:not(.option-btn--disabled) {
          transform: translateX(10px);
          border-color: var(--primary);
          background: rgba(var(--primary-rgb), 0.02);
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        .option-btn--selected {
          border-color: var(--primary) !important;
          background: rgba(var(--primary-rgb), 0.08) !important;
          box-shadow: 0 8px 24px rgba(var(--primary-rgb), 0.1);
        }
        .option-btn--selected::before {
          content: '';
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 5px;
          background: var(--primary);
          box-shadow: 0 0 15px var(--primary);
        }
        .option-btn--disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }
        .option-btn--correct {
          background: rgba(var(--success-rgb), 0.1) !important;
          border-color: var(--success) !important;
          color: var(--success) !important;
          font-weight: 800;
        }
        .option-btn--incorrect {
          background: rgba(var(--error-rgb), 0.1) !important;
          border-color: var(--error) !important;
          color: var(--error) !important;
        }

        .option-avatar {
          width: 32px;
          height: 32px;
          background: var(--panel-bg);
          border: 1px solid var(--border);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          font-weight: 900;
          color: var(--muted-text);
          margin-right: 20px;
          flex-shrink: 0;
          transition: all 0.3s;
        }
        .option-btn--selected .option-avatar {
          background: var(--primary);
          color: white;
          border-color: transparent;
          box-shadow: 0 0 12px rgba(var(--primary-rgb), 0.4);
        }

        .submit-btn {
          margin-top: 32px;
          padding: 20px 60px;
          background: var(--primary);
          color: white;
          border: none;
          border-radius: 18px;
          font-size: 0.95rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 0 10px 30px rgba(var(--primary-rgb), 0.4);
        }
        .submit-btn:hover:not(:disabled) {
          transform: translateY(-5px) scale(1.02);
          box-shadow: 0 20px 40px rgba(var(--primary-rgb), 0.5);
        }
        .submit-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
          box-shadow: none;
          transform: none;
        }

        .cloze-select {
          padding: 8px 16px;
          background: rgba(var(--primary-rgb), 0.05);
          border: 1.5px solid var(--border);
          border-radius: 8px;
          color: var(--primary);
          font-weight: 850;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
          margin: 0 4px;
        }
        .cloze-select:focus { border-color: var(--primary); box-shadow: 0 0 10px rgba(var(--primary-rgb), 0.2); }

        .matrix-wrapper { overflow-x: auto; border-radius: 24px; background: var(--panel-bg); padding: 8px; border: 1.5px solid var(--border); }
        .matrix-table { width: 100%; border-collapse: separate; border-spacing: 0 10px; }
        .matrix-table th { padding: 20px; color: var(--muted-text); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.15em; font-weight: 950; text-align: center; }
        .matrix-corner { text-align: left !important; padding-left: 32px !important; color: var(--primary) !important; }
        .matrix-table td { background: var(--bg-card); padding: 20px; transition: all 0.3s; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); text-align: center; }
        .matrix-row-label { text-align: left !important; padding-left: 32px !important; color: var(--text) !important; font-weight: 850; border-left: 1px solid var(--border); border-radius: 12px 0 0 12px; font-size: 0.95rem; }
        .matrix-cell { border-right: 1px solid var(--border); }
        .matrix-cell:last-child { border-radius: 0 12px 12px 0; }
        .matrix-table tr:hover td { background: rgba(var(--primary-rgb), 0.03); border-color: var(--primary); }

        .matrix-radio-container { display: flex; align-items: center; justify-content: center; cursor: pointer; }
        .matrix-input-hidden { display: none; }
        .matrix-custom-radio {
          width: 24px; height: 24px;
          border: 2px solid var(--border);
          border-radius: 8px;
          transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          background: var(--bg);
          position: relative;
        }
        .matrix-input-hidden:checked + .matrix-custom-radio {
          background: var(--primary);
          border-color: var(--primary);
          box-shadow: 0 0 15px rgba(var(--primary-rgb), 0.4);
          transform: scale(1.1);
        }
        .matrix-input-hidden:checked + .matrix-custom-radio::after {
          content: '✓'; color: white; position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); font-size: 0.8rem; font-weight: 900;
        }

        .ordered-response-container { display: flex; flex-direction: column; gap: 12px; }
        .ordered-item-wrapper {
          display: flex; align-items: center; gap: 16px;
          background: var(--panel-bg); padding: 8px 16px;
          border-radius: 20px; border: 1.5px solid var(--border);
          transition: all 0.3s;
        }
        .ordered-badge {
          width: 36px; height: 36px; border-radius: 12px; background: var(--primary); color: white;
          display: flex; align-items: center; justify-content: center; font-weight: 950; font-family: 'JetBrains Mono', monospace;
          box-shadow: 0 5px 15px rgba(var(--primary-rgb), 0.3);
        }
        .ordered-item-content { margin: 0 !important; flex: 1; border-color: transparent !important; background: transparent !important; box-shadow: none !important; cursor: default !important; }
        .ordered-item-content:hover { transform: none !important; }
        .ordered-controls { display: flex; flex-direction: column; gap: 4px; }
        .ordered-arrow {
          background: var(--bg-card); border: 1px solid var(--border); border-radius: 8px;
          width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;
          color: var(--muted-text); cursor: pointer; transition: all 0.2s; font-size: 0.7rem;
        }
        .ordered-arrow:hover:not(:disabled) { color: var(--primary); border-color: var(--primary); background: rgba(var(--primary-rgb), 0.05); }
        .ordered-arrow:disabled { opacity: 0.3; cursor: not-allowed; }

        .template-text { font-size: 1.2rem; line-height: 2.2; color: var(--text); font-weight: 600; margin-bottom: 24px; }

        /* --- Enhanced Bowtie (Image-Matched) --- */
        .bowtie-blueprint {
            display: flex;
            flex-direction: column;
            gap: 40px;
            padding: 20px;
            background: #f8fafc;
            border-radius: 32px;
            border: 1px solid #e2e8f0;
        }
        .bowtie-diagram {
            display: grid;
            grid-template-columns: 1fr 1.2fr 1fr;
            gap: 20px;
            align-items: center;
            position: relative;
            padding: 40px 0;
        }
        .bowtie-svg-lines {
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
            pointer-events: none;
            z-index: 0;
        }
        .bowtie-glass-path {
            fill: rgba(37, 99, 235, 0.08);
            stroke: rgba(37, 99, 235, 0.25);
            stroke-width: 2;
            backdrop-filter: blur(4px);
        }
        .bowtie-wing { display: flex; flex-direction: column; gap: 16px; z-index: 1; }
        .bowtie-center { z-index: 1; margin: 0 40px; }
        
        .bowtie-slot-box {
            background: rgba(255, 255, 255, 0.8);
            border: 2px dashed #cbd5e1;
            border-radius: 12px;
            min-height: 80px;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 16px;
            text-align: center;
            font-size: 0.9rem;
            font-weight: 800;
            color: #94a3b8;
            transition: all 0.3s;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
            position: relative;
            backdrop-filter: blur(8px);
            cursor: pointer;
        }
        .bowtie-slot-box:hover:not(.bowtie-slot-box--filled) {
            border-color: #3b82f6;
            background: rgba(59, 130, 246, 0.05);
        }
        .bowtie-slot-box--filled:hover {
            transform: scale(0.98);
            opacity: 0.9;
        }
        .bowtie-slot-box--filled {
            border-style: solid;
            color: white;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            border-width: 1px;
        }
        .bowtie-slot-box--action.bowtie-slot-box--filled { background: #2563eb; border-color: #1d4ed8; }
        .bowtie-slot-box--condition.bowtie-slot-box--filled { 
            background: white; 
            color: #1e293b; 
            border: 2px solid #3b82f6; 
            box-shadow: 0 0 30px rgba(59, 130, 246, 0.15);
        }
        .bowtie-slot-box--parameter.bowtie-slot-box--filled { background: #7c3aed; border-color: #6d28d9; }

        .bowtie-bank {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 2px;
            background: #cbd5e1;
            border: 1px solid #cbd5e1;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
        }
        .bank-column { background: white; display: flex; flex-direction: column; }
        .bank-header {
            background: #f1f5f9;
            padding: 16px;
            text-align: center;
            font-weight: 950;
            font-size: 0.85rem;
            color: #334155;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            border-bottom: 1px solid #e2e8f0;
        }
        .bank-options { padding: 12px; display: flex; flex-direction: column; gap: 8px; }
        .bank-option-btn {
            padding: 14px 16px;
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            font-size: 0.85rem;
            font-weight: 700;
            color: #475569;
            text-align: left;
            cursor: pointer;
            transition: all 0.2s;
            line-height: 1.3;
        }
        .bank-option-btn:hover:not(:disabled) { background: #f8fafc; border-color: #3b82f6; transform: translateY(-1px); }
        .bank-option-btn--selected { background: #eff6ff; border-color: #bfdbfe; color: #1e40af; }
        .bank-option-btn--selected::after { content: ' ✓'; font-weight: 900; }
        
        .bank-option-btn--action.bank-option-btn--active { border-left: 4px solid #2563eb; }
        .bank-option-btn--condition.bank-option-btn--active { border-left: 4px solid #64748b; }
        .bank-option-btn--parameter.bank-option-btn--active { border-left: 4px solid #7c3aed; }

        @keyframes slotPulse { 0% { transform: scale(1); } 50% { transform: scale(1.02); } 100% { transform: scale(1); } }
        .bowtie-slot-box--filled { animation: slotPulse 0.4s ease-out; }

        .bowtie-feedback-icon {
            position: absolute;
            top: -10px; right: -10px;
            width: 24px; height: 24px;
            border-radius: 50%;
            background: white;
            display: flex; align-items: center; justify-content: center;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            font-weight: 950; font-size: 0.9rem;
            z-index: 2;
        }
        .bowtie-feedback-icon.correct { color: #22c55e; }
        .bowtie-feedback-icon.incorrect { color: #ef4444; }
        .bowtie-feedback-icon.missed { color: #f59e0b; border: 2px dashed #f59e0b; }

        /* Highlight Enhanced */
        .highlight-passage {
            background: rgba(var(--primary-rgb), 0.02);
            padding: 32px;
            border-radius: 20px;
            border: 1px solid var(--border);
            line-height: 2.2;
            font-size: 1.15rem;
            color: var(--text);
        }
        .highlight-unit {
            padding: 2px 4px;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s;
            position: relative;
            border-bottom: 2px solid transparent;
        }
        .highlight-unit:hover:not(.submitted) { background: rgba(var(--primary-rgb), 0.1); }
        .highlight-unit.selected { background: rgba(var(--primary-rgb), 0.2); border-bottom-color: var(--primary); font-weight: 850; color: var(--primary); }
        .highlight-unit.submitted.correct { background: #34d399 !important; color: #064e3b !important; font-weight: 950 !important; border-bottom: 2px solid #059669 !important; }
        .highlight-unit.submitted.incorrect { background: #f87171 !important; color: #7f1d1d !important; font-weight: 950 !important; border-bottom: 2px solid #b91c1c !important; }
        .highlight-unit.submitted.missed { border-bottom: 2px dashed var(--success); opacity: 0.8; }

        /* --- Trend Overhaul --- */
        .trend-container {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 32px;
            overflow: hidden;
            margin-bottom: 32px;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02);
        }
        .trend-header {
            background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
            padding: 24px 32px;
            display: flex;
            align-items: center;
            gap: 16px;
        }
        .trend-header h3 { color: #f8fafc; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.2em; font-weight: 950; margin: 0; opacity: 0.9; }
        .trend-grid { display: grid; grid-template-columns: 160px 1fr; border-bottom: 1px solid #f1f5f9; transition: all 0.3s ease; }
        .trend-grid:hover { background: #f8fafc; transform: scale(1.002); }
        .trend-time-col { background: #fbfcfe; padding: 24px 32px; color: #475569; font-weight: 950; font-family: 'Inter', sans-serif; font-size: 0.9rem; border-right: 1px solid #f1f5f9; display: flex; align-items: center; }
        .trend-values-col { padding: 24px 32px; display: flex; flex-wrap: wrap; gap: 40px; align-items: center; }
        .trend-metric { display: flex; flex-direction: column; gap: 8px; }
        .trend-metric-label { font-size: 0.75rem; color: #94a3b8; text-transform: uppercase; font-weight: 950; letter-spacing: 0.08em; }
        .trend-metric-value { font-size: 1.3rem; color: #1e293b; font-weight: 950; letter-spacing: -0.02em; }
        .trend-metric--abnormal .trend-metric-value { color: #dc2626; position: relative; }
        .trend-metric--abnormal .trend-metric-value::after { content: '▲'; font-size: 0.7rem; margin-left: 6px; vertical-align: top; color: #ef4444; }

        /* --- Drag and Drop Cloze Overhaul --- */
        .cloze-container { margin: 24px 0; }
        .drop-zone {
            display: inline-flex;
            min-width: 140px;
            height: 40px;
            background: rgba(var(--primary-rgb), 0.05);
            border: 2px dashed rgba(var(--primary-rgb), 0.3);
            border-radius: 10px;
            vertical-align: middle;
            margin: 0 6px;
            align-items: center;
            justify-content: center;
            padding: 0 16px;
            font-weight: 900;
            color: var(--primary);
            transition: all 0.2s;
            cursor: pointer;
            font-size: 0.95rem;
        }
        .drop-zone--active { border-color: var(--primary); background: rgba(var(--primary-rgb), 0.1); transform: scale(1.05); }
        .drop-zone--filled { border-style: solid; border-color: var(--primary); background: white; box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.15); animation: snapIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        @keyframes snapIn { from { transform: scale(0.9); } to { transform: scale(1); } }
        
        .token-pool { background: var(--panel-bg); padding: 32px; border-radius: 24px; border: 1px solid var(--border); display: flex; flex-wrap: wrap; gap: 12px; margin-top: 40px; }
        .token {
            padding: 12px 24px;
            background: white;
            border: 1px solid var(--border);
            border-bottom: 4px solid var(--border);
            border-radius: 12px;
            font-weight: 900;
            color: var(--text);
            cursor: pointer;
            transition: all 0.2s;
            user-select: none;
            box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        }
        .token:hover:not(.token--used) { transform: translateY(-4px); border-color: var(--primary); color: var(--primary); }
        .token--used { opacity: 0.3; cursor: not-allowed; filter: grayscale(1); }
        .token--active { border-color: var(--primary); transform: scale(1.1); box-shadow: 0 10px 20px rgba(var(--primary-rgb), 0.2); }

        /* --- Exhibit Overhaul --- */
        .exhibit-frame { background: white; border: 1.5px solid #e2e8f0; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.08); }
        .exhibit-tabs { display: flex; background: #f8fafc; border-bottom: 1px solid #e2e8f0; padding: 12px 16px 0 16px; gap: 8px; }
        .exhibit-tab {
            padding: 12px 24px;
            background: transparent;
            border: 1px solid transparent;
            border-bottom: none;
            border-radius: 12px 12px 0 0;
            color: #64748b;
            font-weight: 900;
            font-size: 0.8rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            cursor: pointer;
            transition: all 0.2s;
        }
        .exhibit-tab:hover { color: #334155; background: #f1f5f9; }
        .exhibit-tab--active { background: white; border-color: #e2e8f0; color: #2563eb; position: relative; z-index: 1; }
        .exhibit-tab--active::after { content: ''; position: absolute; bottom: -1px; left: 0; right: 0; height: 3px; background: white; z-index: 2; }
        .exhibit-body { padding: 48px; min-height: 300px; color: #334155; }
        
        /* Clinical Table Parsing */
        .clinical-table { width: 100%; border-collapse: collapse; margin: 16px 0; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; }
        .clinical-table th { background: #f8fafc; padding: 16px; text-align: left; font-size: 0.75rem; text-transform: uppercase; color: #64748b; border-bottom: 2px solid #e2e8f0; }
        .clinical-table td { padding: 16px; border-bottom: 1px solid #f1f5f9; font-size: 0.95rem; font-weight: 600; }
        .clinical-table tr:last-child td { border-bottom: none; }
        .clinical-table tr:nth-child(even) { background: #fcfdfe; }
        
        .clinical-findings-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 20px;
            margin: 16px 0;
        }
        .clinical-finding-card {
            background: white;
            border: 1px solid #e2e8f0;
            border-left: 4px solid #3b82f6;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
            transition: transform 0.2s;
        }
        .clinical-finding-card:hover { transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
        .finding-title {
            font-size: 0.75rem;
            font-weight: 950;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 8px;
        }
        .finding-body {
            font-size: 0.95rem;
            font-weight: 700;
            color: #1e293b;
            line-height: 1.5;
        }

        /* --- Bowtie Refinement --- */
        .bowtie-slot { border: 2px dashed rgba(var(--primary-rgb), 0.2); border-radius: 16px; padding: 20px; transition: all 0.3s; background: rgba(var(--primary-rgb), 0.02); }
        .bowtie-slot--active { background: rgba(var(--primary-rgb), 0.05); border-color: var(--primary); }
      `}</style>
        </div>
    );
}

function formatType(type: string): string {
    return type.replace(/([A-Z])/g, ' $1').trim();
}

// ═══════════════════════════════════════════════════════════
//  Item Body Router
// ═══════════════════════════════════════════════════════════

function ItemBody({ item, onSubmit, isSubmitted, userAnswer }: QuestionRendererProps) {
    switch (item.type) {
        case 'multipleChoice':
        case 'priorityAction':
            return <SingleSelect item={item} onSubmit={onSubmit} isSubmitted={isSubmitted} userAnswer={userAnswer} />;
        case 'selectAll':
        case 'selectN':
            return <MultiSelect item={item} onSubmit={onSubmit} isSubmitted={isSubmitted} userAnswer={userAnswer} />;
        case 'orderedResponse':
            return <OrderedResponse item={item} onSubmit={onSubmit} isSubmitted={isSubmitted} userAnswer={userAnswer} />;
        case 'matrixMatch':
            return <MatrixMatch item={item} onSubmit={onSubmit} isSubmitted={isSubmitted} userAnswer={userAnswer} />;
        case 'clozeDropdown':
            return <ClozeDropdown item={item} onSubmit={onSubmit} isSubmitted={isSubmitted} userAnswer={userAnswer} />;
        case 'bowtie':
            return <Bowtie item={item} onSubmit={onSubmit} isSubmitted={isSubmitted} userAnswer={userAnswer} />;
        case 'trend':
            return <TrendQuestion item={item} onSubmit={onSubmit} isSubmitted={isSubmitted} userAnswer={userAnswer} />;
        case 'highlight':
            return <HighlightQuestion item={item} onSubmit={onSubmit} isSubmitted={isSubmitted} userAnswer={userAnswer} />;
        case 'dragAndDropCloze':
            return <DragAndDropCloze item={item} onSubmit={onSubmit} isSubmitted={isSubmitted} userAnswer={userAnswer} />;
        case 'hotspot':
            return <Hotspot item={item} onSubmit={onSubmit} isSubmitted={isSubmitted} userAnswer={userAnswer} />;
        case 'graphic':
        case 'audioVideo':
            return <MediaItem item={item} onSubmit={onSubmit} isSubmitted={isSubmitted} userAnswer={userAnswer} />;
        case 'chartExhibit':
            return <ExhibitViewer item={item} onSubmit={onSubmit} isSubmitted={isSubmitted} userAnswer={userAnswer} />;
        default:
            return <SingleSelect item={item as any} onSubmit={onSubmit} isSubmitted={isSubmitted} userAnswer={userAnswer} />;
    }
}

// ═══════════════════════════════════════════════════════════
//  Single Select (MC, Priority Action, Trend)
// ═══════════════════════════════════════════════════════════

function SingleSelect({ item, onSubmit, isSubmitted, userAnswer }: { item: any; onSubmit: (id: string, answer: unknown) => void; isSubmitted?: boolean; userAnswer?: any }) {
    const [selected, setSelected] = useState<string | null>((userAnswer as string) || null);
    const correctId = item.correctOptionId;

    const shuffledOptions = useMemo(() => {
        return seededShuffle<{ id: string; text: string }>(item.options || [], item.id + '_ss');
    }, [item.id, item.options]);

    const getOptionClass = (optId: string) => {
        let cls = 'option-btn';
        if (selected === optId) cls += ' option-btn--selected';
        if (isSubmitted) {
            cls += ' option-btn--disabled';
            if (optId === correctId) cls += ' option-btn--correct';
            else if (selected === optId && optId !== correctId) cls += ' option-btn--incorrect';
        }
        return cls;
    };

    return (
        <div className="single-select-grid">
            {shuffledOptions.map((opt: { id: string; text: string }, idx: number) => (
                <button
                    key={opt.id}
                    className={getOptionClass(opt.id)}
                    onClick={() => !isSubmitted && setSelected(opt.id)}
                >
                    <div className="option-avatar">{String.fromCharCode(65 + idx)}</div>
                    <span className="option-text">{opt.text}</span>
                </button>
            ))}
            <button
                className="submit-btn"
                disabled={!selected || isSubmitted}
                onClick={() => selected && onSubmit(item.id, selected)}
            >
                {isSubmitted ? 'Action Recorded ✓' : 'Submit Clinical Decision'}
            </button>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════
//  Multi Select (SATA)
// ═══════════════════════════════════════════════════════════

function MultiSelect({ item, onSubmit, isSubmitted, userAnswer }: { item: any; onSubmit: (id: string, answer: unknown) => void; isSubmitted?: boolean; userAnswer?: any }) {
    const [selected, setSelected] = useState<Set<string>>(new Set(userAnswer as string[] || []));
    const correctIds: string[] = item.correctOptionIds || [];

    const shuffledOptions = useMemo(() => {
        return seededShuffle<{ id: string; text: string }>(item.options || [], item.id + '_ms');
    }, [item.id, item.options]);

    const toggle = useCallback((id: string) => {
        if (isSubmitted) return;
        setSelected(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                // If it's a selectN item, optionally enforce the limit in the UI
                if (item.type === 'selectN' && item.n && next.size >= item.n) {
                    return prev;
                }
                next.add(id);
            }
            return next;
        });
    }, [isSubmitted, item.type, item.n]);

    const getOptionClass = (optId: string) => {
        let cls = 'option-btn';
        if (selected.has(optId)) cls += ' option-btn--selected';
        if (isSubmitted) {
            cls += ' option-btn--disabled';
            if (correctIds.includes(optId)) cls += ' option-btn--correct';
            else if (selected.has(optId) && !correctIds.includes(optId)) cls += ' option-btn--incorrect';
        }
        return cls;
    };

    return (
        <div className="multi-select-grid">
            {shuffledOptions.map((opt: { id: string; text: string }, idx: number) => (
                <button
                    key={opt.id}
                    className={getOptionClass(opt.id)}
                    onClick={() => toggle(opt.id)}
                    role="checkbox"
                    aria-checked={selected.has(opt.id)}
                >
                    <div className="option-avatar">{String.fromCharCode(65 + idx)}</div>
                    <span className="option-text">{opt.text}</span>
                </button>
            ))}
            <button
                className="submit-btn"
                disabled={(item.type === 'selectN' ? selected.size !== item.n : selected.size === 0) || isSubmitted}
                onClick={() => onSubmit(item.id, Array.from(selected))}
            >
                {isSubmitted ? 'Responses Logged ✓' : `Confirm ${selected.size} Selections`}
            </button>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════
//  Ordered Response (Drag/Reorder)
// ═══════════════════════════════════════════════════════════

function OrderedResponse({ item, onSubmit, isSubmitted, userAnswer }: { item: any; onSubmit: (id: string, answer: unknown) => void; isSubmitted?: boolean; userAnswer?: any }) {
    const [order, setOrder] = useState<{ id: string; text: string }[]>(() => {
        if (userAnswer && Array.isArray(userAnswer)) {
            return (userAnswer as string[]).map(id => item.options.find((o: any) => o.id === id)).filter(Boolean);
        }
        return [...item.options];
    });

    const moveUp = (idx: number) => {
        if (idx === 0 || isSubmitted) return;
        setOrder(prev => {
            const updated = [...prev];
            [updated[idx - 1], updated[idx]] = [updated[idx], updated[idx - 1]];
            return updated;
        });
    };

    const moveDown = (idx: number) => {
        if (idx === order.length - 1 || isSubmitted) return;
        setOrder(prev => {
            const updated = [...prev];
            [updated[idx], updated[idx + 1]] = [updated[idx + 1], updated[idx]];
            return updated;
        });
    };

    return (
        <div className="ordered-response-container">
            {order.map((opt, i) => (
                <div key={opt.id} className="ordered-item-wrapper">
                    <div className="ordered-badge">{i + 1}</div>
                    <div className="option-btn ordered-item-content">
                        {opt.text}
                    </div>
                    <div className="ordered-controls">
                        <button className="ordered-arrow" onClick={() => moveUp(i)} disabled={i === 0 || isSubmitted}>▲</button>
                        <button className="ordered-arrow" onClick={() => moveDown(i)} disabled={i === order.length - 1 || isSubmitted}>▼</button>
                    </div>
                </div>
            ))}
            <button
                className="submit-btn"
                style={{ marginTop: 24 }}
                disabled={isSubmitted}
                onClick={() => onSubmit(item.id, order.map(o => o.id))}
            >
                {isSubmitted ? 'Sequence Logged ✓' : 'Confirm Clinical Order'}
            </button>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════
//  Matrix Match
// ═══════════════════════════════════════════════════════════

function MatrixMatch({ item, onSubmit, isSubmitted, userAnswer }: { item: any; onSubmit: (id: string, answer: unknown) => void; isSubmitted?: boolean; userAnswer?: any }) {
    const [selections, setSelections] = useState<Record<string, string>>(userAnswer || {});

    const handleSelect = (rowId: string, colId: string) => {
        if (isSubmitted) return;
        setSelections(prev => ({ ...prev, [rowId]: colId }));
    };

    return (
        <div className="matrix-wrapper">
            <table className="matrix-table">
                <thead>
                    <tr>
                        <th className="matrix-corner">Evaluation Parameter</th>
                        {item.columns.map((col: { id: string; text: string }) => (
                            <th key={col.id}>{col.text}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {item.rows.map((row: { id: string; text: string }) => (
                        <tr key={row.id}>
                            <td className="matrix-row-label">{row.text}</td>
                            {item.columns.map((col: { id: string; text: string }) => (
                                <td key={col.id} className="matrix-cell">
                                    <label className="matrix-radio-container">
                                        <input
                                            type="radio"
                                            name={`matrix-${row.id}`}
                                            className="matrix-input-hidden"
                                            checked={selections[row.id] === col.id}
                                            onChange={() => handleSelect(row.id, col.id)}
                                            disabled={isSubmitted}
                                        />
                                        <div className="matrix-custom-radio"></div>
                                    </label>
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            <button
                className="submit-btn"
                style={{ marginTop: 32 }}
                disabled={Object.keys(selections).length !== item.rows.length || isSubmitted}
                onClick={() => onSubmit(item.id, selections)}
            >
                {isSubmitted ? 'Assessment Recorded ✓' : 'Submit Evaluation'}
            </button>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════
//  Cloze Dropdown
// ═══════════════════════════════════════════════════════════

function ClozeDropdown({ item, onSubmit, isSubmitted, userAnswer }: { item: any; onSubmit: (id: string, answer: unknown) => void; isSubmitted?: boolean; userAnswer?: any }) {
    const [selections, setSelections] = useState<Record<string, string>>(userAnswer || {});

    const handleChange = (blankId: string, value: string) => {
        if (isSubmitted) return;
        setSelections(prev => ({ ...prev, [blankId]: value }));
    };

    // Parse template and inject dropdowns
    const renderTemplate = () => {
        const parts = item.template.split(/(\{\{[^}]+\}\})/g);
        return parts.map((part: string, i: number) => {
            const match = part.match(/\{\{(\w+)\}\}/);
            if (match) {
                const blankId = match[1];
                const blank = item.blanks.find((b: any) => b.id === blankId);
                if (!blank) return <span key={i}>[?]</span>;
                return (
                    <select
                        key={i}
                        className="cloze-select"
                        value={selections[blankId] || ''}
                        onChange={e => handleChange(blankId, e.target.value)}
                        disabled={isSubmitted}
                    >
                        <option value="">Select...</option>
                        {blank.options.map((opt: string) => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                );
            }
            return <span key={i}>{part}</span>;
        });
    };

    return (
        <div>
            <div className="template-text">{renderTemplate()}</div>
            <button
                className="submit-btn"
                disabled={Object.keys(selections).length !== item.blanks.length || isSubmitted}
                onClick={() => onSubmit(item.id, selections)}
            >
                {isSubmitted ? 'Submitted ✓' : 'Submit Answer'}
            </button>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════
//  Bowtie
// ═══════════════════════════════════════════════════════════

// Deterministic shuffle seeded by item ID — stable per question, eliminates position bias
function seededShuffle<T>(arr: T[], seed: string): T[] {
    const copy = [...arr];
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = ((h << 5) - h + seed.charCodeAt(i)) | 0;
    for (let i = copy.length - 1; i > 0; i--) {
        h = (h * 1664525 + 1013904223) | 0;
        const j = ((h >>> 0) % (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

function Bowtie({ item, onSubmit, isSubmitted, userAnswer }: { item: any; onSubmit: (id: string, answer: unknown) => void; isSubmitted?: boolean; userAnswer?: any }) {
    const [actionSelections, setActionSelections] = useState<string[]>(userAnswer?.actions || []);
    const [conditionSelection, setConditionSelection] = useState<string | null>(userAnswer?.condition || null);
    const [parameterSelections, setParameterSelections] = useState<string[]>(userAnswer?.parameters || []);

    // Safety checks
    const hasActions = item?.actions || item?.bowtieData?.actionOptions;
    const hasParams = item?.parameters || item?.bowtieData?.parameterOptions;
    if (!hasActions || !hasParams) {
        return <div className="p-8 text-indigo-600 bg-indigo-50 rounded-2xl border border-indigo-100">
            <h3 className="font-black uppercase tracking-tighter italic">Clinical Schematic Missing</h3>
            <p className="text-sm opacity-70">Regulatory bowtie layout for this clinical scenario is missing from the lab vault.</p>
        </div>;
    }

    // Shuffle actions & parameters using item.id as seed — eliminates answer position bias
    const actions = item.actions || item.bowtieData?.actionOptions || [];
    const parameters = item.parameters || item.bowtieData?.parameterOptions || [];
    const condition = item.condition || item.correctAnswers?.condition || '';

    const shuffledActions = useMemo(() => seededShuffle(actions, item.id + '_actions'), [item.id, actions]);
    const shuffledParameters = useMemo(() => seededShuffle(parameters, item.id + '_params'), [item.id, parameters]);

    // Use case-specific potentialConditions from data — no hardcoded fallbacks
    const potentialConditions = useMemo(() => {
        const pc = item.potentialConditions || item.bowtieData?.conditionOptions?.map((o: any) => o.text) || [];
        if (pc.length > 0) {
            return seededShuffle(pc, item.id + '_conds');
        }
        // Ultimate fallback only if data is completely missing (should not happen after data fix)
        return seededShuffle([condition, "Unrelated Condition A", "Unrelated Condition B", "Unrelated Condition C"], item.id + '_conds');
    }, [item.id, item.potentialConditions, item.bowtieData, condition]);

    const toggleAction = (id: string) => {
        if (isSubmitted) return;
        setActionSelections(prev => {
            if (prev.includes(id)) return prev.filter(x => x !== id);
            if (prev.length < 2) return [...prev, id];
            return prev;
        });
    };

    const toggleCondition = (text: string) => {
        if (isSubmitted) return;
        setConditionSelection(prev => prev === text ? null : text);
    };

    const toggleParameter = (id: string) => {
        if (isSubmitted) return;
        setParameterSelections(prev => {
            if (prev.includes(id)) return prev.filter(x => x !== id);
            if (prev.length < 2) return [...prev, id];
            return prev;
        });
    };

    const isCorrect = (type: 'action' | 'condition' | 'parameter', val: string) => {
        const correctActions = item.correctActionIds || item.correctAnswers?.actions || [];
        const correctParams = item.correctParameterIds || item.correctAnswers?.parameters || [];
        const correctCondition = item.condition || item.correctAnswers?.condition || '';

        if (type === 'action') return correctActions.includes(val);
        if (type === 'parameter') return correctParams.includes(val);
        if (type === 'condition') return val === correctCondition;
        return false;
    };

    const getFeedback = (type: 'action' | 'condition' | 'parameter', val: string | null) => {
        if (!isSubmitted || !val) return null;
        const correct = isCorrect(type, val);
        return <div className={`bowtie-feedback-icon ${correct ? 'correct' : 'incorrect'}`}>
            {correct ? '✓' : '✕'}
        </div>;
    };

    return (
        <div className="bowtie-blueprint">
            <div className="bowtie-diagram">
                <svg className="bowtie-svg-lines" viewBox="0 0 800 400">
                    {/* Glassy bowtie background shape */}
                    <path
                        className="bowtie-glass-path"
                        d="M50 80 Q 200 80, 400 200 Q 200 320, 50 320 Z M 750 80 Q 600 80, 400 200 Q 600 320, 750 320 Z"
                    />
                    <path d="M220 150 L 380 200 M 220 250 L 380 200" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="4 4" fill="none" opacity="0.4" />
                    <path d="M580 150 L 420 200 M 580 250 L 420 200" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="4 4" fill="none" opacity="0.4" />
                </svg>

                <div className="bowtie-wing">
                    {[0, 1].map(i => {
                        const selId = actionSelections[i];
                        const selOpt = actions.find((a: any) => a.id === selId);
                        return (
                            <div
                                key={i}
                                className={`bowtie-slot-box bowtie-slot-box--action ${selOpt ? 'bowtie-slot-box--filled' : ''}`}
                                onClick={() => selId && toggleAction(selId)}
                                title={selId ? "Click to clear" : ""}
                            >
                                {getFeedback('action', selId)}
                                {selOpt ? selOpt.text : 'Action to take'}
                            </div>
                        );
                    })}
                </div>

                <div className="bowtie-center">
                    <div
                        className={`bowtie-slot-box bowtie-slot-box--condition ${conditionSelection ? 'bowtie-slot-box--filled' : ''}`}
                        style={{ minHeight: 100 }}
                        onClick={() => conditionSelection && toggleCondition(conditionSelection)}
                        title={conditionSelection ? "Click to clear" : ""}
                    >
                        {getFeedback('condition', conditionSelection)}
                        <div className="flex flex-col gap-1">
                            {!conditionSelection && <span className="text-[0.65rem] opacity-50 uppercase">Condition most likely</span>}
                            <span>{conditionSelection || 'Experiencing'}</span>
                        </div>
                    </div>
                </div>

                <div className="bowtie-wing">
                    {[0, 1].map(i => {
                        const selId = parameterSelections[i];
                        const selOpt = parameters.find((p: any) => p.id === selId);
                        return (
                            <div
                                key={i}
                                className={`bowtie-slot-box bowtie-slot-box--parameter ${selOpt ? 'bowtie-slot-box--filled' : ''}`}
                                onClick={() => selId && toggleParameter(selId)}
                                title={selId ? "Click to clear" : ""}
                            >
                                {getFeedback('parameter', selId)}
                                {selOpt ? selOpt.text : 'Parameter to monitor'}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="bowtie-bank">
                <div className="bank-column">
                    <div className="bank-header">Actions to Take</div>
                    <div className="bank-options">
                        {shuffledActions.map((a: any) => (
                            <button
                                key={a.id}
                                className={`bank-option-btn bank-option-btn--action ${actionSelections.includes(a.id) ? 'bank-option-btn--selected' : 'bank-option-btn--active'}`}
                                onClick={() => toggleAction(a.id)}
                                disabled={isSubmitted}
                            >
                                {a.text}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bank-column">
                    <div className="bank-header">Potential Conditions</div>
                    <div className="bank-options">
                        {potentialConditions.map((cond: string) => (
                            <button
                                key={cond}
                                className={`bank-option-btn bank-option-btn--condition ${conditionSelection === cond ? 'bank-option-btn--selected' : 'bank-option-btn--active'}`}
                                onClick={() => toggleCondition(cond)}
                                disabled={isSubmitted}
                            >
                                {cond}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bank-column">
                    <div className="bank-header">Parameters to Monitor</div>
                    <div className="bank-options">
                        {shuffledParameters.map((p: any) => (
                            <button
                                key={p.id}
                                className={`bank-option-btn bank-option-btn--parameter ${parameterSelections.includes(p.id) ? 'bank-option-btn--selected' : 'bank-option-btn--active'}`}
                                onClick={() => toggleParameter(p.id)}
                                disabled={isSubmitted}
                            >
                                {p.text}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <button
                className="submit-btn w-full mt-4"
                disabled={actionSelections.length < 2 || !conditionSelection || parameterSelections.length < 2 || isSubmitted}
                onClick={() => onSubmit(item.id, {
                    actions: actionSelections,
                    condition: conditionSelection,
                    parameters: parameterSelections,
                })}
            >
                {isSubmitted ? 'Clinical Logic Recorded ✓' : 'Submit Definitive Solution'}
            </button>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════
//  Trend
// ═══════════════════════════════════════════════════════════

function TrendQuestion({ item, onSubmit, isSubmitted, userAnswer }: { item: any; onSubmit: (id: string, answer: unknown) => void; isSubmitted?: boolean; userAnswer?: any }) {
    const [selected, setSelected] = useState<string | null>(userAnswer || null);

    // Safety checks
    const dataPoints = item?.dataPoints || item?.rationale?.dataPoints || [];
    const options = item?.options || [];

    if (dataPoints.length === 0 || options.length === 0) {
        return <div className="p-8 text-rose-600 bg-rose-50 rounded-2xl border border-rose-100">
            <h3 className="font-black uppercase tracking-tighter italic">Trend Data Corruption</h3>
            <p className="text-sm opacity-70">The longitudinal clinical flowsheet for this patient could not be reconstructed from the archival data.</p>
        </div>;
    }

    return (
        <div className="space-y-12">
            <div className="trend-container">
                <div className="trend-header">
                    <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                    <h3>Automated Clinical Flowsheet (Longitudinal Trend)</h3>
                </div>
                {dataPoints.map((dp: { time: string; values: Record<string, number | string> }, i: number) => (
                    <div key={i} className="trend-grid">
                        <div className="trend-time-col">{dp.time}</div>
                        <div className="trend-values-col">
                            {dp.values && Object.entries(dp.values).map(([key, val]) => {
                                // Dynamic abnormality detection
                                const isAbnormal =
                                    (key.toLowerCase().includes('creatinine') && parseFloat(val as string) > 1.2) ||
                                    (key.toLowerCase().includes('hr') && (parseFloat(val as string) > 100 || parseFloat(val as string) < 60)) ||
                                    (key.toLowerCase().includes('pulse') && (parseFloat(val as string) > 100 || parseFloat(val as string) < 60)) ||
                                    (key.toLowerCase().includes('spo2') && parseFloat(val as string) < 94);

                                return (
                                    <div key={key} className={`trend-metric ${isAbnormal ? 'trend-metric--abnormal' : ''}`}>
                                        <span className="trend-metric-label">{key}</span>
                                        <span className="trend-metric-value">{val}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-10 bg-white rounded-[32px] border border-slate-200 shadow-xl shadow-slate-200/50">
                <p className="text-slate-900 font-extrabold text-xl leading-tight mb-8">
                    {item.question || item.stem}
                </p>
                <div className="grid grid-cols-1 gap-4">
                    {options.map((opt: { id: string; text: string }) => (
                        <button
                            key={opt.id}
                            className={`option-btn ${selected === opt.id ? 'option-btn--selected' : ''} ${isSubmitted ? 'option-btn--disabled' : ''}`}
                            onClick={() => !isSubmitted && setSelected(opt.id)}
                            disabled={isSubmitted}
                        >
                            <span className="font-bold">{opt.text}</span>
                        </button>
                    ))}
                </div>

                <button
                    className="submit-btn w-full mt-8"
                    disabled={!selected || isSubmitted}
                    onClick={() => selected && onSubmit(item.id, selected)}
                >
                    {isSubmitted ? 'Clinical Trajectory Recorded ✓' : 'Confirm Clinical Decision'}
                </button>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════
//  Highlight
// ═══════════════════════════════════════════════════════════

function HighlightQuestion({ item, onSubmit, isSubmitted, userAnswer }: { item: any; onSubmit: (id: string, answer: unknown) => void; isSubmitted?: boolean; userAnswer?: any }) {
    const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set(userAnswer as number[] || []));

    // Split passage into sentences for selection
    const sentences = useMemo(() => {
        if (!item?.passage) return [];
        return (item.passage as string).split(/(?<=[.!?])\s+/);
    }, [item?.passage]);

    const toggleSentence = (idx: number) => {
        if (isSubmitted) return;
        setSelectedIndices(prev => {
            const next = new Set(prev);
            next.has(idx) ? next.delete(idx) : next.add(idx);
            return next;
        });
    };

    return (
        <div className="highlight-wrapper">
            <div className="highlight-passage">
                {sentences.map((sentence, i) => {
                    const isCorrect = item.correctSpanIndices?.includes(i) || false;
                    const isSelected = selectedIndices.has(i);
                    let unitClass = 'highlight-unit';
                    if (isSelected) unitClass += ' selected';
                    if (isSubmitted) {
                        unitClass += ' submitted';
                        if (isSelected && isCorrect) unitClass += ' correct';
                        else if (isSelected && !isCorrect) unitClass += ' incorrect';
                        else if (!isSelected && isCorrect) unitClass += ' missed';
                    }
                    return (
                        <span
                            key={i}
                            onClick={() => !isSubmitted && toggleSentence(i)}
                            className={unitClass}
                        >
                            {sentence}{' '}
                        </span>
                    );
                })}
            </div>
            <button
                className="submit-btn"
                style={{ marginTop: 32 }}
                disabled={selectedIndices.size === 0 || isSubmitted}
                onClick={() => onSubmit(item.id, Array.from(selectedIndices))}
            >
                {isSubmitted ? 'Evidence Highlighted ✓' : `Confirm ${selectedIndices.size} Findings`}
            </button>
        </div>
    );
}
// ═══════════════════════════════════════════════════════════
//  Drag and Drop Cloze
// ═══════════════════════════════════════════════════════════

function DragAndDropCloze({ item, onSubmit, isSubmitted, userAnswer }: { item: any; onSubmit: (id: string, answer: unknown) => void; isSubmitted?: boolean; userAnswer?: any }) {
    const [selections, setSelections] = useState<Record<string, string>>(userAnswer || {});
    const [activeBlank, setActiveBlank] = useState<string | null>(null);

    // Robust template detection (handle both 'template' and 'content' schemas)
    const template = item?.template || item?.content;

    // Extract blanks for validation if not explicitly provided
    const detectedBlanks = useMemo(() => {
        if (!template) return [];
        const matches = template.match(/\{\{(.+?)\}\}/g) || [];
        return matches.map((m: string) => m.replace(/\{\{|\}\}/g, ''));
    }, [template]);

    // Safety checks
    if (!template || !item?.options) {
        return <div className="p-8 text-amber-600 bg-amber-50 rounded-2xl border border-amber-100">
            <h3 className="font-black uppercase tracking-tighter italic">Asset Loading Failure</h3>
            <p className="text-sm opacity-70">Simulation templates for this cloze interaction were not found in the laboratory vault.</p>
        </div>;
    }

    const handleBlankClick = (blankId: string) => {
        if (isSubmitted) return;
        setActiveBlank(prev => prev === blankId ? null : blankId);
    };

    const handleOptionSelect = (option: string) => {
        if (!activeBlank || isSubmitted) return;
        setSelections(prev => ({ ...prev, [activeBlank]: option }));
        setActiveBlank(null);
    };

    const renderTemplate = () => {
        const parts = template.split(/(\{\{.+?\}\})/g); // Fixed regex (removed extra space)
        return parts.map((part: string, i: number) => {
            const match = part.match(/\{\{(.+?)\}\}/);
            if (match) {
                const blankId = match[1];
                const value = selections[blankId];
                return (
                    <span
                        key={i}
                        className={`drop-zone ${value ? 'drop-zone--filled' : ''} ${activeBlank === blankId ? 'drop-zone--active' : ''}`}
                        onClick={() => handleBlankClick(blankId)}
                    >
                        {value || `Select...`}
                    </span>
                );
            }
            return <span key={i} className="text-slate-700 leading-relaxed">{part}</span>;
        });
    };

    const isComplete = Object.keys(selections).length === detectedBlanks.length;

    return (
        <div className="p-4">
            <div className="template-text leading-loose">{renderTemplate()}</div>

            {!isSubmitted && (
                <div className="token-pool">
                    {item.options.map((opt: string) => {
                        const isUsed = Object.values(selections).includes(opt);
                        return (
                            <button
                                key={opt}
                                className={`token ${isUsed ? 'token--used' : ''} ${activeBlank ? 'token--highlight' : ''} ${activeBlank && !isUsed ? 'token--selectable' : ''}`}
                                onClick={() => handleOptionSelect(opt)}
                                disabled={!activeBlank || isUsed || isSubmitted}
                            >
                                {opt}
                            </button>
                        );
                    })}
                </div>
            )}

            <button
                className="submit-btn w-full mt-12"
                disabled={!isComplete || isSubmitted}
                onClick={() => onSubmit(item.id, selections)}
            >
                {isSubmitted ? 'Rationalization Complete ✓' : 'Confirm Drag & Drop Solution'}
            </button>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════
//  Hotspot Renderer
// ═══════════════════════════════════════════════════════════

function Hotspot({ item, onSubmit, isSubmitted, userAnswer }: { item: any; onSubmit: (id: string, answer: unknown) => void; isSubmitted?: boolean; userAnswer?: any }) {
    const [point, setPoint] = useState<{ x: number; y: number } | null>(null);

    // Use userAnswer to restore click position for feedback
    useEffect(() => {
        if (userAnswer && Array.isArray(userAnswer) && userAnswer.length > 0) {
            const firstId = userAnswer[0];
            const h = item.hotspots?.find((hs: any) => hs.id === firstId);
            if (h) {
                setPoint({ x: h.x + (h.width / 2), y: h.y + (h.height / 2) });
            }
        }
    }, [userAnswer, item.hotspots]);

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (isSubmitted) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setPoint({ x: Math.round(x), y: Math.round(y) });
    };

    const handleSubmit = () => {
        if (!point || isSubmitted) return;
        const hotspots = item.hotspots || [];
        // Find which hotspot (if any) contains the point
        const selected = hotspots
            .filter((h: any) =>
                point.x >= h.x && point.x <= (h.x + h.width) &&
                point.y >= h.y && point.y <= (h.y + h.height)
            )
            .map((h: any) => h.id);

        onSubmit(item.id, selected);
    };

    if (!item.imageUrl) {
        return <div className="p-8 text-neutral-500 bg-neutral-50 rounded-2xl">Imagery missing for selection.</div>;
    }

    return (
        <div style={{ textAlign: 'center' }}>
            <div className="hotspot-container" onClick={handleClick}>
                <img
                    src={item.imageUrl}
                    alt="Clinical Stimulus"
                    style={{ maxWidth: '100%', borderRadius: 8, display: 'block' }}
                />
                {point && (
                    <div
                        className="hotspot-marker"
                        style={{ left: `${point.x}%`, top: `${point.y}%` }}
                    />
                )}
            </div>
            <div style={{ marginTop: 12, fontSize: '0.8rem', color: '#64748b' }}>
                {point ? `Marker placed. Review and submit.` : 'Click image to mark anatomical landmark'}
            </div>
            <button
                className="submit-btn"
                disabled={!point || isSubmitted}
                onClick={handleSubmit}
            >
                {isSubmitted ? 'Submitted ✓' : 'Submit Marker'}
            </button>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════
//  Media Item (Graphic/Audio/Video)
// ═══════════════════════════════════════════════════════════

function MediaItem({ item, onSubmit, isSubmitted, userAnswer }: { item: any; onSubmit: (id: string, answer: unknown) => void; isSubmitted?: boolean; userAnswer?: any }) {
    return (
        <div>
            <div className="media-stimulus">
                {item.type === 'graphic' && (
                    <img src={item.imageUrl} alt="Stimulus" style={{ maxWidth: '100%', maxHeight: 400 }} />
                )}
                {item.type === 'audioVideo' && item.mediaType === 'video' && (
                    <video controls style={{ width: '100%', maxHeight: 400 }}>
                        <source src={item.mediaUrl} type="video/mp4" />
                    </video>
                )}
                {item.type === 'audioVideo' && item.mediaType === 'audio' && (
                    <audio controls style={{ width: '100%', padding: 20 }}>
                        <source src={item.mediaUrl} type="audio/mpeg" />
                    </audio>
                )}
            </div>

            <SingleSelect item={item} onSubmit={onSubmit} isSubmitted={isSubmitted} userAnswer={userAnswer} />
        </div>
    );
}

// ═══════════════════════════════════════════════════════════
//  Exhibit/Chart Viewer
// ═══════════════════════════════════════════════════════════

function ExhibitViewer({ item, onSubmit, isSubmitted, userAnswer }: { item: any; onSubmit: (id: string, answer: unknown) => void; isSubmitted?: boolean; userAnswer?: any }) {
    const [activeTab, setActiveTab] = useState(0);

    // Safety checks
    if (!item?.exhibits || item.exhibits.length === 0) {
        return <div className="p-8 text-neutral-500 bg-neutral-100 rounded-2xl border border-neutral-200">
            <h3 className="font-black uppercase tracking-widest text-xs">Radiology Port Closed</h3>
            <p className="text-sm opacity-70">Exhibit artifacts for this clinical item were purged or are currently inaccessible.</p>
        </div>;
    }

    /**
     * NCSBN Exhibits often contain pipe-delimited tables or raw structured text.
     * This utility parses such patterns into actual HTML tables for a professional look.
     */
    const renderParsedContent = (content: string) => {
        // Check if content looks like a markdown table (contains | pipes and multiple lines)
        if (content.includes('|') && content.split('\n').length > 1) {
            const lines = content.trim().split('\n');
            const tableRows = lines.map(line => {
                const cells = line.split('|').filter(cell => cell.trim() !== '' || line.startsWith('|') || line.endsWith('|'));
                // Clean up empty edge cells from split
                if (cells.length > 0 && cells[0] === '') cells.shift();
                if (cells.length > 0 && cells[cells.length - 1] === '') cells.pop();
                return cells.map(c => c.trim());
            }).filter(row => row.length > 0);

            // Basic heuristic: if it looks like a header separator (---), skip it
            const filteredRows = tableRows.filter(row => !row.every(cell => cell.match(/^-+$/)));

            if (filteredRows.length > 1) {
                return (
                    <table className="clinical-table animate-in fade-in zoom-in-95 duration-500">
                        <thead>
                            <tr>
                                {filteredRows[0].map((cell, i) => <th key={i}>{cell}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRows.slice(1).map((row, i) => (
                                <tr key={i}>
                                    {row.map((cell, j) => <td key={j}>{cell}</td>)}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );
            }
        }

        // Bullet point parsing for organized clinical cards (e.g. Neuro Exam)
        if (content.includes('•')) {
            const sections = content.split('•').filter(s => s.trim().length > 0);
            return (
                <div className="clinical-findings-grid animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    {sections.map((section, i) => {
                        // Smart split: handles "CN V (Trigeminal): Intact"
                        const colonIndex = section.indexOf(':');
                        let title = "";
                        let body = section;

                        if (colonIndex !== -1 && colonIndex < 40) { // Safety check to ensure it's a title
                            title = section.substring(0, colonIndex);
                            body = section.substring(colonIndex + 1);
                        }

                        return (
                            <div key={i} className="clinical-finding-card">
                                {title && <div className="finding-title">{title.trim()}</div>}
                                <div className="finding-body">{body.trim()}</div>
                            </div>
                        );
                    })}
                </div>
            );
        }

        // Default: Render as HTML (handles bullet points and standard text)
        return <div className="clinical-note animate-in fade-in slide-in-from-bottom-2 duration-700" dangerouslySetInnerHTML={{ __html: content }} />;
    };

    return (
        <div className="exhibit-frame">
            <div className="exhibit-tabs">
                {item.exhibits.map((ex: { title: string }, i: number) => (
                    <button
                        key={i}
                        className={`exhibit-tab ${activeTab === i ? 'exhibit-tab--active' : ''}`}
                        onClick={() => setActiveTab(i)}
                    >
                        {ex.title}
                    </button>
                ))}
            </div>
            <div className="exhibit-body">
                {renderParsedContent(item.exhibits[activeTab].content)}
            </div>

            <div className="mt-8 border-t border-slate-100 bg-slate-50/50 p-10">
                <div className="flex items-center gap-3 mb-8">
                    <div className="h-1 w-12 bg-primary rounded-full" />
                    <p className="font-black text-xs uppercase tracking-[0.2em] text-slate-400">Clinical Evaluation Question</p>
                </div>
                <SingleSelect item={item} onSubmit={onSubmit} isSubmitted={isSubmitted} userAnswer={userAnswer} />
            </div>
        </div>
    );
}
