-- Migration pour ajouter les nouveaux champs d'adresse à church_details
USE light_church;

-- Ajouter les nouveaux champs à la table church_details
ALTER TABLE church_details
ADD COLUMN street_number VARCHAR(10) DEFAULT NULL AFTER address,
ADD COLUMN street_name VARCHAR(255) DEFAULT NULL AFTER street_number,
ADD COLUMN postal_code VARCHAR(10) DEFAULT NULL AFTER street_name,
ADD COLUMN city VARCHAR(100) DEFAULT NULL AFTER postal_code;

-- Créer un index sur la ville pour améliorer les performances de recherche
CREATE INDEX idx_church_city ON church_details(city);

-- Afficher la structure mise à jour
DESCRIBE church_details;