#!/usr/bin/env bash
set -euo pipefail

if [[ ! -f .env ]]; then
  cp .env.example .env
  echo "Created .env. Replace CHANGE_ME values before starting."
fi

mkdir -p data/{postgres,redis,n8n,hermes,media,evolution,minio}
chmod 700 data/hermes

echo "Directories created. Run: make secrets, edit .env, then make validate && make up"
