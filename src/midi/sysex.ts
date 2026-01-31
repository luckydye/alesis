/**
 * SysEx message encoding and decoding for Alesis V49.
 *
 * Message structure:
 *   F0 [manufacturer ID] [header] [command] [header end] [payload?] F7
 *
 * Usage:
 *   const query = createQueryMessage();
 *   output.send(query);
 *
 *   input.onmidimessage = (e) => {
 *     if (isSysExMessage(e.data) && isAlesisMessage(e.data)) {
 *       const cmd = extractCommand(e.data);
 *       const payload = extractPayload(e.data);
 *       // process...
 *     }
 *   };
 */

import {
  SYSEX_START,
  SYSEX_END,
  ALESIS_MANUFACTURER_ID,
  ALESIS_HEADER,
  HEADER_END,
  CMD_QUERY_CONFIG,
  CMD_CONFIG_REPLY,
} from "./protocol.ts";

export function createQueryMessage(): Uint8Array {
  return new Uint8Array([
    SYSEX_START,
    ...ALESIS_MANUFACTURER_ID,
    ...ALESIS_HEADER,
    CMD_QUERY_CONFIG,
    ...HEADER_END,
    SYSEX_END,
  ]);
}

export function createSetMessage(payload: Uint8Array): Uint8Array {
  return new Uint8Array([
    SYSEX_START,
    ...ALESIS_MANUFACTURER_ID,
    ...ALESIS_HEADER,
    0x61,
    ...HEADER_END,
    ...payload,
    SYSEX_END,
  ]);
}

export function isSysExMessage(data: Uint8Array): boolean {
  return data.length >= 2 && data[0] === SYSEX_START && data[data.length - 1] === SYSEX_END;
}

export function isAlesisMessage(data: Uint8Array): boolean {
  if (data.length < 10) return false;

  return (
    data[1] === ALESIS_MANUFACTURER_ID[0] &&
    data[2] === ALESIS_MANUFACTURER_ID[1] &&
    data[3] === ALESIS_MANUFACTURER_ID[2] &&
    data[4] === ALESIS_HEADER[0] &&
    data[5] === ALESIS_HEADER[1]
  );
}

export function extractCommand(data: Uint8Array): number {
  if (!isAlesisMessage(data)) {
    throw new Error("Not a valid Alesis SysEx message");
  }
  return data[6]!;
}

export function extractPayload(data: Uint8Array): Uint8Array {
  if (!isAlesisMessage(data)) {
    throw new Error("Not a valid Alesis SysEx message");
  }

  const cmd = data[6]!;
  if (cmd === CMD_QUERY_CONFIG) {
    return new Uint8Array(0);
  }

  if (cmd === CMD_CONFIG_REPLY) {
    const payloadStart = 9;
    const payloadEnd = data.length - 1;
    return data.slice(payloadStart, payloadEnd);
  }

  throw new Error(`Unknown command: 0x${cmd.toString(16)}`);
}
