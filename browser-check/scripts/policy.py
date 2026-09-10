"""Explicit local-browser inputs; no browser imports or side effects."""
import json
from urllib.parse import urlsplit

KEYS = {"Tab", "Shift+Tab", "Enter", "Escape", "Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Home", "End"}
SCHEMAS = {"click": {"action", "selector"}, "fill": {"action", "selector", "value"},
           "press": {"action", "key"}, "scroll": {"action", "x", "y"},
           "wait-for": {"action", "selector"}, "screenshot": {"action"}}

def require(ok, message):
    if not ok:
        raise ValueError(message)

def local_url(value):
    require(isinstance(value, str) and len(value) <= 4096 and not any(c.isspace() or ord(c) < 32 or ord(c) == 127 for c in value), "Invalid local URL")
    parsed = urlsplit(value)
    require(parsed.scheme == "http" and parsed.hostname == "127.0.0.1" and parsed.username is None and parsed.password is None,
            "Only explicit http://127.0.0.1:PORT local previews are supported")
    require(parsed.port is not None and 1024 <= parsed.port <= 65535 and parsed.netloc == f"127.0.0.1:{parsed.port}", "Use a canonical explicit unprivileged port")
    require("\\" not in value, "Backslash URL refused")
    return f"http://127.0.0.1:{parsed.port}", parsed.port

def same_origin(value, origin):
    try:
        return local_url(value)[0] == origin
    except ValueError:
        return False

def unique_object(pairs):
    result = {}
    for key, value in pairs:
        require(key not in result, "Duplicate JSON key")
        result[key] = value
    return result

def actions(raw):
    require(len(raw) <= 65536, "Actions file exceeds64KiB")
    rows = json.loads(raw, object_pairs_hook=unique_object)
    require(isinstance(rows, list) and len(rows) <= 16, "Use at most16 explicit actions")
    for row in rows:
        require(isinstance(row, dict) and isinstance(row.get("action"), str) and row["action"] in SCHEMAS, "Unknown action")
        require(set(row) == SCHEMAS[row["action"]], "Unexpected or missing action fields")
        if "selector" in row:
            require(isinstance(row["selector"], str) and 0 < len(row["selector"]) <= 512 and "\0" not in row["selector"], "Invalid selector")
        if "value" in row:
            require(isinstance(row["value"], str) and len(row["value"]) <= 4096 and "\0" not in row["value"], "Invalid fill value")
        if "key" in row:
            require(isinstance(row["key"], str) and row["key"] in KEYS, "Unsupported key")
        for key in ("x", "y"):
            if key in row:
                require(type(row[key]) is int and abs(row[key]) <= 10000, "Scroll outside bounds")
    return rows

def fill_allowed(kind, autocomplete):
    return (kind or "").lower() not in {"password", "file", "hidden"} and not set((autocomplete or "").lower().split()) & {"current-password", "new-password", "one-time-code"}
