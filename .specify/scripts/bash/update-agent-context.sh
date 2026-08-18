#!/usr/bin/env bash
# Refresh the managed "Active feature context" block in the agent file
# (CLAUDE.md) from the current feature's plan.md.
#
#   update-agent-context.sh [claude]
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./common.sh
source "$SCRIPT_DIR/common.sh"

AGENT="${1:-claude}"
get_feature_paths

case "$AGENT" in
    claude) AGENT_FILE="$REPO_ROOT/CLAUDE.md" ;;
    *) echo "ERROR: unsupported agent '$AGENT' (only 'claude' is wired up here)." >&2; exit 1 ;;
esac

if [[ -z "$FEATURE_DIR" || ! -f "$IMPL_PLAN" ]]; then
    echo "ERROR: no plan.md for the current feature. Run /speckit.plan first." >&2
    exit 1
fi

BEGIN="<!-- SPECIFY:BEGIN active-feature -->"
END="<!-- SPECIFY:END active-feature -->"
FEATURE_NAME="$(basename "$FEATURE_DIR")"

# Pull the "## Technical Context" section out of plan.md, if present.
TECH="$(awk '/^## Technical Context/{flag=1; next} /^## /{flag=0} flag' "$IMPL_PLAN" | sed '/^$/d')"
[[ -z "$TECH" ]] && TECH="_No Technical Context section in plan.md yet._"

BLOCK="$(cat <<EOF
$BEGIN
<!-- Managed by .specify/scripts/bash/update-agent-context.sh. Do not edit by hand. -->

## Active feature context

**Feature:** \`$FEATURE_NAME\` — see [specs/$FEATURE_NAME/spec.md](specs/$FEATURE_NAME/spec.md) and [plan.md](specs/$FEATURE_NAME/plan.md).

$TECH
$END
EOF
)"

if grep -qF "$BEGIN" "$AGENT_FILE"; then
    # The block travels through the environment: stdin already carries the
    # Python program, and argv carries the paths.
    SPECIFY_BLOCK="$BLOCK" python3 - "$AGENT_FILE" "$BEGIN" "$END" <<'EMBED'
import os, sys

path, begin, end = sys.argv[1], sys.argv[2], sys.argv[3]
block = os.environ["SPECIFY_BLOCK"].rstrip("\n")
s = open(path, encoding="utf-8").read()
i, j = s.index(begin), s.index(end) + len(end)
open(path, "w", encoding="utf-8").write(s[:i] + block + s[j:])
EMBED
    echo "Updated the active-feature block in $AGENT_FILE"
else
    printf '\n%s\n' "$BLOCK" >> "$AGENT_FILE"
    echo "Appended the active-feature block to $AGENT_FILE"
fi
