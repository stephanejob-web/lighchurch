#!/bin/bash

# Script de renouvellement SSL
# À ajouter dans cron pour un renouvellement automatique

cd /chemin/vers/ton/projet  # Change ce chemin!

docker compose run --rm certbot renew
docker compose restart nginx
