"use client";

import { useCallback } from "react";

export function useTimerSound() {
  const playAlarm = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();

      // Play a sequence of beeps
      const beepDuration = 0.15;
      const pauseDuration = 0.1;
      const frequencies = [880, 1100, 880, 1100, 880, 1100];

      frequencies.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.frequency.value = freq;
        osc.type = "square";

        const startTime = ctx.currentTime + i * (beepDuration + pauseDuration);
        gain.gain.setValueAtTime(0.3, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + beepDuration);

        osc.start(startTime);
        osc.stop(startTime + beepDuration);
      });
    } catch {
      // Audio not available
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

  return { playAlarm, requestNotificationPermission, sendNotification };
}
