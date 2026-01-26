# 🗄️ Light Church - Database Files

Ce dossier contient tous les fichiers relatifs à la structure et aux données de la base de données.

## 📁 Fichiers

### schema.sql
**Structure de la base de données** (14 tables)

Ce fichier contient uniquement la structure de la base de données MySQL :
- Définitions des tables
- Index et contraintes
- Clés étrangères
- Colonnes générées (latitude/longitude)

**Chargement automatique** : Ce fichier est automatiquement chargé par Docker au premier démarrage via `docker-compose.yml`.

**À versionner sur Git** : ✅ OUI

**Mise à jour** :
```bash
# Exporter la nouvelle structure après modifications
docker exec mysql-db mysqldump -u root -proot --no-data --routines --triggers light_church > backend-express/database/schema.sql
```

### seeders.sql
**Données de test** (30 églises + 31 admins)

Fichier unique contenant toutes les données de test pour le développement :
- 4 unions d'églises
- 6 dénominations
- 10 langues (id=10 = Français par défaut)
- 5 types d'activités
- 31 admins (1 super admin + 30 pasteurs)
- 30 églises réparties sur 3 villes
- 60 horaires de cultes
- 19 liens réseaux sociaux

**Mot de passe unique** : `780662aB2` (développement uniquement !)

**Chargement manuel** : À exécuter après le premier démarrage
```bash
# Depuis la racine du projet
./seed-database.sh
```

**À versionner sur Git** : ✅ OUI

### backups/ (dossier)
**Backups personnels** (non versionnés)

Ce dossier contient vos backups personnels et fichiers temporaires.

**À versionner sur Git** : ❌ NON (ignoré par .gitignore)

### migrations/ (dossier)
**Migrations de base de données** (versionnées)

Ce dossier contient les fichiers de migration SQL pour les changements de schéma :
- `migration_add_address_fields.sql` - Ajout des champs d'adresse détaillés
- `migration_pastor_name_split.sql` - Séparation nom/prénom pasteur

**À versionner sur Git** : ✅ OUI

## 🔧 Commandes Utiles

### Export Schema Only
```bash
docker exec mysql-db mysqldump -u root -proot --no-data --routines --triggers light_church > backend-express/database/schema.sql
```

### Export Data Only
```bash
docker exec mysql-db mysqldump -u root -proot --no-create-info light_church > backend-express/database/backups/data_$(date +%Y%m%d).sql
```

### Full Backup
```bash
docker exec mysql-db mysqldump -u root -proot light_church > backend-express/database/backups/full_backup_$(date +%Y%m%d).sql
```

### Restore Backup
```bash
docker exec -i mysql-db mysql -u root -proot light_church < backend-express/database/backups/your_backup.sql
```

### Run Migration
```bash
docker exec -i mysql-db mysql -u root -proot light_church < backend-express/database/migrations/your_migration.sql
```

## 📊 Structure des Tables

| Table | Description |
|-------|-------------|
| admins | Utilisateurs (Super Admin, Pasteurs, Évangélistes) |
| churches | Églises avec géolocalisation PostGIS |
| church_details | Détails des églises (adresse, description, parking) |
| church_schedules | Horaires des cultes |
| church_socials | Liens réseaux sociaux |
| events | Événements organisés |
| event_details | Détails des événements |
| event_interests | Intérêts utilisateurs pour événements |
| event_translations | Traductions des événements |
| denominations | Dénominations religieuses |
| church_unions | Unions d'églises (CNEF, FPF, etc.) |
| languages | Langues disponibles |
| activity_types | Types d'activités (Culte, Prière, etc.) |
| push_tokens | Tokens notifications push mobile |

## 🔐 Identifiants de Test (seeders.sql)

Après avoir exécuté `./seed-database.sh`, vous pouvez vous connecter avec :

### Super Admin
```
Email: admin@lightchurch.fr
Password: 780662aB2
```

### Pasteurs (30 comptes)
Tous utilisent le mot de passe : `780662aB2`

**Paris** : `p.martin@paris1.fr` à `l.simon@paris10.fr`
**Toulon** : `c.moreau@toulon1.fr` à `y.sanchez@toulon10.fr`
**Ollioules** : `e.dupont@ollioules1.fr` à `w.gauthier@ollioules10.fr`

📖 Liste complète dans `seeders.sql`

## ⚠️ Bonnes Pratiques

### ✅ À FAIRE
- Versionner `schema.sql` après chaque modification de structure
- Versionner `seeders.sql` si modification des données de test
- Créer des backups avant modifications importantes
- Documenter les changements de schéma dans les commits

### ❌ À ÉVITER
- Ne jamais commiter les fichiers du dossier `backups/`
- Ne jamais utiliser le mot de passe `780662aB2` en production
- Ne jamais commiter de vraies données utilisateurs
- Ne jamais pousser de backups contenant des données sensibles

## 🔄 Workflow de Développement

### 1. Modifier la Structure
```bash
# Faire les modifications via migrations ou directement en dev
# ...

# Exporter la nouvelle structure
docker exec mysql-db mysqldump -u root -proot --no-data --routines --triggers light_church > backend-express/database/schema.sql

# Commiter
git add backend-express/database/schema.sql
git commit -m "feat: add new column to churches table"
```

### 2. Modifier les Seeders
```bash
# Éditer seeders.sql
nano backend-express/database/seeders.sql

# Tester
docker-compose down
docker volume rm test-docker_mysql-data
docker-compose up -d
./seed-database.sh

# Commiter si OK
git add backend-express/database/seeders.sql
git commit -m "chore: update seeders with new test data"
```

### 3. Réinitialiser la Base
```bash
# Tout supprimer
docker-compose down
docker volume rm test-docker_mysql-data

# Redémarrer avec schema.sql
docker-compose up -d

# Attendre 10-15 secondes
sleep 15

# Charger les seeders
./seed-database.sh
```

## 📖 Documentation Complète

Pour plus d'informations, consultez :
- **README.md** (racine) : Guide complet du projet
- **DATABASE.md** : Guide de gestion de la base de données
- **SEEDERS_REBUILD.md** : Documentation de la reconstruction des seeders

---

**💡 Organisation** : Tous les fichiers liés à la base de données sont regroupés ici pour une meilleure organisation du projet.
