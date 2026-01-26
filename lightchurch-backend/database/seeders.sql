-- ============================================
-- Light Church - Database Seeders
-- ============================================
-- Ce fichier contient des données de test pour le développement
-- À exécuter manuellement après le premier démarrage
--
-- Contenu :
-- - 1 Super Admin + 30 Pasteurs (tous validés)
-- - 30 Églises réparties sur 3 villes (Paris, Toulon, Ollioules)
-- - Données de référence (unions, dénominations, langues, types d'activités)
--
-- Mot de passe unique : 780662aB2
-- ============================================

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- ============================================
-- 1. CHURCH UNIONS (4 unions d'églises)
-- ============================================
INSERT INTO church_unions (id, name, abbreviation, website, is_active) VALUES
(1, 'Conseil National des Évangéliques de France', 'CNEF', 'https://lecnef.org', 1),
(2, 'Fédération Protestante de France', 'FPF', 'https://www.protestants.org', 1),
(3, 'Assemblées de Dieu de France', 'ADD France', 'https://www.add.fr', 1),
(4, 'Indépendant', NULL, NULL, 1);

-- ============================================
-- 2. DENOMINATIONS (6 dénominations)
-- ============================================
INSERT INTO denominations (id, union_id, name, abbreviation, is_active) VALUES
(1, 3, 'Assemblées de Dieu', 'ADD', 1),
(2, 1, 'Église Évangélique', 'EE', 1),
(3, 1, 'Église Baptiste', 'EB', 1),
(4, 2, 'Église Protestante Unie', 'EPU', 1),
(5, 1, 'Église Pentecôtiste', 'EP', 1),
(6, 4, 'Église Indépendante', NULL, 1);

-- ============================================
-- 3. LANGUAGES (10 langues, id=10 = Français par défaut)
-- ============================================
INSERT INTO languages (id, code, name_native, name_fr, flag_emoji, is_active, display_order) VALUES
(1, 'en', 'English', 'Anglais', '🇬🇧', 1, 2),
(2, 'es', 'Español', 'Espagnol', '🇪🇸', 1, 3),
(3, 'pt', 'Português', 'Portugais', '🇵🇹', 1, 4),
(4, 'de', 'Deutsch', 'Allemand', '🇩🇪', 1, 5),
(5, 'it', 'Italiano', 'Italien', '🇮🇹', 1, 6),
(6, 'ar', 'العربية', 'Arabe', '🇸🇦', 1, 7),
(7, 'zh', '中文', 'Chinois', '🇨🇳', 1, 8),
(8, 'ru', 'Русский', 'Russe', '🇷🇺', 1, 9),
(9, 'pl', 'Polski', 'Polonais', '🇵🇱', 1, 10),
(10, 'fr', 'Français', 'Français', '🇫🇷', 1, 1);

-- ============================================
-- 4. ACTIVITY TYPES (5 types d'activités)
-- ============================================
INSERT INTO activity_types (id, name, label_fr, icon) VALUES
(1, 'WORSHIP', 'Culte', '⛪'),
(2, 'PRAYER', 'Prière', '🙏'),
(3, 'BIBLE_STUDY', 'Étude Biblique', '📖'),
(4, 'YOUTH', 'Groupe de Jeunes', '👥'),
(5, 'CHILDREN', 'École du Dimanche', '👶');

-- ============================================
-- 5. ADMINS (1 Super Admin + 30 Pasteurs)
-- Mot de passe pour tous : 780662aB2
-- Hash bcrypt : $2b$10$AzaCCLYpZwe0oOYQR9nfEuX5JrbUSrIJMxx/eULcJp1N/erMfxq2.
-- ============================================

-- Super Admin
INSERT INTO admins (id, email, password_hash, role, status, first_name, last_name, created_at, allow_network_visibility) VALUES
(1, 'admin@lightchurch.fr', '$2b$10$AzaCCLYpZwe0oOYQR9nfEuX5JrbUSrIJMxx/eULcJp1N/erMfxq2.', 'SUPER_ADMIN', 'VALIDATED', 'Jean', 'Administrateur', NOW(), 0);

-- Pasteurs Paris (IDs 2-11)
INSERT INTO admins (id, email, password_hash, role, status, first_name, last_name, created_at, allow_network_visibility) VALUES
(2, 'p.martin@paris1.fr', '$2b$10$AzaCCLYpZwe0oOYQR9nfEuX5JrbUSrIJMxx/eULcJp1N/erMfxq2.', 'PASTOR', 'VALIDATED', 'Pierre', 'Martin', NOW(), 1),
(3, 'j.dubois@paris2.fr', '$2b$10$AzaCCLYpZwe0oOYQR9nfEuX5JrbUSrIJMxx/eULcJp1N/erMfxq2.', 'PASTOR', 'VALIDATED', 'Jacques', 'Dubois', NOW(), 1),
(4, 'm.bernard@paris3.fr', '$2b$10$AzaCCLYpZwe0oOYQR9nfEuX5JrbUSrIJMxx/eULcJp1N/erMfxq2.', 'PASTOR', 'VALIDATED', 'Michel', 'Bernard', NOW(), 1),
(5, 'a.thomas@paris4.fr', '$2b$10$AzaCCLYpZwe0oOYQR9nfEuX5JrbUSrIJMxx/eULcJp1N/erMfxq2.', 'PASTOR', 'VALIDATED', 'Alain', 'Thomas', NOW(), 1),
(6, 'r.petit@paris5.fr', '$2b$10$AzaCCLYpZwe0oOYQR9nfEuX5JrbUSrIJMxx/eULcJp1N/erMfxq2.', 'PASTOR', 'VALIDATED', 'Robert', 'Petit', NOW(), 1),
(7, 'p.robert@paris6.fr', '$2b$10$AzaCCLYpZwe0oOYQR9nfEuX5JrbUSrIJMxx/eULcJp1N/erMfxq2.', 'PASTOR', 'VALIDATED', 'Paul', 'Robert', NOW(), 1),
(8, 'j.richard@paris7.fr', '$2b$10$AzaCCLYpZwe0oOYQR9nfEuX5JrbUSrIJMxx/eULcJp1N/erMfxq2.', 'PASTOR', 'VALIDATED', 'Jean', 'Richard', NOW(), 1),
(9, 'f.durand@paris8.fr', '$2b$10$AzaCCLYpZwe0oOYQR9nfEuX5JrbUSrIJMxx/eULcJp1N/erMfxq2.', 'PASTOR', 'VALIDATED', 'François', 'Durand', NOW(), 1),
(10, 'd.moreau@paris9.fr', '$2b$10$AzaCCLYpZwe0oOYQR9nfEuX5JrbUSrIJMxx/eULcJp1N/erMfxq2.', 'PASTOR', 'VALIDATED', 'Daniel', 'Moreau', NOW(), 1),
(11, 'l.simon@paris10.fr', '$2b$10$AzaCCLYpZwe0oOYQR9nfEuX5JrbUSrIJMxx/eULcJp1N/erMfxq2.', 'PASTOR', 'VALIDATED', 'Laurent', 'Simon', NOW(), 1);

-- Pasteurs Toulon (IDs 12-21)
INSERT INTO admins (id, email, password_hash, role, status, first_name, last_name, created_at, allow_network_visibility) VALUES
(12, 'c.moreau@toulon1.fr', '$2b$10$AzaCCLYpZwe0oOYQR9nfEuX5JrbUSrIJMxx/eULcJp1N/erMfxq2.', 'PASTOR', 'VALIDATED', 'Christian', 'Moreau', NOW(), 1),
(13, 'f.girard@toulon2.fr', '$2b$10$AzaCCLYpZwe0oOYQR9nfEuX5JrbUSrIJMxx/eULcJp1N/erMfxq2.', 'PASTOR', 'VALIDATED', 'Frédéric', 'Girard', NOW(), 1),
(14, 'g.bonnet@toulon3.fr', '$2b$10$AzaCCLYpZwe0oOYQR9nfEuX5JrbUSrIJMxx/eULcJp1N/erMfxq2.', 'PASTOR', 'VALIDATED', 'Gérard', 'Bonnet', NOW(), 1),
(15, 'n.blanc@toulon4.fr', '$2b$10$AzaCCLYpZwe0oOYQR9nfEuX5JrbUSrIJMxx/eULcJp1N/erMfxq2.', 'PASTOR', 'VALIDATED', 'Nicolas', 'Blanc', NOW(), 1),
(16, 'p.garcia@toulon5.fr', '$2b$10$AzaCCLYpZwe0oOYQR9nfEuX5JrbUSrIJMxx/eULcJp1N/erMfxq2.', 'PASTOR', 'VALIDATED', 'Philippe', 'Garcia', NOW(), 1),
(17, 's.martinez@toulon6.fr', '$2b$10$AzaCCLYpZwe0oOYQR9nfEuX5JrbUSrIJMxx/eULcJp1N/erMfxq2.', 'PASTOR', 'VALIDATED', 'Stéphane', 'Martinez', NOW(), 1),
(18, 't.lopez@toulon7.fr', '$2b$10$AzaCCLYpZwe0oOYQR9nfEuX5JrbUSrIJMxx/eULcJp1N/erMfxq2.', 'PASTOR', 'VALIDATED', 'Thierry', 'Lopez', NOW(), 1),
(19, 'v.gonzalez@toulon8.fr', '$2b$10$AzaCCLYpZwe0oOYQR9nfEuX5JrbUSrIJMxx/eULcJp1N/erMfxq2.', 'PASTOR', 'VALIDATED', 'Vincent', 'Gonzalez', NOW(), 1),
(20, 'x.perez@toulon9.fr', '$2b$10$AzaCCLYpZwe0oOYQR9nfEuX5JrbUSrIJMxx/eULcJp1N/erMfxq2.', 'PASTOR', 'VALIDATED', 'Xavier', 'Perez', NOW(), 1),
(21, 'y.sanchez@toulon10.fr', '$2b$10$AzaCCLYpZwe0oOYQR9nfEuX5JrbUSrIJMxx/eULcJp1N/erMfxq2.', 'PASTOR', 'VALIDATED', 'Yves', 'Sanchez', NOW(), 1);

-- Pasteurs Ollioules (IDs 22-31)
INSERT INTO admins (id, email, password_hash, role, status, first_name, last_name, created_at, allow_network_visibility) VALUES
(22, 'e.dupont@ollioules1.fr', '$2b$10$AzaCCLYpZwe0oOYQR9nfEuX5JrbUSrIJMxx/eULcJp1N/erMfxq2.', 'PASTOR', 'VALIDATED', 'Éric', 'Dupont', NOW(), 1),
(23, 'l.andre@ollioules2.fr', '$2b$10$AzaCCLYpZwe0oOYQR9nfEuX5JrbUSrIJMxx/eULcJp1N/erMfxq2.', 'PASTOR', 'VALIDATED', 'Luc', 'André', NOW(), 1),
(24, 'm.fontaine@ollioules3.fr', '$2b$10$AzaCCLYpZwe0oOYQR9nfEuX5JrbUSrIJMxx/eULcJp1N/erMfxq2.', 'PASTOR', 'VALIDATED', 'Marc', 'Fontaine', NOW(), 1),
(25, 'o.chevalier@ollioules4.fr', '$2b$10$AzaCCLYpZwe0oOYQR9nfEuX5JrbUSrIJMxx/eULcJp1N/erMfxq2.', 'PASTOR', 'VALIDATED', 'Olivier', 'Chevalier', NOW(), 1),
(26, 'q.lambert@ollioules5.fr', '$2b$10$AzaCCLYpZwe0oOYQR9nfEuX5JrbUSrIJMxx/eULcJp1N/erMfxq2.', 'PASTOR', 'VALIDATED', 'Quentin', 'Lambert', NOW(), 1),
(27, 'r.rousseau@ollioules6.fr', '$2b$10$AzaCCLYpZwe0oOYQR9nfEuX5JrbUSrIJMxx/eULcJp1N/erMfxq2.', 'PASTOR', 'VALIDATED', 'René', 'Rousseau', NOW(), 1),
(28, 's.vincent@ollioules7.fr', '$2b$10$AzaCCLYpZwe0oOYQR9nfEuX5JrbUSrIJMxx/eULcJp1N/erMfxq2.', 'PASTOR', 'VALIDATED', 'Serge', 'Vincent', NOW(), 1),
(29, 't.leroy@ollioules8.fr', '$2b$10$AzaCCLYpZwe0oOYQR9nfEuX5JrbUSrIJMxx/eULcJp1N/erMfxq2.', 'PASTOR', 'VALIDATED', 'Thomas', 'Leroy', NOW(), 1),
(30, 'u.clement@ollioules9.fr', '$2b$10$AzaCCLYpZwe0oOYQR9nfEuX5JrbUSrIJMxx/eULcJp1N/erMfxq2.', 'PASTOR', 'VALIDATED', 'Urbain', 'Clément', NOW(), 1),
(31, 'w.gauthier@ollioules10.fr', '$2b$10$AzaCCLYpZwe0oOYQR9nfEuX5JrbUSrIJMxx/eULcJp1N/erMfxq2.', 'PASTOR', 'VALIDATED', 'William', 'Gauthier', NOW(), 1);

-- ============================================
-- 6. CHURCHES (30 églises avec coordonnées GPS réelles)
-- ============================================

-- Églises Paris (IDs 1-10)
INSERT INTO churches (id, admin_id, denomination_id, church_name, location, created_at) VALUES
(1, 2, 2, 'Église Évangélique de Belleville', ST_GeomFromText('POINT(2.3808 48.8720)'), NOW()),
(2, 3, 1, 'Assemblée de Dieu Montmartre', ST_GeomFromText('POINT(2.3422 48.8867)'), NOW()),
(3, 4, 3, 'Église Baptiste du Marais', ST_GeomFromText('POINT(2.3599 48.8566)'), NOW()),
(4, 5, 5, 'Église Pentecôtiste Nation', ST_GeomFromText('POINT(2.3964 48.8675)'), NOW()),
(5, 6, 2, 'Église Évangélique Bastille', ST_GeomFromText('POINT(2.3694 48.8532)'), NOW()),
(6, 7, 1, 'Assemblée de Dieu Oberkampf', ST_GeomFromText('POINT(2.3686 48.8642)'), NOW()),
(7, 8, 4, 'Église Protestante Unie Batignolles', ST_GeomFromText('POINT(2.3197 48.8852)'), NOW()),
(8, 9, 6, 'Église Indépendante République', ST_GeomFromText('POINT(2.3637 48.8673)'), NOW()),
(9, 10, 2, 'Église Évangélique Ménilmontant', ST_GeomFromText('POINT(2.3847 48.8686)'), NOW()),
(10, 11, 5, 'Église Pentecôtiste Père Lachaise', ST_GeomFromText('POINT(2.3933 48.8619)'), NOW());

-- Églises Toulon (IDs 11-20)
INSERT INTO churches (id, admin_id, denomination_id, church_name, location, created_at) VALUES
(11, 12, 1, 'Assemblée de Dieu du Port', ST_GeomFromText('POINT(5.9300 43.1200)'), NOW()),
(12, 13, 2, 'Église Évangélique Mourillon', ST_GeomFromText('POINT(5.9450 43.1100)'), NOW()),
(13, 14, 3, 'Église Baptiste Faron', ST_GeomFromText('POINT(5.9150 43.1350)'), NOW()),
(14, 15, 5, 'Église Pentecôtiste Centre-Ville', ST_GeomFromText('POINT(5.9280 43.1245)'), NOW()),
(15, 16, 2, 'Église Évangélique La Garde', ST_GeomFromText('POINT(6.0100 43.1250)'), NOW()),
(16, 17, 1, 'Assemblée de Dieu Sainte-Musse', ST_GeomFromText('POINT(5.9700 43.1150)'), NOW()),
(17, 18, 4, 'Église Protestante Unie Bon Rencontre', ST_GeomFromText('POINT(5.9200 43.1300)'), NOW()),
(18, 19, 6, 'Église Indépendante Petit Bois', ST_GeomFromText('POINT(5.9050 43.1180)'), NOW()),
(19, 20, 2, 'Église Évangélique Claret', ST_GeomFromText('POINT(5.9350 43.1280)'), NOW()),
(20, 21, 5, 'Église Pentecôtiste Cap Brun', ST_GeomFromText('POINT(5.9580 43.0950)'), NOW());

-- Églises Ollioules (IDs 21-30)
INSERT INTO churches (id, admin_id, denomination_id, church_name, location, created_at) VALUES
(21, 22, 2, 'Église Évangélique Centre Ollioules', ST_GeomFromText('POINT(5.8480 43.1395)'), NOW()),
(22, 23, 1, 'Assemblée de Dieu Les Gorges', ST_GeomFromText('POINT(5.8350 43.1450)'), NOW()),
(23, 24, 3, 'Église Baptiste La Favière', ST_GeomFromText('POINT(5.8550 43.1350)'), NOW()),
(24, 25, 5, 'Église Pentecôtiste La Castellane', ST_GeomFromText('POINT(5.8420 43.1420)'), NOW()),
(25, 26, 2, 'Église Évangélique Sainte-Barbe', ST_GeomFromText('POINT(5.8500 43.1380)'), NOW()),
(26, 27, 1, 'Assemblée de Dieu Les Oliviers', ST_GeomFromText('POINT(5.8600 43.1410)'), NOW()),
(27, 28, 4, 'Église Protestante Unie Le Castillon', ST_GeomFromText('POINT(5.8380 43.1360)'), NOW()),
(28, 29, 6, 'Église Indépendante La Courtine', ST_GeomFromText('POINT(5.8520 43.1430)'), NOW()),
(29, 30, 2, 'Église Évangélique Les Plans', ST_GeomFromText('POINT(5.8450 43.1340)'), NOW()),
(30, 31, 5, 'Église Pentecôtiste La Combe', ST_GeomFromText('POINT(5.8580 43.1370)'), NOW());

-- ============================================
-- 7. CHURCH DETAILS (avec language_id=10 pour français)
-- ============================================

-- Church Details Paris (churches 1-10)
INSERT INTO church_details (church_id, language_id, pastor_first_name, pastor_last_name, phone, description, address, street_number, street_name, postal_code, city, has_parking, parking_capacity, is_parking_free, status, website) VALUES
(1, 10, 'Pierre', 'Martin', '+33 1 42 08 15 42', 'Église dynamique au cœur de Belleville, accueillant une communauté multiculturelle avec des cultes en français.', '127 Rue de Belleville 75019 Paris', '127', 'Rue de Belleville', '75019', 'Paris', 1, 15, 1, 'ACTIVE', 'https://ee-belleville.fr'),
(2, 10, 'Jacques', 'Dubois', '+33 1 46 06 22 33', 'Assemblée de Dieu de Montmartre, connue pour ses louanges enflammées et son accueil chaleureux.', '82 Rue Caulaincourt 75018 Paris', '82', 'Rue Caulaincourt', '75018', 'Paris', 0, NULL, 1, 'ACTIVE', 'https://add-montmartre.fr'),
(3, 10, 'Michel', 'Bernard', '+33 1 42 78 44 55', 'Église Baptiste historique du Marais, centrée sur l\'enseignement biblique et la communion fraternelle.', '29 Rue des Archives 75004 Paris', '29', 'Rue des Archives', '75004', 'Paris', 0, NULL, 1, 'ACTIVE', 'https://eb-marais.fr'),
(4, 10, 'Alain', 'Thomas', '+33 1 43 55 67 88', 'Église Pentecôtiste Nation, engagée dans l\'évangélisation et le service communautaire.', '56 Boulevard de la Villette 75019 Paris', '56', 'Boulevard de la Villette', '75019', 'Paris', 1, 20, 1, 'ACTIVE', NULL),
(5, 10, 'Robert', 'Petit', '+33 1 43 43 21 09', 'Église Évangélique proche de Bastille, axée sur la jeunesse et les familles.', '12 Rue de la Roquette 75011 Paris', '12', 'Rue de la Roquette', '75011', 'Paris', 0, NULL, 1, 'ACTIVE', 'https://ee-bastille.fr'),
(6, 10, 'Paul', 'Robert', '+33 1 43 57 89 12', 'Assemblée de Dieu Oberkampf, mettant l\'accent sur la prière et l\'intercession.', '145 Rue Oberkampf 75011 Paris', '145', 'Rue Oberkampf', '75011', 'Paris', 0, NULL, 1, 'ACTIVE', NULL),
(7, 10, 'Jean', 'Richard', '+33 1 42 94 56 78', 'Église Protestante Unie des Batignolles, tradition réformée avec ouverture œcuménique.', '34 Boulevard des Batignolles 75017 Paris', '34', 'Boulevard des Batignolles', '75017', 'Paris', 0, NULL, 1, 'ACTIVE', 'https://epu-batignolles.fr'),
(8, 10, 'François', 'Durand', '+33 1 43 38 92 34', 'Église indépendante République, communauté jeune et moderne avec cultes contemporains.', '78 Rue du Faubourg du Temple 75011 Paris', '78', 'Rue du Faubourg du Temple', '75011', 'Paris', 0, NULL, 1, 'ACTIVE', NULL),
(9, 10, 'Daniel', 'Moreau', '+33 1 43 58 11 22', 'Église Évangélique de Ménilmontant, église de quartier avec ministères variés.', '22 Rue de Ménilmontant 75020 Paris', '22', 'Rue de Ménilmontant', '75020', 'Paris', 1, 10, 1, 'ACTIVE', 'https://ee-menilmontant.fr'),
(10, 10, 'Laurent', 'Simon', '+33 1 43 57 33 44', 'Église Pentecôtiste Père Lachaise, communauté priante avec fort accent missionnaire.', '94 Rue de la Roquette 75011 Paris', '94', 'Rue de la Roquette', '75011', 'Paris', 0, NULL, 1, 'ACTIVE', NULL);

-- Church Details Toulon (churches 11-20)
INSERT INTO church_details (church_id, language_id, pastor_first_name, pastor_last_name, phone, description, address, street_number, street_name, postal_code, city, has_parking, parking_capacity, is_parking_free, status, website) VALUES
(11, 10, 'Christian', 'Moreau', '+33 4 94 03 12 34', 'Assemblée de Dieu du Port de Toulon, église méditerranéenne avec vue sur la mer.', '18 Quai de Stalingrad 83000 Toulon', '18', 'Quai de Stalingrad', '83000', 'Toulon', 1, 25, 1, 'ACTIVE', 'https://add-toulon-port.fr'),
(12, 10, 'Frédéric', 'Girard', '+33 4 94 41 56 78', 'Église Évangélique Mourillon, quartier familial avec plage à proximité.', '56 Rue du Docteur Fontan 83000 Toulon', '56', 'Rue du Docteur Fontan', '83000', 'Toulon', 1, 15, 1, 'ACTIVE', NULL),
(13, 10, 'Gérard', 'Bonnet', '+33 4 94 24 67 89', 'Église Baptiste Faron, au pied du Mont Faron, église de montagne.', '12 Chemin de Faron 83000 Toulon', '12', 'Chemin de Faron', '83000', 'Toulon', 1, 30, 1, 'ACTIVE', 'https://eb-faron.fr'),
(14, 10, 'Nicolas', 'Blanc', '+33 4 94 92 34 56', 'Église Pentecôtiste du centre-ville, au cœur de l\'activité toulonnaise.', '45 Avenue de la République 83000 Toulon', '45', 'Avenue de la République', '83000', 'Toulon', 0, NULL, 1, 'ACTIVE', NULL),
(15, 10, 'Philippe', 'Garcia', '+33 4 94 08 78 90', 'Église Évangélique La Garde, commune voisine, communauté solidaire.', '23 Avenue Alphonse Daudet 83130 La Garde', '23', 'Avenue Alphonse Daudet', '83130', 'La Garde', 1, 20, 1, 'ACTIVE', 'https://ee-lagarde.fr'),
(16, 10, 'Stéphane', 'Martinez', '+33 4 94 27 45 67', 'Assemblée de Dieu Sainte-Musse, quartier est de Toulon, église en croissance.', '78 Avenue Sainte-Musse 83100 Toulon', '78', 'Avenue Sainte-Musse', '83100', 'Toulon', 1, 15, 1, 'ACTIVE', NULL),
(17, 10, 'Thierry', 'Lopez', '+33 4 94 62 89 12', 'Église Protestante Unie Bon Rencontre, tradition historique et engagement social.', '34 Boulevard Bon Rencontre 83000 Toulon', '34', 'Boulevard Bon Rencontre', '83000', 'Toulon', 0, NULL, 1, 'ACTIVE', 'https://epu-toulon.fr'),
(18, 10, 'Vincent', 'Gonzalez', '+33 4 94 46 23 45', 'Église indépendante Petit Bois, communauté créative avec arts et musique.', '89 Chemin du Petit Bois 83000 Toulon', '89', 'Chemin du Petit Bois', '83000', 'Toulon', 1, 10, 1, 'ACTIVE', NULL),
(19, 10, 'Xavier', 'Perez', '+33 4 94 31 56 78', 'Église Évangélique Claret, quartier nord, ministère auprès des jeunes.', '67 Avenue Claret 83100 Toulon', '67', 'Avenue Claret', '83100', 'Toulon', 1, 12, 1, 'ACTIVE', NULL),
(20, 10, 'Yves', 'Sanchez', '+33 4 94 36 78 90', 'Église Pentecôtiste Cap Brun, quartier résidentiel, communauté francophone.', '45 Chemin de Cap Brun 83000 Toulon', '45', 'Chemin de Cap Brun', '83000', 'Toulon', 1, 20, 1, 'ACTIVE', 'https://ep-capbrun.fr');

-- Church Details Ollioules (churches 21-30)
INSERT INTO church_details (church_id, language_id, pastor_first_name, pastor_last_name, phone, description, address, street_number, street_name, postal_code, city, has_parking, parking_capacity, is_parking_free, status, website) VALUES
(21, 10, 'Éric', 'Dupont', '+33 4 94 63 12 34', 'Église Évangélique du centre d\'Ollioules, petite ville provençale authentique.', '15 Place Jean Jaurès 83190 Ollioules', '15', 'Place Jean Jaurès', '83190', 'Ollioules', 1, 20, 1, 'ACTIVE', 'https://ee-ollioules.fr'),
(22, 10, 'Luc', 'André', '+33 4 94 63 45 67', 'Assemblée de Dieu Les Gorges, proche des célèbres gorges d\'Ollioules.', '234 Route des Gorges 83190 Ollioules', '234', 'Route des Gorges', '83190', 'Ollioules', 1, 25, 1, 'ACTIVE', NULL),
(23, 10, 'Marc', 'Fontaine', '+33 4 94 63 78 90', 'Église Baptiste La Favière, quartier résidentiel calme et familial.', '56 Avenue de la Favière 83190 Ollioules', '56', 'Avenue de la Favière', '83190', 'Ollioules', 1, 15, 1, 'ACTIVE', 'https://eb-ollioules.fr'),
(24, 10, 'Olivier', 'Chevalier', '+33 4 94 63 23 45', 'Église Pentecôtiste La Castellane, secteur est, louange vivante.', '78 Chemin de la Castellane 83190 Ollioules', '78', 'Chemin de la Castellane', '83190', 'Ollioules', 1, 18, 1, 'ACTIVE', NULL),
(25, 10, 'Quentin', 'Lambert', '+33 4 94 63 56 78', 'Église Évangélique Sainte-Barbe, au pied de la colline Sainte-Barbe.', '12 Montée Sainte-Barbe 83190 Ollioules', '12', 'Montée Sainte-Barbe', '83190', 'Ollioules', 0, NULL, 1, 'ACTIVE', NULL),
(26, 10, 'René', 'Rousseau', '+33 4 94 63 89 12', 'Assemblée de Dieu Les Oliviers, entourée d\'oliviers centenaires.', '145 Chemin des Oliviers 83190 Ollioules', '145', 'Chemin des Oliviers', '83190', 'Ollioules', 1, 30, 1, 'ACTIVE', 'https://add-oliviers.fr'),
(27, 10, 'Serge', 'Vincent', '+33 4 94 63 34 56', 'Église Protestante Unie Le Castillon, tradition réformée provençale.', '23 Rue du Castillon 83190 Ollioules', '23', 'Rue du Castillon', '83190', 'Ollioules', 0, NULL, 1, 'ACTIVE', NULL),
(28, 10, 'Thomas', 'Leroy', '+33 4 94 63 67 89', 'Église indépendante La Courtine, communauté moderne et accueillante.', '89 Avenue de la Courtine 83190 Ollioules', '89', 'Avenue de la Courtine', '83190', 'Ollioules', 1, 12, 1, 'ACTIVE', NULL),
(29, 10, 'Urbain', 'Clément', '+33 4 94 63 12 90', 'Église Évangélique Les Plans, quartier résidentiel récent.', '34 Boulevard des Plans 83190 Ollioules', '34', 'Boulevard des Plans', '83190', 'Ollioules', 1, 15, 1, 'ACTIVE', 'https://ee-plans.fr'),
(30, 10, 'William', 'Gauthier', '+33 4 94 63 45 12', 'Église Pentecôtiste La Combe, vallée paisible, retraites spirituelles.', '67 Chemin de la Combe 83190 Ollioules', '67', 'Chemin de la Combe', '83190', 'Ollioules', 1, 25, 1, 'ACTIVE', NULL);

-- ============================================
-- 8. CHURCH SCHEDULES (2 horaires par église : 60 total)
-- ============================================

INSERT INTO church_schedules (church_id, activity_type_id, day_of_week, start_time) VALUES
-- Paris (1-10)
(1, 1, 'SUNDAY', '10:00:00'), (1, 2, 'WEDNESDAY', '19:30:00'),
(2, 1, 'SUNDAY', '10:30:00'), (2, 3, 'WEDNESDAY', '19:00:00'),
(3, 1, 'SUNDAY', '10:00:00'), (3, 3, 'WEDNESDAY', '20:00:00'),
(4, 1, 'SUNDAY', '09:30:00'), (4, 2, 'WEDNESDAY', '19:30:00'),
(5, 1, 'SUNDAY', '10:00:00'), (5, 4, 'FRIDAY', '19:00:00'),
(6, 1, 'SUNDAY', '10:30:00'), (6, 2, 'WEDNESDAY', '19:30:00'),
(7, 1, 'SUNDAY', '10:00:00'), (7, 3, 'WEDNESDAY', '19:00:00'),
(8, 1, 'SUNDAY', '11:00:00'), (8, 4, 'FRIDAY', '20:00:00'),
(9, 1, 'SUNDAY', '10:00:00'), (9, 5, 'SUNDAY', '09:00:00'),
(10, 1, 'SUNDAY', '10:30:00'), (10, 2, 'WEDNESDAY', '19:30:00'),
-- Toulon (11-20)
(11, 1, 'SUNDAY', '10:00:00'), (11, 2, 'WEDNESDAY', '19:00:00'),
(12, 1, 'SUNDAY', '10:30:00'), (12, 3, 'WEDNESDAY', '19:30:00'),
(13, 1, 'SUNDAY', '09:30:00'), (13, 3, 'WEDNESDAY', '19:00:00'),
(14, 1, 'SUNDAY', '10:00:00'), (14, 2, 'WEDNESDAY', '19:30:00'),
(15, 1, 'SUNDAY', '10:00:00'), (15, 4, 'FRIDAY', '19:00:00'),
(16, 1, 'SUNDAY', '10:30:00'), (16, 2, 'WEDNESDAY', '19:30:00'),
(17, 1, 'SUNDAY', '10:00:00'), (17, 3, 'WEDNESDAY', '19:00:00'),
(18, 1, 'SUNDAY', '11:00:00'), (18, 4, 'FRIDAY', '20:00:00'),
(19, 1, 'SUNDAY', '10:00:00'), (19, 5, 'SUNDAY', '09:00:00'),
(20, 1, 'SUNDAY', '10:30:00'), (20, 2, 'WEDNESDAY', '19:30:00'),
-- Ollioules (21-30)
(21, 1, 'SUNDAY', '10:00:00'), (21, 2, 'WEDNESDAY', '19:00:00'),
(22, 1, 'SUNDAY', '10:30:00'), (22, 3, 'WEDNESDAY', '19:30:00'),
(23, 1, 'SUNDAY', '09:30:00'), (23, 3, 'WEDNESDAY', '19:00:00'),
(24, 1, 'SUNDAY', '10:00:00'), (24, 2, 'WEDNESDAY', '19:30:00'),
(25, 1, 'SUNDAY', '10:00:00'), (25, 4, 'FRIDAY', '19:00:00'),
(26, 1, 'SUNDAY', '10:30:00'), (26, 2, 'WEDNESDAY', '19:30:00'),
(27, 1, 'SUNDAY', '10:00:00'), (27, 3, 'WEDNESDAY', '19:00:00'),
(28, 1, 'SUNDAY', '11:00:00'), (28, 4, 'FRIDAY', '20:00:00'),
(29, 1, 'SUNDAY', '10:00:00'), (29, 5, 'SUNDAY', '09:00:00'),
(30, 1, 'SUNDAY', '10:30:00'), (30, 2, 'WEDNESDAY', '19:30:00');

-- ============================================
-- 9. CHURCH SOCIALS (réseaux sociaux : 19 total)
-- ============================================

INSERT INTO church_socials (church_id, platform, url) VALUES
-- Paris
(1, 'FACEBOOK', 'https://facebook.com/ee.belleville'),
(1, 'INSTAGRAM', 'https://instagram.com/ee.belleville'),
(2, 'YOUTUBE', 'https://youtube.com/@add.montmartre'),
(3, 'FACEBOOK', 'https://facebook.com/eb.marais'),
(5, 'INSTAGRAM', 'https://instagram.com/ee.bastille'),
(7, 'FACEBOOK', 'https://facebook.com/epu.batignolles'),
(9, 'FACEBOOK', 'https://facebook.com/ee.menilmontant'),
(9, 'YOUTUBE', 'https://youtube.com/@ee.menilmontant'),
-- Toulon
(11, 'FACEBOOK', 'https://facebook.com/add.toulon.port'),
(11, 'INSTAGRAM', 'https://instagram.com/add.toulon.port'),
(13, 'YOUTUBE', 'https://youtube.com/@eb.faron'),
(15, 'FACEBOOK', 'https://facebook.com/ee.lagarde'),
(17, 'FACEBOOK', 'https://facebook.com/epu.toulon'),
(20, 'INSTAGRAM', 'https://instagram.com/ep.capbrun'),
-- Ollioules
(21, 'FACEBOOK', 'https://facebook.com/ee.ollioules'),
(21, 'INSTAGRAM', 'https://instagram.com/ee.ollioules'),
(23, 'FACEBOOK', 'https://facebook.com/eb.ollioules'),
(26, 'YOUTUBE', 'https://youtube.com/@add.oliviers'),
(29, 'FACEBOOK', 'https://facebook.com/ee.plans');

-- ============================================
-- 10. FIX AUTO_INCREMENT VALUES
-- ============================================
-- Force MySQL to use correct next IDs after explicit inserts

ALTER TABLE admins AUTO_INCREMENT = 32;
ALTER TABLE churches AUTO_INCREMENT = 31;
ALTER TABLE activity_types AUTO_INCREMENT = 6;
ALTER TABLE church_unions AUTO_INCREMENT = 5;
ALTER TABLE denominations AUTO_INCREMENT = 7;
ALTER TABLE languages AUTO_INCREMENT = 11;
ALTER TABLE church_schedules AUTO_INCREMENT = 61;
ALTER TABLE church_socials AUTO_INCREMENT = 20;

-- ============================================
-- FIN DES SEEDERS
-- ============================================
-- Base de données peuplée avec succès !
-- Vous pouvez maintenant vous connecter avec :
--   Email: admin@lightchurch.fr ou p.martin@paris1.fr (ou tout autre pasteur)
--   Password: 780662aB2
-- ============================================
