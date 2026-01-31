/**
 * Application state management for V49 configuration.
 *
 * Usage:
 *   const state = new V49State();
 *
 *   // Subscribe to changes
 *   const unsubscribe = state.subscribe((config) => {
 *     console.log("Config updated:", config);
 *   });
 *
 *   // Set initial config from device
 *   state.setConfig(parsedConfig);
 *
 *   // Update individual controls
 *   state.updateKnob(0, { cc: 42, channel: 4 });
 *   state.updatePad(2, { mode: "toggle_cc", noteOrCC: 20 });
 *
 *   // Clean up
 *   unsubscribe();
 */

import type {
  V49Config,
  KnobConfig,
  PadConfig,
  ButtonConfig,
  KeysConfig,
  PitchWheelConfig,
  ModWheelConfig,
  SustainConfig,
} from "./config.ts";

export type StateListener = (config: V49Config) => void;

export class V49State {
  config: V49Config | null = null;
  listeners = new Set<StateListener>();

  setConfig(config: V49Config): void {
    this.config = config;
    this.notifyListeners();
  }

  updateKeys(updates: Partial<KeysConfig>): void {
    if (!this.config) {
      throw new Error("Config not initialized");
    }
    this.config.keys = { ...this.config.keys, ...updates };
    this.notifyListeners();
  }

  updatePitchWheel(updates: Partial<PitchWheelConfig>): void {
    if (!this.config) {
      throw new Error("Config not initialized");
    }
    this.config.pitchWheel = { ...this.config.pitchWheel, ...updates };
    this.notifyListeners();
  }

  updateModWheel(updates: Partial<ModWheelConfig>): void {
    if (!this.config) {
      throw new Error("Config not initialized");
    }
    this.config.modWheel = { ...this.config.modWheel, ...updates };
    this.notifyListeners();
  }

  updateSustain(updates: Partial<SustainConfig>): void {
    if (!this.config) {
      throw new Error("Config not initialized");
    }
    this.config.sustain = { ...this.config.sustain, ...updates };
    this.notifyListeners();
  }

  updateKnob(index: number, updates: Partial<KnobConfig>): void {
    if (!this.config) {
      throw new Error("Config not initialized");
    }
    if (index < 0 || index >= this.config.knobs.length) {
      throw new Error(`Knob index out of range: ${index}`);
    }
    this.config.knobs[index] = { ...this.config.knobs[index]!, ...updates };
    this.notifyListeners();
  }

  updatePad(index: number, updates: Partial<PadConfig>): void {
    if (!this.config) {
      throw new Error("Config not initialized");
    }
    if (index < 0 || index >= this.config.pads.length) {
      throw new Error(`Pad index out of range: ${index}`);
    }
    this.config.pads[index] = { ...this.config.pads[index]!, ...updates };
    this.notifyListeners();
  }

  updateButton(index: number, updates: Partial<ButtonConfig>): void {
    if (!this.config) {
      throw new Error("Config not initialized");
    }
    if (index < 0 || index >= this.config.buttons.length) {
      throw new Error(`Button index out of range: ${index}`);
    }
    this.config.buttons[index] = { ...this.config.buttons[index]!, ...updates };
    this.notifyListeners();
  }

  subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  notifyListeners(): void {
    if (!this.config) return;
    for (const listener of this.listeners) {
      listener(this.config);
    }
  }
}
