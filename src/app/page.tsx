import Timer from "@/components/Timer";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-red-950 via-[#1a0000] to-[#0d0000] px-4">
      {/* Header */}
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-red-100 tracking-tight">
          Time Keeper
        </h1>
        <p className="mt-2 text-sm text-red-400/70 tracking-wide">
          Selecciona el tiempo y pulsa para iniciar
        </p>
      </header>

      {/* Timer */}
      <main>
        <Timer />
      </main>

      {/* Footer */}
      <footer className="mt-16 text-xs text-red-900/60">
        Persistencia en servidor — el temporizador sobrevive reinicios
      </footer>
    </div>
  );
}
