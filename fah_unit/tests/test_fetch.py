"""fetch() tests, runnable anywhere: the widget does not need Tesserae for these."""
from __future__ import annotations

import importlib.util
import json
from pathlib import Path

import pytest

_HERE = Path(__file__).resolve().parents[1]
_spec = importlib.util.spec_from_file_location("fah_unit_server", _HERE / "server.py")
assert _spec and _spec.loader
server = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(server)

_SNAPSHOT = {
    "generated": "2026-11-16T00:00:00Z",
    "machine": "Dallis",
    "user": "artemteddy",
    "donor": {"name": "artemteddy", "position": 9, "rank": 3233,
              "score": 2016184966, "wus": 8832},
    "team": {"name": "Team Pewds", "rank": 61, "score": 101539419819, "wus": 488908},
    "units": [
        {"id": "cpu1", "project": 15511, "project_name": "Pin1",
         "topic": "Alzheimer's · protein folding", "progress": 0.5,
         "eta": "9h", "gpus": [], "protein": {"frames": 3}},
        {"id": "gpu1", "project": 15506, "project_name": "CD40L",
         "topic": "autoimmune · ligand binding", "progress": 0.25,
         "eta": "2h", "gpus": ["gpu:0"], "protein": {"frames": 7}},
    ],
}


def _install_fake(monkeypatch, snapshot=None):
    payload = json.dumps(snapshot or _SNAPSHOT).encode()

    def fake_get(url, timeout=6.0):
        return payload if url.endswith("/fah.json") else b"\x89PNG\r\n\x1a\n"

    monkeypatch.setattr(server, "_get", fake_get)


def _fetch(monkeypatch, focus="gpu"):
    _install_fake(monkeypatch)
    return server.fetch({"focus": focus}, {"base_url": "http://127.0.0.1:8766"},
                        ctx={"cell_w": 600})


def test_prefers_the_gpu_unit(monkeypatch):
    data = _fetch(monkeypatch, "gpu")
    assert data["project"] == 15506
    assert data["project_name"] == "CD40L"
    assert data["progress"] == pytest.approx(0.25)
    assert data["protein"]


def test_cpu_focus(monkeypatch):
    assert _fetch(monkeypatch, "cpu")["project"] == 15511


def test_unknown_project_is_unspecified(monkeypatch):
    snapshot = json.loads(json.dumps(_SNAPSHOT))
    snapshot["units"][1]["project_name"] = None
    snapshot["units"][1]["topic"] = ""
    _install_fake(monkeypatch, snapshot)
    data = server.fetch({"focus": "gpu"}, {"base_url": "http://x"},
                        ctx={"cell_w": 600})
    assert data["project_name"] == "Unspecified"
    assert data["topic"] == ""


def test_bridge_down_is_an_error_not_an_exception(monkeypatch):
    def boom(url, timeout=6.0):
        raise OSError("connection refused")

    monkeypatch.setattr(server, "_get", boom)
    data = server.fetch({}, {"base_url": "http://127.0.0.1:8766"}, ctx={"cell_w": 600})
    assert "error" in data
    assert "bridge" in data["error"].lower()
