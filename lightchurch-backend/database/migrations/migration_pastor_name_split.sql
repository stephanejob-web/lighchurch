-- Migration : Séparer pastor_name en pastor_first_name et pastor_last_name
-- Date : 2025-12-26

-- Étape 1 : Ajouter les nouvelles colonnes
ALTER TABLE church_details
ADD COLUMN pastor_first_name VARCHAR(50) DEFAULT NULL AFTER pastor_name,
ADD COLUMN pastor_last_name VARCHAR(50) DEFAULT NULL AFTER pastor_first_name;

-- Étape 2 : Supprimer l'ancienne colonne pastor_name
ALTER TABLE church_details
DROP COLUMN pastor_name;

-- Note : Comme il n'y a qu'un seul enregistrement et qu'il peut être supprimé,
-- pas besoin de migration des données existantes.
