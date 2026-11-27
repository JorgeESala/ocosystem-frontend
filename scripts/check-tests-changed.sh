#!/usr/bin/env bash
# Fail when frontend source changed without a matching test change.
# Usage: scripts/check-tests-changed.sh [base-sha]
set -euo pipefail

base="${1:-${BASE_SHA:-}}"

if [ -z "${base}" ] || [ "${base}" = "0000000000000000000000000000000000000000" ]; then
  base="$(git rev-parse HEAD^ 2>/dev/null || true)"
fi

if [ -z "${base}" ]; then
  echo "No base commit available; skipping tests-changed check."
  exit 0
fi

changed="$(git diff --name-only "${base}...HEAD")"
source_changes="$(printf '%s\n' "${changed}" | grep -E '^src/' | grep -Ev '(__tests__/|\.test\.|\.spec\.|^src/test/)' || true)"
test_changes="$(printf '%s\n' "${changed}" | grep -E '(^src/.*(__tests__/|\.test\.|\.spec\.))|^e2e/|^src/test/' || true)"

if [ -z "${source_changes}" ] || [ -n "${test_changes}" ]; then
  echo "Tests-changed check passed."
  exit 0
fi

if printf '%s' "${PR_TITLE:-}" | grep -q '\[no-test\]'; then
  echo "Tests-changed check bypassed by [no-test] in the PR title."
  exit 0
fi

if git log --format=%B "${base}..HEAD" | grep -q '\[no-test\]'; then
  echo "Tests-changed check bypassed by [no-test] in a commit message."
  exit 0
fi

echo "ERROR: frontend source changed without test changes." >&2
echo "Start with a failing test (TDD), then implement the change." >&2
echo "Changed source files:" >&2
printf '%s\n' "${source_changes}" >&2
echo "If this change truly needs no test, add [no-test] with the reason to the commit message or PR title." >&2
exit 1
