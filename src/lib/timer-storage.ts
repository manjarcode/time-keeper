import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const TIMER_FILE = path.join(DATA_DIR, "timer.json");

export interface TimerState {
  startedAt: number; // Unix timestamp in ms
  durationMs: number; // Total duration in ms
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function getTimer(): TimerState | null {
  ensureDataDir();
  if (!fs.existsSync(TIMER_FILE)) {
    return null;
  }
  try {
    const raw = fs.readFileSync(TIMER_FILE, "utf-8");
    return JSON.parse(raw) as TimerState;
  } catch {
    return null;
  }
}

export function saveTimer(state: TimerState): void {
  ensureDataDir();
  fs.writeFileSync(TIMER_FILE, JSON.stringify(state, null, 2), "utf-8");
}

export function clearTimer(): void {
  ensureDataDir();
  if (fs.existsSync(TIMER_FILE)) {
    fs.unlinkSync(TIMER_FILE);
  }
}
