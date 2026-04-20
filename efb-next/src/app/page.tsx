import { Efb } from "@/components/Efb";

export default function Home() {
  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_800px_at_20%_0%,rgba(56,189,248,0.12),transparent_60%),radial-gradient(1000px_700px_at_80%_10%,rgba(168,85,247,0.10),transparent_55%),radial-gradient(900px_650px_at_50%_100%,rgba(34,197,94,0.08),transparent_60%)] bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-white">EFB — Weight &amp; Balance</h1>
          <p className="mt-1 text-sm text-zinc-300">
            Inputs (NO PAX / cargo / FOB) → CG (%MAC) and gross weight on the envelope.
          </p>
        </div>

        <Efb />
      </div>
    </div>
  );
}
