#!/bin/sh
set -e

# Valeur par défaut pour le port du backend
BACKEND_PORT=${BACKEND_PORT:-3000}

echo "🔧 Configuration nginx avec BACKEND_PORT=${BACKEND_PORT}"

# Remplacer les variables d'environnement dans le template nginx
envsubst '${BACKEND_PORT}' < /etc/nginx/conf.d/nginx.conf.template > /etc/nginx/conf.d/default.conf

echo "✅ Configuration nginx générée:"
cat /etc/nginx/conf.d/default.conf

# Démarrer nginx
exec nginx -g 'daemon off;'
