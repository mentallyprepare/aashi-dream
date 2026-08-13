import React from "react";

type ErrorBoundaryState = {
  error: Error | null;
};

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <main className="grid min-h-screen place-items-center bg-[var(--bg-primary)] p-6 text-[var(--text-primary)]">
        <section className="w-full max-w-2xl border-2 border-[var(--border)] bg-[var(--bg-secondary)] p-6">
          <div className="mono text-[10px] font-bold uppercase tracking-widest text-[var(--accent-red)]">Runtime Error</div>
          <h1 className="heading mt-2 text-3xl font-bold text-[var(--accent-indigo)]">Aashi Dreams needs a refresh</h1>
          <p className="mt-3 text-sm text-[var(--text-secondary)]">
            The app caught a screen error instead of crashing fully. Reload the page; if it repeats, run the release check and inspect the message below.
          </p>
          <pre className="mt-4 max-h-56 overflow-auto border border-[var(--border)] bg-[var(--bg-primary)] p-3 text-xs text-[var(--text-secondary)]">
            {this.state.error.message}
          </pre>
          <button className="mt-4 bg-[var(--accent-indigo)] px-4 py-2 text-sm font-bold text-white" onClick={() => window.location.reload()} type="button">
            Reload App
          </button>
        </section>
      </main>
    );
  }
}
