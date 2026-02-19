"use client";

import { useCallback, useRef } from "react";

export function useTimerSound() {
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Must be called from a user gesture (click) to unlock audio
  const ensureAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
    }
    // Resume if suspended (browsers suspend contexts not started from user gesture)
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  const playAlarm = useCallback(() => {
    try {
      const ctx = audioCtxRef.current;
      if (!ctx) return;

      // Resume just in case
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      // Play 3 rounds of beeps with pauses between rounds
      const beepDuration = 0.18;
      const pauseBetweenBeeps = 0.1;
      const pauseBetweenRounds = 0.5;
      const frequencies = [880, 1100, 880];
      const rounds = 3;

      for (let round = 0; round < rounds; round++) {
        const roundOffset = round * (frequencies.length * (beepDuration + pauseBetweenBeeps) + pauseBetweenRounds);

        frequencies.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.frequency.value = freq;
          osc.type = "square";

          const startTime = ctx.currentTime + roundOffset + i * (beepDuration + pauseBetweenBeeps);
          gain.gain.setValueAtTime(0.35, startTime);
          gain.gain.exponentialRampToValueAtTime(0.01, startTime + beepDuration);

          osc.start(startTime);
          osc.stop(startTime + beepDuration + 0.01);
        });
      }
    } catch (e) {
      console.warn("Audio alarm failed:", e);
    }
  }, []);

  const requestNotificationPermission = useCallback(async () => {
    if ("Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission();
    }
  }, []);

  const sendNotification = useCallback(() => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("⏰ Time Keeper", {
        body: "¡El temporizador ha terminado!",
        icon: "/favicon.ico",
      });
    }
  }, []);

  return { playAlarm, ensureAudioContext, requestNotificationPermission, sendNotification };
}
