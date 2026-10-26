#!/usr/bin/env bash
# F2 wrapper: tools/src.py with the shared source cache in tools/work/srccache.
HERE="$(cd "$(dirname "$0")" && pwd)"
SRC_CACHE="$HERE/work/srccache" exec python3 "$HERE/src.py" "$@"
