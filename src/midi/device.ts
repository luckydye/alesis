/**
 * MIDI device enumeration and connection for Alesis V49.
 *
 * Usage:
 *   const access = await requestMidiAccess();
 *   const { input, output } = findV49Device(access);
 *   setupMessageHandler(input, (data) => console.log("Received:", data));
 *   output.send(queryMessage);
 */

export async function requestMidiAccess(): Promise<MIDIAccess> {
  if (!navigator.requestMIDIAccess) {
    throw new Error("Web MIDI API not supported in this browser. Use Chrome, Edge, or Brave.");
  }

  return await navigator.requestMIDIAccess({ sysex: true });
}

export interface MidiDevice {
  name: string;
  input: MIDIInput;
  output: MIDIOutput;
}

export function discoverV49Devices(access: MIDIAccess): MidiDevice[] {
  const devices: MidiDevice[] = [];
  const inputs = new Map<string, MIDIInput>();
  const outputs = new Map<string, MIDIOutput>();

  function normalizeDeviceName(name: string): string {
    return name.replace(/\s+(In|Out)$/i, "").trim();
  }

  for (const port of access.inputs.values()) {
    if (port.name?.includes("V49")) {
      const baseName = normalizeDeviceName(port.name);
      inputs.set(baseName, port);
    }
  }

  for (const port of access.outputs.values()) {
    if (port.name?.includes("V49")) {
      const baseName = normalizeDeviceName(port.name);
      outputs.set(baseName, port);
    }
  }

  for (const [baseName, input] of inputs) {
    const output = outputs.get(baseName);
    if (output) {
      devices.push({
        name: baseName,
        input,
        output,
      });
    }
  }

  return devices;
}

export function findV49Device(access: MIDIAccess): { input: MIDIInput; output: MIDIOutput } {
  let input: MIDIInput | null = null;
  let output: MIDIOutput | null = null;

  for (const port of access.inputs.values()) {
    if (port.name?.includes("V49 Out")) {
      input = port;
      break;
    }
  }

  for (const port of access.outputs.values()) {
    if (port.name?.includes("V49 In")) {
      output = port;
      break;
    }
  }

  if (!input || !output) {
    throw new Error("Alesis V49 not found. Please connect the device via USB.");
  }

  return { input, output };
}

export function setupMessageHandler(
  input: MIDIInput,
  onMessage: (data: Uint8Array) => void
): void {
  input.onmidimessage = (event) => {
    onMessage(event.data);
  };
}
