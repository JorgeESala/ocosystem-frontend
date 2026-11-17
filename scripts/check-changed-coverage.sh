#!/usr/bin/env bash
# Fail when changed frontend lines are not covered enough by tests.
# Usage: scripts/check-changed-coverage.sh [base-ref]
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

report="${COVERAGE_REPORT:-coverage/lcov.info}"
base="${1:-${BASE_SHA:-origin/main}}"
threshold="${COVERAGE_THRESHOLD:-80}"

if [ ! -f "$report" ]; then
  echo "ERROR: coverage report not found: $report" >&2
  echo "Run npm run test:coverage first." >&2
  exit 1
fi

if command -v diff-cover >/dev/null 2>&1; then
  diff_cover=(diff-cover)
elif python -c "import diff_cover" >/dev/null 2>&1; then
  diff_cover=(python -m diff_cover.diff_cover_tool)
else
  echo "ERROR: diff-cover is not installed. Run: python -m pip install diff-cover" >&2
  exit 1
fi

"${diff_cover[@]}" "$report" \
  --compare-branch="$base" \
  --fail-under="$threshold" \
  --exclude 'src/**/__tests__/**' \
  --exclude 'src/**/*.test.*' \
  --exclude 'src/**/*.spec.*' \
  --exclude 'src/test/**' \
  --exclude 'src/**/*.d.ts' \
  --exclude 'src/main.tsx' \
  --exclude 'src/**/types/**' \
  --exclude 'src/**/*.config.*' \
  --exclude 'e2e/**'
