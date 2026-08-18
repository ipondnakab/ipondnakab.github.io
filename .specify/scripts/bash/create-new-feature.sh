#!/usr/bin/env bash
# Create the next numbered feature: a branch (when git is available) and a
# specs/###-slug/spec.md seeded from the spec template.
#
#   create-new-feature.sh [--json] [--no-branch] "<feature description>"
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./common.sh
source "$SCRIPT_DIR/common.sh"

JSON_MODE=false
NO_BRANCH=false
ARGS=()
while [[ $# -gt 0 ]]; do
    case "$1" in
        --json) JSON_MODE=true ;;
        --no-branch) NO_BRANCH=true ;;
        -h|--help) echo "Usage: $0 [--json] [--no-branch] \"<feature description>\""; exit 0 ;;
        *) ARGS+=("$1") ;;
    esac
    shift
done

FEATURE_DESCRIPTION="${ARGS[*]:-}"
if [[ -z "$FEATURE_DESCRIPTION" ]]; then
    echo "Usage: $0 [--json] [--no-branch] \"<feature description>\"" >&2
    exit 1
fi

REPO_ROOT="$(get_repo_root)"
SPECS_DIR="$REPO_ROOT/specs"
mkdir -p "$SPECS_DIR"

# Next number = highest existing + 1.
HIGHEST=0
while IFS= read -r dir; do
    [[ -z "$dir" ]] && continue
    num="${dir##*/}"; num="${num%%-*}"; num="$((10#$num))"
    (( num > HIGHEST )) && HIGHEST="$num"
done < <(find "$SPECS_DIR" -mindepth 1 -maxdepth 1 -type d -name '[0-9][0-9][0-9]-*' 2>/dev/null)
FEATURE_NUM="$(printf '%03d' "$((HIGHEST + 1))")"

# Slug: lowercase, non-alphanumerics to dashes, first 4 meaningful words.
SLUG="$(printf '%s' "$FEATURE_DESCRIPTION" \
    | tr '[:upper:]' '[:lower:]' \
    | sed -E 's/[^a-z0-9]+/-/g; s/^-+//; s/-+$//' \
    | awk -F'-' '{n=(NF<4?NF:4); s=""; for(i=1;i<=n;i++) s=s (i>1?"-":"") $i; print s}')"
[[ -z "$SLUG" ]] && SLUG="feature"
BRANCH_NAME="${FEATURE_NUM}-${SLUG}"

HAS_GIT_REPO="$(has_git && echo true || echo false)"
BRANCH_CREATED=false
if [[ "$HAS_GIT_REPO" == "true" && "$NO_BRANCH" == "false" ]]; then
    git -C "$REPO_ROOT" checkout -b "$BRANCH_NAME" >/dev/null 2>&1 && BRANCH_CREATED=true \
        || echo "WARNING: could not create branch '$BRANCH_NAME'; staying on the current branch." >&2
fi

FEATURE_DIR="$SPECS_DIR/$BRANCH_NAME"
mkdir -p "$FEATURE_DIR"
SPEC_FILE="$FEATURE_DIR/spec.md"

TEMPLATE="$REPO_ROOT/.specify/templates/spec-template.md"
if [[ -f "$TEMPLATE" ]]; then cp "$TEMPLATE" "$SPEC_FILE"; else : > "$SPEC_FILE"; fi

if [[ "$JSON_MODE" == "true" ]]; then
    printf '{"BRANCH_NAME":"%s","SPEC_FILE":"%s","FEATURE_NUM":"%s","FEATURE_DIR":"%s","BRANCH_CREATED":%s,"HAS_GIT":%s}\n' \
        "$BRANCH_NAME" "$SPEC_FILE" "$FEATURE_NUM" "$FEATURE_DIR" "$BRANCH_CREATED" "$HAS_GIT_REPO"
else
    echo "BRANCH_NAME: $BRANCH_NAME"
    echo "SPEC_FILE:   $SPEC_FILE"
    echo "FEATURE_NUM: $FEATURE_NUM"
fi
