#!/usr/bin/env bash
# Compila y despliega con Serverless. Pasa flags extra a serverless (p. ej. --stage prod).
#
# Tras `aws login`, el SDK de Node a veces no ve la sesión; exportamos credenciales como hace la CLI.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "${ROOT}"

if command -v aws >/dev/null 2>&1; then
  eval "$(aws configure export-credentials --format env)"
fi

npm run build
exec npx serverless deploy "$@"
