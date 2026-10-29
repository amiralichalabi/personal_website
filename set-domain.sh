#!/usr/bin/env bash
# Usage: ./set-domain.sh yourname.ir
# Replaces the YOUR-DOMAIN.ir placeholder everywhere and writes the CNAME file.
set -euo pipefail
d="${1:?Usage: ./set-domain.sh yourname.ir}"
d="${d#https://}"; d="${d#http://}"; d="${d%/}"
files=$(grep -rl "YOUR-DOMAIN.ir" --include="*.html" --include="*.xml" --include="*.txt" --include="*.md" . || true)
for f in $files; do sed -i.bak "s/YOUR-DOMAIN\.ir/$d/g" "$f" && rm -f "$f.bak"; done
printf '%s\n' "$d" > CNAME
echo "Done. Domain set to: $d (CNAME written, $(echo "$files" | wc -w) files updated)"
