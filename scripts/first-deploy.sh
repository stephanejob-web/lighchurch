#!/bin/bash
# ══════════════════════════════════════════════════════════════════════════
# LightChurch - Script de premier déploiement sur VPS
# À exécuter UNE SEULE FOIS lors de l'installation initiale
# ══════════════════════════════════════════════════════════════════════════

set -e

echo "🚀 Installation de LightChurch sur VPS..."

# Variables
APP_DIR="/home/deploy/apps/lightchurch"
DATA_DIR="/home/deploy/data/lightchurch"

# Créer les dossiers
echo "📁 Création des dossiers..."
mkdir -p $APP_DIR
mkdir -p $DATA_DIR/mysql
mkdir -p $DATA_DIR/uploads

# Se placer dans le dossier
cd $APP_DIR

# Copier les fichiers nécessaires
echo "📋 Copie des fichiers de configuration..."
cat > docker-compose.yml << 'COMPOSE'
services:
  mysql:
    image: mysql:8.0
    container_name: lightchurch-mysql
    restart: unless-stopped
    command: --default-time-zone='+01:00' --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: ${MYSQL_DATABASE}
      MYSQL_USER: ${MYSQL_USER}
      MYSQL_PASSWORD: ${MYSQL_PASSWORD}
      TZ: Europe/Paris
    volumes:
      - /home/deploy/data/lightchurch/mysql:/var/lib/mysql
      - ./schema.sql:/docker-entrypoint-initdb.d/01-schema.sql
    networks:
      - lightchurch-network
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      timeout: 20s
      retries: 10

  backend:
    image: ${DOCKER_USERNAME}/lightchurch-backend:latest
    container_name: lightchurch-backend
    restart: unless-stopped
    volumes:
      - /home/deploy/data/lightchurch/uploads:/app/uploads
    environment:
      DB_HOST: mysql
      DB_USER: ${MYSQL_USER}
      DB_PASSWORD: ${MYSQL_PASSWORD}
      DB_NAME: ${MYSQL_DATABASE}
      PORT: 3000
      JWT_SECRET: ${JWT_SECRET}
      TZ: Europe/Paris
    depends_on:
      mysql:
        condition: service_healthy
    networks:
      - lightchurch-network

  frontend:
    image: ${DOCKER_USERNAME}/lightchurch-frontend:latest
    container_name: lightchurch-frontend
    restart: unless-stopped
    environment:
      BACKEND_PORT: 3000
    ports:
      - "3080:80"
    depends_on:
      - backend
    networks:
      - lightchurch-network

networks:
  lightchurch-network:
    driver: bridge
COMPOSE

echo "✅ docker-compose.yml créé"

# Créer le fichier .env
echo ""
echo "📝 Configuration du fichier .env..."
echo "Entrez les informations suivantes:"
echo ""

read -p "Nom d'utilisateur Docker Hub: " DOCKER_USER
read -p "Mot de passe MySQL root: " MYSQL_ROOT_PASS
read -p "Mot de passe MySQL user: " MYSQL_USER_PASS
read -p "JWT Secret (chaîne aléatoire): " JWT

cat > .env << EOF
# Docker Hub
DOCKER_USERNAME=$DOCKER_USER

# MySQL
MYSQL_ROOT_PASSWORD=$MYSQL_ROOT_PASS
MYSQL_DATABASE=light_church
MYSQL_USER=lightchurch_user
MYSQL_PASSWORD=$MYSQL_USER_PASS

# Backend
JWT_SECRET=$JWT

# Frontend
FRONTEND_PORT=3080
EOF

echo "✅ .env créé"

echo ""
echo "🔧 Pour terminer l'installation:"
echo "1. Copie le fichier schema.sql dans $APP_DIR/"
echo "2. Lance: docker compose pull"
echo "3. Lance: docker compose up -d"
echo "4. Crée le super admin: docker exec -it lightchurch-backend node scripts/createSuperAdmin.js"
echo ""
echo "📧 Admin: admin@lightchurch.fr"
echo "🔑 Mot de passe: 780662aB2"
