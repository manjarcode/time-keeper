"use client";

interface TimerDisplayProps {
  remainingMs: number;
  totalMs: number;
  finished: boolean;
}

export default function TimerDisplay({
  remainingMs,
  totalMs,
  finished,
}: TimerDisplayProps) {
  const progress = totalMs > 0 ? Math.max(0, remainingMs / totalMs) : 0;

  const totalSeconds = Math.ceil(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const timeStr = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  // SVG circle parameters
  const size = 280;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="relative flex items-center justify-center">
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-red-900/20"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className={`transition-all duration-1000 ease-linear ${
            finished
              ? "text-red-400 animate-pulse"
              : "text-red-500"
          }`}
        />
      </svg>

      {/* Time display */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {finished ? (
          <>
            <span className="text-5xl font-bold text-red-400 animate-pulse tracking-wider">
              00:00
            </span>
            <span className="mt-2 text-sm font-medium text-red-400/80 uppercase tracking-widest">
              ¡Tiempo!
            </span>
          </>
        ) : (
          <span className="text-5xl font-bold text-red-100 tracking-wider font-mono">
            {timeStr}
          </span>
        )}
      </div>
    </div>
  );
}
