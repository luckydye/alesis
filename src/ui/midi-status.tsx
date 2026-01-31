/**
 * Compact MIDI status bar showing the last message.
 */

import type { MidiLogEntry } from "./midi-log.tsx";

interface MidiStatusProps {
  lastEntry: MidiLogEntry | null;
}

export function MidiStatus({ lastEntry }: MidiStatusProps) {
  if (!lastEntry) {
    return (
      <div class="bg-gray-900 border-t border-gray-800 px-4 py-2">
        <div class="flex items-center gap-3 text-xs text-gray-500">
          <span class="font-mono">MIDI</span>
          <span>No activity</span>
        </div>
      </div>
    );
  }

  const formatBytes = (data: Uint8Array): string => {
    return Array.from(data)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join(" ");
  };

  const formatMessage = (): string => {
    const data = lastEntry.data;
    if (lastEntry.type === "note") {
      const note = data[1];
      const velocity = data[2];
      return `Note ${note} vel ${velocity}`;
    }
    if (lastEntry.type === "cc") {
      const cc = data[1];
      const value = data[2];
      return `CC ${cc} = ${value}`;
    }
    if (lastEntry.type === "sysex") {
      return `SysEx (${data.length} bytes)`;
    }
    return formatBytes(data);
  };

  const directionColor = lastEntry.direction === "in" ? "text-blue-400" : "text-green-400";
  const directionSymbol = lastEntry.direction === "in" ? "←" : "→";

  return (
    <div class="bg-gray-900 border-t border-gray-800 px-4 py-2">
      <div class="flex items-center gap-3 text-xs font-mono overflow-hidden whitespace-nowrap">
        <span class="text-gray-500">MIDI</span>
        <span class={directionColor}>{directionSymbol}</span>
        <span class="text-gray-400">{lastEntry.port}</span>
        {lastEntry.type === "sysex" && (
          <span class="text-purple-400 font-semibold">SysEx</span>
        )}
        <span class="text-gray-300">{formatMessage()}</span>
        <span class="text-gray-600 ml-auto">
          {new Date(lastEntry.timestamp).toLocaleTimeString()}.
          {(lastEntry.timestamp % 1000).toString().padStart(3, "0")}
        </span>
      </div>
    </div>
  );
}
