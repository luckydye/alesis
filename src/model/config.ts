/**
 * V49 configuration model and parsing logic.
 *
 * Payload structure (based on reverse-engineered protocol):
 *
 * Offset | Size | Component
 * -------|------|----------
 * 0      | 4    | Keys (base_note, octave, channel, velocity_curve)
 * 4      | 1    | PitchWheel (channel)
 * 5      | 4    | ModWheel (channel, cc, min, max)
 * 9      | 4    | Sustain (cc, min, max, channel)
 * 13     | 20   | Knobs (4 × 5 bytes: mode, cc, min, max, channel)
 * 33     | 40   | Pads (8 × 5 bytes: mode, note_or_cc, fixed_or_min, velocity_or_max, channel)
 * 73     | 20   | Buttons (4 × 5 bytes: mode, cc, on, off, channel)
 * Total: 93 bytes
 */

export type MidiChannel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15;
export type MidiValue = number; // 0-127
export type MidiNote = number; // 0-127

export interface KeysConfig {
  baseNote: MidiNote;
  octave: number; // -5 to +5
  channel: MidiChannel;
  velocityCurve: number;
}

export interface PitchWheelConfig {
  channel: MidiChannel;
}

export interface ModWheelConfig {
  channel: MidiChannel;
  cc: MidiValue;
  min: MidiValue;
  max: MidiValue;
}

export interface SustainConfig {
  cc: MidiValue;
  min: MidiValue;
  max: MidiValue;
  channel: MidiChannel;
}

export type KnobMode = "cc" | "aftertouch";

export interface KnobConfig {
  mode: KnobMode;
  cc: MidiValue;
  min: MidiValue;
  max: MidiValue;
  channel: MidiChannel;
}

export type PadMode = "note" | "toggle_cc" | "momentary_cc";

export interface PadConfig {
  mode: PadMode;
  noteOrCC: number;
  fixedOrMin: MidiValue;
  velocityOrMax: MidiValue;
  channel: MidiChannel;
}

export type ButtonMode = "toggle" | "momentary";

export interface ButtonConfig {
  mode: ButtonMode;
  cc: MidiValue;
  on: MidiValue;
  off: MidiValue;
  channel: MidiChannel;
}

export interface V49Config {
  keys: KeysConfig;
  pitchWheel: PitchWheelConfig;
  modWheel: ModWheelConfig;
  sustain: SustainConfig;
  knobs: [KnobConfig, KnobConfig, KnobConfig, KnobConfig];
  pads: [PadConfig, PadConfig, PadConfig, PadConfig, PadConfig, PadConfig, PadConfig, PadConfig];
  buttons: [ButtonConfig, ButtonConfig, ButtonConfig, ButtonConfig];
}

function validateMidiValue(value: number, name: string): MidiValue {
  if (value < 0 || value > 127) {
    throw new Error(`${name} must be 0-127, got ${value}`);
  }
  return value;
}

function validateChannel(value: number, name: string): MidiChannel {
  if (value < 0 || value > 15) {
    throw new Error(`${name} must be 0-15, got ${value}`);
  }
  return value as MidiChannel;
}

function parseKnobMode(mode: number): KnobMode {
  if (mode === 0x00) return "cc";
  if (mode === 0x01) return "aftertouch";
  throw new Error(`Invalid knob mode: 0x${mode.toString(16)}`);
}

function parsePadMode(mode: number): PadMode {
  if (mode === 0x00) return "note";
  if (mode === 0x01) return "toggle_cc";
  if (mode === 0x02) return "momentary_cc";
  throw new Error(`Invalid pad mode: 0x${mode.toString(16)}`);
}

function parseButtonMode(mode: number): ButtonMode {
  if (mode === 0x00) return "toggle";
  if (mode === 0x01) return "momentary";
  throw new Error(`Invalid button mode: 0x${mode.toString(16)}`);
}

export function parseV49Config(payload: Uint8Array): V49Config {
  if (payload.length !== 93) {
    throw new Error(`Expected 93 bytes, got ${payload.length}`);
  }

  let offset = 0;

  const keys: KeysConfig = {
    baseNote: validateMidiValue(payload[offset++]!, "keys.baseNote"),
    octave: payload[offset++]!,
    channel: validateChannel(payload[offset++]!, "keys.channel"),
    velocityCurve: payload[offset++]!,
  };

  const pitchWheel: PitchWheelConfig = {
    channel: validateChannel(payload[offset++]!, "pitchWheel.channel"),
  };

  const modWheel: ModWheelConfig = {
    channel: validateChannel(payload[offset++]!, "modWheel.channel"),
    cc: validateMidiValue(payload[offset++]!, "modWheel.cc"),
    min: validateMidiValue(payload[offset++]!, "modWheel.min"),
    max: validateMidiValue(payload[offset++]!, "modWheel.max"),
  };

  const sustain: SustainConfig = {
    cc: validateMidiValue(payload[offset++]!, "sustain.cc"),
    min: validateMidiValue(payload[offset++]!, "sustain.min"),
    max: validateMidiValue(payload[offset++]!, "sustain.max"),
    channel: validateChannel(payload[offset++]!, "sustain.channel"),
  };

  const knobs: [KnobConfig, KnobConfig, KnobConfig, KnobConfig] = [
    {
      mode: parseKnobMode(payload[offset++]!),
      cc: validateMidiValue(payload[offset++]!, "knob1.cc"),
      min: validateMidiValue(payload[offset++]!, "knob1.min"),
      max: validateMidiValue(payload[offset++]!, "knob1.max"),
      channel: validateChannel(payload[offset++]!, "knob1.channel"),
    },
    {
      mode: parseKnobMode(payload[offset++]!),
      cc: validateMidiValue(payload[offset++]!, "knob2.cc"),
      min: validateMidiValue(payload[offset++]!, "knob2.min"),
      max: validateMidiValue(payload[offset++]!, "knob2.max"),
      channel: validateChannel(payload[offset++]!, "knob2.channel"),
    },
    {
      mode: parseKnobMode(payload[offset++]!),
      cc: validateMidiValue(payload[offset++]!, "knob3.cc"),
      min: validateMidiValue(payload[offset++]!, "knob3.min"),
      max: validateMidiValue(payload[offset++]!, "knob3.max"),
      channel: validateChannel(payload[offset++]!, "knob3.channel"),
    },
    {
      mode: parseKnobMode(payload[offset++]!),
      cc: validateMidiValue(payload[offset++]!, "knob4.cc"),
      min: validateMidiValue(payload[offset++]!, "knob4.min"),
      max: validateMidiValue(payload[offset++]!, "knob4.max"),
      channel: validateChannel(payload[offset++]!, "knob4.channel"),
    },
  ];

  const pads: [PadConfig, PadConfig, PadConfig, PadConfig, PadConfig, PadConfig, PadConfig, PadConfig] = [
    ...Array(8),
  ].map((_, i) => ({
    mode: parsePadMode(payload[offset++]!),
    noteOrCC: validateMidiValue(payload[offset++]!, `pad${i + 1}.noteOrCC`),
    fixedOrMin: validateMidiValue(payload[offset++]!, `pad${i + 1}.fixedOrMin`),
    velocityOrMax: validateMidiValue(payload[offset++]!, `pad${i + 1}.velocityOrMax`),
    channel: validateChannel(payload[offset++]!, `pad${i + 1}.channel`),
  })) as [PadConfig, PadConfig, PadConfig, PadConfig, PadConfig, PadConfig, PadConfig, PadConfig];

  const buttons: [ButtonConfig, ButtonConfig, ButtonConfig, ButtonConfig] = [...Array(4)].map(
    (_, i) => ({
      mode: parseButtonMode(payload[offset++]!),
      cc: validateMidiValue(payload[offset++]!, `button${i + 1}.cc`),
      on: validateMidiValue(payload[offset++]!, `button${i + 1}.on`),
      off: validateMidiValue(payload[offset++]!, `button${i + 1}.off`),
      channel: validateChannel(payload[offset++]!, `button${i + 1}.channel`),
    })
  ) as [ButtonConfig, ButtonConfig, ButtonConfig, ButtonConfig];

  return {
    keys,
    pitchWheel,
    modWheel,
    sustain,
    knobs,
    pads,
    buttons,
  };
}

function encodeKnobMode(mode: KnobMode): number {
  if (mode === "cc") return 0x00;
  if (mode === "aftertouch") return 0x01;
  throw new Error(`Invalid knob mode: ${mode}`);
}

function encodePadMode(mode: PadMode): number {
  if (mode === "note") return 0x00;
  if (mode === "toggle_cc") return 0x01;
  if (mode === "momentary_cc") return 0x02;
  throw new Error(`Invalid pad mode: ${mode}`);
}

function encodeButtonMode(mode: ButtonMode): number {
  if (mode === "toggle") return 0x00;
  if (mode === "momentary") return 0x01;
  throw new Error(`Invalid button mode: ${mode}`);
}

export function encodeV49Config(config: V49Config): Uint8Array {
  const payload = new Uint8Array(93);
  let offset = 0;

  payload[offset++] = config.keys.baseNote;
  payload[offset++] = config.keys.octave;
  payload[offset++] = config.keys.channel;
  payload[offset++] = config.keys.velocityCurve;

  payload[offset++] = config.pitchWheel.channel;

  payload[offset++] = config.modWheel.channel;
  payload[offset++] = config.modWheel.cc;
  payload[offset++] = config.modWheel.min;
  payload[offset++] = config.modWheel.max;

  payload[offset++] = config.sustain.cc;
  payload[offset++] = config.sustain.min;
  payload[offset++] = config.sustain.max;
  payload[offset++] = config.sustain.channel;

  for (const knob of config.knobs) {
    payload[offset++] = encodeKnobMode(knob.mode);
    payload[offset++] = knob.cc;
    payload[offset++] = knob.min;
    payload[offset++] = knob.max;
    payload[offset++] = knob.channel;
  }

  for (const pad of config.pads) {
    payload[offset++] = encodePadMode(pad.mode);
    payload[offset++] = pad.noteOrCC;
    payload[offset++] = pad.fixedOrMin;
    payload[offset++] = pad.velocityOrMax;
    payload[offset++] = pad.channel;
  }

  for (const button of config.buttons) {
    payload[offset++] = encodeButtonMode(button.mode);
    payload[offset++] = button.cc;
    payload[offset++] = button.on;
    payload[offset++] = button.off;
    payload[offset++] = button.channel;
  }

  return payload;
}
