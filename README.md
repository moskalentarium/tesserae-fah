# Tesserae: Folding@home, Unit

A Tesserae widget showing the work unit this machine is folding right now: your
place on the team, points and work-unit count, a still of the protein drawn from
the running simulation, and that unit's progress bar.

```
FOLDING@HOME                       DALLIS


                               artemteddy
                           TEAM PEWDS (#61)
#9        2.03B        8,858
ON TEAM   POINTS      WU

              [ protein still ]

p15506 · CD40L
autoimmune · ligand binding
████░░░░░░░░░░░░░░░░░░
17%                       ETA 2h 6m
```

## It needs a companion service

This widget reads from [**fah-bridge**](https://github.com/moskalentarium/kindle-dash/tree/main/bridge),
a small read-only container that turns the Folding@home client's local state and
trajectory files into JSON and a PNG. Tesserae renders widgets server-side and
cannot read the FAH client's WebSocket or its on-disk viewer files itself, so the
bridge does that part.

Run the bridge on the same host as Tesserae:

```bash
git clone https://github.com/moskalentarium/kindle-dash
cd kindle-dash/bridge
# edit the FAH config path in docker-compose.yml, then:
docker compose up -d --build
curl -s localhost:8766/healthz
```

The bridge listens on `127.0.0.1:8766` and needs Folding@home running on that
host. If the bridge runs elsewhere, change **Bridge URL** in the widget settings
*and* the `network:127.0.0.1` entry in `plugin.json` — Tesserae enforces the
network allowlist at the socket layer.

## Install

From Tesserae: **Widgets → Browse catalog → Folding@home, Unit → Install**.

Manual install: zip the `fah_unit/` folder and use **Widgets → Installed widgets
→ Upload widget**.

## Options

| Option | Default | What it does |
|---|---|---|
| Unit | GPU unit | Show the GPU unit, the CPU unit, or the busiest one |
| Donor stats | on | The `#9 / 2.03B / 8,832` row |

| Setting | Default | What it does |
|---|---|---|
| Bridge URL | `http://127.0.0.1:8766` | Where fah-bridge listens |

The widget refreshes its preview every 60 seconds (`live_refresh_s`), matching
the FAH core's frame cadence. Set the panel's own refresh interval to the same.

## Sizes

Designed for a portrait panel (the reference is a 600×800 Kindle), but it scales
with container queries. `sm` hides the stats and topic lines, `md` and `lg` show
everything.

The still is drawn on a white matte, so it reads on light and dark themes alike
(the render itself is ink on white).

## Data

- State: the FAH v8 client's WebSocket API (via fah-bridge).
- Donor numbers: the public team member list at `api.foldingathome.org`.
- Structure: the client's own `viewerTop.json` / `viewerFrameN.json`, the same
  files its "View 3D protein" page uses.

No accounts, keys or secrets. The only outbound request is to the bridge.

## Development

```bash
pip install -r requirements-dev.txt
pytest fah_unit/tests/test_fetch.py      # runs anywhere
```

The host render test (`tests/test_smoke.py`) needs a Tesserae checkout: copy
`fah_unit/` into its `plugins/` folder and run pytest from there.

## Licence

AGPL-3.0-or-later.
