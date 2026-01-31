/**
 * Procedurally generated illustration of the Alesis V49 controller.
 * Shows visual feedback for active controls.
 */

import type { V49Config } from "../model/config.ts";

interface ControllerIllustrationProps {
  config: V49Config | null;
  activeControl: { type: "knob" | "pad" | "button"; index: number } | null;
  onControlClick?: (type: "knob" | "pad" | "button", index: number) => void;
}

export function ControllerIllustration({ config, activeControl, onControlClick }: ControllerIllustrationProps) {
  const isActive = (type: string, index: number) =>
    activeControl?.type === type && activeControl?.index === index;

  const handleClick = (type: "knob" | "pad" | "button", index: number) => {
    if (onControlClick) {
      onControlClick(type, index);
    }
  };

  return (
    <svg
      viewBox="0 0 900 200"
      class="w-full h-auto"
      style="filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.5))"
    >
      {/* Controller body */}
      <rect x="5" y="5" width="890" height="190" rx="8" fill="#1a1a1a" stroke="#333" stroke-width="2" />

      {/* Brand */}
      <text x="450" y="25" text-anchor="middle" fill="#4a5568" font-size="12" font-weight="bold" font-family="sans-serif">
        ALESIS V49
      </text>

      {/* Top section: Knobs, Pads, Buttons in a row */}
      <g transform="translate(0, 40)">
        {/* Knobs - left */}
        <g transform="translate(40, 0)">
          {[0, 1, 2, 3].map((i) => {
            const active = isActive("knob", i);
            return (
              <g
                key={i}
                transform={`translate(${i * 45}, 0)`}
                onClick={() => handleClick("knob", i)}
                class="cursor-pointer"
              >
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill={active ? "#06b6d4" : "#2d3748"}
                  stroke={active ? "#0891b2" : "#4a5568"}
                  stroke-width="2"
                  class="transition-all duration-300 hover:brightness-125"
                />
                <line
                  x1="18"
                  y1="18"
                  x2="18"
                  y2="7"
                  stroke={active ? "#fff" : "#718096"}
                  stroke-width="2"
                  stroke-linecap="round"
                />
                <text
                  x="18"
                  y="45"
                  text-anchor="middle"
                  fill={active ? "#0891b2" : "#718096"}
                  font-size="8"
                  font-family="monospace"
                >
                  K{i + 1}
                </text>
              </g>
            );
          })}
        </g>

        {/* Pads - center (2x4 compact) */}
        <g transform="translate(240, 0)">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
            const active = isActive("pad", i);
            const row = Math.floor(i / 4);
            const col = i % 4;
            return (
              <g
                key={i}
                transform={`translate(${col * 40}, ${row * 28})`}
                onClick={() => handleClick("pad", i)}
                class="cursor-pointer"
              >
                <rect
                  x="2"
                  y="2"
                  width="32"
                  height="22"
                  rx="2"
                  fill={active ? "#a855f7" : "#2d3748"}
                  stroke={active ? "#9333ea" : "#4a5568"}
                  stroke-width="2"
                  class="transition-all duration-300 hover:brightness-125"
                />
                <text
                  x="18"
                  y="16"
                  text-anchor="middle"
                  fill={active ? "#fff" : "#718096"}
                  font-size="10"
                  font-weight="bold"
                  font-family="monospace"
                >
                  {i + 1}
                </text>
              </g>
            );
          })}
        </g>

        {/* Buttons - right (vertical stack) */}
        <g transform="translate(420, 0)">
          {[0, 1, 2, 3].map((i) => {
            const active = isActive("button", i);
            return (
              <g
                key={i}
                transform={`translate(0, ${i * 15})`}
                onClick={() => handleClick("button", i)}
                class="cursor-pointer"
              >
                <rect
                  x="0"
                  y="0"
                  width="40"
                  height="12"
                  rx="2"
                  fill={active ? "#22c55e" : "#2d3748"}
                  stroke={active ? "#16a34a" : "#4a5568"}
                  stroke-width="1.5"
                  class="transition-all duration-300 hover:brightness-125"
                />
                <text
                  x="20"
                  y="9"
                  text-anchor="middle"
                  fill={active ? "#fff" : "#718096"}
                  font-size="8"
                  font-family="monospace"
                >
                  B{i + 1}
                </text>
              </g>
            );
          })}
        </g>
      </g>

      {/* Bottom section: Wheels + Keyboard */}
      <g transform="translate(20, 120)">
        {/* Pitch/Mod wheels - LEFT of keys */}
        <g transform="translate(0, 0)">
          {/* Pitch wheel */}
          <rect x="0" y="10" width="12" height="55" rx="2" fill="#2d3748" stroke="#4a5568" stroke-width="1" />
          <rect x="1.5" y="30" width="9" height="12" rx="1" fill="#718096" />
          <text x="6" y="70" text-anchor="middle" fill="#718096" font-size="7">PW</text>

          {/* Mod wheel */}
          <rect x="16" y="10" width="12" height="55" rx="2" fill="#2d3748" stroke="#4a5568" stroke-width="1" />
          <rect x="17.5" y="30" width="9" height="12" rx="1" fill="#718096" />
          <text x="22" y="70" text-anchor="middle" fill="#718096" font-size="7">MW</text>
        </g>

        {/* Keyboard - starts after wheels */}
        <g transform="translate(40, 0)">
          {/* White keys (49 keys = 28 white keys approximately) */}
          {[...Array(28)].map((_, i) => (
            <rect
              key={i}
              x={i * 28}
              y="0"
              width="27"
              height="65"
              rx="2"
              fill="#e5e7eb"
              stroke="#9ca3af"
              stroke-width="1"
            />
          ))}
          {/* Black keys pattern */}
          {[...Array(28)].map((_, i) => {
            const octavePos = i % 7;
            if (octavePos === 2 || octavePos === 6) return null;
            return (
              <rect
                key={i}
                x={i * 28 + 20}
                y="0"
                width="14"
                height="38"
                rx="1"
                fill="#1f2937"
                stroke="#111827"
                stroke-width="1"
              />
            );
          })}
        </g>
      </g>
    </svg>
  );
}
