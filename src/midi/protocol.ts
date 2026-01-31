/**
 * Alesis V49 SysEx protocol constants.
 *
 * Based on reverse-engineered protocol:
 * - Manufacturer ID: 00 00 0E (Alesis)
 * - Header: 00 41
 * - Commands: 0x61 (set), 0x62 (query), 0x63 (reply)
 * - Query format: F0 00 00 0E 00 41 62 00 5D F7
 */

export const SYSEX_START = 0xf0;
export const SYSEX_END = 0xf7;

export const ALESIS_MANUFACTURER_ID = [0x00, 0x00, 0x0e] as const;
export const ALESIS_HEADER = [0x00, 0x42] as const;
export const HEADER_END = [0x00, 0x5d] as const;

export const CMD_SET_CONFIG = 0x61;
export const CMD_QUERY_CONFIG = 0x62;
export const CMD_CONFIG_REPLY = 0x63;

export const QUERY_MESSAGE_LENGTH = 10;
