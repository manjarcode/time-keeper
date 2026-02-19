"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import TimerDisplay from "./TimerDisplay";
import TimerControls from "./TimerControls";
import { useTimerSound } from "@/hooks/useTimerSound";

interface TimerApiResponse {
  active: boolean;
  finished?: boolean;
  timer: {
    startedAt: number;
    durationMs: number;
    remainingMs: number;
    elapsed: number;
  } | null;
}

export default function Timer() {
  const [remainingMs, setRemainingMs] = useState(0);
  const [totalMs, setTotalMs] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [loading, setLoading] = useState(true);

  // Track server state for client-side countdown
  const timerRef = useRef<{ startedAt: number; durationMs: number } | null>(null);
  const hasNotifiedRef = useRef(false);

  const { playAlarm, ensureAudioContext, requestNotificationPermission, sendNotification } =
    useTimerSound();

  // Fetch timer state from server
  const fetchTimer = useCallback(async () => {
    try {
      const res = await fetch("/api/timer");
      const data: TimerApiResponse = await res.json();

      if (data.timer) {
        timerRef.current = {
          startedAt: data.timer.startedAt,
          durationMs: data.timer.durationMs,
        };
        setTotalMs(data.timer.durationMs);
        setRemainingMs(data.timer.remainingMs);
        setIsActive(data.active);
        setIsFinished(data.finished ?? false);

        if (data.finished && !hasNotifiedRef.current) {
          hasNotifiedRef.current = true;
          playAlarm();
          sendNotification();
        }
      } else {
        timerRef.current = null;
        setIsActive(false);
        setIsFinished(false);
        setRemainingMs(0);
        setTotalMs(0);
      }
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  }, [playAlarm, sendNotification]);

  // Start a new timer
  const startTimer = useCallback(
    async (durationMs: number) => {
      hasNotifiedRef.current = false;
      // Unlock AudioContext during user gesture (click) so alarm can play later
      ensureAudioContext();
      await requestNotificationPermission();

      try {
        const res = await fetch("/api/timer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ durationMs }),
        });
        const data: TimerApiResponse = await res.json();

        if (data.timer) {
          timerRef.current = {
            startedAt: data.timer.startedAt,
            durationMs: data.timer.durationMs,
          };
          setTotalMs(data.timer.durationMs);
          setRemainingMs(data.timer.remainingMs);
          setIsActive(true);
          setIsFinished(false);
        }
      } catch {
        // Silent fail
      }
    },
    [requestNotificationPermission, ensureAudioContext]
  );

  // Cancel/clear the timer
  const cancelTimer = useCallback(async () => {
    try {
      await fetch("/api/timer", { method: "DELETE" });
      timerRef.current = null;
      setIsActive(false);
      setIsFinished(false);
      setRemainingMs(0);
      setTotalMs(0);
      hasNotifiedRef.current = false;
    } catch {
      // Silent fail
    }
  }, []);

  // Initial fetch on mount
  useEffect(() => {
    fetchTimer();
  }, [fetchTimer]);

  // Client-side countdown tick (every second)
  useEffect(() => {
    if (!isActive || !timerRef.current) return;

    const interval = setInterval(() => {
      const { startedAt, durationMs } = timerRef.current!;
      const elapsed = Date.now() - startedAt;
      const remaining = Math.max(0, durationMs - elapsed);

      setRemainingMs(remaining);

      if (remaining <= 0) {
        setIsActive(false);
        setIsFinished(true);

        if (!hasNotifiedRef.current) {
          hasNotifiedRef.current = true;
          playAlarm();
          sendNotification();
        }
      }
    }, 250); // Update 4x/sec for smooth countdown

    return () => clearInterval(interval);
  }, [isActive, playAlarm, sendNotification]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-10">
      <TimerDisplay
        remainingMs={remainingMs}
        totalMs={totalMs}
        finished={isFinished}
      />
      <TimerControls
        onStart={startTimer}
        onCancel={cancelTimer}
        isActive={isActive}
        isFinished={isFinished}
      />
    </div>
  );
}
