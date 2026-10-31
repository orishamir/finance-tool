#!/usr/bin/env bash
# For the founder to run in the morning, with no arguments. Claude does not run this: it reads gov.il's pages through
# the founder's own FlareSolverr tool (research/audit/tools/govil-page.sh), which Claude does not use.
#
# Goes through gov-il-list.tsv (link, publisher, title, separated by tabs), fetches each page the library does not
# hold yet, files it under its link and pushes the index. Run again as often as you like: what is filed is skipped.
# What failed stays in gov-il-failed.tsv, and the last line says how many.
set -uo pipefail
cd "$(dirname "$0")/../.." || exit 1

list="${GOVIL_LIST:-research/2026-10-31-night/gov-il-list.tsv}"
failed="${GOVIL_FAILED:-research/2026-10-31-night/gov-il-failed.tsv}"
library="${GOVIL_LIBRARY:-research/library/library.mjs}"
tool="${GOVIL_TOOL:-research/audit/tools/govil-page.sh}"
index="$(dirname "$library")/index.jsonl"
botcheck='just a moment|attention required|enable javascript and cookies|verify you are human|captcha'

[[ -f "$list" ]] || { echo "No list at $list yet."; exit 1; }

if [[ -z "${GOVIL_TOOL:-}" ]] && ! curl -s --max-time 3 http://127.0.0.1:8191/ >/dev/null; then
  echo "Starting FlareSolverr..."
  docker start flaresolverr >/dev/null 2>&1 ||
    docker run -d --name flaresolverr -p 127.0.0.1:8191:8191 ghcr.io/flaresolverr/flaresolverr:latest >/dev/null ||
    { echo "Could not start FlareSolverr: is Docker running?"; exit 1; }
  for _ in $(seq 1 30); do
    curl -s --max-time 3 http://127.0.0.1:8191/ >/dev/null && break
    sleep 2
  done
fi

work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT
: >"$failed"
filed=0 skipped=0 bad=0

fail() {
  printf '%s\t%s\t%s\t%s\n' "$url" "$publisher" "$title" "$1" >>"$failed"
  echo "  failed: $1"
  bad=$((bad + 1))
}

while IFS=$'\t' read -r url publisher title; do
  [[ -z "$url" || "$url" == \#* ]] && continue
  if grep -qF "\"url\":\"$url\"" "$index" 2>/dev/null; then
    skipped=$((skipped + 1))
    continue
  fi
  echo "$url"
  if [[ "$url" =~ ^https://(www\.)?gov\.il/ && ! "$url" =~ /BlobFolder/ ]]; then
    file="$work/page.html"
    if ! "$tool" "$url" >"$file" 2>"$work/err"; then
      fail "the tool failed: $(tr '\n' ' ' <"$work/err" | cut -c1-120)"
      continue
    fi
  else
    # A PDF, or a host the tool refuses: a plain download.
    case "$url" in
      *.pdf | *.PDF | */BlobFolder/*) file="$work/page.pdf" ;;
      *) file="$work/page.html" ;;
    esac
    if ! curl -sSL --fail --connect-timeout 20 --max-time 180 -A 'Mozilla/5.0' -o "$file" "$url" 2>"$work/err"; then
      fail "download failed: $(tr '\n' ' ' <"$work/err" | cut -c1-120)"
      continue
    fi
  fi
  # A check page or an empty frame is not the document, and filing it would hide that the page is still missing.
  if [[ $(wc -c <"$file") -lt 2000 ]]; then
    fail "came back nearly empty"
    continue
  fi
  if [[ $(head -c 4 "$file") != "%PDF" ]]; then
    if [[ $(wc -c <"$file") -lt 200000 ]] && grep -qiE "$botcheck" "$file"; then
      fail "a check page came back instead of the document"
      continue
    fi
    # A link to a PDF that answers with a page is not the PDF.
    if [[ "$file" == *.pdf ]]; then
      fail "a web page came back instead of the PDF: save this one from your browser"
      continue
    fi
  fi
  if ! node "$library" add "$file" --url "$url" --publisher "$publisher" --title "$title"; then
    fail "the library refused it"
    continue
  fi
  filed=$((filed + 1))
done <"$list"

if [[ -z "${GOVIL_TOOL:-}" && $filed -gt 0 ]]; then
  git add research/library/index.jsonl research/library/unreachable.jsonl research/library/tried.jsonl "$failed"
  git commit -q -m "Library: gov.il pages the founder fetched

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" -- research/library/index.jsonl research/library/unreachable.jsonl research/library/tried.jsonl "$failed"
  git pull -q --rebase --autostash && git push -q origin main || echo "Filed, but the push failed: tell Claude."
fi

echo
echo "Filed $filed, already held $skipped, failed $bad."
[[ $bad -gt 0 ]] && echo "The failures are in $failed." || true
echo "Tell Claude it ran."
