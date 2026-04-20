"use client";

import { ResponsiveLine } from "@nivo/line";

export type EnvelopeSeries = {
  id: string;
  data: { x: number; y: number }[];
};

export function CgChart({
  data,
}: {
  data: EnvelopeSeries[];
}) {
  return (
    <div className="h-[640px] w-full rounded-2xl border border-white/10 bg-zinc-950/40 p-4 shadow-[0_0_0_1px_rgba(0,0,0,0.2),0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur">
      <ResponsiveLine
        data={data}
        xScale={{ type: "linear", min: 10, max: 45 }}
        yScale={{ type: "linear", min: 35000, max: 80000 }}
        margin={{ top: 20, right: 24, bottom: 60, left: 74 }}
        axisBottom={{
          legend: "CG (%MAC)",
          legendOffset: 42,
          legendPosition: "middle",
          tickSize: 5,
          tickPadding: 5,
        }}
        axisLeft={{
          legend: "Weight (kg)",
          legendOffset: -56,
          legendPosition: "middle",
          tickSize: 5,
          tickPadding: 5,
        }}
        enablePoints
        pointSize={10}
        pointBorderWidth={2}
        pointLabel="data.id"
        useMesh
        colors={{ scheme: "category10" }}
        theme={{
          background: "transparent",
          grid: { line: { stroke: "rgba(255,255,255,0.08)", strokeWidth: 1 } },
          axis: {
            ticks: {
              line: { stroke: "rgba(255,255,255,0.20)" },
              text: { fill: "rgba(255,255,255,0.72)" },
            },
            legend: { text: { fill: "rgba(255,255,255,0.85)" } },
          },
          legends: { text: { fill: "rgba(255,255,255,0.78)" } },
          tooltip: {
            container: {
              fontSize: 12,
              background: "rgba(9,9,11,0.92)",
              color: "white",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "10px",
            },
          },
        }}
        legends={[
          {
            anchor: "top-right",
            direction: "column",
            translateX: 0,
            translateY: 0,
            itemWidth: 90,
            itemHeight: 18,
            itemsSpacing: 4,
            symbolSize: 10,
            symbolShape: "circle",
          },
        ]}
        tooltip={({ point }) => (
          <div className="rounded-xl border border-white/10 bg-zinc-950/90 px-3 py-2 text-sm shadow-lg">
            <div className="font-medium">{(point as any).serieId ?? (point as any).seriesId}</div>
            <div>CG: {Number(point.data.x).toFixed(2)} %MAC</div>
            <div>W: {Number(point.data.y).toFixed(0)} kg</div>
          </div>
        )}
      />
    </div>
  );
}

