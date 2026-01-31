/**
 * Main application component.
 * Orchestrates MIDI connection, state management, and UI rendering.
 */

import { Component } from "preact";
import { ErrorBoundary } from "./error-boundary.tsx";
import { DeviceSelector, type V49Device } from "./device-selector.tsx";
import { KeysEditor, KnobEditor, PadEditor, ButtonEditor } from "./controls.tsx";
import { MidiStatus } from "./midi-status.tsx";
import type { MidiLogEntry } from "./midi-log.tsx";
import { ControllerIllustration } from "./controller-illustration.tsx";
import type { V49Config } from "../model/config.ts";
import type { V49State } from "../model/state.ts";

interface AppProps {
  state: V49State;
  onDiscover: () => Promise<V49Device[]>;
  onConnect: (device: V49Device) => Promise<void>;
  onSendToDevice: () => Promise<void>;
  onMidiMessage?: (entry: MidiLogEntry) => void;
}

interface AppState {
  connected: boolean;
  connectedDevice: string | null;
  devices: V49Device[];
  discovering: boolean;
  config: V49Config | null;
  sending: boolean;
  lastMidiMessage: MidiLogEntry | null;
  activeControl: { type: "knob" | "pad" | "button" | "keys"; index?: number } | null;
}

export class App extends Component<AppProps, AppState> {
  state: AppState = {
    connected: false,
    connectedDevice: null,
    devices: [],
    discovering: false,
    config: null,
    sending: false,
    lastMidiMessage: null,
    activeControl: null,
  };

  unsubscribe: (() => void) | null = null;
  activeControlTimeout: number | null = null;

  componentDidMount(): void {
    this.unsubscribe = this.props.state.subscribe((config) => {
      this.setState({ config });
    });

    if (this.props.state.config) {
      this.setState({ config: this.props.state.config });
    }
  }

  componentWillUnmount(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
    if (this.activeControlTimeout) {
      clearTimeout(this.activeControlTimeout);
    }
  }

  handleDiscover = async () => {
    this.setState({ discovering: true });
    try {
      const devices = await this.props.onDiscover();
      this.setState({ devices, discovering: false });
    } catch (err) {
      this.setState({ discovering: false });
      throw err;
    }
  };

  handleConnect = async (device: V49Device) => {
    await this.props.onConnect(device);
    this.setState({ connected: true, connectedDevice: device.name });
  };

  handleSendToDevice = async () => {
    this.setState({ sending: true });
    try {
      await this.props.onSendToDevice();
    } finally {
      this.setState({ sending: false });
    }
  };

  addLogEntry = (entry: MidiLogEntry) => {
    this.setState({ lastMidiMessage: entry });

    if (entry.direction === "in" && entry.type === "cc" && this.state.config) {
      const cc = entry.data[1];

      const knobIndex = this.state.config.knobs.findIndex((k) => k.mode === "cc" && k.cc === cc);
      if (knobIndex !== -1) {
        this.setActiveControl("knob", knobIndex);
        return;
      }

      const padIndex = this.state.config.pads.findIndex(
        (p) => (p.mode === "toggle_cc" || p.mode === "momentary_cc") && p.noteOrCC === cc
      );
      if (padIndex !== -1) {
        this.setActiveControl("pad", padIndex);
        return;
      }

      const buttonIndex = this.state.config.buttons.findIndex((b) => b.cc === cc);
      if (buttonIndex !== -1) {
        this.setActiveControl("button", buttonIndex);
        return;
      }
    }

    if (entry.direction === "in" && entry.type === "note" && this.state.config) {
      const note = entry.data[1];
      const padIndex = this.state.config.pads.findIndex((p) => p.mode === "note" && p.noteOrCC === note);
      if (padIndex !== -1) {
        this.setActiveControl("pad", padIndex);
        return;
      }

      this.setActiveControl("keys");
    }
  };

  setActiveControl = (type: "knob" | "pad" | "button" | "keys", index?: number) => {
    if (this.activeControlTimeout) {
      clearTimeout(this.activeControlTimeout);
    }

    this.setState({ activeControl: { type, index } });

    this.activeControlTimeout = window.setTimeout(() => {
      this.setState({ activeControl: null });
    }, 1000);
  };

  handleControlClick = (type: "knob" | "pad" | "button" | "keys", index?: number) => {
    const elementId = type === "keys" ? "keys-editor" : `${type}-${index}`;
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      this.setActiveControl(type, index);
    }
  };

  render() {
    const { config, connected, connectedDevice, devices, discovering, sending, lastMidiMessage, activeControl } = this.state;
    const { state } = this.props;

    return (
      <ErrorBoundary>
        <div class="flex flex-col h-screen bg-gray-950 text-gray-100">
            <header class="bg-gray-900 border-b border-gray-800 px-6 py-4">
              <div class="flex items-center justify-between">
                <div>
                  <h1 class="text-2xl font-bold text-gray-100">Alesis V49 Editor</h1>
                  <p class="text-sm text-gray-400">MIDI Configuration Tool</p>
                </div>
                {connected && (
                  <div class="flex items-center gap-4">
                    <DeviceSelector
                      connected={connected}
                      connectedDevice={connectedDevice}
                      devices={devices}
                      discovering={discovering}
                      onDiscover={this.handleDiscover}
                      onConnect={this.handleConnect}
                    />
                    <button
                      onClick={this.handleSendToDevice}
                      disabled={sending}
                      class="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold rounded-lg transition-colors"
                    >
                      {sending ? "Sending..." : "Send to Device"}
                    </button>
                  </div>
                )}
              </div>
            </header>

            {/* Initial state - centered discover/device list */}
            {!connected && (
              <div class="flex-1 flex items-center justify-center">
                <div class="text-center max-w-md w-full px-6">
                  {devices.length === 0 && !discovering && (
                    <>
                      <div class="mb-6">
                        <svg class="w-24 h-24 mx-auto text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                        </svg>
                      </div>
                      <h2 class="text-2xl font-semibold text-gray-300 mb-3">No Device Connected</h2>
                      <p class="text-gray-500 mb-6">Connect your Alesis V49 via USB to get started</p>
                      <button
                        onClick={this.handleDiscover}
                        class="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors text-lg"
                      >
                        Discover Devices
                      </button>
                    </>
                  )}

                  {discovering && (
                    <>
                      <div class="mb-6">
                        <div class="animate-spin rounded-full h-24 w-24 border-b-4 border-blue-500 mx-auto"></div>
                      </div>
                      <h2 class="text-2xl font-semibold text-gray-300">Discovering devices...</h2>
                    </>
                  )}

                  {devices.length > 0 && !discovering && (
                    <>
                      <div class="mb-6">
                        <svg class="w-16 h-16 mx-auto text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                        </svg>
                      </div>
                      <h2 class="text-2xl font-semibold text-gray-300 mb-6">Select Device</h2>
                      <div class="space-y-3 mb-6">
                        {devices.map((device) => (
                          <button
                            key={device.inputId}
                            onClick={() => this.handleConnect(device)}
                            class="w-full px-6 py-4 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg transition-colors text-left flex items-center gap-4"
                          >
                            <div class="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0"></div>
                            <span class="font-semibold text-lg">{device.name}</span>
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={this.handleDiscover}
                        class="text-gray-500 hover:text-gray-300 text-sm transition-colors"
                      >
                        Refresh
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Fixed illustration at top */}
            {connected && config && (
              <div class="flex-1 p-6 flex justify-center items-center">
                <ControllerIllustration
                  config={config}
                  activeControl={activeControl}
                  onControlClick={this.handleControlClick}
                />
              </div>
            )}

            <div class="flex-none p-6">
              {connected && config && (
                <div class="gap-6 overflow-auto flex">
                  {/* Keybed */}
                  <section class="flex-none">
                    <div class="flex items-center justify-between mb-3">
                      <h2 class="text-lg font-semibold text-gray-200 pr-6">Keybed</h2>
                      <span class="text-xs text-gray-500">49-Key Keybed</span>
                    </div>
                    <div id="keys-editor">
                      <KeysEditor
                        config={config.keys}
                        active={activeControl?.type === "keys"}
                        onUpdate={(updates) => state.updateKeys(updates)}
                      />
                    </div>
                  </section>

                  {/* Knobs */}
                  <section class="flex-none">
                    <div class="flex items-center justify-between mb-3">
                      <h2 class="text-lg font-semibold text-gray-200">Knobs</h2>
                      <span class="text-xs text-gray-500">4 Rotary Knobs</span>
                    </div>
                    <div class="flex gap-4">
                      {config.knobs.map((knob, i) => (
                        <KnobEditor
                          key={i}
                          index={i}
                          config={knob}
                          active={activeControl?.type === "knob" && activeControl.index === i}
                          onUpdate={(idx, updates) => state.updateKnob(idx, updates)}
                        />
                      ))}
                    </div>
                  </section>

                  {/* Pads */}
                  <section class="flex-none">
                    <div class="flex items-center justify-between mb-3">
                      <h2 class="text-lg font-semibold text-gray-200">Pads</h2>
                      <span class="text-xs text-gray-500">8 Velocity-Sensitive Pads</span>
                    </div>
                    <div class="flex gap-4">
                      {config.pads.map((pad, i) => (
                        <PadEditor
                          key={i}
                          index={i}
                          config={pad}
                          active={activeControl?.type === "pad" && activeControl.index === i}
                          onUpdate={(idx, updates) => state.updatePad(idx, updates)}
                        />
                      ))}
                    </div>
                  </section>

                  {/* Buttons */}
                  <section class="flex-none">
                    <div class="flex items-center justify-between mb-3">
                      <h2 class="text-lg font-semibold text-gray-200">Buttons</h2>
                      <span class="text-xs text-gray-500">4 Function Buttons</span>
                    </div>
                    <div class="flex gap-4">
                      {config.buttons.map((button, i) => (
                        <ButtonEditor
                          key={i}
                          index={i}
                          config={button}
                          active={activeControl?.type === "button" && activeControl.index === i}
                          onUpdate={(idx, updates) => state.updateButton(idx, updates)}
                        />
                      ))}
                    </div>
                  </section>
                </div>
              )}

              {connected && !config && (
                <div class="flex items-center justify-center h-64">
                  <div class="text-center">
                    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p class="text-gray-400">Loading configuration...</p>
                  </div>
                </div>
              )}
            </div>

          {/* MIDI Status Bar */}
          {connected && <MidiStatus lastEntry={lastMidiMessage} />}
        </div>
      </ErrorBoundary>
    );
  }
}
