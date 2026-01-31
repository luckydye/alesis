/**
 * Control editors for knobs, pads, and buttons.
 * Pure UI components - receive data and dispatch updates via callbacks.
 */

import type {
  KnobConfig,
  PadConfig,
  ButtonConfig,
  MidiChannel,
  KnobMode,
  PadMode,
  ButtonMode,
} from "../model/config.ts";

interface KnobEditorProps {
  index: number;
  config: KnobConfig;
  onUpdate: (index: number, updates: Partial<KnobConfig>) => void;
}

export function KnobEditor({ index, config, onUpdate }: KnobEditorProps) {
  return (
    <div class="border border-gray-200 rounded-lg p-4 bg-white">
      <h3 class="font-semibold mb-3">Knob {index + 1}</h3>

      <div class="space-y-2">
        <div>
          <label class="block text-sm text-gray-600 mb-1">Mode</label>
          <select
            class="w-full border border-gray-300 rounded px-2 py-1"
            value={config.mode}
            onChange={(e) => onUpdate(index, { mode: (e.currentTarget.value as KnobMode) })}
          >
            <option value="cc">CC</option>
            <option value="aftertouch">Aftertouch</option>
          </select>
        </div>

        {config.mode === "cc" && (
          <div>
            <label class="block text-sm text-gray-600 mb-1">CC Number</label>
            <input
              type="number"
              min="0"
              max="127"
              class="w-full border border-gray-300 rounded px-2 py-1"
              value={config.cc}
              onChange={(e) => onUpdate(index, { cc: parseInt(e.currentTarget.value) })}
            />
          </div>
        )}

        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block text-sm text-gray-600 mb-1">Min</label>
            <input
              type="number"
              min="0"
              max="127"
              class="w-full border border-gray-300 rounded px-2 py-1"
              value={config.min}
              onChange={(e) => onUpdate(index, { min: parseInt(e.currentTarget.value) })}
            />
          </div>
          <div>
            <label class="block text-sm text-gray-600 mb-1">Max</label>
            <input
              type="number"
              min="0"
              max="127"
              class="w-full border border-gray-300 rounded px-2 py-1"
              value={config.max}
              onChange={(e) => onUpdate(index, { max: parseInt(e.currentTarget.value) })}
            />
          </div>
        </div>

        <div>
          <label class="block text-sm text-gray-600 mb-1">Channel</label>
          <select
            class="w-full border border-gray-300 rounded px-2 py-1"
            value={config.channel}
            onChange={(e) => onUpdate(index, { channel: parseInt(e.currentTarget.value) as MidiChannel })}
          >
            {[...Array(16)].map((_, i) => (
              <option key={i} value={i}>
                {i + 1}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

interface PadEditorProps {
  index: number;
  config: PadConfig;
  onUpdate: (index: number, updates: Partial<PadConfig>) => void;
}

export function PadEditor({ index, config, onUpdate }: PadEditorProps) {
  return (
    <div class="border border-gray-200 rounded-lg p-4 bg-white">
      <h3 class="font-semibold mb-3">Pad {index + 1}</h3>

      <div class="space-y-2">
        <div>
          <label class="block text-sm text-gray-600 mb-1">Mode</label>
          <select
            class="w-full border border-gray-300 rounded px-2 py-1"
            value={config.mode}
            onChange={(e) => onUpdate(index, { mode: e.currentTarget.value as PadMode })}
          >
            <option value="note">Note</option>
            <option value="toggle_cc">Toggle CC</option>
            <option value="momentary_cc">Momentary CC</option>
          </select>
        </div>

        <div>
          <label class="block text-sm text-gray-600 mb-1">
            {config.mode === "note" ? "Note" : "CC"}
          </label>
          <input
            type="number"
            min="0"
            max="127"
            class="w-full border border-gray-300 rounded px-2 py-1"
            value={config.noteOrCC}
            onChange={(e) => onUpdate(index, { noteOrCC: parseInt(e.currentTarget.value) })}
          />
        </div>

        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block text-sm text-gray-600 mb-1">
              {config.mode === "note" ? "Fixed" : "Min"}
            </label>
            <input
              type="number"
              min="0"
              max="127"
              class="w-full border border-gray-300 rounded px-2 py-1"
              value={config.fixedOrMin}
              onChange={(e) => onUpdate(index, { fixedOrMin: parseInt(e.currentTarget.value) })}
            />
          </div>
          <div>
            <label class="block text-sm text-gray-600 mb-1">
              {config.mode === "note" ? "Velocity" : "Max"}
            </label>
            <input
              type="number"
              min="0"
              max="127"
              class="w-full border border-gray-300 rounded px-2 py-1"
              value={config.velocityOrMax}
              onChange={(e) => onUpdate(index, { velocityOrMax: parseInt(e.currentTarget.value) })}
            />
          </div>
        </div>

        <div>
          <label class="block text-sm text-gray-600 mb-1">Channel</label>
          <select
            class="w-full border border-gray-300 rounded px-2 py-1"
            value={config.channel}
            onChange={(e) => onUpdate(index, { channel: parseInt(e.currentTarget.value) as MidiChannel })}
          >
            {[...Array(16)].map((_, i) => (
              <option key={i} value={i}>
                {i + 1}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

interface ButtonEditorProps {
  index: number;
  config: ButtonConfig;
  onUpdate: (index: number, updates: Partial<ButtonConfig>) => void;
}

export function ButtonEditor({ index, config, onUpdate }: ButtonEditorProps) {
  return (
    <div class="border border-gray-200 rounded-lg p-4 bg-white">
      <h3 class="font-semibold mb-3">Button {index + 1}</h3>

      <div class="space-y-2">
        <div>
          <label class="block text-sm text-gray-600 mb-1">Mode</label>
          <select
            class="w-full border border-gray-300 rounded px-2 py-1"
            value={config.mode}
            onChange={(e) => onUpdate(index, { mode: e.currentTarget.value as ButtonMode })}
          >
            <option value="toggle">Toggle</option>
            <option value="momentary">Momentary</option>
          </select>
        </div>

        <div>
          <label class="block text-sm text-gray-600 mb-1">CC Number</label>
          <input
            type="number"
            min="0"
            max="127"
            class="w-full border border-gray-300 rounded px-2 py-1"
            value={config.cc}
            onChange={(e) => onUpdate(index, { cc: parseInt(e.currentTarget.value) })}
          />
        </div>

        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block text-sm text-gray-600 mb-1">On Value</label>
            <input
              type="number"
              min="0"
              max="127"
              class="w-full border border-gray-300 rounded px-2 py-1"
              value={config.on}
              onChange={(e) => onUpdate(index, { on: parseInt(e.currentTarget.value) })}
            />
          </div>
          <div>
            <label class="block text-sm text-gray-600 mb-1">Off Value</label>
            <input
              type="number"
              min="0"
              max="127"
              class="w-full border border-gray-300 rounded px-2 py-1"
              value={config.off}
              onChange={(e) => onUpdate(index, { off: parseInt(e.currentTarget.value) })}
            />
          </div>
        </div>

        <div>
          <label class="block text-sm text-gray-600 mb-1">Channel</label>
          <select
            class="w-full border border-gray-300 rounded px-2 py-1"
            value={config.channel}
            onChange={(e) => onUpdate(index, { channel: parseInt(e.currentTarget.value) as MidiChannel })}
          >
            {[...Array(16)].map((_, i) => (
              <option key={i} value={i}>
                {i + 1}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
