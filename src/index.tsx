/**
 * Main entry point for Alesis V49 browser editor.
 * Initializes MIDI, state, and UI.
 */

import { render, h } from "preact";
import { App } from "./ui/app.tsx";
import { V49State } from "./model/state.ts";
import { parseV49Config, encodeV49Config } from "./model/config.ts";
import { requestMidiAccess, findV49Device, setupMessageHandler } from "./midi/device.ts";
import {
  createQueryMessage,
  createSetMessage,
  isSysExMessage,
  isAlesisMessage,
  extractCommand,
  extractPayload,
} from "./midi/sysex.ts";
import { CMD_CONFIG_REPLY } from "./midi/protocol.ts";

const appState = new V49State();
let midiOutput: MIDIOutput | null = null;

async function handleConnect(): Promise<void> {
  const access = await requestMidiAccess();

  console.log("Available MIDI inputs:");
  for (const input of access.inputs.values()) {
    console.log(`  - ${input.name} (${input.manufacturer})`);
  }

  console.log("Available MIDI outputs:");
  for (const output of access.outputs.values()) {
    console.log(`  - ${output.name} (${output.manufacturer})`);
  }

  const { input, output } = findV49Device(access);
  console.log("Connected to input:", input.name);
  console.log("Connected to output:", output.name);

  midiOutput = output;

  setupMessageHandler(input, (data) => {
    if (data[0] === 0xf0) {
      console.log("Received SysEx:", Array.from(data).map(b => b.toString(16).padStart(2, '0')).join(' '));
    }

    if (!isSysExMessage(data)) return;

    if (!isAlesisMessage(data)) {
      console.log("Not an Alesis message - manufacturer ID:", data[1]?.toString(16), data[2]?.toString(16), data[3]?.toString(16));
      return;
    }

    const cmd = extractCommand(data);
    console.log("Alesis command:", cmd.toString(16));

    if (cmd === CMD_CONFIG_REPLY) {
      console.log("Received config reply");
      const payload = extractPayload(data);
      console.log("Payload length:", payload.length);
      const config = parseV49Config(payload);
      console.log("Parsed config:", config);
      appState.setConfig(config);
    }
  });

  const queryMsg = createQueryMessage();
  console.log("Sending query:", Array.from(queryMsg).map(b => b.toString(16).padStart(2, '0')).join(' '));
  output.send(queryMsg);
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
  midiOutput.send(msg);
}

const root = document.getElementById("root");
if (!root) {
  throw new Error("Root element not found");
}

render(
  <App state={appState} onConnect={handleConnect} onSendToDevice={handleSendToDevice} />,
  root
);
