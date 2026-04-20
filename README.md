# tolissperformance — EFB (W&B)

Next.js app lives in `efb-next/`.

## Local dev

```bash
cd efb-next
npm install
npm run dev -- --hostname 127.0.0.1 --port 3000
```

Open `http://127.0.0.1:3000`.

## Deploy to Vercel

- Import the GitHub repo in Vercel
- **Root Directory**: set to `efb-next`
- Build command: `next build` (default)
- Output: `.next` (default)

# EFB — Weight & Balance (toy)

Small Electronic Flight Bag style tool to input:
- NO PAX
- FWD CARGO (kg)
- AFT CARGO (kg)
- FOB / fuel (kg)

It computes a simplified CG (%MAC) + gross weight and plots the point on top of the MIW/MLW/MTOW envelopes you provided.

## Run

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
streamlit run efb_app.py
```

## Files

- `main.py`: simplified W&B calculations (`compute_wb`)
- `efb_app.py`: Streamlit UI + Plotly graph

