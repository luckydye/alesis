/**
 * Main entry point for Alesis V49 browser editor.
 * Initializes MIDI, state, and UI.
 */

import { render, h, createRef } from "preact";
import { App } from "./ui/app.tsx";
import { V49State } from "./model/state.ts";
import { parseV49Config, encodeV49Config } from "./model/config.ts";
import { requestMidiAccess, discoverV49Devices } from "./midi/device.ts";
import {
  createQueryMessage,
  createSetMessage,
  isSysExMessage,
  isAlesisMessage,
  extractCommand,
  extractPayload,
} from "./midi/sysex.ts";
import { CMD_CONFIG_REPLY } from "./midi/protocol.ts";
import type { MidiLogEntry } from "./ui/midi-log.tsx";
import type { V49Device } from "./ui/device-selector.tsx";

const appState = new V49State();
let midiInput: MIDIInput | null = null;
let midiOutput: MIDIOutput | null = null;
const appRef = createRef<App>();

function addLogEntry(entry: MidiLogEntry): void {
  const app = appRef.current;
  if (app) {
    app.addLogEntry(entry);
  }
}

function classifyMessage(data: Uint8Array): "sysex" | "note" | "cc" | "other" {
  if (data[0] === 0xf0) return "sysex";
  const status = data[0]! & 0xf0;
  if (status === 0x90 || status === 0x80) return "note";
  if (status === 0xb0) return "cc";
  return "other";
}

async function handleDiscover(): Promise<V49Device[]> {
  const access = await requestMidiAccess();
  const devices = discoverV49Devices(access);

  return devices.map((d) => ({
    name: d.name,
    inputId: d.input.id,
    outputId: d.output.id,
  }));
}

async function handleConnect(device: V49Device): Promise<void> {
  const access = await requestMidiAccess();
  const devices = discoverV49Devices(access);

  const selectedDevice = devices.find((d) => d.input.id === device.inputId);
  if (!selectedDevice) {
    throw new Error("Selected device not found");
  }

  midiInput = selectedDevice.input;
  midiOutput = selectedDevice.output;

  selectedDevice.input.onmidimessage = (event) => {
    const data = event.data;
    const entry: MidiLogEntry = {
      timestamp: Date.now(),
      direction: "in",
      type: classifyMessage(data),
      port: selectedDevice.input.name || "Unknown",
      data,
    };

    addLogEntry(entry);

    if (!isSysExMessage(data)) return;
    if (!isAlesisMessage(data)) return;

    const cmd = extractCommand(data);
    if (cmd === CMD_CONFIG_REPLY) {
      const payload = extractPayload(data);
      const config = parseV49Config(payload);
      appState.setConfig(config);
    }
  };

  const queryMsg = createQueryMessage();
  addLogEntry({
    timestamp: Date.now(),
    direction: "out",
    type: "sysex",
    port: selectedDevice.output.name || "Unknown",
    data: queryMsg,
  });
  selectedDevice.output.send(queryMsg);
}

async function handleSendToDevice(): Promise<void> {
  if (!midiOutput) {
    throw new Error("MIDI output not initialized");
  }

  if (!appState.config) {
    throw new Error("No configuration to send");
  }

  const payload = encodeV49Config(appState.config);
  const msg = createSetMessage(payload);

  addLogEntry({
    timestamp: Date.now(),
    direction: "out",
    type: "sysex",
    port: midiOutput.name || "Unknown",
    data: msg,
  });

  midiOutput.send(msg);
}

const root = document.getElementById("root");
if (!root) {
  throw new Error("Root element not found");
}

render(
  <App
    ref={appRef}
    state={appState}
    onDiscover={handleDiscover}
    onConnect={handleConnect}
    onSendToDevice={handleSendToDevice}
  />,
  root
);
