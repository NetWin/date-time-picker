#! /usr/bin/env bash
set -euo pipefail

if [ $# -ne 2 ]; then
  echo "Usage: $0 <base_branch> <head_branch>" >&2
  exit 1
fi

base_branch="$1"
head_branch="$2"

git checkout "$base_branch"
git reset --hard "$head_branch"


# Stop semantic-release from detecting the CI environment. Otherwise it ignores
# the git environment and do dumb stuff...
unset GITHUB_ACTIONS

output="$(npx semantic-release \
  --plugins @semantic-release/commit-analyzer,@semantic-release/release-notes-generator \
  --dry-run --no-ci)"

printf "====================\n" >&2
printf "DEBUG: semantic-release output:\n" >&2
printf "$output\n" >&2
printf "====================\n\n\n" >&2


# Extract version bump type. Grep has no lookbehind, so this is a bit ugly...
bump_type="$(echo "$output" | grep -Po "Analysis of \d+ commits complete: \K(no|patch|minor|major)(?= release$)" || echo "no" )"

printf "Version bump type: $bump_type\n\n" >&2

if [ -n "${CI-}" ]; then
  echo "version-bump-type=$bump_type" >> $GITHUB_OUTPUT
fi

# Extract changelog
if [ "$bump_type" = "no" ]; then
  echo "No release needed" >&2
  exit 0
fi

changelog="$(echo "$output" | sed -En "/\[semantic-release\] › ℹ  Release note for version [0-9a-zA-Z.+-]+:$/,$ p" | tail -n +2)"

echo "Changelog:" >&2
echo "$changelog" >&2

# Set outputs for GitHub Actions
if [ -n "${CI-}" ]; then
  {
    echo "changelog<<EOF"
    echo "$changelog"
    echo "EOF"
  } >> $GITHUB_OUTPUT
fi
