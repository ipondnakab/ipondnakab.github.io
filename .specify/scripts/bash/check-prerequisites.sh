#!/usr/bin/env bash
# Report the current feature directory and which design docs exist.
#   check-prerequisites.sh [--json] [--require-tasks] [--include-tasks] [--paths-only]
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./common.sh
source "$SCRIPT_DIR/common.sh"

JSON_MODE=false; REQUIRE_TASKS=false; INCLUDE_TASKS=false; PATHS_ONLY=false
while [[ $# -gt 0 ]]; do
    case "$1" in
        --json) JSON_MODE=true ;;
        --require-tasks) REQUIRE_TASKS=true ;;
        --include-tasks) INCLUDE_TASKS=true ;;
        --paths-only) PATHS_ONLY=true ;;
        -h|--help) echo "Usage: $0 [--json] [--require-tasks] [--include-tasks] [--paths-only]"; exit 0 ;;
    esac
    shift
done

get_feature_paths
check_feature_branch "$CURRENT_BRANCH" "$HAS_GIT"

if [[ "$PATHS_ONLY" == "true" ]]; then
    if [[ "$JSON_MODE" == "true" ]]; then
        printf '{"REPO_ROOT":"%s","BRANCH":"%s","FEATURE_DIR":"%s","FEATURE_SPEC":"%s","IMPL_PLAN":"%s","TASKS":"%s"}\n' \
            "$REPO_ROOT" "$CURRENT_BRANCH" "$FEATURE_DIR" "$FEATURE_SPEC" "$IMPL_PLAN" "$TASKS"
    else
        echo "REPO_ROOT:    $REPO_ROOT"
        echo "BRANCH:       $CURRENT_BRANCH"
        echo "FEATURE_DIR:  $FEATURE_DIR"
        echo "FEATURE_SPEC: $FEATURE_SPEC"
        echo "IMPL_PLAN:    $IMPL_PLAN"
        echo "TASKS:        $TASKS"
    fi
    exit 0
fi

if [[ -z "$FEATURE_DIR" || ! -d "$FEATURE_DIR" ]]; then
    echo "ERROR: no feature found under specs/. Run /speckit.specify first." >&2
    exit 1
fi
if [[ ! -f "$IMPL_PLAN" ]]; then
    echo "ERROR: plan.md not found in $FEATURE_DIR. Run /speckit.plan first." >&2
    exit 1
fi
if [[ "$REQUIRE_TASKS" == "true" && ! -f "$TASKS" ]]; then
    echo "ERROR: tasks.md not found in $FEATURE_DIR. Run /speckit.tasks first." >&2
    exit 1
fi

DOCS=()
[[ -f "$RESEARCH" ]]   && DOCS+=("research.md")
[[ -f "$DATA_MODEL" ]] && DOCS+=("data-model.md")
[[ -d "$CONTRACTS_DIR" && -n "$(ls -A "$CONTRACTS_DIR" 2>/dev/null)" ]] && DOCS+=("contracts/")
[[ -f "$QUICKSTART" ]] && DOCS+=("quickstart.md")
[[ "$INCLUDE_TASKS" == "true" && -f "$TASKS" ]] && DOCS+=("tasks.md")

if [[ "$JSON_MODE" == "true" ]]; then
    json_docs="$(printf '"%s",' "${DOCS[@]:-}" | sed 's/,$//; s/""//')"
    printf '{"FEATURE_DIR":"%s","AVAILABLE_DOCS":[%s]}\n' "$FEATURE_DIR" "$json_docs"
else
    echo "FEATURE_DIR: $FEATURE_DIR"
    echo "AVAILABLE_DOCS:"
    for d in "${DOCS[@]:-}"; do [[ -n "$d" ]] && echo "  - $d"; done
fi
