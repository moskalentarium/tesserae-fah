"""Host render smoke test.

This one needs a Tesserae checkout: copy `fah_unit/` into the host's `plugins/`
folder and run pytest from the Tesserae root. Outside that tree it skips.
"""
from __future__ import annotations

import json
from unittest.mock import patch

import pytest

pytest.importorskip("app", reason="run inside a Tesserae checkout")

_PNG = b"\x89PNG\r\n\x1a\n"
_SNAPSHOT = json.dumps({
    "generated": "2026-11-16T00:00:00Z",
    "machine": "Dallis",
    "user": "artemteddy",
    "donor": {"name": "artemteddy", "position": 9, "score": 2016184966, "wus": 8832},
    "team": {"name": "Team Pewds", "rank": 61},
    "units": [{"id": "gpu1", "project": 15506, "project_name": "CD40L",
               "topic": "autoimmune · ligand binding", "progress": 0.25,
               "eta": "2h", "gpus": ["gpu:0"], "protein": {"frames": 7}}],
}).encode()


class _Response:
    def __init__(self, data: bytes) -> None:
        self._data = data

    def read(self) -> bytes:
        return self._data

    def __enter__(self) -> "_Response":
        return self

    def __exit__(self, *args) -> bool:
        return False


def _urlopen(request, *args, **kwargs):
    url = getattr(request, "full_url", str(request))
    return _Response(_SNAPSHOT if url.endswith("/fah.json") else _PNG)


@pytest.mark.parametrize("size", ["sm", "md", "lg"])
def test_widget_renders(client, size: str) -> None:
    with patch("urllib.request.urlopen", side_effect=_urlopen):
        resp = client.get(f"/_test/render?plugin=fah_unit&size={size}")
    assert resp.status_code == 200
    body = resp.get_data(as_text=True)
    assert 'data-plugin="fah_unit"' in body
