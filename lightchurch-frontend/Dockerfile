# Build stage
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Production stage
FROM nginx:alpine

# Copier les fichiers buildés
COPY --from=build /app/dist /usr/share/nginx/html

# Copier le template nginx (pas le fichier final)
COPY nginx.conf.template /etc/nginx/conf.d/nginx.conf.template

# Copier et rendre exécutable le script d'entrypoint
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80

# Utiliser notre entrypoint pour générer la config nginx dynamiquement
ENTRYPOINT ["/docker-entrypoint.sh"]
