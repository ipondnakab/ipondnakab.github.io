#!/usr/bin/env bash
# Shared helpers for the Spec Kit scripts in this repo.

get_repo_root() {
    if git rev-parse --show-toplevel >/dev/null 2>&1; then
        git rev-parse --show-toplevel
    else
        local dir
        dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
        while [[ "$dir" != "/" ]]; do
            [[ -d "$dir/.specify" ]] && { printf '%s\n' "$dir"; return 0; }
            dir="$(dirname "$dir")"
        done
        pwd
    fi
}

has_git() { git rev-parse --show-toplevel >/dev/null 2>&1; }

get_current_branch() {
    # SPECIFY_FEATURE wins, so a feature can be worked on without a branch.
    if [[ -n "${SPECIFY_FEATURE:-}" ]]; then
        printf '%s\n' "$SPECIFY_FEATURE"
    elif has_git; then
        git rev-parse --abbrev-ref HEAD
    else
        printf '%s\n' "main"
    fi
}

# A feature slug looks like 003-planning-poker-groups.
is_feature_slug() { [[ "$1" =~ ^[0-9]{3}- ]]; }

# The spec folder for the current feature. Falls back to the highest-numbered
# folder in specs/ so /speckit.plan still works on a non-feature branch.
get_feature_dir() {
    local repo_root="$1" branch="$2"
    if is_feature_slug "$branch" && [[ -d "$repo_root/specs/$branch" ]]; then
        printf '%s\n' "$repo_root/specs/$branch"
        return 0
    fi
    local latest
    latest="$(find "$repo_root/specs" -mindepth 1 -maxdepth 1 -type d -name '[0-9][0-9][0-9]-*' 2>/dev/null | sort | tail -1)"
    [[ -n "$latest" ]] && printf '%s\n' "$latest"
}

# Export FEATURE_DIR, FEATURE_SPEC, IMPL_PLAN, TASKS and friends.
get_feature_paths() {
    local repo_root current_branch feature_dir
    repo_root="$(get_repo_root)"
    current_branch="$(get_current_branch)"
    feature_dir="$(get_feature_dir "$repo_root" "$current_branch")"

    REPO_ROOT="$repo_root"
    CURRENT_BRANCH="$current_branch"
    HAS_GIT="$(has_git && echo true || echo false)"
    FEATURE_DIR="$feature_dir"
    FEATURE_SPEC="$feature_dir/spec.md"
    IMPL_PLAN="$feature_dir/plan.md"
    TASKS="$feature_dir/tasks.md"
    RESEARCH="$feature_dir/research.md"
    DATA_MODEL="$feature_dir/data-model.md"
    QUICKSTART="$feature_dir/quickstart.md"
    CONTRACTS_DIR="$feature_dir/contracts"
}

check_feature_branch() {
    local branch="$1" has_git_repo="$2"
    if [[ "$has_git_repo" != "true" ]]; then return 0; fi
    if ! is_feature_slug "$branch"; then
        echo "WARNING: '$branch' is not a feature branch (expected ###-name)." >&2
        echo "         Set SPECIFY_FEATURE=<###-name> or run /speckit.specify first." >&2
    fi
    return 0
}
