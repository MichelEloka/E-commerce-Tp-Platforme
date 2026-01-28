#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

DEFAULT_NAMESPACE="micheleloka"
DOCKERHUB_NAMESPACE="${DOCKERHUB_NAMESPACE:-$DEFAULT_NAMESPACE}"

TAG="${TAG:-latest}"
SERVICES=("ms-membership" "ms-product" "ms-order")

if ! command -v docker >/dev/null 2>&1; then
  echo "docker not found in PATH." >&2
  exit 1
fi

echo "Using namespace: ${DOCKERHUB_NAMESPACE}"
echo "Using tag: ${TAG}"

for service in "${SERVICES[@]}"; do
  local_image="e-commerce-tp-platforme-${service}:latest"
  remote_image="${DOCKERHUB_NAMESPACE}/e-commerce-tp-platforme-${service}:${TAG}"

  if ! docker image inspect "${local_image}" >/dev/null 2>&1; then
    echo "Local image not found: ${local_image}. Run ./docker/build-all.sh first." >&2
    exit 1
  fi

  docker tag "${local_image}" "${remote_image}"
  docker push "${remote_image}"
done
