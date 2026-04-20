export const WB = {
  // Masses (kg)
  DOW_KG: 44_220, // excludes pax, cargo, fuel
  MZFW_KG: 64_300,
  MTOW_KG: 79_000,
  MRW_KG: 79_400,

  // Limits
  MAX_PAX: 188,
  MAX_FUEL_KG: 18_623,
  MAX_FWD_CARGO_KG: 3_402,
  MAX_AFT_CARGO_KG: 6_033,

  // Geometry / CG
  // CG% = (CG_arm - LEMAC_arm) / MAC * 100
  // Cargo arms are treated as offsets from DOW CG arm (toy model).
  MAC_M: 4.0,
  LEMAC_ARM_M: 10.0,

  DOW_CG_PERCENT: 29.5,
  FWD_CARGO_ARM_OFFSET_M: -7.0,
  AFT_CARGO_ARM_OFFSET_M: 5.0,

  // Pax distribution
  PAX_DISTRIB_LEVER_ARM_M: 12.2,

  // Planning
  STANDARD_PAX_KG: 84.0,
} as const;

export function clamp(x: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, x));
}

export function paxLeverArmM(paxDistRatio: number, noPax: number): number {
  const ratio = clamp(paxDistRatio, 0, 1);
  const pax = clamp(noPax, 0, WB.MAX_PAX);
  const fullnessFactor = clamp((WB.MAX_PAX - pax) / WB.MAX_PAX, 0, 1);
  return (ratio - 0.5) * 2.0 * fullnessFactor * WB.PAX_DISTRIB_LEVER_ARM_M;
}

export function armMFromCgPercent(cgPercent: number): number {
  return WB.LEMAC_ARM_M + (cgPercent / 100.0) * WB.MAC_M;
}

export function cgPercentFromArmM(armM: number): number {
  return ((armM - WB.LEMAC_ARM_M) / WB.MAC_M) * 100.0;
}

export type WbInput = {
  noPax: number;
  fwdCargoKg: number;
  aftCargoKg: number;
  fuelKg: number; // FOB
  paxDistRatio?: number; // 0..1
  paxKgEach?: number;
};

export type WbOutput = {
  cgPercentMac: number;
  grossWeightKg: number;
};

export type Point = { x: number; y: number };

// Ray casting algorithm
export function pointInPolygon(p: Point, polygon: Point[]): boolean {
  if (polygon.length < 3) return false;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i]!.x;
    const yi = polygon[i]!.y;
    const xj = polygon[j]!.x;
    const yj = polygon[j]!.y;

    const intersect =
      yi > p.y !== yj > p.y &&
      p.x < ((xj - xi) * (p.y - yi)) / (yj - yi + Number.EPSILON) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

export function computeWb(input: WbInput): WbOutput {
  const noPax = Math.trunc(clamp(input.noPax ?? 0, 0, WB.MAX_PAX));
  const fuelKg = clamp(input.fuelKg ?? 0, 0, WB.MAX_FUEL_KG);
  const fwdCargoKg = clamp(Math.max(0, input.fwdCargoKg ?? 0), 0, WB.MAX_FWD_CARGO_KG);
  const aftCargoKg = clamp(Math.max(0, input.aftCargoKg ?? 0), 0, WB.MAX_AFT_CARGO_KG);
  const paxDistRatio = clamp(input.paxDistRatio ?? 0.5, 0, 1);
  const paxKgEach = clamp(input.paxKgEach ?? WB.STANDARD_PAX_KG, 50, 120);

  const dowArmM = armMFromCgPercent(WB.DOW_CG_PERCENT);
  const paxArmM = dowArmM + paxLeverArmM(paxDistRatio, noPax);
  const fwdCargoArmM = dowArmM + WB.FWD_CARGO_ARM_OFFSET_M;
  const aftCargoArmM = dowArmM + WB.AFT_CARGO_ARM_OFFSET_M;

  const paxKg = noPax * paxKgEach;
  const grossWeightKg = WB.DOW_KG + paxKg + fwdCargoKg + aftCargoKg + fuelKg;

  const totalMoment =
    WB.DOW_KG * dowArmM +
    paxKg * paxArmM +
    fwdCargoKg * fwdCargoArmM +
    aftCargoKg * aftCargoArmM +
    fuelKg * dowArmM;

  const cgArmM = grossWeightKg > 0 ? totalMoment / grossWeightKg : dowArmM;
  const cgPercentMac = cgPercentFromArmM(cgArmM);

  return { cgPercentMac, grossWeightKg };
}

