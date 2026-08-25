#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
skills_dir="${AGENTS_SKILLS_DIR:-$HOME/.agents/skills}"

skills=(
  java-clean-architecture
  java-ddd-architecture
  java-readable-code
  java-testing-style
  java-solid-review
  java-agent-instructions
  java-logging-exceptions
  java-application-security
  java-domain-clarification
  java-spring-security
  java-flyway-migrations
)

mkdir -p "$skills_dir"

for skill in "${skills[@]}"; do
  source="$repo_root/$skill"
  target="$skills_dir/$skill"

  if [[ ! -f "$source/SKILL.md" ]]; then
    echo "Missing skill: $source/SKILL.md" >&2
    exit 1
  fi

  if [[ -L "$target" ]]; then
    current="$(readlink "$target")"
    if [[ "$current" == "$source" ]]; then
      echo "Already installed: $skill"
      continue
    fi

    echo "Updating symlink: $skill"
    rm "$target"
  elif [[ -e "$target" ]]; then
    echo "Refusing to overwrite existing non-symlink: $target" >&2
    exit 1
  fi

  ln -s "$source" "$target"
  echo "Installed: $skill -> $source"
done

echo
echo "Restart Codex to pick up new or changed skills."
