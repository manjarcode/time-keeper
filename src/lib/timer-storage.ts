import { put, del, list } from "@vercel/blob";
import fs from "fs";
import path from "path";

const BLOB_FILENAME = "timer-active.json";

const DATA_DIR = path.join(process.cwd(), "data");
const TIMER_FILE = path.join(DATA_DIR, "timer.json");

export interface TimerState {
  startedAt: number; // Unix timestamp in ms
  durationMs: number; // Total duration in ms
}

const isVercel = !!process.env.BLOB_READ_WRITE_TOKEN;

// ─── File-based storage (local dev) ─────────────────────────────

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function getTimerFromFile(): TimerState | null {
  ensureDataDir();
  if (!fs.existsSync(TIMER_FILE)) return null;
  try {
    return JSON.parse(fs.readFileSync(TIMER_FILE, "utf-8")) as TimerState;
  } catch {
    return null;
  }
}

function saveTimerToFile(state: TimerState): void {
  ensureDataDir();
  fs.writeFileSync(TIMER_FILE, JSON.stringify(state, null, 2), "utf-8");
}

function clearTimerFromFile(): void {
  ensureDataDir();
  if (fs.existsSync(TIMER_FILE)) fs.unlinkSync(TIMER_FILE);
}

// ─── Blob-based storage (Vercel prod) ──────────────────────────

async function getTimerFromBlob(): Promise<TimerState | null> {
  try {
    const { blobs } = await list({ prefix: BLOB_FILENAME });
    if (blobs.length === 0) return null;

    const res = await fetch(blobs[0].url);
    if (!res.ok) return null;
    return (await res.json()) as TimerState;
  } catch {
    return null;
  }
}

async function saveTimerToBlob(state: TimerState): Promise<void> {
  // Delete existing blob first to avoid duplicates
  await clearTimerFromBlob();
  await put(BLOB_FILENAME, JSON.stringify(state), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
  });
}

async function clearTimerFromBlob(): Promise<void> {
  try {
    const { blobs } = await list({ prefix: BLOB_FILENAME });
    for (const blob of blobs) {
      await del(blob.url);
    }
  } catch {
    // Silent fail
  }
}

// ─── Public API (async, works in both envs) ────────────────────

export async function getTimer(): Promise<TimerState | null> {
  if (isVercel) return getTimerFromBlob();
  return getTimerFromFile();
}

export async function saveTimer(state: TimerState): Promise<void> {
  if (isVercel) return saveTimerToBlob(state);
  saveTimerToFile(state);
}

export async function clearTimer(): Promise<void> {
  if (isVercel) return clearTimerFromBlob();
  clearTimerFromFile();
}
