/**
 * Error boundary component for displaying errors.
 * Does not provide fallback UI - shows error directly to user.
 */

import { Component } from "preact";
import type { ComponentChildren } from "preact";

interface ErrorBoundaryProps {
  children: ComponentChildren;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error): void {
    console.error("Error caught by boundary:", error);
  }

  render() {
    if (this.state.error) {
      return (
        <div class="min-h-screen bg-gray-950 flex items-center justify-center p-8">
          <div class="max-w-2xl w-full bg-red-950 border border-red-700 rounded-lg p-8">
            <h1 class="text-2xl font-bold text-red-300 mb-4">Error</h1>
            <p class="text-red-200 font-mono text-sm whitespace-pre-wrap">
              {this.state.error.message}
            </p>
            <p class="text-red-400 text-xs mt-4">Check console for details.</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
