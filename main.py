from __future__ import annotations

# Masses (kg)
DOW_KG = 44_220  # Dry Operating Weight (excludes pax, cargo, fuel)
MZFW_KG = 64_300  # Maximum Zero Fuel Weight
MTOW_KG = 79_000  # Maximum Takeoff Weight
MRW_KG = 79_400  # Maximum Ramp Weight

# Limits
MAX_PAX = 188
MAX_FUEL_KG = 18_623

# Geometry / CG
# Assumptions to convert between physical arms (m) and %MAC:
# - CG% = (CG_arm - LEMAC_arm)/MAC * 100
# - Cargo arms below are treated as *offsets (m)* relative to the DOW CG arm.
# If you know the real LEMAC/MAC and station arms, replace these.
MAC_M = 4.0
LEMAC_ARM_M = 10.0

DOW_CG_PERCENT = 29.5
FWD_CARGO_ARM_OFFSET_M = -7.0
AFT_CARGO_ARM_OFFSET_M = 5.0

# Passenger distribution (0.0 = fully forward, 1.0 = fully aft)
PAX_DIST_RATIO = 0.5

PAX_DISTRIB_LEVER_ARM_M = 12.2

# Planning weights (can be tuned)
STANDARD_PAX_KG = 84.0


def clamp(x: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, x))


def pax_lever_arm_m(
    pax_dist_ratio: float,
    no_pax: int,
    *,
    max_pax: int = MAX_PAX,
    pax_distrib_lever_arm_m: float = PAX_DISTRIB_LEVER_ARM_M,
) -> float:
    """
    Passenger lever arm contribution (m), scaled by:
    - how far distribution is from 50/50 (forward vs aft)
    - how full the cabin is (less effect as pax approaches max)
    """
    fullness_factor = clamp((max_pax - no_pax) / max_pax, 0.0, 1.0)
    return (pax_dist_ratio - 0.5) * 2.0 * fullness_factor * pax_distrib_lever_arm_m


def cg_percent_from_arm_m(arm_m: float, *, lemac_arm_m: float = LEMAC_ARM_M, mac_m: float = MAC_M) -> float:
    return ((arm_m - lemac_arm_m) / mac_m) * 100.0


def arm_m_from_cg_percent(
    cg_percent: float, *, lemac_arm_m: float = LEMAC_ARM_M, mac_m: float = MAC_M
) -> float:
    return lemac_arm_m + (cg_percent / 100.0) * mac_m


def compute_wb(
    *,
    no_pax: int,
    fwd_cargo_kg: float,
    aft_cargo_kg: float,
    fuel_kg: float,
    pax_dist_ratio: float = PAX_DIST_RATIO,
    pax_kg_each: float = STANDARD_PAX_KG,
) -> tuple[float, float]:
    """
    Returns (cg_percent_mac, gross_weight_kg).

    Simplified W&B model intended for an EFB-like visualization.
    """
    no_pax = int(clamp(float(no_pax), 0.0, float(MAX_PAX)))
    fuel_kg = float(clamp(float(fuel_kg), 0.0, float(MAX_FUEL_KG)))
    fwd_cargo_kg = max(0.0, float(fwd_cargo_kg))
    aft_cargo_kg = max(0.0, float(aft_cargo_kg))
    pax_dist_ratio = float(clamp(float(pax_dist_ratio), 0.0, 1.0))

    dow_arm_m = arm_m_from_cg_percent(DOW_CG_PERCENT)
    pax_arm_m = dow_arm_m + pax_lever_arm_m(pax_dist_ratio, no_pax)
    fwd_cargo_arm_m = dow_arm_m + FWD_CARGO_ARM_OFFSET_M
    aft_cargo_arm_m = dow_arm_m + AFT_CARGO_ARM_OFFSET_M

    pax_kg = no_pax * float(pax_kg_each)
    gross_kg = DOW_KG + pax_kg + fwd_cargo_kg + aft_cargo_kg + fuel_kg

    total_moment = (
        DOW_KG * dow_arm_m
        + pax_kg * pax_arm_m
        + fwd_cargo_kg * fwd_cargo_arm_m
        + aft_cargo_kg * aft_cargo_arm_m
        + fuel_kg * dow_arm_m
    )
    cg_arm_m = total_moment / gross_kg if gross_kg > 0 else dow_arm_m
    return cg_percent_from_arm_m(cg_arm_m), gross_kg