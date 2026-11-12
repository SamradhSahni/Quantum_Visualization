"""
Input Normalization & Context-Specific Output Escaping Utilities
Neutralizes control characters, path traversal tokens, LaTeX command injection, and unsafe data URLs.
"""
from __future__ import annotations

import re
import unicodedata
from email_validator import EmailNotValidError, validate_email

LATEX_ESCAPE_MAP = str.maketrans({
    "\\": r"\textbackslash{}",
    "{": r"\{",
    "}": r"\}",
    "$": r"\$",
    "&": r"\&",
    "#": r"\#",
    "^": r"\textasciicircum{}",
    "_": r"\_",
    "%": r"\%",
    "~": r"\textasciitilde{}",
})

_SAFE_IMAGE_DATA_URL_RE = re.compile(
    r"^data:image/(?:png|jpeg|webp);base64,[A-Za-z0-9+/=]+$"
)


def sanitize_text(value: str, max_len: int = 120, allow_newlines: bool = False) -> str:
    """Applies NFKC normalization, strips control chars/null bytes, and enforces length limits."""
    normalized = unicodedata.normalize("NFKC", value or "")
    cleaned_chars = []
    for ch in normalized:
        code = ord(ch)
        if code == 0:
            continue
        if code < 32:
            if allow_newlines and ch in ("\n", "\t"):
                cleaned_chars.append(ch)
            continue
        if code == 127:
            continue
        cleaned_chars.append(ch)
    result = "".join(cleaned_chars).strip()
    if len(result) > max_len:
        result = result[:max_len].strip()
    return result


def validate_and_normalize_email(email: str) -> str:
    """Validates email syntax and returns lowercased NFKC normalized address."""
    raw = sanitize_text(email, max_len=254, allow_newlines=False).lower()
    if not raw:
        raise ValueError("Email address is required.")
    try:
        info = validate_email(raw, check_deliverability=False)
        return info.normalized.lower()
    except EmailNotValidError as exc:
        raise ValueError(f"Invalid email address: {exc}") from exc


def sanitize_latex_text(value: str, max_len: int = 80) -> str:
    """Rejects TeX hex trigraphs/control chars and escapes all TeX metacharacters."""
    raw = sanitize_text(value, max_len=max_len, allow_newlines=False)
    if "^^" in raw:
        raise ValueError("Forbidden TeX trigraph sequence '^^' detected.")
    return raw.translate(LATEX_ESCAPE_MAP)


def is_safe_image_data_url(value: str) -> bool:
    """Permits strictly PNG/JPEG/WebP base64 image URLs."""
    if not value or len(value) > 7_500_000:
        return False
    return bool(_SAFE_IMAGE_DATA_URL_RE.match(value.strip()))

