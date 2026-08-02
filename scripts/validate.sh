#!/usr/bin/env bash
set -euo pipefail

fail=0

if [[ ! -f .env ]]; then
  echo "ERROR: .env not found. Run ./scripts/bootstrap.sh"
  fail=1
fi

if command -v docker >/dev/null 2>&1; then
  docker compose config >/dev/null
  echo "OK: docker compose config"
else
  echo "ERROR: Docker not installed"
  fail=1
fi

if command -v node >/dev/null 2>&1 && command -v npm >/dev/null 2>&1; then
  npm install --ignore-scripts
  npm run typecheck
  echo "OK: TypeScript"
else
  echo "WARN: Node/npm not installed; skipped TypeScript check"
fi

if [[ -f .env ]] && grep -q 'CHANGE_ME' .env; then
  echo "ERROR: .env still contains CHANGE_ME"
  fail=1
fi

exit "$fail"
