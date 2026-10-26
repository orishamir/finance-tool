#!/usr/bin/env bash
# Render pages of a PDF to PNG for reading by eye: tools/render.sh <pdf> <first> <last> <dpi> <outprefix>
set -euo pipefail
pdftoppm -r "$4" -f "$2" -l "$3" -png "$1" "$5"
ls -la "$(dirname "$5")" | grep "$(basename "$5")"
