import { NextResponse } from "next/server";
import { getTimer, saveTimer, clearTimer, TimerState } from "@/lib/timer-storage";

// GET /api/timer — returns current timer state with computed remaining time
export async function GET() {
  const timer = await getTimer();

  if (!timer) {
    return NextResponse.json({ active: false, timer: null });
  }

  const elapsed = Date.now() - timer.startedAt;
  const remainingMs = Math.max(0, timer.durationMs - elapsed);
  const finished = remainingMs <= 0;

  return NextResponse.json({
    active: !finished,
    finished,
    timer: {
      ...timer,
      remainingMs,
      elapsed,
    },
  });
}

// POST /api/timer — start a new timer
export async function POST(request: Request) {
  const body = await request.json();
  const { durationMs } = body as { durationMs: number };

  if (!durationMs || durationMs <= 0) {
    return NextResponse.json(
      { error: "durationMs must be a positive number" },
      { status: 400 }
    );
  }

  const state: TimerState = {
    startedAt: Date.now(),
    durationMs,
  };

  await saveTimer(state);

  return NextResponse.json({
    active: true,
    timer: {
      ...state,
      remainingMs: durationMs,
      elapsed: 0,
    },
  });
}

// DELETE /api/timer — clear the current timer
export async function DELETE() {
  await clearTimer();
  return NextResponse.json({ active: false, timer: null });
}
