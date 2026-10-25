'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Delete, History, RotateCcw } from 'lucide-react';

/**
 * Safe Recursive-Descent Math Expression Evaluator
 * Strictly forbids eval() or Function() constructor execution.
 */
function safeEvaluateMath(expr: string): { result?: number; error?: string } {
  // Normalize symbols
  const sanitized = expr
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/−/g, '-')
    .replace(/\s+/g, '');

  if (!sanitized) return { result: 0 };

  // Disallow any characters other than digits, decimals, parentheses, and arithmetic operators
  if (!/^[\d+\-*/().%]+$/.test(sanitized)) {
    return { error: 'Invalid characters in expression' };
  }

  let pos = 0;

  function parseExpression(): number {
    let val = parseTerm();
    while (pos < sanitized.length) {
      const op = sanitized[pos];
      if (op === '+' || op === '-') {
        pos++;
        const nextVal = parseTerm();
        val = op === '+' ? val + nextVal : val - nextVal;
      } else {
        break;
      }
    }
    return val;
  }

  function parseTerm(): number {
    let val = parseFactor();
    while (pos < sanitized.length) {
      const op = sanitized[pos];
      if (op === '*' || op === '/' || op === '%') {
        pos++;
        const nextVal = parseFactor();
        if (op === '*') {
          val = val * nextVal;
        } else if (op === '/') {
          if (nextVal === 0) throw new Error('Division by zero');
          val = val / nextVal;
        } else if (op === '%') {
          val = val % nextVal;
        }
      } else {
        break;
      }
    }
    return val;
  }

  function parseFactor(): number {
    if (pos >= sanitized.length) throw new Error('Unexpected end of expression');

    // Unary plus/minus
    if (sanitized[pos] === '+') {
      pos++;
      return parseFactor();
    }
    if (sanitized[pos] === '-') {
      pos++;
      return -parseFactor();
    }

    if (sanitized[pos] === '(') {
      pos++; // consume '('
      const val = parseExpression();
      if (sanitized[pos] !== ')') {
        throw new Error('Mismatched parentheses');
      }
      pos++; // consume ')'
      return val;
    }

    // Number literal
    const start = pos;
    while (
      pos < sanitized.length &&
      ((sanitized[pos] >= '0' && sanitized[pos] <= '9') || sanitized[pos] === '.')
    ) {
      pos++;
    }

    if (start === pos) {
      throw new Error(`Unexpected token at position ${pos}`);
    }

    const numStr = sanitized.substring(start, pos);
    const num = parseFloat(numStr);
    if (isNaN(num)) throw new Error('Invalid number format');
    return num;
  }

  try {
    const result = parseExpression();
    if (pos < sanitized.length) {
      throw new Error('Unparsed characters remaining');
    }
    return { result };
  } catch (err: any) {
    return { error: err.message || 'Syntax Error' };
  }
}

export function CalculatorApp() {
  const [expression, setExpression] = useState('');
  const [displayValue, setDisplayValue] = useState('0');
  const [history, setHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isCalculated, setIsCalculated] = useState(false);

  const handleInput = useCallback((char: string) => {
    setDisplayValue((prev) => {
      if (isCalculated) {
        setIsCalculated(false);
        return char === '.' ? '0.' : char;
      }
      if (prev === '0' && char !== '.') return char;
      if (char === '.' && prev.includes('.')) return prev;
      return prev + char;
    });
  }, [isCalculated]);

  const handleOperator = useCallback((op: string) => {
    setIsCalculated(false);
    setExpression((prev) => {
      return prev ? `${prev} ${displayValue} ${op}` : `${displayValue} ${op}`;
    });
    setDisplayValue('0');
  }, [displayValue]);

  const handleClear = useCallback(() => {
    setDisplayValue('0');
    setExpression('');
    setIsCalculated(false);
  }, []);

  const handleBackspace = useCallback(() => {
    setDisplayValue((prev) => {
      if (prev.length <= 1) return '0';
      return prev.slice(0, -1);
    });
  }, []);

  const handleToggleSign = useCallback(() => {
    setDisplayValue((prev) => {
      if (prev === '0') return prev;
      return prev.startsWith('-') ? prev.slice(1) : `-${prev}`;
    });
  }, []);

  const handleEquals = useCallback(() => {
    const fullExpr = expression ? `${expression} ${displayValue}` : displayValue;
    const { result, error } = safeEvaluateMath(fullExpr);

    if (error) {
      setDisplayValue(error);
      setIsCalculated(true);
    } else if (result !== undefined) {
      const formatted = Number.isInteger(result)
        ? result.toString()
        : parseFloat(result.toFixed(8)).toString();

      setHistory((prev) => [`${fullExpr} = ${formatted}`, ...prev.slice(0, 19)]);
      setDisplayValue(formatted);
      setExpression('');
      setIsCalculated(true);
    }
  }, [expression, displayValue]);

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return;

      if (e.key >= '0' && e.key <= '9') {
        handleInput(e.key);
      } else if (e.key === '.') {
        handleInput('.');
      } else if (e.key === '+') {
        handleOperator('+');
      } else if (e.key === '-') {
        handleOperator('−');
      } else if (e.key === '*') {
        handleOperator('×');
      } else if (e.key === '/') {
        e.preventDefault();
        handleOperator('÷');
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleEquals();
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Escape') {
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleInput, handleOperator, handleEquals, handleBackspace, handleClear]);

  return (
    <div className="h-full flex flex-col bg-[#11141C] text-slate-200 select-none font-sans text-xs">
      {/* Top Header Bar */}
      <div className="h-9 px-3 bg-[#161B26] border-b border-white/10 flex items-center justify-between shrink-0">
        <span className="font-semibold text-white text-xs">Standard Calculator</span>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className={`p-1.5 rounded-lg border transition-colors ${
            showHistory
              ? 'bg-sky-500/20 text-sky-400 border-sky-500/30'
              : 'bg-white/5 text-slate-400 hover:text-white border-white/5'
          }`}
          title="History log"
        >
          <History size={13} />
        </button>
      </div>

      {showHistory ? (
        /* History View */
        <div className="flex-1 flex flex-col p-4 overflow-hidden bg-[#0F131C]">
          <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2">
            <span className="font-bold text-xs text-white">Calculation History</span>
            <button
              onClick={() => setHistory([])}
              className="text-[10px] text-slate-400 hover:text-red-400 transition-colors"
            >
              Clear History
            </button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2 window-scroll">
            {history.map((item, idx) => (
              <div key={idx} className="p-2 rounded-lg bg-white/5 border border-white/5 text-right font-mono text-xs text-sky-300">
                {item}
              </div>
            ))}
            {history.length === 0 && (
              <div className="py-12 text-center text-slate-400 text-xs">
                There&apos;s no history yet.
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Calculator Keypad View */
        <div className="flex-1 flex flex-col p-4 bg-[#0F131C]">
          {/* Expression & Result Screen */}
          <div className="mb-4 bg-[#141824] border border-white/10 rounded-2xl p-4 flex flex-col items-end justify-center min-h-[85px] shadow-inner">
            <span className="text-[11px] text-slate-400 font-mono tracking-wider h-4">
              {expression}
            </span>
            <span className="text-2xl font-bold text-white font-mono tracking-tight truncate max-w-full">
              {displayValue}
            </span>
          </div>

          {/* Keypad Grid (4 columns) */}
          <div className="flex-1 grid grid-cols-4 gap-2">
            {/* Row 1 */}
            <button
              onClick={handleClear}
              className="rounded-xl bg-white/5 hover:bg-white/10 text-amber-400 font-bold active:scale-95 transition-all text-xs"
            >
              C
            </button>
            <button
              onClick={handleBackspace}
              className="rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-medium active:scale-95 transition-all flex items-center justify-center"
            >
              <Delete size={14} />
            </button>
            <button
              onClick={handleToggleSign}
              className="rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-medium active:scale-95 transition-all text-xs"
            >
              ±
            </button>
            <button
              onClick={() => handleOperator('÷')}
              className="rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 font-bold text-sm active:scale-95 transition-all border border-sky-500/20"
            >
              ÷
            </button>

            {/* Row 2 */}
            <button onClick={() => handleInput('7')} className="rounded-xl bg-[#191F2D] hover:bg-white/10 text-white font-semibold text-sm active:scale-95 transition-all">7</button>
            <button onClick={() => handleInput('8')} className="rounded-xl bg-[#191F2D] hover:bg-white/10 text-white font-semibold text-sm active:scale-95 transition-all">8</button>
            <button onClick={() => handleInput('9')} className="rounded-xl bg-[#191F2D] hover:bg-white/10 text-white font-semibold text-sm active:scale-95 transition-all">9</button>
            <button onClick={() => handleOperator('×')} className="rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 font-bold text-sm active:scale-95 transition-all border border-sky-500/20">×</button>

            {/* Row 3 */}
            <button onClick={() => handleInput('4')} className="rounded-xl bg-[#191F2D] hover:bg-white/10 text-white font-semibold text-sm active:scale-95 transition-all">4</button>
            <button onClick={() => handleInput('5')} className="rounded-xl bg-[#191F2D] hover:bg-white/10 text-white font-semibold text-sm active:scale-95 transition-all">5</button>
            <button onClick={() => handleInput('6')} className="rounded-xl bg-[#191F2D] hover:bg-white/10 text-white font-semibold text-sm active:scale-95 transition-all">6</button>
            <button onClick={() => handleOperator('−')} className="rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 font-bold text-sm active:scale-95 transition-all border border-sky-500/20">−</button>

            {/* Row 4 */}
            <button onClick={() => handleInput('1')} className="rounded-xl bg-[#191F2D] hover:bg-white/10 text-white font-semibold text-sm active:scale-95 transition-all">1</button>
            <button onClick={() => handleInput('2')} className="rounded-xl bg-[#191F2D] hover:bg-white/10 text-white font-semibold text-sm active:scale-95 transition-all">2</button>
            <button onClick={() => handleInput('3')} className="rounded-xl bg-[#191F2D] hover:bg-white/10 text-white font-semibold text-sm active:scale-95 transition-all">3</button>
            <button onClick={() => handleOperator('+')} className="rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 font-bold text-sm active:scale-95 transition-all border border-sky-500/20">+</button>

            {/* Row 5 */}
            <button onClick={() => handleInput('0')} className="rounded-xl bg-[#191F2D] hover:bg-white/10 text-white font-semibold text-sm active:scale-95 transition-all col-span-2">0</button>
            <button onClick={() => handleInput('.')} className="rounded-xl bg-[#191F2D] hover:bg-white/10 text-white font-semibold text-sm active:scale-95 transition-all">.</button>
            <button onClick={handleEquals} className="rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm active:scale-95 transition-all shadow-md shadow-sky-500/20">=</button>
          </div>
        </div>
      )}
    </div>
  );
}
