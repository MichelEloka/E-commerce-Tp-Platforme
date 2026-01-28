#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if ! command -v mvn >/dev/null 2>&1; then
  echo "mvn not found in PATH." >&2
  exit 1
fi
if ! command -v docker >/dev/null 2>&1; then
  echo "docker not found in PATH." >&2
  exit 1
fi
if [[ ! -f docker-compose.yml ]]; then
  echo "Missing docker-compose.yml in repo root." >&2
  exit 1
fi

SERVICES=("ms-membership" "ms-product" "ms-order")

echo "Building Maven artifacts..."
for service in "${SERVICES[@]}"; do
  if [[ ! -f "${service}/pom.xml" ]]; then
    echo "Missing ${service}/pom.xml" >&2
    exit 1
  fi
  mvn -f "${service}/pom.xml" -DskipTests package
done

echo "Building Docker images..."
docker compose build "${SERVICES[@]}"
