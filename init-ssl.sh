#!/bin/bash

# Script d'initialisation SSL pour lightchurch.fr
# À exécuter UNE SEULE FOIS sur le VPS après le premier déploiement

DOMAIN="lightchurch.fr"
EMAIL="admin@lightchurch.fr"  # Change avec ton email

echo "=== Étape 1: Création des dossiers ==="
mkdir -p certbot/conf certbot/www

echo "=== Étape 2: Utilisation de la config initiale (sans SSL) ==="
cp nginx/nginx-init.conf nginx/nginx.conf

echo "=== Étape 3: Démarrage des conteneurs ==="
docker compose up -d

echo "=== Étape 4: Attente du démarrage de Nginx (10 secondes) ==="
sleep 10

echo "=== Étape 5: Obtention du certificat SSL ==="
docker compose run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    -d $DOMAIN \
    -d www.$DOMAIN

echo "=== Étape 6: Restauration de la config SSL ==="
cat > nginx/nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    upstream frontend {
        server frontend:80;
    }

    # Redirection HTTP vers HTTPS
    server {
        listen 80;
        server_name lightchurch.fr www.lightchurch.fr;

        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }

        location / {
            return 301 https://$host$request_uri;
        }
    }

    # Serveur HTTPS
    server {
        listen 443 ssl;
        server_name lightchurch.fr www.lightchurch.fr;

        ssl_certificate /etc/letsencrypt/live/lightchurch.fr/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/lightchurch.fr/privkey.pem;

        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;

        location / {
            proxy_pass http://frontend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
EOF

echo "=== Étape 7: Redémarrage de Nginx avec SSL ==="
docker compose restart nginx

echo ""
echo "=========================================="
echo "   INSTALLATION SSL TERMINÉE!"
echo "=========================================="
echo ""
echo "Ton site est maintenant accessible sur:"
echo "  https://lightchurch.fr"
echo "  https://www.lightchurch.fr"
echo ""
