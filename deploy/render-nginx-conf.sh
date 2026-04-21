#!/usr/bin/env bash
set -euo pipefail

DOMAIN="${1:-}"
CERT_NAME="${2:-$DOMAIN}"
BACKEND_PORT="${BACKEND_PORT:-4000}"
FRONTEND_ROOT="${FRONTEND_ROOT:-/root/miniapp/frontend/dist}"

if [[ -z "$DOMAIN" ]]; then
  echo "Usage: $0 <domain> [cert-name]" >&2
  exit 1
fi

cat <<EOF
server {
  listen 80;
  listen [::]:80;
  server_name ${DOMAIN};
  return 301 https://\$host\$request_uri;
}

server {
  listen 443 ssl http2;
  listen [::]:443 ssl http2;
  server_name ${DOMAIN};

  ssl_certificate /etc/letsencrypt/live/${CERT_NAME}/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/${CERT_NAME}/privkey.pem;

  root ${FRONTEND_ROOT};
  index index.html;

  client_max_body_size 10m;

  location ~ ^/(auth|wallet|notifications|trading|withdrawals|health|hooks|admin|api)(/|$) {
    proxy_pass http://127.0.0.1:${BACKEND_PORT};
    proxy_http_version 1.1;
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
  }

  location /assets/ {
    access_log off;
    expires 7d;
    add_header Cache-Control "public, max-age=604800, immutable";
    try_files \$uri =404;
  }

  location = /index.html {
    expires -1;
    add_header Cache-Control "no-store, no-cache, must-revalidate";
    try_files /index.html =404;
  }

  location / {
    try_files \$uri \$uri/ /index.html;
  }
}
EOF
