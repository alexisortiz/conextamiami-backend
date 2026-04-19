#!/usr/bin/env bash
# Guarda el token de Bridge en Parameter Store (SecureString).
# Uso: export BRIDGE_SERVER_TOKEN='tu_token' && ./scripts/put-bridge-token-ssm.sh [stage]
# stage por defecto: dev  |  región: AWS_REGION o us-east-1
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
STAGE="${1:-dev}"
REGION="${AWS_REGION:-us-east-1}"
NAME="/conextamiami/${STAGE}/bridge-server-token"

if [[ -z "${BRIDGE_SERVER_TOKEN:-}" ]]; then
  echo "Error: define BRIDGE_SERVER_TOKEN en el entorno." >&2
  exit 1
fi

aws ssm put-parameter \
  --region "${REGION}" \
  --name "${NAME}" \
  --value "${BRIDGE_SERVER_TOKEN}" \
  --type SecureString \
  --overwrite

echo "Parámetro actualizado: ${NAME} (región ${REGION})"
