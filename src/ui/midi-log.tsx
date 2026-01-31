/**
 * MIDI message log panel for debugging and monitoring.
 */

import { Component } from "preact";

export interface MidiLogEntry {
  timestamp: number;
  direction: "in" | "out";
  type: "sysex" | "note" | "cc" | "other";
  port: string;
  data: Uint8Array;
}

interface MidiLogProps {
  entries: MidiLogEntry[];
  onClear: () => void;
}

export class MidiLog extends Component<MidiLogProps> {
  logRef: HTMLDivElement | null = null;

  componentDidUpdate(): void {
    if (this.logRef) {
      this.logRef.scrollTop = this.logRef.scrollHeight;
    }
  }

  formatBytes(data: Uint8Array): string {
    return Array.from(data)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join(" ");
  }

  formatMessage(entry: MidiLogEntry): string {
    const data = entry.data;
    if (entry.type === "note") {
      const note = data[1];
      const velocity = data[2];
      return `Note ${note} vel ${velocity}`;
    }
    if (entry.type === "cc") {
      const cc = data[1];
      const value = data[2];
      return `CC ${cc} = ${value}`;
    }
    return "";
  }

  render() {
    const { entries, onClear } = this.props;

    return (
      <div class="flex flex-col h-full bg-gray-900">
        <div class="flex items-center justify-between px-3 py-2 bg-gray-800 border-b border-gray-700">
          <h3 class="text-sm font-semibold text-gray-300">MIDI Log</h3>
          <button
            onClick={onClear}
            class="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
          >
            Clear
          </button>
        </div>

        <div
          ref={(el) => (this.logRef = el)}
          class="flex-1 overflow-y-auto p-2 space-y-1 font-mono text-xs"
        >
          {entries.length === 0 && (
            <div class="text-gray-500 text-center py-4">No messages yet</div>
          )}

          {entries.map((entry, i) => (
            <div
              key={i}
              class={`p-2 rounded border-l-2 ${
                entry.direction === "in"
                  ? "bg-blue-950 border-blue-500"
                  : "bg-green-950 border-green-500"
              } ${entry.type === "sysex" ? "border-l-4" : ""}`}
            >
              <div class="flex items-center gap-2 text-gray-400 mb-1">
                <span class="text-gray-500">
                  {new Date(entry.timestamp).toLocaleTimeString()}.
                  {(entry.timestamp % 1000).toString().padStart(3, "0")}
                </span>
                <span
                  class={
                    entry.direction === "in" ? "text-blue-400" : "text-green-400"
                  }
                >
                  {entry.direction === "in" ? "←" : "→"}
                </span>
                <span class="text-gray-400">{entry.port}</span>
                {entry.type === "sysex" && (
                  <span class="text-purple-400 font-semibold">SysEx</span>
                )}
              </div>

              {(entry.type === "note" || entry.type === "cc") && (
                <div class="text-cyan-300 mb-1">
                  {this.formatMessage(entry)}
                </div>
              )}

              <div class="text-gray-400 break-all">
                {this.formatBytes(entry.data)}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
}
