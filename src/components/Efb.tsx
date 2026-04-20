"use client";

import { useMemo, useState } from "react";

import { CgChart, type EnvelopeSeries } from "@/components/CgChart";
import { WB, computeWb, pointInPolygon, type Point } from "@/lib/wb";

const ENVELOPES: EnvelopeSeries[] = [
  {
    id: "MIW",
    data: [
      { x: 13, y: 35000 },
      { x: 13, y: 53000 },
      { x: 15, y: 63000 },
      { x: 15, y: 72000 },
      { x: 17, y: 73500 },
      { x: 25, y: 79000 },
      { x: 38, y: 79000 },
      { x: 41, y: 74700 },
      { x: 41, y: 51000 },
      { x: 35, y: 45000 },
      { x: 35, y: 35000 },
      { x: 13, y: 35000 },
    ],
  },
  {
    id: "MLW",
    data: [
      { x: 15, y: 35000 },
      { x: 15, y: 53000 },
      { x: 17, y: 63900 },
      { x: 17, y: 67400 },
      { x: 40, y: 67400 },
      { x: 40, y: 50000 },
      { x: 35, y: 45000 },
      { x: 35, y: 35000 },
      { x: 15, y: 35000 },
    ],
  },
  {
    id: "MTOW",
    data: [
      { x: 15, y: 35000 },
      { x: 15, y: 53000 },
      { x: 17, y: 63000 },
      { x: 17, y: 72000 },
      { x: 19, y: 73500 },
      { x: 27, y: 79000 },
      { x: 36.1, y: 79100 },
      { x: 36.1, y: 79000 },
      { x: 40, y: 73300 },
      { x: 40, y: 57900 },
      { x: 28, y: 35000 },
      { x: 15, y: 35000 },
    ],
  },
];

function envelopePolygon(id: string): Point[] {
  const env = ENVELOPES.find((e) => e.id === id);
  return env ? env.data.map((p) => ({ x: p.x, y: p.y })) : [];
}

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="grid gap-1">
      <span className="flex items-baseline justify-between gap-3 text-sm font-medium text-zinc-200">
        <span>{label}</span>
        {hint ? <span className="text-xs font-normal text-zinc-400">{hint}</span> : null}
      </span>
      {children}
    </label>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-950/40 px-4 py-3 shadow-[0_0_0_1px_rgba(0,0,0,0.2),0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur">
      <div className="text-xs font-medium text-zinc-400">{label}</div>
      <div className="mt-1 text-lg font-semibold tabular-nums text-white">{value}</div>
    </div>
  );
}

function Badge({ ok }: { ok: boolean }) {
  return (
    <div
      className={[
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold tracking-wide",
        ok
          ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-200"
          : "border-rose-400/20 bg-rose-500/10 text-rose-200",
      ].join(" ")}
    >
      <span className={["h-2 w-2 rounded-full", ok ? "bg-emerald-400" : "bg-rose-400"].join(" ")} />
      {ok ? "IN LIMITS" : "OUT OF LIMITS"}
    </div>
  );
}

export function Efb() {
  const [noPax, setNoPax] = useState<number>(0);
  const [fwdCargoKg, setFwdCargoKg] = useState<number>(0);
  const [aftCargoKg, setAftCargoKg] = useState<number>(0);
  const [fuelKg, setFuelKg] = useState<number>(0);
  const [paxDistRatio, setPaxDistRatio] = useState<number>(0.5);
  const [paxKgEach, setPaxKgEach] = useState<number>(WB.STANDARD_PAX_KG);

  const wb = useMemo(
    () =>
      computeWb({
        noPax,
        fwdCargoKg,
        aftCargoKg,
        fuelKg,
        paxDistRatio,
        paxKgEach,
      }),
    [noPax, fwdCargoKg, aftCargoKg, fuelKg, paxDistRatio, paxKgEach],
  );

  const chartData: EnvelopeSeries[] = useMemo(
    () => [
      ...ENVELOPES,
      {
        id: "Current",
        data: [{ x: wb.cgPercentMac, y: wb.grossWeightKg }],
      },
    ],
    [wb.cgPercentMac, wb.grossWeightKg],
  );

  const inLimits = useMemo(() => {
    const p = { x: wb.cgPercentMac, y: wb.grossWeightKg };
    return pointInPolygon(p, envelopePolygon("MTOW"));
  }, [wb.cgPercentMac, wb.grossWeightKg]);

  return (
    <div className="grid gap-6">
      <div className="rounded-3xl border border-white/10 bg-zinc-950/30 p-4 shadow-[0_0_0_1px_rgba(0,0,0,0.18),0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs font-medium text-zinc-400">WEIGHT &amp; BALANCE</div>
            <div className="mt-1 text-lg font-semibold tracking-tight text-white">GCTJ</div>
          </div>
          <div className="flex items-center gap-3">
            <Badge ok={inLimits} />
            <div className="hidden rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-zinc-300 sm:block">
              CG: <span className="font-semibold text-white">{wb.cgPercentMac.toFixed(2)}%</span> · GW:{" "}
              <span className="font-semibold text-white">
                {Math.round(wb.grossWeightKg).toLocaleString()}
              </span>{" "}
              kg
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[380px_1fr]">
          <div className="rounded-2xl border border-white/10 bg-zinc-950/40 p-4 backdrop-blur">
            <div className="text-sm font-semibold text-white">Loadsheet inputs</div>
            <div className="mt-4 grid gap-3">
              <Field label="NO PAX" hint={`0–${WB.MAX_PAX}`}>
                <input
                  className="h-10 rounded-xl border border-white/10 bg-white/5 px-3 text-white outline-none placeholder:text-zinc-500 focus:border-sky-400/40 focus:bg-white/10"
                  type="number"
                  min={0}
                  max={WB.MAX_PAX}
                  step={1}
                  value={noPax}
                  onChange={(e) => setNoPax(Number(e.target.value))}
                />
              </Field>
              <Field label="FWD CARGO" hint="kg">
                <input
                  className="h-10 rounded-xl border border-white/10 bg-white/5 px-3 text-white outline-none focus:border-sky-400/40 focus:bg-white/10"
                  type="number"
                  min={0}
                  step={50}
                  value={fwdCargoKg}
                  onChange={(e) => setFwdCargoKg(Number(e.target.value))}
                />
              </Field>
              <Field label="AFT CARGO" hint="kg">
                <input
                  className="h-10 rounded-xl border border-white/10 bg-white/5 px-3 text-white outline-none focus:border-sky-400/40 focus:bg-white/10"
                  type="number"
                  min={0}
                  step={50}
                  value={aftCargoKg}
                  onChange={(e) => setAftCargoKg(Number(e.target.value))}
                />
              </Field>
              <Field label="FOB / Fuel" hint={`kg (0–${WB.MAX_FUEL_KG.toLocaleString()})`}>
                <input
                  className="h-10 rounded-xl border border-white/10 bg-white/5 px-3 text-white outline-none focus:border-sky-400/40 focus:bg-white/10"
                  type="number"
                  min={0}
                  max={WB.MAX_FUEL_KG}
                  step={100}
                  value={fuelKg}
                  onChange={(e) => setFuelKg(Number(e.target.value))}
                />
              </Field>

              <div className="mt-2 grid gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
                <Field label="PAX distribution" hint="0=fwd · 1=aft">
                  <input
                    className="w-full"
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={paxDistRatio}
                    onChange={(e) => setPaxDistRatio(Number(e.target.value))}
                  />
                  <div className="text-xs text-zinc-400">{paxDistRatio.toFixed(2)}</div>
                </Field>
                <Field label="Std pax mass" hint="kg">
                  <input
                    className="h-10 rounded-xl border border-white/10 bg-white/5 px-3 text-white outline-none focus:border-sky-400/40 focus:bg-white/10"
                    type="number"
                    min={50}
                    max={120}
                    step={1}
                    value={paxKgEach}
                    onChange={(e) => setPaxKgEach(Number(e.target.value))}
                  />
                </Field>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <Metric label="Gross weight" value={`${Math.round(wb.grossWeightKg).toLocaleString()} kg`} />
              <Metric label="CG" value={`${wb.cgPercentMac.toFixed(2)} %MAC`} />
              <Metric label="Fuel" value={`${Math.round(fuelKg).toLocaleString()} kg`} />
            </div>
            <CgChart data={chartData} />
          </div>
        </div>
      </div>

    </div>
  );
}

