"""
Standalone Python 3 server for GK Hemanth's portfolio.

Serves the exact static portfolio (index.html, styles.css, script.js, and
certificate PDFs) alongside the /api/contact and /api/messages endpoints.

Usage:
    python3 app.py
"""

from __future__ import annotations

import json
import mimetypes
import os
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any
from urllib.parse import unquote, urlparse

from backend.portfolio_service import (
    PortfolioMessageStore,
    ValidationError,
    verify_certificates,
)

BASE_DIR = Path(__file__).resolve().parent
PUBLIC_DIR = BASE_DIR / "public"
DIST_DIR = BASE_DIR / "dist"
DEFAULT_HOST = "0.0.0.0"
DEFAULT_PORT = int(os.environ.get("PORT", "3000"))

MESSAGE_STORE = PortfolioMessageStore()


def _resolve_static_file(url_path: str) -> Path | None:
    """Resolve a request path to the exact portfolio file safely."""
    clean_path = unquote(url_path).lstrip("/")
    if not clean_path or clean_path == "index.html":
        for candidate in (BASE_DIR / "index.html", DIST_DIR / "index.html"):
            if candidate.is_file():
                return candidate
        return None

    for root in (PUBLIC_DIR, DIST_DIR, BASE_DIR):
        candidate = (root / clean_path).resolve()
        try:
            candidate.relative_to(root.resolve())
        except ValueError:
            continue
        if candidate.is_file():
            return candidate
    return None


class PortfolioRequestHandler(BaseHTTPRequestHandler):
    """HTTP handler for GK Hemanth's portfolio and contact API."""

    server_version = "PortfolioPythonServer/1.0"

    def _send_json(self, payload: Any, status: HTTPStatus = HTTPStatus.OK) -> None:
        encoded = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(encoded)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(encoded)

    def _send_file(self, file_path: Path) -> None:
        mime_type, _ = mimetypes.guess_type(str(file_path))
        content_type = mime_type or "application/octet-stream"
        if content_type.startswith("text/") or content_type == "application/javascript":
            content_type = f"{content_type}; charset=utf-8"

        data = file_path.read_bytes()
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self) -> None:  # noqa: N802
        parsed = urlparse(self.path)
        route = parsed.path

        if route == "/api/messages":
            self._send_json(MESSAGE_STORE.list_messages(), HTTPStatus.OK)
            return

        if route == "/api/health":
            self._send_json(
                {
                    "status": "ok",
                    "runtime": "python",
                    "certificates": verify_certificates(PUBLIC_DIR),
                },
                HTTPStatus.OK,
            )
            return

        file_path = _resolve_static_file(route)
        if file_path is not None:
            self._send_file(file_path)
            return

        self._send_json({"error": "Not found"}, HTTPStatus.NOT_FOUND)

    def do_POST(self) -> None:  # noqa: N802
        parsed = urlparse(self.path)
        if parsed.path != "/api/contact":
            self._send_json({"error": "Not found"}, HTTPStatus.NOT_FOUND)
            return

        try:
            content_length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            self._send_json(
                {"success": False, "message": "Invalid Content-Length header."},
                HTTPStatus.BAD_REQUEST,
            )
            return

        raw_body = self.rfile.read(content_length)
        try:
            payload = json.loads(raw_body.decode("utf-8")) if raw_body else {}
        except (UnicodeDecodeError, json.JSONDecodeError):
            self._send_json(
                {"success": False, "message": "Invalid JSON body."},
                HTTPStatus.BAD_REQUEST,
            )
            return

        try:
            saved = MESSAGE_STORE.add_message(payload)
        except ValidationError as exc:
            self._send_json(
                {"success": False, "message": str(exc)},
                HTTPStatus.BAD_REQUEST,
            )
            return

        self._send_json(
            {
                "success": True,
                "message": "Your message has been received and recorded.",
                "data": saved,
            },
            HTTPStatus.CREATED,
        )


def run_server(host: str = DEFAULT_HOST, port: int = DEFAULT_PORT) -> None:
    """Start the standalone Python HTTP server."""
    server = ThreadingHTTPServer((host, port), PortfolioRequestHandler)
    print(f"GK Hemanth Portfolio (Python server) running at http://{host}:{port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    run_server()
