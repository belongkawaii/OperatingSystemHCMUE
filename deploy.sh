#!/usr/bin/env bash
set -euo pipefail

cd -- "$(dirname -- "${BASH_SOURCE[0]}")"
export APP_IMAGE="${1:?Missing image reference}"

if [[ -f current-image.txt ]]; then
  cp -- current-image.txt previous-image.txt
fi

docker compose -p winnux -f compose.yaml pull server
docker compose -p winnux -f compose.yaml up -d --no-build --wait --wait-timeout 90 server
curl -fsS --max-time 10 -o /dev/null http://127.0.0.1:8080/index.html

printf '%s\n' "$APP_IMAGE" > current-image.next.txt
mv -- current-image.next.txt current-image.txt