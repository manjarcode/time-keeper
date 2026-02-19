"use client";

import { useState } from "react";

interface TimerControlsProps {
  onStart: (durationMs: number) => void;
  onCancel: () => void;
  isActive: boolean;
  isFinished: boolean;
}

const PRESETS = [
  { label: "5 min", ms: 5 * 60 * 1000 },
  { label: "10 min", ms: 10 * 60 * 1000 },
  { label: "20 min", ms: 20 * 60 * 1000 },
];

export default function TimerControls({
  onStart,
  onCancel,
  isActive,
  isFinished,
}: TimerControlsProps) {
  const [customMinutes, setCustomMinutes] = useState("");

  const handleCustomStart = () => {
    const mins = parseFloat(customMinutes);
    if (mins > 0 && mins <= 999) {
      onStart(mins * 60 * 1000);
      setCustomMinutes("");
    }
  };

  if (isActive) {
    return (
      <div className="flex flex-col items-center gap-4">
        <button
          onClick={onCancel}
          className="px-8 py-3 rounded-full bg-red-900/40 text-red-300 border border-red-700/50 hover:bg-red-900/60 hover:border-red-600 transition-all duration-200 font-medium tracking-wide cursor-pointer"
        >
          Cancelar
        </button>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="flex flex-col items-center gap-4">
        <button
          onClick={onCancel}
          className="px-8 py-3 rounded-full bg-red-600 text-white hover:bg-red-500 transition-all duration-200 font-medium tracking-wide shadow-lg shadow-red-600/30 cursor-pointer"
        >
          Listo
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Preset buttons */}
      <div className="flex gap-3">
        {PRESETS.map((preset) => (
          <button
            key={preset.label}
            onClick={() => onStart(preset.ms)}
            className="px-6 py-3 rounded-full bg-red-600 text-white font-medium hover:bg-red-500 transition-all duration-200 shadow-lg shadow-red-600/25 hover:shadow-red-500/40 hover:scale-105 active:scale-95 cursor-pointer"
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Custom time input */}
      <div className="flex items-center gap-2">
        <input
          type="number"
          min="1"
          max="999"
          step="1"
          placeholder="Minutos"
          value={customMinutes}
          onChange={(e) => setCustomMinutes(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCustomStart()}
          className="w-28 px-4 py-2.5 rounded-full bg-red-950/50 border border-red-800/50 text-red-100 placeholder-red-700 text-center focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <button
          onClick={handleCustomStart}
          disabled={!customMinutes || parseFloat(customMinutes) <= 0}
          className="px-5 py-2.5 rounded-full bg-red-800/60 text-red-200 border border-red-700/40 hover:bg-red-700/60 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 font-medium cursor-pointer"
        >
          Iniciar
        </button>
      </div>
    </div>
  );
}
