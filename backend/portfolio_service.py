"""
Python backend service for GK Hemanth's portfolio.

Handles contact form validation, persistent message storage, inbox retrieval,
and certificate PDF integrity checks without altering the frontend UI.
"""

from __future__ import annotations

import json
import os
import re
import sys
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
MESSAGES_FILE = DATA_DIR / "messages.json"
PUBLIC_DIR = BASE_DIR / "public"

EMAIL_PATTERN = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
MAX_MESSAGE_LENGTH = 600
MAX_STORED_MESSAGES = 500

CERTIFICATES_REGISTRY: List[Dict[str, str]] = [
    {
        "id": "computer-architecture",
        "title": "Computer Architecture Essentials",
        "issuer": "LinkedIn Learning",
        "certId": "4e25ba83abcdf7e2a778c5d4955a648e82be25ebcf007434750a22e81d12560c",
        "pdfFile": "assets/certificates/computer-architecture-essentials.pdf",
    },
    {
        "id": "discrete-math",
        "title": "Programming Foundations: Discrete Mathematics",
        "issuer": "LinkedIn Learning",
        "certId": "e4d9eed96531d360d055d72ca369bcf02d5b110a2d01d4278f3b22d0a0d08683",
        "pdfFile": "assets/certificates/programming-foundations-discrete-mathematics.pdf",
    },
    {
        "id": "graph-neural-networks",
        "title": "Learning Graph Neural Networks",
        "issuer": "LinkedIn Learning",
        "certId": "3166ad55658d1897f9ef19c764a1f48ecf0866ec7d8d5ce2f7f83193af2d2d9b",
        "pdfFile": "assets/certificates/learning-graph-neural-networks.pdf",
    },
]


class ValidationError(ValueError):
    """Raised when an incoming contact inquiry fails validation."""


@dataclass
class ContactMessage:
    """Validated contact inquiry submitted through the portfolio form."""

    name: str
    email: str
    subject: str
    message: str
    timestamp: str
    received: str

    def to_dict(self) -> Dict[str, str]:
        return asdict(self)


def validate_contact_payload(payload: Dict[str, Any]) -> ContactMessage:
    """Validate and normalize a contact form submission payload."""
    if not isinstance(payload, dict):
        raise ValidationError("Invalid request payload.")

    name = str(payload.get("name", "")).strip()
    email = str(payload.get("email", "")).strip()
    subject = str(payload.get("subject", "")).strip()
    message = str(payload.get("message", "")).strip()
    raw_timestamp = str(payload.get("timestamp", "")).strip()

    if len(name) < 2:
        raise ValidationError("Please enter your full name (at least 2 characters).")
    if not EMAIL_PATTERN.match(email):
        raise ValidationError("Please enter a valid email address.")
    if len(subject) < 2:
        raise ValidationError("Please enter a message subject.")
    if len(message) < 5:
        raise ValidationError("Please write a message with at least 5 characters.")
    if len(message) > MAX_MESSAGE_LENGTH:
        raise ValidationError(
            f"Message exceeds the maximum length of {MAX_MESSAGE_LENGTH} characters."
        )

    now_utc = datetime.now(timezone.utc)
    timestamp = raw_timestamp or now_utc.isoformat().replace("+00:00", "Z")
    received = now_utc.strftime("%Y-%m-%d %H:%M:%S UTC")

    return ContactMessage(
        name=name,
        email=email,
        subject=subject,
        message=message,
        timestamp=timestamp,
        received=received,
    )


class PortfolioMessageStore:
    """File-backed JSON store for portfolio contact inquiries."""

    def __init__(self, storage_path: Optional[Path] = None) -> None:
        self.storage_path = storage_path or MESSAGES_FILE

    def _ensure_storage(self) -> None:
        self.storage_path.parent.mkdir(parents=True, exist_ok=True)
        if not self.storage_path.exists():
            self.storage_path.write_text("[]", encoding="utf-8")

    def list_messages(self) -> List[Dict[str, str]]:
        """Return stored contact inquiries ordered newest-first."""
        self._ensure_storage()
        try:
            raw = self.storage_path.read_text(encoding="utf-8")
            parsed = json.loads(raw)
            if isinstance(parsed, list):
                return parsed
        except (OSError, json.JSONDecodeError):
            pass
        return []

    def add_message(self, payload: Dict[str, Any]) -> Dict[str, str]:
        """Validate and prepend a new contact inquiry to the JSON store."""
        entry = validate_contact_payload(payload).to_dict()
        messages = self.list_messages()
        messages.insert(0, entry)
        trimmed = messages[:MAX_STORED_MESSAGES]

        tmp_path = self.storage_path.with_suffix(".tmp")
        tmp_path.write_text(
            json.dumps(trimmed, indent=2, ensure_ascii=False),
            encoding="utf-8",
        )
        os.replace(tmp_path, self.storage_path)
        return entry


def verify_certificates(static_root: Optional[Path] = None) -> List[Dict[str, Any]]:
    """Check that every linked certificate PDF is present on disk."""
    root = static_root or PUBLIC_DIR
    results: List[Dict[str, Any]] = []
    for cert in CERTIFICATES_REGISTRY:
        pdf_path = root / cert["pdfFile"]
        results.append(
            {
                "id": cert["id"],
                "title": cert["title"],
                "exists": pdf_path.is_file(),
                "bytes": pdf_path.stat().st_size if pdf_path.is_file() else 0,
            }
        )
    return results


def _run_cli(argv: List[str]) -> int:
    """CLI entrypoint used by the Node/Express bridge or shell tooling."""
    store = PortfolioMessageStore()
    command = argv[1] if len(argv) > 1 else "list"

    if command == "list":
        print(json.dumps(store.list_messages(), ensure_ascii=False))
        return 0

    if command == "add":
        raw_input = sys.stdin.read()
        try:
            payload = json.loads(raw_input) if raw_input.strip() else {}
            saved = store.add_message(payload)
            print(
                json.dumps(
                    {
                        "success": True,
                        "message": "Your message has been received and recorded.",
                        "data": saved,
                    },
                    ensure_ascii=False,
                )
            )
            return 0
        except ValidationError as exc:
            print(json.dumps({"success": False, "message": str(exc)}, ensure_ascii=False))
            return 2
        except json.JSONDecodeError:
            print(
                json.dumps(
                    {"success": False, "message": "Invalid JSON body."},
                    ensure_ascii=False,
                )
            )
            return 2

    if command == "verify-certs":
        print(json.dumps(verify_certificates(), indent=2, ensure_ascii=False))
        return 0

    print(
        json.dumps(
            {"success": False, "message": f"Unknown command: {command}"},
            ensure_ascii=False,
        )
    )
    return 1


if __name__ == "__main__":
    raise SystemExit(_run_cli(sys.argv))
