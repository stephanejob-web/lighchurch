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

# Créer les dossiers data
echo "📁 Création des dossiers de données..."
mkdir -p $DATA_DIR/mysql
mkdir -p $DATA_DIR/uploads

# Cloner le repo
echo "📥 Clonage du repository..."
cd /home/deploy/apps

if [ -d "lightchurch" ]; then
    echo "⚠️  Le dossier lightchurch existe déjà"
    cd lightchurch
    git pull origin main
else
    git clone https://github.com/VOTRE-USERNAME/lightchurch.git
    cd lightchurch
fi

# Créer le fichier .env
echo ""
echo "📝 Configuration du fichier .env..."
echo ""

read -p "Mot de passe MySQL root: " MYSQL_ROOT_PASS
read -p "Mot de passe MySQL user: " MYSQL_USER_PASS
read -p "JWT Secret (chaîne aléatoire longue): " JWT

cat > .env << EOF
# MySQL
MYSQL_ROOT_PASSWORD=$MYSQL_ROOT_PASS
MYSQL_DATABASE=light_church
MYSQL_USER=lightchurch_user
MYSQL_PASSWORD=$MYSQL_USER_PASS
MYSQL_PORT=3306

# Backend
EXPRESS_PORT=3000
JWT_SECRET=$JWT

# Frontend
FRONTEND_PORT=3080
EOF

echo "✅ .env créé"

# Build et lancement
echo ""
echo "🔨 Build des images Docker..."
docker compose build

echo ""
echo "🚀 Lancement des conteneurs..."
docker compose up -d

# Attendre que MySQL soit prêt
echo "⏳ Attente de MySQL..."
sleep 30

# Créer le super admin
echo ""
echo "👤 Création du Super Admin..."
docker exec -it lightchurch-backend node scripts/createSuperAdmin.js

echo ""
echo "════════════════════════════════════════════════════════"
echo "✅ Installation terminée!"
echo ""
echo "📧 Admin: admin@lightchurch.fr"
echo "🔑 Mot de passe: 780662aB2"
echo ""
echo "🌐 L'application est accessible sur le port 3080"
echo "   Configure Nginx pour le reverse proxy"
echo "════════════════════════════════════════════════════════"
