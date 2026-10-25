'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  appId?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class AppErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`Unhandled error in application "${this.props.appId}":`, error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="h-full w-full flex flex-col items-center justify-center p-6 bg-[#131722] text-slate-200 select-none">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 shadow-lg shadow-amber-500/5">
            <AlertTriangle size={24} />
          </div>
          <h2 className="text-sm font-semibold text-white mb-1">
            Application Encountered an Error
          </h2>
          <p className="text-xs text-slate-400 text-center max-w-sm mb-4 leading-relaxed">
            {this.state.error?.message || 'An unexpected runtime issue occurred in this window.'}
          </p>
          <button
            onClick={this.handleReset}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 active:scale-95 text-xs text-white transition-all border border-white/10"
          >
            <RotateCcw size={13} />
            <span>Reload Application</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
