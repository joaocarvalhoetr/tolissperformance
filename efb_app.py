from __future__ import annotations

import streamlit as st
import plotly.graph_objects as go

from main import MAX_FUEL_KG, MAX_PAX, compute_wb


def _envelope_traces() -> list[go.Scatter]:
    # Data copied from your `dataGraph` (x = CG%MAC, y = weight)
    envelopes = [
        (
            "MIW",
            [
                (13, 35000),
                (13, 53000),
                (15, 63000),
                (15, 72000),
                (17, 73500),
                (25, 79000),
                (38, 79000),
                (41, 74700),
                (41, 51000),
                (35, 45000),
                (35, 35000),
                (13, 35000),
            ],
        ),
        (
            "MLW",
            [
                (15, 35000),
                (15, 53000),
                (17, 63900),
                (17, 67400),
                (40, 67400),
                (40, 50000),
                (35, 45000),
                (35, 35000),
                (15, 35000),
            ],
        ),
        (
            "MTOW",
            [
                (15, 35000),
                (15, 53000),
                (17, 63000),
                (17, 72000),
                (19, 73500),
                (27, 79000),
                (36.1, 79100),
                (36.1, 79000),
                (40, 73300),
                (40, 57900),
                (28, 35000),
                (15, 35000),
            ],
        ),
    ]

    traces: list[go.Scatter] = []
    for name, pts in envelopes:
        xs = [p[0] for p in pts]
        ys = [p[1] for p in pts]
        traces.append(
            go.Scatter(
                x=xs,
                y=ys,
                mode="lines",
                name=name,
                line=dict(width=2),
            )
        )
    return traces


def _current_trace(cg: float, gw: float) -> go.Scatter:
    return go.Scatter(
        x=[cg],
        y=[gw],
        mode="markers+text",
        name="Current",
        marker=dict(size=12),
        text=[f"CG {cg:.1f}% / {gw:,.0f} kg"],
        textposition="top center",
    )


def main() -> None:
    st.set_page_config(page_title="EFB — Weight & Balance", layout="wide")
    st.title("EFB — Weight & Balance (CG envelope)")

    with st.sidebar:
        st.subheader("Inputs")
        no_pax = st.number_input("NO PAX", min_value=0, max_value=MAX_PAX, value=0, step=1)
        fwd_cargo_kg = st.number_input("FWD CARGO (kg)", min_value=0.0, value=0.0, step=50.0)
        aft_cargo_kg = st.number_input("AFT CARGO (kg)", min_value=0.0, value=0.0, step=50.0)
        fuel_kg = st.number_input("FOB / Fuel (kg)", min_value=0.0, max_value=float(MAX_FUEL_KG), value=0.0, step=100.0)

        st.divider()
        pax_dist_ratio = st.slider("PAX distribution (0=fwd, 1=aft)", 0.0, 1.0, 0.5, 0.01)
        pax_kg_each = st.number_input("Std pax mass (kg)", min_value=50.0, max_value=120.0, value=84.0, step=1.0)

    cg, gross_weight = compute_wb(
        no_pax=int(no_pax),
        fwd_cargo_kg=float(fwd_cargo_kg),
        aft_cargo_kg=float(aft_cargo_kg),
        fuel_kg=float(fuel_kg),
        pax_dist_ratio=float(pax_dist_ratio),
        pax_kg_each=float(pax_kg_each),
    )

    c1, c2, c3 = st.columns(3)
    c1.metric("Gross weight", f"{gross_weight:,.0f} kg")
    c2.metric("CG", f"{cg:.2f} %MAC")
    c3.metric("Fuel", f"{fuel_kg:,.0f} kg")

    fig = go.Figure()
    for tr in _envelope_traces():
        fig.add_trace(tr)
    fig.add_trace(_current_trace(cg, gross_weight))

    fig.update_layout(
        height=650,
        xaxis_title="CG (%MAC)",
        yaxis_title="Weight (kg)",
        legend_title="Envelope",
        template="plotly_white",
        margin=dict(l=20, r=20, t=30, b=20),
    )
    fig.update_xaxes(range=[10, 45], showgrid=True, zeroline=False)
    fig.update_yaxes(range=[35_000, 80_000], showgrid=True, zeroline=False)

    st.plotly_chart(fig, use_container_width=True)

    with st.expander("Notes / assumptions", expanded=False):
        st.write(
            "- O cálculo de CG em `%MAC` aqui é **simplificado** (precisa de LEMAC/MAC/arms reais para ser certificável).\n"
            "- Mantive os envelopes exatamente como enviaste e plotei o ponto `Current` em cima."
        )


if __name__ == "__main__":
    main()

