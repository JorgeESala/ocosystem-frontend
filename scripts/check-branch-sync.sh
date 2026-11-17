#!/usr/bin/env bash
# Verify that production (main) is contained in development (dev).
set -euo pipefail

require_identical=0
if [ "${1:-}" = "--require-identical" ]; then
  require_identical=1
fi

git fetch origin main dev --quiet

if ! git merge-base --is-ancestor origin/main origin/dev; then
  echo "ERROR: main has commits that dev does not have." >&2
  echo "Sync it before finishing:" >&2
  echo "  git checkout dev && git merge origin/main && git push origin dev" >&2
  exit 1
fi

if [ "$require_identical" = 1 ] && ! git diff --quiet origin/main origin/dev; then
  echo "ERROR: dev and main are not identical (release verification failed)." >&2
  exit 1
fi

echo "OK: main is contained in dev."
