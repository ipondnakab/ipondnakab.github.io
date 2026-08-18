#!/usr/bin/env bash
# Seed plan.md for the current feature from the plan template.
#   setup-plan.sh [--json]
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./common.sh
source "$SCRIPT_DIR/common.sh"

JSON_MODE=false
[[ "${1:-}" == "--json" ]] && JSON_MODE=true

get_feature_paths
check_feature_branch "$CURRENT_BRANCH" "$HAS_GIT"

if [[ -z "$FEATURE_DIR" ]]; then
    echo "ERROR: no feature found under specs/. Run /speckit.specify first." >&2
    exit 1
fi
if [[ ! -f "$FEATURE_SPEC" ]]; then
    echo "ERROR: $FEATURE_SPEC not found. Run /speckit.specify first." >&2
    exit 1
fi

mkdir -p "$FEATURE_DIR"
TEMPLATE="$REPO_ROOT/.specify/templates/plan-template.md"
[[ -f "$TEMPLATE" && ! -s "$IMPL_PLAN" ]] && cp "$TEMPLATE" "$IMPL_PLAN"

if [[ "$JSON_MODE" == "true" ]]; then
    printf '{"FEATURE_SPEC":"%s","IMPL_PLAN":"%s","SPECS_DIR":"%s","BRANCH":"%s","HAS_GIT":%s}\n' \
        "$FEATURE_SPEC" "$IMPL_PLAN" "$FEATURE_DIR" "$CURRENT_BRANCH" "$HAS_GIT"
else
    echo "FEATURE_SPEC: $FEATURE_SPEC"
    echo "IMPL_PLAN:    $IMPL_PLAN"
    echo "SPECS_DIR:    $FEATURE_DIR"
    echo "BRANCH:       $CURRENT_BRANCH"
fi
