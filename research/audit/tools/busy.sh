#!/usr/bin/env bash
# How many heavy jobs (site builds, test runs) run on this machine now: each counted once, at its top process. Wait while it prints 3 or
# more. The old count (`ps aux | grep -E "[r]eact-router build|[v]itest" | wc -l`) also counted every vitest worker, so one test run could
# read as 10 or 30 and agents waited up to 24 minutes for nothing (2026-11-07).
ps -eo pid=,ppid=,args= | awk '
  { pid[$1]=$2; a=$0; sub(/^ *[0-9]+ +[0-9]+ +/, "", a); args[$1]=a }
  END {
    for (p in args) {
      if (args[p] ~ /(ba)?sh -c/) continue
      if (args[p] !~ /react-router build|vitest/) continue
      q = pid[p]; nested = 0
      while (q in args && q > 1) { if (args[q] ~ /react-router build|vitest/ && args[q] !~ /(ba)?sh -c/) { nested = 1; break } q = pid[q] }
      if (!nested) n++
    }
    print n + 0
  }'
