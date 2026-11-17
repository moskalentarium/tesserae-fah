"""Folding@home widget data, fetched from the local bridge.

Tesserae forbids client-side fetch (the screenshot fires before async data
arrives), so everything comes through here and lands in `ctx.data`.

The bridge does the caching that matters: one render per work unit, replaced when
the FAH core writes a new trajectory frame (about once a minute). This module
just asks for the JSON and the matching PNG.
"""
from __future__ import annotations

import base64
import json
import urllib.parse
import urllib.request

USER_AGENT = "tesserae/0.1 (+fah_unit)"
DEFAULT_BASE = "http://127.0.0.1:8766"


def _get(url: str, timeout: float = 6.0) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return resp.read()


def _pick_unit(snapshot: dict, focus: str) -> tuple[dict | None, str | None]:
    """Return (unit, error)."""
    units = snapshot.get("units") or []
    if not units:
        return None, "No work unit is running right now."

    if focus == "cpu":
        cpu = [u for u in units if not u.get("gpus")]
        if not cpu:
            return None, "No CPU work unit is running right now."
        return max(cpu, key=lambda u: u.get("ppd") or 0), None

    if focus == "gpu":
        gpu = [u for u in units if u.get("gpus")]
        if not gpu:
            return None, "No GPU work unit is running right now."
        return max(gpu, key=lambda u: u.get("ppd") or 0), None

    return max(units, key=lambda u: u.get("ppd") or 0), None


def fetch(options: dict, settings: dict, *, ctx: dict) -> dict:
    base = (settings.get("base_url") or DEFAULT_BASE).rstrip("/")
    try:
        snapshot = json.loads(_get(f"{base}/fah.json", timeout=6))
    except Exception:  # noqa: BLE001 - any failure means "bridge is not there"
        return {"error": "Can't reach the Folding@home bridge. Is fah-bridge running?"}

    if snapshot.get("error"):
        return {"error": str(snapshot["error"])}

    unit, problem = _pick_unit(snapshot, options.get("focus") or "gpu")
    if unit is None:
        return {"error": problem or "No work unit is running right now."}

    # Ask for roughly the pixels we will draw, so the panel does not upscale.
    wanted = int(ctx.get("cell_w") or 600)
    size = max(240, min(900, wanted))
    query = urllib.parse.urlencode({"unit": unit.get("id"), "size": size})
    try:
        png = _get(f"{base}/protein.png?{query}", timeout=20)
    except Exception:  # noqa: BLE001 - the numbers are still worth showing
        png = b""

    donor = snapshot.get("donor") or {}
    team = snapshot.get("team") or {}

    return {
        "generated": snapshot.get("generated"),
        "machine": snapshot.get("machine"),
        "user": snapshot.get("user"),
        "donor": {
            "name": donor.get("name"),
            "position": donor.get("position"),
            "rank": donor.get("rank"),
            "score": donor.get("score"),
            "wus": donor.get("wus"),
        },
        "team": {
            "name": team.get("name"),
            "rank": team.get("rank"),
            "score": team.get("score"),
            "wus": team.get("wus"),
        },
        "project": unit.get("project"),
        "project_name": unit.get("project_name") or "Unspecified",
        "topic": unit.get("topic") or "",
        "cause": unit.get("cause"),
        "progress": float(unit.get("progress") or 0),
        "eta": unit.get("eta"),
        "group": unit.get("group"),
        "frames": (unit.get("protein") or {}).get("frames"),
        "protein": base64.b64encode(png).decode() if png else None,
        # The editor re-fetches after this many seconds while the cell is visible.
        # Matches the FAH core's frame cadence and the panel's refresh interval.
        "live_refresh_s": 60,
    }
