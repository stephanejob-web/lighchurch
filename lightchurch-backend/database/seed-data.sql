-- ============================================================
-- SEED DATA - LightChurch Database
-- 3000 Églises évangéliques en France
-- Bloc 1/7 : Nettoyage + Références + Églises 1-50
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- 1. NETTOYAGE DES TABLES
-- ============================================================
TRUNCATE TABLE event_interests;
TRUNCATE TABLE event_translations;
TRUNCATE TABLE event_details;
TRUNCATE TABLE events;
TRUNCATE TABLE church_schedules;
TRUNCATE TABLE church_socials;
TRUNCATE TABLE church_details;
TRUNCATE TABLE churches;
TRUNCATE TABLE admins;
TRUNCATE TABLE activity_types;
TRUNCATE TABLE denominations;
TRUNCATE TABLE church_unions;
TRUNCATE TABLE languages;
TRUNCATE TABLE push_tokens;

-- ============================================================
-- 2. DONNÉES DE RÉFÉRENCE
-- ============================================================

-- Languages (ID 10 = Français)
INSERT INTO languages (id, code, name_native, name_fr, flag_emoji, is_active, display_order) VALUES
(1, 'en', 'English', 'Anglais', '🇬🇧', 1, 2),
(2, 'es', 'Español', 'Espagnol', '🇪🇸', 1, 3),
(3, 'pt', 'Português', 'Portugais', '🇵🇹', 1, 4),
(4, 'de', 'Deutsch', 'Allemand', '🇩🇪', 1, 5),
(5, 'it', 'Italiano', 'Italien', '🇮🇹', 1, 6),
(6, 'ar', 'العربية', 'Arabe', '🇸🇦', 1, 7),
(7, 'zh', '中文', 'Chinois', '🇨🇳', 1, 8),
(8, 'ko', '한국어', 'Coréen', '🇰🇷', 1, 9),
(9, 'ln', 'Lingála', 'Lingala', '🇨🇩', 1, 10),
(10, 'fr', 'Français', 'Français', '🇫🇷', 1, 1);

-- Activity Types (4 types)
INSERT INTO activity_types (id, name, label_fr, icon) VALUES
(1, 'WORSHIP', 'Culte', 'church'),
(2, 'YOUTH', 'Jeunesse', 'users'),
(3, 'PRAYER', 'Prière', 'hands'),
(4, 'BIBLE_STUDY', 'Étude Biblique', 'book');

-- Church Unions
INSERT INTO church_unions (id, name, abbreviation, website, is_active) VALUES
(1, 'Fédération des Églises Évangéliques de France', 'FEEF', 'https://feef.org', 1),
(2, 'Conseil National des Évangéliques de France', 'CNEF', 'https://cnef.org', 1);

-- Denominations (4 évangéliques)
INSERT INTO denominations (id, union_id, name, abbreviation, is_active) VALUES
(1, 1, 'Impact Centre Chrétien', 'ICC', 1),
(2, 2, 'Assemblées de Dieu', 'ADD', 1),
(3, 1, 'Église Baptiste', 'BAPTIST', 1),
(4, 2, 'Église Charismatique', 'CHARISMA', 1);

-- Admins (10 admins avec mot de passe 'azerty' hashé en bcrypt)
-- Hash bcrypt de 'azerty': $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.aSr7QdEd6d.z.4.Dku
INSERT INTO admins (id, email, password_hash, role, status, first_name, last_name, created_at) VALUES
(1, 'admin1@lightchurch.fr', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.aSr7QdEd6d.z.4.Dku', 'PASTOR', 'VALIDATED', 'Jean', 'Dupont', NOW()),
(2, 'admin2@lightchurch.fr', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.aSr7QdEd6d.z.4.Dku', 'PASTOR', 'VALIDATED', 'Marie', 'Martin', NOW()),
(3, 'admin3@lightchurch.fr', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.aSr7QdEd6d.z.4.Dku', 'PASTOR', 'VALIDATED', 'Pierre', 'Bernard', NOW()),
(4, 'admin4@lightchurch.fr', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.aSr7QdEd6d.z.4.Dku', 'EVANGELIST', 'VALIDATED', 'Sophie', 'Thomas', NOW()),
(5, 'admin5@lightchurch.fr', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.aSr7QdEd6d.z.4.Dku', 'PASTOR', 'VALIDATED', 'David', 'Petit', NOW()),
(6, 'admin6@lightchurch.fr', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.aSr7QdEd6d.z.4.Dku', 'PASTOR', 'VALIDATED', 'Sarah', 'Robert', NOW()),
(7, 'admin7@lightchurch.fr', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.aSr7QdEd6d.z.4.Dku', 'EVANGELIST', 'VALIDATED', 'Paul', 'Richard', NOW()),
(8, 'admin8@lightchurch.fr', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.aSr7QdEd6d.z.4.Dku', 'PASTOR', 'VALIDATED', 'Claire', 'Durand', NOW()),
(9, 'admin9@lightchurch.fr', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.aSr7QdEd6d.z.4.Dku', 'PASTOR', 'VALIDATED', 'Marc', 'Leroy', NOW()),
(10, 'admin10@lightchurch.fr', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.aSr7QdEd6d.z.4.Dku', 'SUPER_ADMIN', 'VALIDATED', 'Anne', 'Moreau', NOW());

-- ============================================================
-- 3. ÉGLISES 1-50 (avec church_details)
-- ============================================================

-- Paris et Île-de-France (Églises 1-10)
INSERT INTO churches (id, admin_id, denomination_id, church_name, location) VALUES
(1, 1, 1, 'Impact Centre Chrétien Paris', ST_GeomFromText('POINT(2.3522 48.8566)')),
(2, 2, 2, 'ADD Paris Nation', ST_GeomFromText('POINT(2.3959 48.8484)')),
(3, 3, 3, 'Église de la Victoire Paris', ST_GeomFromText('POINT(2.3200 48.8700)')),
(4, 4, 4, 'Le Rocher Paris Est', ST_GeomFromText('POINT(2.4100 48.8600)')),
(5, 5, 1, 'Porte de l''Espoir Montreuil', ST_GeomFromText('POINT(2.4400 48.8600)')),
(6, 6, 2, 'Source de Vie Saint-Denis', ST_GeomFromText('POINT(2.3550 48.9360)')),
(7, 7, 3, 'Impact Centre Chrétien Créteil', ST_GeomFromText('POINT(2.4550 48.7900)')),
(8, 8, 4, 'ADD Boulogne', ST_GeomFromText('POINT(2.2400 48.8400)')),
(9, 9, 1, 'Église de la Victoire Versailles', ST_GeomFromText('POINT(2.1300 48.8000)')),
(10, 10, 2, 'Le Rocher Nanterre', ST_GeomFromText('POINT(2.2067 48.8924)')),

-- Lyon (Églises 11-16)
(11, 1, 3, 'Porte de l''Espoir Lyon Centre', ST_GeomFromText('POINT(4.8357 45.7640)')),
(12, 2, 4, 'Source de Vie Lyon Part-Dieu', ST_GeomFromText('POINT(4.8590 45.7600)')),
(13, 3, 1, 'Impact Centre Chrétien Villeurbanne', ST_GeomFromText('POINT(4.8800 45.7700)')),
(14, 4, 2, 'ADD Lyon Confluence', ST_GeomFromText('POINT(4.8200 45.7400)')),
(15, 5, 3, 'Église de la Victoire Lyon 8', ST_GeomFromText('POINT(4.8700 45.7350)')),
(16, 6, 4, 'Le Rocher Vénissieux', ST_GeomFromText('POINT(4.8870 45.6970)')),

-- Marseille (Églises 17-22)
(17, 7, 1, 'Porte de l''Espoir Marseille Centre', ST_GeomFromText('POINT(5.3698 43.2965)')),
(18, 8, 2, 'Source de Vie Marseille Nord', ST_GeomFromText('POINT(5.3900 43.3300)')),
(19, 9, 3, 'Impact Centre Chrétien La Valentine', ST_GeomFromText('POINT(5.4800 43.2900)')),
(20, 10, 4, 'ADD Marseille Prado', ST_GeomFromText('POINT(5.3900 43.2700)')),
(21, 1, 1, 'Église de la Victoire Aix-en-Provence', ST_GeomFromText('POINT(5.4474 43.5297)')),
(22, 2, 2, 'Le Rocher Aubagne', ST_GeomFromText('POINT(5.5700 43.2900)')),

-- Bordeaux (Églises 23-28)
(23, 3, 3, 'Porte de l''Espoir Bordeaux Centre', ST_GeomFromText('POINT(-0.5792 44.8378)')),
(24, 4, 4, 'Source de Vie Bordeaux Lac', ST_GeomFromText('POINT(-0.5650 44.8800)')),
(25, 5, 1, 'Impact Centre Chrétien Mérignac', ST_GeomFromText('POINT(-0.6430 44.8386)')),
(26, 6, 2, 'ADD Pessac', ST_GeomFromText('POINT(-0.6310 44.8070)')),
(27, 7, 3, 'Église de la Victoire Talence', ST_GeomFromText('POINT(-0.5870 44.8030)')),
(28, 8, 4, 'Le Rocher Cenon', ST_GeomFromText('POINT(-0.5330 44.8570)')),

-- Nantes (Églises 29-34)
(29, 9, 1, 'Porte de l''Espoir Nantes Centre', ST_GeomFromText('POINT(-1.5534 47.2184)')),
(30, 10, 2, 'Source de Vie Nantes Nord', ST_GeomFromText('POINT(-1.5500 47.2500)')),
(31, 1, 3, 'Impact Centre Chrétien Saint-Herblain', ST_GeomFromText('POINT(-1.6500 47.2200)')),
(32, 2, 4, 'ADD Rezé', ST_GeomFromText('POINT(-1.5500 47.1800)')),
(33, 3, 1, 'Église de la Victoire Orvault', ST_GeomFromText('POINT(-1.6200 47.2700)')),
(34, 4, 2, 'Le Rocher Carquefou', ST_GeomFromText('POINT(-1.4800 47.2900)')),

-- Strasbourg (Églises 35-40)
(35, 5, 3, 'Porte de l''Espoir Strasbourg Centre', ST_GeomFromText('POINT(7.7521 48.5734)')),
(36, 6, 4, 'Source de Vie Strasbourg Neudorf', ST_GeomFromText('POINT(7.7800 48.5600)')),
(37, 7, 1, 'Impact Centre Chrétien Schiltigheim', ST_GeomFromText('POINT(7.7500 48.6060)')),
(38, 8, 2, 'ADD Illkirch', ST_GeomFromText('POINT(7.7200 48.5300)')),
(39, 9, 3, 'Église de la Victoire Lingolsheim', ST_GeomFromText('POINT(7.6840 48.5560)')),
(40, 10, 4, 'Le Rocher Hoenheim', ST_GeomFromText('POINT(7.7550 48.6200)')),

-- Lille (Églises 41-46)
(41, 1, 1, 'Porte de l''Espoir Lille Centre', ST_GeomFromText('POINT(3.0573 50.6292)')),
(42, 2, 2, 'Source de Vie Lille Fives', ST_GeomFromText('POINT(3.0900 50.6300)')),
(43, 3, 3, 'Impact Centre Chrétien Roubaix', ST_GeomFromText('POINT(3.1746 50.6942)')),
(44, 4, 4, 'ADD Tourcoing', ST_GeomFromText('POINT(3.1611 50.7256)')),
(45, 5, 1, 'Église de la Victoire Villeneuve-d''Ascq', ST_GeomFromText('POINT(3.1300 50.6300)')),
(46, 6, 2, 'Le Rocher Marcq-en-Baroeul', ST_GeomFromText('POINT(3.0970 50.6740)')),

-- Toulouse (Églises 47-50)
(47, 7, 3, 'Porte de l''Espoir Toulouse Centre', ST_GeomFromText('POINT(1.4442 43.6047)')),
(48, 8, 4, 'Source de Vie Toulouse Mirail', ST_GeomFromText('POINT(1.3930 43.5800)')),
(49, 9, 1, 'Impact Centre Chrétien Blagnac', ST_GeomFromText('POINT(1.3900 43.6370)')),
(50, 10, 2, 'ADD Colomiers', ST_GeomFromText('POINT(1.3350 43.6110)'));

-- ============================================================
-- 4. CHURCH_DETAILS pour les églises 1-50
-- ============================================================

INSERT INTO church_details (church_id, status, language_id, pastor_first_name, pastor_last_name, address, street_number, street_name, postal_code, city, phone, description, has_parking, parking_capacity, is_parking_free) VALUES
-- Paris et IDF (1-10)
(1, 'ACTIVE', 10, 'Jean', 'Dupont', '15 Rue de Rivoli, 75001 Paris', '15', 'Rue de Rivoli', '75001', 'Paris', '01 42 33 44 55', 'Église dynamique au coeur de Paris. Nous accueillons tous ceux qui cherchent Dieu dans un esprit de communion fraternelle.', 1, 50, 0),
(2, 'ACTIVE', 10, 'Marie', 'Martin', '45 Avenue de la République, 75011 Paris', '45', 'Avenue de la République', '75011', 'Paris', '01 43 55 66 77', 'Communauté vivante près de Nation. Notre mission est de partager l''amour de Christ avec tous.', 0, NULL, 1),
(3, 'ACTIVE', 10, 'Pierre', 'Bernard', '78 Rue de Clichy, 75009 Paris', '78', 'Rue de Clichy', '75009', 'Paris', '01 48 74 85 96', 'Église familiale dans le 9ème arrondissement. Venez vivre des moments de louange et d''adoration.', 1, 30, 1),
(4, 'ACTIVE', 10, 'Sophie', 'Thomas', '23 Boulevard Voltaire, 75011 Paris', '23', 'Boulevard Voltaire', '75011', 'Paris', '01 43 79 12 34', 'Une église pour les jeunes et les familles. Nous croyons en la puissance de la prière.', 0, NULL, 1),
(5, 'ACTIVE', 10, 'David', 'Petit', '12 Rue de Paris, 93100 Montreuil', '12', 'Rue de Paris', '93100', 'Montreuil', '01 48 58 69 70', 'Communauté multiculturelle de Montreuil. Nous célébrons la diversité dans l''unité en Christ.', 1, 80, 1),
(6, 'ACTIVE', 10, 'Sarah', 'Robert', '56 Avenue du Président Wilson, 93200 Saint-Denis', '56', 'Avenue du Président Wilson', '93200', 'Saint-Denis', '01 48 20 31 42', 'Église accueillante à Saint-Denis. Notre vision est de transformer des vies par l''Évangile.', 1, 100, 1),
(7, 'ACTIVE', 10, 'Paul', 'Richard', '34 Avenue du Général de Gaulle, 94000 Créteil', '34', 'Avenue du Général de Gaulle', '94000', 'Créteil', '01 45 17 28 39', 'Grande église de Créteil avec parking gratuit. Rejoignez-nous pour des cultes inspirants.', 1, 150, 1),
(8, 'ACTIVE', 10, 'Claire', 'Durand', '89 Route de la Reine, 92100 Boulogne', '89', 'Route de la Reine', '92100', 'Boulogne-Billancourt', '01 46 05 16 27', 'Église moderne à Boulogne. Nous offrons des programmes pour tous les âges.', 0, NULL, 1),
(9, 'ACTIVE', 10, 'Marc', 'Leroy', '67 Rue de la Paroisse, 78000 Versailles', '67', 'Rue de la Paroisse', '78000', 'Versailles', '01 39 50 61 72', 'Belle église historique de Versailles. Tradition et renouveau spirituel.', 1, 40, 0),
(10, 'ACTIVE', 10, 'Anne', 'Moreau', '21 Avenue Pablo Picasso, 92000 Nanterre', '21', 'Avenue Pablo Picasso', '92000', 'Nanterre', '01 47 25 36 47', 'Église de quartier à Nanterre. Une famille qui vous attend.', 1, 60, 1),

-- Lyon (11-16)
(11, 'ACTIVE', 10, 'Thomas', 'Girard', '45 Rue de la République, 69001 Lyon', '45', 'Rue de la République', '69001', 'Lyon', '04 78 42 53 64', 'Église centrale de Lyon sur la Presqu''île. Cultes bilingues français-anglais.', 0, NULL, 1),
(12, 'ACTIVE', 10, 'Julie', 'Bonnet', '23 Rue Garibaldi, 69003 Lyon', '23', 'Rue Garibaldi', '69003', 'Lyon', '04 78 95 06 17', 'Communauté dynamique près de Part-Dieu. Groupes de maison dans tout Lyon.', 1, 45, 1),
(13, 'ACTIVE', 10, 'Antoine', 'Roux', '78 Cours Émile Zola, 69100 Villeurbanne', '78', 'Cours Émile Zola', '69100', 'Villeurbanne', '04 78 84 95 06', 'Église multiculturelle de Villeurbanne. Accueil des réfugiés et nouveaux arrivants.', 1, 70, 1),
(14, 'ACTIVE', 10, 'Émilie', 'Faure', '12 Quai Perrache, 69002 Lyon', '12', 'Quai Perrache', '69002', 'Lyon', '04 78 37 48 59', 'Nouvelle église au quartier Confluence. Architecture moderne, foi authentique.', 1, 120, 0),
(15, 'ACTIVE', 10, 'Lucas', 'Mercier', '56 Avenue Paul Santy, 69008 Lyon', '56', 'Avenue Paul Santy', '69008', 'Lyon', '04 78 00 11 22', 'Église familiale du 8ème arrondissement. Ministère pour les enfants développé.', 1, 35, 1),
(16, 'ACTIVE', 10, 'Camille', 'Blanc', '34 Boulevard Laurent Bonnevay, 69200 Vénissieux', '34', 'Boulevard Laurent Bonnevay', '69200', 'Vénissieux', '04 78 70 81 92', 'Grande communauté de Vénissieux. Programmes sociaux et entraide.', 1, 200, 1),

-- Marseille (17-22)
(17, 'ACTIVE', 10, 'Romain', 'Lopez', '67 La Canebière, 13001 Marseille', '67', 'La Canebière', '13001', 'Marseille', '04 91 54 65 76', 'Église historique sur la Canebière. Témoins de Christ dans la cité phocéenne.', 0, NULL, 1),
(18, 'ACTIVE', 10, 'Léa', 'Garcia', '89 Boulevard de Paris, 13003 Marseille', '89', 'Boulevard de Paris', '13003', 'Marseille', '04 91 02 13 24', 'Communauté engagée dans les quartiers Nord. Actions sociales et évangélisation.', 1, 50, 1),
(19, 'ACTIVE', 10, 'Hugo', 'Fernandez', '12 Avenue de la Valbarelle, 13011 Marseille', '12', 'Avenue de la Valbarelle', '13011', 'Marseille', '04 91 35 46 57', 'Église de La Valentine avec grand parking. Cultes joyeux et fraternels.', 1, 180, 1),
(20, 'ACTIVE', 10, 'Manon', 'Rodriguez', '45 Avenue du Prado, 13008 Marseille', '45', 'Avenue du Prado', '13008', 'Marseille', '04 91 77 88 99', 'Belle église près du Prado. Ministère musical reconnu.', 0, NULL, 1),
(21, 'ACTIVE', 10, 'Théo', 'Martinez', '23 Cours Mirabeau, 13100 Aix-en-Provence', '23', 'Cours Mirabeau', '13100', 'Aix-en-Provence', '04 42 26 37 48', 'Église d''Aix au coeur de la ville. Accueil des étudiants.', 1, 30, 0),
(22, 'ACTIVE', 10, 'Emma', 'Gonzalez', '56 Avenue de Verdun, 13400 Aubagne', '56', 'Avenue de Verdun', '13400', 'Aubagne', '04 42 03 14 25', 'Communauté chaleureuse d''Aubagne. Nous grandissons ensemble dans la foi.', 1, 65, 1),

-- Bordeaux (23-28)
(23, 'ACTIVE', 10, 'Nathan', 'Dubois', '78 Rue Sainte-Catherine, 33000 Bordeaux', '78', 'Rue Sainte-Catherine', '33000', 'Bordeaux', '05 56 44 55 66', 'Église en plein centre de Bordeaux. Ministère urbain dynamique.', 0, NULL, 1),
(24, 'ACTIVE', 10, 'Chloé', 'Lambert', '34 Avenue des 40 Journaux, 33300 Bordeaux', '34', 'Avenue des 40 Journaux', '33300', 'Bordeaux', '05 56 50 61 72', 'Grande église près du Lac. Conventions et séminaires réguliers.', 1, 250, 1),
(25, 'ACTIVE', 10, 'Gabriel', 'Michel', '12 Avenue de la Libération, 33700 Mérignac', '12', 'Avenue de la Libération', '33700', 'Mérignac', '05 56 97 08 19', 'Église de Mérignac près de l''aéroport. Communauté internationale.', 1, 100, 1),
(26, 'ACTIVE', 10, 'Inès', 'Lefebvre', '56 Avenue Pasteur, 33600 Pessac', '56', 'Avenue Pasteur', '33600', 'Pessac', '05 56 36 47 58', 'Église universitaire de Pessac. Groupe étudiant actif.', 1, 40, 1),
(27, 'ACTIVE', 10, 'Louis', 'Leroy', '89 Cours de la Libération, 33400 Talence', '89', 'Cours de la Libération', '33400', 'Talence', '05 56 80 91 02', 'Communauté familiale de Talence. Programmes jeunesse développés.', 0, NULL, 1),
(28, 'ACTIVE', 10, 'Jade', 'Moreau', '23 Avenue Jean Jaurès, 33150 Cenon', '23', 'Avenue Jean Jaurès', '33150', 'Cenon', '05 56 86 97 08', 'Église de la rive droite. Engagée dans le quartier.', 1, 55, 1),

-- Nantes (29-34)
(29, 'ACTIVE', 10, 'Raphaël', 'Simon', '45 Rue Crébillon, 44000 Nantes', '45', 'Rue Crébillon', '44000', 'Nantes', '02 40 47 58 69', 'Église centrale de Nantes. Cultes inspirants et communauté unie.', 0, NULL, 1),
(30, 'ACTIVE', 10, 'Louise', 'Laurent', '67 Boulevard des Américains, 44000 Nantes', '67', 'Boulevard des Américains', '44000', 'Nantes', '02 40 74 85 96', 'Communauté du Nord de Nantes. Groupes de partage hebdomadaires.', 1, 45, 1),
(31, 'ACTIVE', 10, 'Arthur', 'Morel', '12 Boulevard de la Fraternité, 44800 Saint-Herblain', '12', 'Boulevard de la Fraternité', '44800', 'Saint-Herblain', '02 40 43 54 65', 'Grande église de Saint-Herblain. Parking et accessibilité PMR.', 1, 150, 1),
(32, 'ACTIVE', 10, 'Zoé', 'Fournier', '34 Rue Alsace-Lorraine, 44400 Rezé', '34', 'Rue Alsace-Lorraine', '44400', 'Rezé', '02 40 84 95 06', 'Église de Rezé près du Hangar à Bananes. Communauté jeune.', 1, 60, 1),
(33, 'ACTIVE', 10, 'Adam', 'Giraud', '78 Route de Vannes, 44700 Orvault', '78', 'Route de Vannes', '44700', 'Orvault', '02 40 63 74 85', 'Église familiale d''Orvault. Ministère enfants et adolescents.', 1, 80, 1),
(34, 'ACTIVE', 10, 'Alice', 'Rousseau', '56 Boulevard de la Loire, 44470 Carquefou', '56', 'Boulevard de la Loire', '44470', 'Carquefou', '02 40 52 63 74', 'Communauté de Carquefou. Cadre verdoyant et paisible.', 1, 70, 1),

-- Strasbourg (35-40)
(35, 'ACTIVE', 10, 'Jules', 'Vincent', '89 Grand''Rue, 67000 Strasbourg', '89', 'Grand''Rue', '67000', 'Strasbourg', '03 88 32 43 54', 'Église au coeur de Strasbourg. Patrimoine et modernité.', 0, NULL, 1),
(36, 'ACTIVE', 10, 'Lina', 'Nicolas', '12 Rue du Rhin, 67100 Strasbourg', '12', 'Rue du Rhin', '67100', 'Strasbourg', '03 88 84 95 06', 'Communauté de Neudorf. Cultes en français et allemand.', 1, 35, 1),
(37, 'ACTIVE', 10, 'Léo', 'Masson', '45 Route de Bischwiller, 67300 Schiltigheim', '45', 'Route de Bischwiller', '67300', 'Schiltigheim', '03 88 83 94 05', 'Église dynamique de Schiltigheim. École du dimanche active.', 1, 90, 1),
(38, 'ACTIVE', 10, 'Eva', 'André', '23 Route de Lyon, 67400 Illkirch', '23', 'Route de Lyon', '67400', 'Illkirch-Graffenstaden', '03 88 66 77 88', 'Église d''Illkirch près du campus. Accueil étudiant.', 1, 50, 1),
(39, 'ACTIVE', 10, 'Noah', 'Lemaire', '67 Rue de la Division Leclerc, 67380 Lingolsheim', '67', 'Rue de la Division Leclerc', '67380', 'Lingolsheim', '03 88 78 89 00', 'Communauté de Lingolsheim. Entraide et solidarité.', 1, 40, 1),
(40, 'ACTIVE', 10, 'Rose', 'Fontaine', '34 Rue de la République, 67800 Hoenheim', '34', 'Rue de la République', '67800', 'Hoenheim', '03 88 81 92 03', 'Église familiale de Hoenheim. Ambiance chaleureuse.', 1, 55, 1),

-- Lille (41-46)
(41, 'ACTIVE', 10, 'Maxime', 'Chevalier', '56 Rue Faidherbe, 59000 Lille', '56', 'Rue Faidherbe', '59000', 'Lille', '03 20 54 65 76', 'Église centrale de Lille. Au coeur du Vieux-Lille.', 0, NULL, 1),
(42, 'ACTIVE', 10, 'Lucie', 'Renard', '78 Rue Pierre Legrand, 59800 Lille', '78', 'Rue Pierre Legrand', '59800', 'Lille', '03 20 53 64 75', 'Communauté de Fives. Église de quartier engagée.', 1, 30, 1),
(43, 'ACTIVE', 10, 'Sacha', 'Picard', '12 Grande Rue, 59100 Roubaix', '12', 'Grande Rue', '59100', 'Roubaix', '03 20 70 81 92', 'Grande église de Roubaix. Ministère multiculturel.', 1, 120, 1),
(44, 'ACTIVE', 10, 'Margot', 'Carpentier', '34 Rue de Gand, 59200 Tourcoing', '34', 'Rue de Gand', '59200', 'Tourcoing', '03 20 26 37 48', 'Église historique de Tourcoing. Communauté intergénérationnelle.', 1, 80, 1),
(45, 'ACTIVE', 10, 'Ethan', 'Poirier', '89 Boulevard de Tournai, 59650 Villeneuve-d''Ascq', '89', 'Boulevard de Tournai', '59650', 'Villeneuve-d''Ascq', '03 20 91 02 13', 'Église près de l''université. Ministère étudiant actif.', 1, 100, 1),
(46, 'ACTIVE', 10, 'Anna', 'Blanchard', '23 Avenue Foch, 59700 Marcq-en-Baroeul', '23', 'Avenue Foch', '59700', 'Marcq-en-Baroeul', '03 20 72 83 94', 'Communauté de Marcq. Programmes familles et couples.', 1, 65, 1),

-- Toulouse (47-50)
(47, 'ACTIVE', 10, 'Tom', 'Gautier', '45 Rue du Taur, 31000 Toulouse', '45', 'Rue du Taur', '31000', 'Toulouse', '05 61 21 32 43', 'Église centrale de Toulouse. Près de la place du Capitole.', 0, NULL, 1),
(48, 'ACTIVE', 10, 'Lola', 'Perrin', '67 Avenue de Muret, 31100 Toulouse', '67', 'Avenue de Muret', '31100', 'Toulouse', '05 61 40 51 62', 'Communauté du Mirail. Engagement social et évangélisation.', 1, 75, 1),
(49, 'ACTIVE', 10, 'Mathis', 'Robin', '12 Place du Général de Gaulle, 31700 Blagnac', '12', 'Place du Général de Gaulle', '31700', 'Blagnac', '05 61 71 82 93', 'Église de Blagnac près de l''aéroport. Communauté internationale.', 1, 90, 1),
(50, 'ACTIVE', 10, 'Mia', 'Henry', '34 Allée du Ramassier, 31770 Colomiers', '34', 'Allée du Ramassier', '31770', 'Colomiers', '05 61 78 89 00', 'Grande église de Colomiers. Louange et adoration.', 1, 110, 1);

-- ============================================================
-- 5. ÉVÉNEMENTS pour les églises 1-50 (2 par église = 100 events)
-- ============================================================

INSERT INTO events (id, admin_id, church_id, title, language_id, start_datetime, end_datetime, event_location) VALUES
-- Église 1 - Paris
(1, 1, 1, 'Culte du Dimanche - ICC Paris', 10, '2026-02-01 10:00:00', '2026-02-01 12:30:00', ST_GeomFromText('POINT(2.3522 48.8566)')),
(2, 1, 1, 'Soirée de Prière', 10, '2026-03-15 19:00:00', '2026-03-15 21:00:00', ST_GeomFromText('POINT(2.3522 48.8566)')),
-- Église 2
(3, 2, 2, 'Culte de Pâques', 10, '2026-04-05 10:00:00', '2026-04-05 13:00:00', ST_GeomFromText('POINT(2.3959 48.8484)')),
(4, 2, 2, 'Étude Biblique du Mercredi', 10, '2026-04-08 19:30:00', '2026-04-08 21:00:00', ST_GeomFromText('POINT(2.3959 48.8484)')),
-- Église 3
(5, 3, 3, 'Culte Spécial Louange', 10, '2026-02-15 10:00:00', '2026-02-15 12:30:00', ST_GeomFromText('POINT(2.3200 48.8700)')),
(6, 3, 3, 'Soirée Jeunesse', 10, '2026-05-22 19:00:00', '2026-05-22 22:00:00', ST_GeomFromText('POINT(2.3200 48.8700)')),
-- Église 4
(7, 4, 4, 'Culte Dominical', 10, '2026-02-22 10:30:00', '2026-02-22 12:30:00', ST_GeomFromText('POINT(2.4100 48.8600)')),
(8, 4, 4, 'Réunion de Prière Matinale', 10, '2026-06-10 06:00:00', '2026-06-10 07:30:00', ST_GeomFromText('POINT(2.4100 48.8600)')),
-- Église 5
(9, 5, 5, 'Culte de la Pentecôte', 10, '2026-05-24 10:00:00', '2026-05-24 13:00:00', ST_GeomFromText('POINT(2.4400 48.8600)')),
(10, 5, 5, 'Conférence Femmes', 10, '2026-07-18 09:00:00', '2026-07-18 17:00:00', ST_GeomFromText('POINT(2.4400 48.8600)')),
-- Église 6
(11, 6, 6, 'Culte Multiculturel', 10, '2026-03-01 10:00:00', '2026-03-01 12:30:00', ST_GeomFromText('POINT(2.3550 48.9360)')),
(12, 6, 6, 'Séminaire Leadership', 10, '2026-08-22 09:00:00', '2026-08-22 18:00:00', ST_GeomFromText('POINT(2.3550 48.9360)')),
-- Église 7
(13, 7, 7, 'Culte de Louange', 10, '2026-03-08 10:00:00', '2026-03-08 12:30:00', ST_GeomFromText('POINT(2.4550 48.7900)')),
(14, 7, 7, 'Camp Jeunesse', 10, '2026-08-01 08:00:00', '2026-08-03 18:00:00', ST_GeomFromText('POINT(2.4550 48.7900)')),
-- Église 8
(15, 8, 8, 'Culte du Dimanche', 10, '2026-03-15 10:30:00', '2026-03-15 12:30:00', ST_GeomFromText('POINT(2.2400 48.8400)')),
(16, 8, 8, 'Atelier Mariage', 10, '2026-09-05 14:00:00', '2026-09-05 17:00:00', ST_GeomFromText('POINT(2.2400 48.8400)')),
-- Église 9
(17, 9, 9, 'Culte de Rentrée', 10, '2026-09-06 10:00:00', '2026-09-06 12:30:00', ST_GeomFromText('POINT(2.1300 48.8000)')),
(18, 9, 9, 'Concert de Noël', 10, '2026-12-20 19:00:00', '2026-12-20 21:30:00', ST_GeomFromText('POINT(2.1300 48.8000)')),
-- Église 10
(19, 10, 10, 'Culte Familial', 10, '2026-03-22 10:00:00', '2026-03-22 12:30:00', ST_GeomFromText('POINT(2.2067 48.8924)')),
(20, 10, 10, 'Baptêmes', 10, '2026-06-28 14:00:00', '2026-06-28 16:00:00', ST_GeomFromText('POINT(2.2067 48.8924)')),

-- Lyon (Églises 11-16)
(21, 1, 11, 'Culte Bilingue', 10, '2026-02-08 10:00:00', '2026-02-08 12:30:00', ST_GeomFromText('POINT(4.8357 45.7640)')),
(22, 1, 11, 'Veillée de Prière', 10, '2026-04-17 21:00:00', '2026-04-18 05:00:00', ST_GeomFromText('POINT(4.8357 45.7640)')),
(23, 2, 12, 'Culte de Pâques Lyon', 10, '2026-04-05 10:00:00', '2026-04-05 13:00:00', ST_GeomFromText('POINT(4.8590 45.7600)')),
(24, 2, 12, 'Groupe de Maison', 10, '2026-05-13 20:00:00', '2026-05-13 22:00:00', ST_GeomFromText('POINT(4.8590 45.7600)')),
(25, 3, 13, 'Culte International', 10, '2026-02-15 10:30:00', '2026-02-15 13:00:00', ST_GeomFromText('POINT(4.8800 45.7700)')),
(26, 3, 13, 'Accueil Réfugiés', 10, '2026-06-06 14:00:00', '2026-06-06 17:00:00', ST_GeomFromText('POINT(4.8800 45.7700)')),
(27, 4, 14, 'Culte Confluence', 10, '2026-02-22 10:00:00', '2026-02-22 12:30:00', ST_GeomFromText('POINT(4.8200 45.7400)')),
(28, 4, 14, 'Conférence Hommes', 10, '2026-10-17 09:00:00', '2026-10-17 17:00:00', ST_GeomFromText('POINT(4.8200 45.7400)')),
(29, 5, 15, 'Culte Enfants', 10, '2026-03-01 10:00:00', '2026-03-01 12:00:00', ST_GeomFromText('POINT(4.8700 45.7350)')),
(30, 5, 15, 'Fête de l''École du Dimanche', 10, '2026-06-21 14:00:00', '2026-06-21 18:00:00', ST_GeomFromText('POINT(4.8700 45.7350)')),
(31, 6, 16, 'Culte Social', 10, '2026-03-08 10:00:00', '2026-03-08 12:30:00', ST_GeomFromText('POINT(4.8870 45.6970)')),
(32, 6, 16, 'Distribution Alimentaire', 10, '2026-11-14 09:00:00', '2026-11-14 13:00:00', ST_GeomFromText('POINT(4.8870 45.6970)')),

-- Marseille (Églises 17-22)
(33, 7, 17, 'Culte Canebière', 10, '2026-02-08 10:00:00', '2026-02-08 12:30:00', ST_GeomFromText('POINT(5.3698 43.2965)')),
(34, 7, 17, 'Évangélisation Vieux-Port', 10, '2026-07-11 15:00:00', '2026-07-11 19:00:00', ST_GeomFromText('POINT(5.3698 43.2965)')),
(35, 8, 18, 'Culte Quartiers Nord', 10, '2026-02-15 10:00:00', '2026-02-15 12:30:00', ST_GeomFromText('POINT(5.3900 43.3300)')),
(36, 8, 18, 'Action Sociale', 10, '2026-09-19 10:00:00', '2026-09-19 16:00:00', ST_GeomFromText('POINT(5.3900 43.3300)')),
(37, 9, 19, 'Culte La Valentine', 10, '2026-02-22 10:30:00', '2026-02-22 12:30:00', ST_GeomFromText('POINT(5.4800 43.2900)')),
(38, 9, 19, 'Pique-nique Église', 10, '2026-05-09 11:00:00', '2026-05-09 17:00:00', ST_GeomFromText('POINT(5.4800 43.2900)')),
(39, 10, 20, 'Culte Musical Prado', 10, '2026-03-01 10:00:00', '2026-03-01 12:30:00', ST_GeomFromText('POINT(5.3900 43.2700)')),
(40, 10, 20, 'Concert Gospel', 10, '2026-12-12 20:00:00', '2026-12-12 22:30:00', ST_GeomFromText('POINT(5.3900 43.2700)')),
(41, 1, 21, 'Culte Étudiant Aix', 10, '2026-03-08 11:00:00', '2026-03-08 13:00:00', ST_GeomFromText('POINT(5.4474 43.5297)')),
(42, 1, 21, 'Welcome Week Étudiants', 10, '2026-09-07 18:00:00', '2026-09-07 22:00:00', ST_GeomFromText('POINT(5.4474 43.5297)')),
(43, 2, 22, 'Culte Aubagne', 10, '2026-03-15 10:00:00', '2026-03-15 12:30:00', ST_GeomFromText('POINT(5.5700 43.2900)')),
(44, 2, 22, 'Journée Portes Ouvertes', 10, '2026-10-03 10:00:00', '2026-10-03 17:00:00', ST_GeomFromText('POINT(5.5700 43.2900)')),

-- Bordeaux (Églises 23-28)
(45, 3, 23, 'Culte Centre-Ville', 10, '2026-02-08 10:30:00', '2026-02-08 12:30:00', ST_GeomFromText('POINT(-0.5792 44.8378)')),
(46, 3, 23, 'Marche pour Jésus', 10, '2026-06-13 14:00:00', '2026-06-13 18:00:00', ST_GeomFromText('POINT(-0.5792 44.8378)')),
(47, 4, 24, 'Culte Convention', 10, '2026-02-15 10:00:00', '2026-02-15 12:30:00', ST_GeomFromText('POINT(-0.5650 44.8800)')),
(48, 4, 24, 'Convention Régionale', 10, '2026-11-21 09:00:00', '2026-11-22 18:00:00', ST_GeomFromText('POINT(-0.5650 44.8800)')),
(49, 5, 25, 'Culte International Mérignac', 10, '2026-02-22 10:00:00', '2026-02-22 12:30:00', ST_GeomFromText('POINT(-0.6430 44.8386)')),
(50, 5, 25, 'Soirée Internationale', 10, '2026-08-29 18:00:00', '2026-08-29 22:00:00', ST_GeomFromText('POINT(-0.6430 44.8386)')),
(51, 6, 26, 'Culte Universitaire', 10, '2026-03-01 11:00:00', '2026-03-01 13:00:00', ST_GeomFromText('POINT(-0.6310 44.8070)')),
(52, 6, 26, 'Retraite Étudiants', 10, '2026-04-25 08:00:00', '2026-04-26 18:00:00', ST_GeomFromText('POINT(-0.6310 44.8070)')),
(53, 7, 27, 'Culte Familial Talence', 10, '2026-03-08 10:00:00', '2026-03-08 12:30:00', ST_GeomFromText('POINT(-0.5870 44.8030)')),
(54, 7, 27, 'Camp Ados', 10, '2026-07-06 08:00:00', '2026-07-10 18:00:00', ST_GeomFromText('POINT(-0.5870 44.8030)')),
(55, 8, 28, 'Culte Rive Droite', 10, '2026-03-15 10:00:00', '2026-03-15 12:30:00', ST_GeomFromText('POINT(-0.5330 44.8570)')),
(56, 8, 28, 'Fête de Quartier', 10, '2026-06-27 14:00:00', '2026-06-27 20:00:00', ST_GeomFromText('POINT(-0.5330 44.8570)')),

-- Nantes (Églises 29-34)
(57, 9, 29, 'Culte Centre Nantes', 10, '2026-02-08 10:00:00', '2026-02-08 12:30:00', ST_GeomFromText('POINT(-1.5534 47.2184)')),
(58, 9, 29, 'Soirée Louange', 10, '2026-05-16 19:30:00', '2026-05-16 22:00:00', ST_GeomFromText('POINT(-1.5534 47.2184)')),
(59, 10, 30, 'Culte Dimanche Nord', 10, '2026-02-15 10:00:00', '2026-02-15 12:30:00', ST_GeomFromText('POINT(-1.5500 47.2500)')),
(60, 10, 30, 'Groupe de Partage', 10, '2026-04-22 20:00:00', '2026-04-22 22:00:00', ST_GeomFromText('POINT(-1.5500 47.2500)')),
(61, 1, 31, 'Culte Saint-Herblain', 10, '2026-02-22 10:30:00', '2026-02-22 12:30:00', ST_GeomFromText('POINT(-1.6500 47.2200)')),
(62, 1, 31, 'Journée Handicap', 10, '2026-10-10 10:00:00', '2026-10-10 17:00:00', ST_GeomFromText('POINT(-1.6500 47.2200)')),
(63, 2, 32, 'Culte Jeune Rezé', 10, '2026-03-01 11:00:00', '2026-03-01 13:00:00', ST_GeomFromText('POINT(-1.5500 47.1800)')),
(64, 2, 32, 'Soirée Jeunes', 10, '2026-07-04 19:00:00', '2026-07-04 23:00:00', ST_GeomFromText('POINT(-1.5500 47.1800)')),
(65, 3, 33, 'Culte Familial Orvault', 10, '2026-03-08 10:00:00', '2026-03-08 12:30:00', ST_GeomFromText('POINT(-1.6200 47.2700)')),
(66, 3, 33, 'Fête des Enfants', 10, '2026-06-14 14:00:00', '2026-06-14 18:00:00', ST_GeomFromText('POINT(-1.6200 47.2700)')),
(67, 4, 34, 'Culte Nature', 10, '2026-03-15 10:00:00', '2026-03-15 12:30:00', ST_GeomFromText('POINT(-1.4800 47.2900)')),
(68, 4, 34, 'Retraite Spirituelle', 10, '2026-09-26 09:00:00', '2026-09-27 17:00:00', ST_GeomFromText('POINT(-1.4800 47.2900)')),

-- Strasbourg (Églises 35-40)
(69, 5, 35, 'Culte Alsacien', 10, '2026-02-08 10:00:00', '2026-02-08 12:30:00', ST_GeomFromText('POINT(7.7521 48.5734)')),
(70, 5, 35, 'Marché de Noël Chrétien', 10, '2026-12-06 10:00:00', '2026-12-06 20:00:00', ST_GeomFromText('POINT(7.7521 48.5734)')),
(71, 6, 36, 'Culte Bilingue FR-DE', 10, '2026-02-15 10:00:00', '2026-02-15 12:30:00', ST_GeomFromText('POINT(7.7800 48.5600)')),
(72, 6, 36, 'Échange Franco-Allemand', 10, '2026-05-30 14:00:00', '2026-05-30 18:00:00', ST_GeomFromText('POINT(7.7800 48.5600)')),
(73, 7, 37, 'Culte Schiltigheim', 10, '2026-02-22 10:30:00', '2026-02-22 12:30:00', ST_GeomFromText('POINT(7.7500 48.6060)')),
(74, 7, 37, 'VBS - Vacances Bibliques', 10, '2026-08-17 09:00:00', '2026-08-21 16:00:00', ST_GeomFromText('POINT(7.7500 48.6060)')),
(75, 8, 38, 'Culte Campus', 10, '2026-03-01 11:00:00', '2026-03-01 13:00:00', ST_GeomFromText('POINT(7.7200 48.5300)')),
(76, 8, 38, 'Café Théologique', 10, '2026-04-15 19:00:00', '2026-04-15 21:30:00', ST_GeomFromText('POINT(7.7200 48.5300)')),
(77, 9, 39, 'Culte Solidaire', 10, '2026-03-08 10:00:00', '2026-03-08 12:30:00', ST_GeomFromText('POINT(7.6840 48.5560)')),
(78, 9, 39, 'Action Caritative', 10, '2026-12-19 10:00:00', '2026-12-19 16:00:00', ST_GeomFromText('POINT(7.6840 48.5560)')),
(79, 10, 40, 'Culte Familial Hoenheim', 10, '2026-03-15 10:00:00', '2026-03-15 12:30:00', ST_GeomFromText('POINT(7.7550 48.6200)')),
(80, 10, 40, 'Brunch Communautaire', 10, '2026-06-07 11:00:00', '2026-06-07 14:00:00', ST_GeomFromText('POINT(7.7550 48.6200)')),

-- Lille (Églises 41-46)
(81, 1, 41, 'Culte Vieux-Lille', 10, '2026-02-08 10:30:00', '2026-02-08 12:30:00', ST_GeomFromText('POINT(3.0573 50.6292)')),
(82, 1, 41, 'Nuit de Prière', 10, '2026-11-07 21:00:00', '2026-11-08 06:00:00', ST_GeomFromText('POINT(3.0573 50.6292)')),
(83, 2, 42, 'Culte Quartier Fives', 10, '2026-02-15 10:00:00', '2026-02-15 12:30:00', ST_GeomFromText('POINT(3.0900 50.6300)')),
(84, 2, 42, 'Café Accueil', 10, '2026-09-12 15:00:00', '2026-09-12 18:00:00', ST_GeomFromText('POINT(3.0900 50.6300)')),
(85, 3, 43, 'Culte Multiculturel Roubaix', 10, '2026-02-22 10:00:00', '2026-02-22 12:30:00', ST_GeomFromText('POINT(3.1746 50.6942)')),
(86, 3, 43, 'Fête des Nations', 10, '2026-10-24 14:00:00', '2026-10-24 20:00:00', ST_GeomFromText('POINT(3.1746 50.6942)')),
(87, 4, 44, 'Culte Historique', 10, '2026-03-01 10:30:00', '2026-03-01 12:30:00', ST_GeomFromText('POINT(3.1611 50.7256)')),
(88, 4, 44, 'Journée Patrimoine Église', 10, '2026-09-20 10:00:00', '2026-09-20 18:00:00', ST_GeomFromText('POINT(3.1611 50.7256)')),
(89, 5, 45, 'Culte Étudiant', 10, '2026-03-08 11:00:00', '2026-03-08 13:00:00', ST_GeomFromText('POINT(3.1300 50.6300)')),
(90, 5, 45, 'Alpha Jeunes', 10, '2026-10-07 19:00:00', '2026-10-07 21:30:00', ST_GeomFromText('POINT(3.1300 50.6300)')),
(91, 6, 46, 'Culte Couples', 10, '2026-03-15 10:00:00', '2026-03-15 12:30:00', ST_GeomFromText('POINT(3.0970 50.6740)')),
(92, 6, 46, 'Week-end Couples', 10, '2026-11-14 18:00:00', '2026-11-15 17:00:00', ST_GeomFromText('POINT(3.0970 50.6740)')),

-- Toulouse (Églises 47-50)
(93, 7, 47, 'Culte Capitole', 10, '2026-02-08 10:00:00', '2026-02-08 12:30:00', ST_GeomFromText('POINT(1.4442 43.6047)')),
(94, 7, 47, 'Festival de Louange', 10, '2026-07-25 18:00:00', '2026-07-25 22:00:00', ST_GeomFromText('POINT(1.4442 43.6047)')),
(95, 8, 48, 'Culte Social Mirail', 10, '2026-02-15 10:00:00', '2026-02-15 12:30:00', ST_GeomFromText('POINT(1.3930 43.5800)')),
(96, 8, 48, 'Solidarité Quartier', 10, '2026-12-05 10:00:00', '2026-12-05 17:00:00', ST_GeomFromText('POINT(1.3930 43.5800)')),
(97, 9, 49, 'Culte International Blagnac', 10, '2026-02-22 10:30:00', '2026-02-22 12:30:00', ST_GeomFromText('POINT(1.3900 43.6370)')),
(98, 9, 49, 'Welcome Expats', 10, '2026-09-05 18:00:00', '2026-09-05 21:00:00', ST_GeomFromText('POINT(1.3900 43.6370)')),
(99, 10, 50, 'Culte Louange Colomiers', 10, '2026-03-01 10:00:00', '2026-03-01 12:30:00', ST_GeomFromText('POINT(1.3350 43.6110)')),
(100, 10, 50, 'École de Louange', 10, '2026-04-18 09:00:00', '2026-04-18 17:00:00', ST_GeomFromText('POINT(1.3350 43.6110)'));

-- ============================================================
-- 6. EVENT_DETAILS pour les événements 1-100
-- ============================================================

INSERT INTO event_details (event_id, description, max_seats, address, street_number, street_name, postal_code, city, speaker_name, has_parking, is_free) VALUES
-- Paris (events 1-20)
(1, 'Culte dominical avec louange, prédication et communion fraternelle. Bienvenue à tous!', 200, '15 Rue de Rivoli, 75001 Paris', '15', 'Rue de Rivoli', '75001', 'Paris', 'Pasteur Jean Dupont', 1, 1),
(2, 'Soirée de prière et intercession pour la ville de Paris et la France.', 100, '15 Rue de Rivoli, 75001 Paris', '15', 'Rue de Rivoli', '75001', 'Paris', 'Équipe Pastorale', 1, 1),
(3, 'Célébration de la résurrection de Jésus-Christ. Culte spécial avec chorale.', 300, '45 Avenue de la République, 75011 Paris', '45', 'Avenue de la République', '75011', 'Paris', 'Pasteur Marie Martin', 0, 1),
(4, 'Étude approfondie du livre des Actes des Apôtres.', 50, '45 Avenue de la République, 75011 Paris', '45', 'Avenue de la République', '75011', 'Paris', 'Pasteur Marie Martin', 0, 1),
(5, 'Culte spécial dédié à la louange et l''adoration.', 150, '78 Rue de Clichy, 75009 Paris', '78', 'Rue de Clichy', '75009', 'Paris', 'Pasteur Pierre Bernard', 1, 1),
(6, 'Soirée pour les jeunes de 15 à 25 ans avec jeux, louange et message.', 80, '78 Rue de Clichy, 75009 Paris', '78', 'Rue de Clichy', '75009', 'Paris', 'Leader Jeunesse Thomas', 1, 1),
(7, 'Culte hebdomadaire pour toute la famille.', 120, '23 Boulevard Voltaire, 75011 Paris', '23', 'Boulevard Voltaire', '75011', 'Paris', 'Pasteur Sophie Thomas', 0, 1),
(8, 'Prière matinale pour commencer la journée avec Dieu.', 40, '23 Boulevard Voltaire, 75011 Paris', '23', 'Boulevard Voltaire', '75011', 'Paris', 'Équipe de Prière', 0, 1),
(9, 'Célébration de la Pentecôte avec un culte festif.', 250, '12 Rue de Paris, 93100 Montreuil', '12', 'Rue de Paris', '93100', 'Montreuil', 'Pasteur David Petit', 1, 1),
(10, 'Conférence dédiée aux femmes avec témoignages et enseignements.', 150, '12 Rue de Paris, 93100 Montreuil', '12', 'Rue de Paris', '93100', 'Montreuil', 'Intervenante Rachel Cohen', 1, 1),
(11, 'Culte célébrant la diversité culturelle de notre communauté.', 180, '56 Avenue du Président Wilson, 93200 Saint-Denis', '56', 'Avenue du Président Wilson', '93200', 'Saint-Denis', 'Pasteur Sarah Robert', 1, 1),
(12, 'Formation intensive pour les leaders de l''église.', 60, '56 Avenue du Président Wilson, 93200 Saint-Denis', '56', 'Avenue du Président Wilson', '93200', 'Saint-Denis', 'Formateur Michel Leblanc', 1, 0),
(13, 'Culte centré sur la louange et l''adoration prolongée.', 200, '34 Avenue du Général de Gaulle, 94000 Créteil', '34', 'Avenue du Général de Gaulle', '94000', 'Créteil', 'Pasteur Paul Richard', 1, 1),
(14, 'Camp d''été pour les jeunes de 12 à 18 ans.', 100, '34 Avenue du Général de Gaulle, 94000 Créteil', '34', 'Avenue du Général de Gaulle', '94000', 'Créteil', 'Équipe Jeunesse', 1, 0),
(15, 'Culte dominical avec temps d''enseignement et de communion.', 100, '89 Route de la Reine, 92100 Boulogne', '89', 'Route de la Reine', '92100', 'Boulogne-Billancourt', 'Pasteur Claire Durand', 0, 1),
(16, 'Atelier pratique pour les couples mariés ou fiancés.', 30, '89 Route de la Reine, 92100 Boulogne', '89', 'Route de la Reine', '92100', 'Boulogne-Billancourt', 'Couple Durand', 0, 1),
(17, 'Culte de rentrée avec bénédiction des cartables.', 150, '67 Rue de la Paroisse, 78000 Versailles', '67', 'Rue de la Paroisse', '78000', 'Versailles', 'Pasteur Marc Leroy', 1, 1),
(18, 'Concert de Noël avec la chorale de l''église.', 200, '67 Rue de la Paroisse, 78000 Versailles', '67', 'Rue de la Paroisse', '78000', 'Versailles', 'Chorale de Versailles', 1, 1),
(19, 'Culte familial avec programme spécial pour les enfants.', 140, '21 Avenue Pablo Picasso, 92000 Nanterre', '21', 'Avenue Pablo Picasso', '92000', 'Nanterre', 'Pasteur Anne Moreau', 1, 1),
(20, 'Cérémonie de baptêmes par immersion.', 200, '21 Avenue Pablo Picasso, 92000 Nanterre', '21', 'Avenue Pablo Picasso', '92000', 'Nanterre', 'Pasteur Anne Moreau', 1, 1),

-- Lyon (events 21-32)
(21, 'Culte bilingue français-anglais pour notre communauté internationale.', 160, '45 Rue de la République, 69001 Lyon', '45', 'Rue de la République', '69001', 'Lyon', 'Pasteur Thomas Girard', 0, 1),
(22, 'Nuit entière de prière et d''intercession.', 80, '45 Rue de la République, 69001 Lyon', '45', 'Rue de la République', '69001', 'Lyon', 'Équipe de Prière', 0, 1),
(23, 'Célébration de Pâques avec la communauté lyonnaise.', 200, '23 Rue Garibaldi, 69003 Lyon', '23', 'Rue Garibaldi', '69003', 'Lyon', 'Pasteur Julie Bonnet', 1, 1),
(24, 'Soirée de partage biblique en petit groupe.', 20, '23 Rue Garibaldi, 69003 Lyon', '23', 'Rue Garibaldi', '69003', 'Lyon', 'Animateur GDM', 1, 1),
(25, 'Culte international avec traduction simultanée.', 180, '78 Cours Émile Zola, 69100 Villeurbanne', '78', 'Cours Émile Zola', '69100', 'Villeurbanne', 'Pasteur Antoine Roux', 1, 1),
(26, 'Journée d''accueil et d''aide aux réfugiés.', 100, '78 Cours Émile Zola, 69100 Villeurbanne', '78', 'Cours Émile Zola', '69100', 'Villeurbanne', 'Équipe Sociale', 1, 1),
(27, 'Culte dans notre nouveau bâtiment moderne.', 250, '12 Quai Perrache, 69002 Lyon', '12', 'Quai Perrache', '69002', 'Lyon', 'Pasteur Émilie Faure', 1, 1),
(28, 'Conférence dédiée aux hommes et pères de famille.', 100, '12 Quai Perrache, 69002 Lyon', '12', 'Quai Perrache', '69002', 'Lyon', 'Intervenant Jacques Martin', 1, 0),
(29, 'Culte avec programme spécial pour les enfants.', 120, '56 Avenue Paul Santy, 69008 Lyon', '56', 'Avenue Paul Santy', '69008', 'Lyon', 'Pasteur Lucas Mercier', 1, 1),
(30, 'Fête de fin d''année pour l''école du dimanche.', 150, '56 Avenue Paul Santy, 69008 Lyon', '56', 'Avenue Paul Santy', '69008', 'Lyon', 'Équipe Enfants', 1, 1),
(31, 'Culte avec un accent sur l''action sociale chrétienne.', 200, '34 Boulevard Laurent Bonnevay, 69200 Vénissieux', '34', 'Boulevard Laurent Bonnevay', '69200', 'Vénissieux', 'Pasteur Camille Blanc', 1, 1),
(32, 'Distribution de colis alimentaires aux familles dans le besoin.', 300, '34 Boulevard Laurent Bonnevay, 69200 Vénissieux', '34', 'Boulevard Laurent Bonnevay', '69200', 'Vénissieux', 'Équipe Diaconie', 1, 1),

-- Marseille (events 33-44)
(33, 'Culte au coeur de Marseille sur la Canebière.', 150, '67 La Canebière, 13001 Marseille', '67', 'La Canebière', '13001', 'Marseille', 'Pasteur Romain Lopez', 0, 1),
(34, 'Évangélisation de rue près du Vieux-Port.', 50, '67 La Canebière, 13001 Marseille', '67', 'La Canebière', '13001', 'Marseille', 'Équipe Évangélisation', 0, 1),
(35, 'Culte dans les quartiers Nord avec la communauté locale.', 120, '89 Boulevard de Paris, 13003 Marseille', '89', 'Boulevard de Paris', '13003', 'Marseille', 'Pasteur Léa Garcia', 1, 1),
(36, 'Journée d''action sociale : aide aux devoirs et cours de français.', 80, '89 Boulevard de Paris, 13003 Marseille', '89', 'Boulevard de Paris', '13003', 'Marseille', 'Équipe Sociale', 1, 1),
(37, 'Culte dominical dans notre belle église de La Valentine.', 200, '12 Avenue de la Valbarelle, 13011 Marseille', '12', 'Avenue de la Valbarelle', '13011', 'Marseille', 'Pasteur Hugo Fernandez', 1, 1),
(38, 'Pique-nique annuel de l''église en plein air.', 300, '12 Avenue de la Valbarelle, 13011 Marseille', '12', 'Avenue de la Valbarelle', '13011', 'Marseille', 'Toute l''Église', 1, 1),
(39, 'Culte avec un accent sur la musique et la louange.', 180, '45 Avenue du Prado, 13008 Marseille', '45', 'Avenue du Prado', '13008', 'Marseille', 'Pasteur Manon Rodriguez', 0, 1),
(40, 'Concert de gospel avec chorale invitée.', 250, '45 Avenue du Prado, 13008 Marseille', '45', 'Avenue du Prado', '13008', 'Marseille', 'Gospel Choir Marseille', 0, 1),
(41, 'Culte spécialement conçu pour les étudiants.', 100, '23 Cours Mirabeau, 13100 Aix-en-Provence', '23', 'Cours Mirabeau', '13100', 'Aix-en-Provence', 'Pasteur Théo Martinez', 1, 1),
(42, 'Soirée d''accueil pour les nouveaux étudiants.', 150, '23 Cours Mirabeau, 13100 Aix-en-Provence', '23', 'Cours Mirabeau', '13100', 'Aix-en-Provence', 'Équipe GBU', 1, 1),
(43, 'Culte chaleureux de notre communauté d''Aubagne.', 100, '56 Avenue de Verdun, 13400 Aubagne', '56', 'Avenue de Verdun', '13400', 'Aubagne', 'Pasteur Emma Gonzalez', 1, 1),
(44, 'Journée portes ouvertes pour découvrir notre église.', 150, '56 Avenue de Verdun, 13400 Aubagne', '56', 'Avenue de Verdun', '13400', 'Aubagne', 'Toute l''Équipe', 1, 1),

-- Bordeaux (events 45-56)
(45, 'Culte en plein centre-ville de Bordeaux.', 120, '78 Rue Sainte-Catherine, 33000 Bordeaux', '78', 'Rue Sainte-Catherine', '33000', 'Bordeaux', 'Pasteur Nathan Dubois', 0, 1),
(46, 'Marche de témoignage dans les rues de Bordeaux.', 200, '78 Rue Sainte-Catherine, 33000 Bordeaux', '78', 'Rue Sainte-Catherine', '33000', 'Bordeaux', 'Toutes les Églises', 0, 1),
(47, 'Culte d''ouverture de la convention annuelle.', 400, '34 Avenue des 40 Journaux, 33300 Bordeaux', '34', 'Avenue des 40 Journaux', '33300', 'Bordeaux', 'Pasteur Chloé Lambert', 1, 1),
(48, 'Convention régionale avec orateurs nationaux.', 500, '34 Avenue des 40 Journaux, 33300 Bordeaux', '34', 'Avenue des 40 Journaux', '33300', 'Bordeaux', 'Pasteur National', 1, 0),
(49, 'Culte international avec notre communauté diverse.', 150, '12 Avenue de la Libération, 33700 Mérignac', '12', 'Avenue de la Libération', '33700', 'Mérignac', 'Pasteur Gabriel Michel', 1, 1),
(50, 'Soirée multiculturelle avec repas partagé.', 200, '12 Avenue de la Libération, 33700 Mérignac', '12', 'Avenue de la Libération', '33700', 'Mérignac', 'Communauté Internationale', 1, 1),
(51, 'Culte universitaire pour étudiants et jeunes actifs.', 80, '56 Avenue Pasteur, 33600 Pessac', '56', 'Avenue Pasteur', '33600', 'Pessac', 'Pasteur Inès Lefebvre', 1, 1),
(52, 'Retraite spirituelle pour les étudiants.', 50, '56 Avenue Pasteur, 33600 Pessac', '56', 'Avenue Pasteur', '33600', 'Pessac', 'Aumônier Campus', 1, 0),
(53, 'Culte familial avec garderie et activités jeunesse.', 140, '89 Cours de la Libération, 33400 Talence', '89', 'Cours de la Libération', '33400', 'Talence', 'Pasteur Louis Leroy', 0, 1),
(54, 'Camp d''été pour les adolescents.', 60, '89 Cours de la Libération, 33400 Talence', '89', 'Cours de la Libération', '33400', 'Talence', 'Équipe Jeunesse', 0, 0),
(55, 'Culte avec la communauté de la rive droite.', 100, '23 Avenue Jean Jaurès, 33150 Cenon', '23', 'Avenue Jean Jaurès', '33150', 'Cenon', 'Pasteur Jade Moreau', 1, 1),
(56, 'Fête de quartier organisée par l''église.', 200, '23 Avenue Jean Jaurès, 33150 Cenon', '23', 'Avenue Jean Jaurès', '33150', 'Cenon', 'Équipe de Quartier', 1, 1),

-- Nantes (events 57-68)
(57, 'Culte au coeur de Nantes.', 130, '45 Rue Crébillon, 44000 Nantes', '45', 'Rue Crébillon', '44000', 'Nantes', 'Pasteur Raphaël Simon', 0, 1),
(58, 'Soirée spéciale de louange et d''adoration.', 150, '45 Rue Crébillon, 44000 Nantes', '45', 'Rue Crébillon', '44000', 'Nantes', 'Groupe de Louange', 0, 1),
(59, 'Culte dominical au Nord de Nantes.', 100, '67 Boulevard des Américains, 44000 Nantes', '67', 'Boulevard des Américains', '44000', 'Nantes', 'Pasteur Louise Laurent', 1, 1),
(60, 'Soirée de partage et d''édification mutuelle.', 25, '67 Boulevard des Américains, 44000 Nantes', '67', 'Boulevard des Américains', '44000', 'Nantes', 'Animateur de Groupe', 1, 1),
(61, 'Culte accessible à tous dans notre grand bâtiment.', 200, '12 Boulevard de la Fraternité, 44800 Saint-Herblain', '12', 'Boulevard de la Fraternité', '44800', 'Saint-Herblain', 'Pasteur Arthur Morel', 1, 1),
(62, 'Journée de sensibilisation au handicap.', 150, '12 Boulevard de la Fraternité, 44800 Saint-Herblain', '12', 'Boulevard de la Fraternité', '44800', 'Saint-Herblain', 'Association Handicap', 1, 1),
(63, 'Culte dynamique pour les jeunes.', 100, '34 Rue Alsace-Lorraine, 44400 Rezé', '34', 'Rue Alsace-Lorraine', '44400', 'Rezé', 'Pasteur Zoé Fournier', 1, 1),
(64, 'Grande soirée jeunesse avec concert live.', 150, '34 Rue Alsace-Lorraine, 44400 Rezé', '34', 'Rue Alsace-Lorraine', '44400', 'Rezé', 'Band Worship', 1, 1),
(65, 'Culte familial avec programme pour tous les âges.', 160, '78 Route de Vannes, 44700 Orvault', '78', 'Route de Vannes', '44700', 'Orvault', 'Pasteur Adam Giraud', 1, 1),
(66, 'Fête annuelle pour les enfants de l''église.', 200, '78 Route de Vannes, 44700 Orvault', '78', 'Route de Vannes', '44700', 'Orvault', 'Équipe Enfants', 1, 1),
(67, 'Culte en pleine nature dans notre cadre verdoyant.', 120, '56 Boulevard de la Loire, 44470 Carquefou', '56', 'Boulevard de la Loire', '44470', 'Carquefou', 'Pasteur Alice Rousseau', 1, 1),
(68, 'Week-end de retraite spirituelle.', 50, '56 Boulevard de la Loire, 44470 Carquefou', '56', 'Boulevard de la Loire', '44470', 'Carquefou', 'Pasteur Alice Rousseau', 1, 0),

-- Strasbourg (events 69-80)
(69, 'Culte au coeur de Strasbourg.', 140, '89 Grand''Rue, 67000 Strasbourg', '89', 'Grand''Rue', '67000', 'Strasbourg', 'Pasteur Jules Vincent', 0, 1),
(70, 'Marché de Noël chrétien avec stands et animations.', 300, '89 Grand''Rue, 67000 Strasbourg', '89', 'Grand''Rue', '67000', 'Strasbourg', 'Équipe Organisation', 0, 1),
(71, 'Culte bilingue français-allemand.', 100, '12 Rue du Rhin, 67100 Strasbourg', '12', 'Rue du Rhin', '67100', 'Strasbourg', 'Pasteur Lina Nicolas', 1, 1),
(72, 'Échange culturel et spirituel franco-allemand.', 80, '12 Rue du Rhin, 67100 Strasbourg', '12', 'Rue du Rhin', '67100', 'Strasbourg', 'Délégation Allemande', 1, 1),
(73, 'Culte dynamique de Schiltigheim.', 160, '45 Route de Bischwiller, 67300 Schiltigheim', '45', 'Route de Bischwiller', '67300', 'Schiltigheim', 'Pasteur Léo Masson', 1, 1),
(74, 'Semaine de vacances bibliques pour les enfants.', 100, '45 Route de Bischwiller, 67300 Schiltigheim', '45', 'Route de Bischwiller', '67300', 'Schiltigheim', 'Équipe Moniteurs', 1, 1),
(75, 'Culte près du campus universitaire.', 90, '23 Route de Lyon, 67400 Illkirch', '23', 'Route de Lyon', '67400', 'Illkirch-Graffenstaden', 'Pasteur Eva André', 1, 1),
(76, 'Discussion ouverte sur la foi et la science.', 50, '23 Route de Lyon, 67400 Illkirch', '23', 'Route de Lyon', '67400', 'Illkirch-Graffenstaden', 'Prof. Martin', 1, 1),
(77, 'Culte avec accent sur l''entraide et la solidarité.', 100, '67 Rue de la Division Leclerc, 67380 Lingolsheim', '67', 'Rue de la Division Leclerc', '67380', 'Lingolsheim', 'Pasteur Noah Lemaire', 1, 1),
(78, 'Distribution de colis de Noël aux plus démunis.', 200, '67 Rue de la Division Leclerc, 67380 Lingolsheim', '67', 'Rue de la Division Leclerc', '67380', 'Lingolsheim', 'Équipe Caritative', 1, 1),
(79, 'Culte familial chaleureux.', 120, '34 Rue de la République, 67800 Hoenheim', '34', 'Rue de la République', '67800', 'Hoenheim', 'Pasteur Rose Fontaine', 1, 1),
(80, 'Brunch convivial après le culte.', 80, '34 Rue de la République, 67800 Hoenheim', '34', 'Rue de la République', '67800', 'Hoenheim', 'Équipe Accueil', 1, 1),

-- Lille (events 81-92)
(81, 'Culte dans le Vieux-Lille historique.', 130, '56 Rue Faidherbe, 59000 Lille', '56', 'Rue Faidherbe', '59000', 'Lille', 'Pasteur Maxime Chevalier', 0, 1),
(82, 'Nuit de prière pour la ville et la région.', 100, '56 Rue Faidherbe, 59000 Lille', '56', 'Rue Faidherbe', '59000', 'Lille', 'Équipe de Prière', 0, 1),
(83, 'Culte de quartier à Fives.', 80, '78 Rue Pierre Legrand, 59800 Lille', '78', 'Rue Pierre Legrand', '59800', 'Lille', 'Pasteur Lucie Renard', 1, 1),
(84, 'Café-accueil pour les habitants du quartier.', 50, '78 Rue Pierre Legrand, 59800 Lille', '78', 'Rue Pierre Legrand', '59800', 'Lille', 'Équipe Accueil', 1, 1),
(85, 'Culte multiculturel avec différentes communautés.', 200, '12 Grande Rue, 59100 Roubaix', '12', 'Grande Rue', '59100', 'Roubaix', 'Pasteur Sacha Picard', 1, 1),
(86, 'Fête célébrant la diversité des nations.', 300, '12 Grande Rue, 59100 Roubaix', '12', 'Grande Rue', '59100', 'Roubaix', 'Toutes les Communautés', 1, 1),
(87, 'Culte dans notre église historique.', 150, '34 Rue de Gand, 59200 Tourcoing', '34', 'Rue de Gand', '59200', 'Tourcoing', 'Pasteur Margot Carpentier', 1, 1),
(88, 'Visite de l''église pour les journées du patrimoine.', 200, '34 Rue de Gand, 59200 Tourcoing', '34', 'Rue de Gand', '59200', 'Tourcoing', 'Guide Bénévole', 1, 1),
(89, 'Culte étudiant près de l''université.', 100, '89 Boulevard de Tournai, 59650 Villeneuve-d''Ascq', '89', 'Boulevard de Tournai', '59650', 'Villeneuve-d''Ascq', 'Pasteur Ethan Poirier', 1, 1),
(90, 'Parcours Alpha pour les jeunes.', 30, '89 Boulevard de Tournai, 59650 Villeneuve-d''Ascq', '89', 'Boulevard de Tournai', '59650', 'Villeneuve-d''Ascq', 'Équipe Alpha', 1, 1),
(91, 'Culte avec thème spécial pour les couples.', 120, '23 Avenue Foch, 59700 Marcq-en-Baroeul', '23', 'Avenue Foch', '59700', 'Marcq-en-Baroeul', 'Pasteur Anna Blanchard', 1, 1),
(92, 'Week-end de ressourcement pour couples.', 40, '23 Avenue Foch, 59700 Marcq-en-Baroeul', '23', 'Avenue Foch', '59700', 'Marcq-en-Baroeul', 'Couple Animateur', 1, 0),

-- Toulouse (events 93-100)
(93, 'Culte près de la place du Capitole.', 140, '45 Rue du Taur, 31000 Toulouse', '45', 'Rue du Taur', '31000', 'Toulouse', 'Pasteur Tom Gautier', 0, 1),
(94, 'Festival de louange en plein air.', 400, '45 Rue du Taur, 31000 Toulouse', '45', 'Rue du Taur', '31000', 'Toulouse', 'Groupes de Louange', 0, 1),
(95, 'Culte avec engagement social au Mirail.', 120, '67 Avenue de Muret, 31100 Toulouse', '67', 'Avenue de Muret', '31100', 'Toulouse', 'Pasteur Lola Perrin', 1, 1),
(96, 'Journée de solidarité dans le quartier.', 150, '67 Avenue de Muret, 31100 Toulouse', '67', 'Avenue de Muret', '31100', 'Toulouse', 'Équipe Sociale', 1, 1),
(97, 'Culte international près de l''aéroport.', 150, '12 Place du Général de Gaulle, 31700 Blagnac', '12', 'Place du Général de Gaulle', '31700', 'Blagnac', 'Pasteur Mathis Robin', 1, 1),
(98, 'Soirée d''accueil pour expatriés et nouveaux arrivants.', 100, '12 Place du Général de Gaulle, 31700 Blagnac', '12', 'Place du Général de Gaulle', '31700', 'Blagnac', 'Équipe Accueil', 1, 1),
(99, 'Culte avec louange contemporaine.', 180, '34 Allée du Ramassier, 31770 Colomiers', '34', 'Allée du Ramassier', '31770', 'Colomiers', 'Pasteur Mia Henry', 1, 1),
(100, 'Formation à la louange et à la musique.', 60, '34 Allée du Ramassier, 31770 Colomiers', '34', 'Allée du Ramassier', '31770', 'Colomiers', 'Directeur Musical', 1, 1);

-- ============================================================
-- 7. CHURCH_SCHEDULES pour les églises 1-50
-- Activity Types: 1=Culte, 2=Jeunesse, 3=Prière, 4=Étude Biblique
-- ============================================================

INSERT INTO church_schedules (church_id, activity_type_id, day_of_week, start_time) VALUES
-- Église 1 - Impact Centre Chrétien Paris
(1, 1, 'SUNDAY', '10:00:00'),
(1, 3, 'WEDNESDAY', '19:30:00'),
(1, 4, 'THURSDAY', '19:00:00'),
(1, 2, 'SATURDAY', '15:00:00'),

-- Église 2 - ADD Paris Nation
(2, 1, 'SUNDAY', '10:00:00'),
(2, 1, 'SUNDAY', '15:00:00'),
(2, 3, 'TUESDAY', '19:00:00'),
(2, 4, 'FRIDAY', '19:30:00'),

-- Église 3 - Église de la Victoire Paris
(3, 1, 'SUNDAY', '10:30:00'),
(3, 3, 'WEDNESDAY', '19:00:00'),
(3, 2, 'SATURDAY', '14:00:00'),

-- Église 4 - Le Rocher Paris Est
(4, 1, 'SUNDAY', '10:00:00'),
(4, 3, 'MONDAY', '06:00:00'),
(4, 3, 'FRIDAY', '19:30:00'),
(4, 4, 'TUESDAY', '20:00:00'),

-- Église 5 - Porte de l'Espoir Montreuil
(5, 1, 'SUNDAY', '09:30:00'),
(5, 1, 'SUNDAY', '11:30:00'),
(5, 3, 'WEDNESDAY', '19:00:00'),
(5, 2, 'SATURDAY', '16:00:00'),

-- Église 6 - Source de Vie Saint-Denis
(6, 1, 'SUNDAY', '10:00:00'),
(6, 3, 'THURSDAY', '19:30:00'),
(6, 4, 'SATURDAY', '10:00:00'),

-- Église 7 - Impact Centre Chrétien Créteil
(7, 1, 'SUNDAY', '10:00:00'),
(7, 3, 'TUESDAY', '19:00:00'),
(7, 4, 'WEDNESDAY', '19:30:00'),
(7, 2, 'FRIDAY', '19:00:00'),

-- Église 8 - ADD Boulogne
(8, 1, 'SUNDAY', '10:30:00'),
(8, 3, 'WEDNESDAY', '12:30:00'),
(8, 4, 'THURSDAY', '20:00:00'),

-- Église 9 - Église de la Victoire Versailles
(9, 1, 'SUNDAY', '10:00:00'),
(9, 3, 'FRIDAY', '19:00:00'),
(9, 2, 'SATURDAY', '15:00:00'),

-- Église 10 - Le Rocher Nanterre
(10, 1, 'SUNDAY', '10:00:00'),
(10, 1, 'SUNDAY', '18:00:00'),
(10, 3, 'WEDNESDAY', '19:30:00'),
(10, 4, 'TUESDAY', '19:30:00'),

-- Église 11 - Porte de l'Espoir Lyon Centre
(11, 1, 'SUNDAY', '10:30:00'),
(11, 3, 'THURSDAY', '19:00:00'),
(11, 4, 'WEDNESDAY', '19:30:00'),

-- Église 12 - Source de Vie Lyon Part-Dieu
(12, 1, 'SUNDAY', '10:00:00'),
(12, 3, 'TUESDAY', '19:30:00'),
(12, 2, 'SATURDAY', '14:30:00'),

-- Église 13 - Impact Centre Chrétien Villeurbanne
(13, 1, 'SUNDAY', '10:00:00'),
(13, 1, 'SUNDAY', '15:00:00'),
(13, 3, 'WEDNESDAY', '19:00:00'),
(13, 4, 'FRIDAY', '19:30:00'),
(13, 2, 'SATURDAY', '16:00:00'),

-- Église 14 - ADD Lyon Confluence
(14, 1, 'SUNDAY', '10:30:00'),
(14, 3, 'MONDAY', '19:00:00'),
(14, 4, 'THURSDAY', '19:30:00'),

-- Église 15 - Église de la Victoire Lyon 8
(15, 1, 'SUNDAY', '10:00:00'),
(15, 3, 'WEDNESDAY', '19:30:00'),
(15, 2, 'SATURDAY', '15:00:00'),

-- Église 16 - Le Rocher Vénissieux
(16, 1, 'SUNDAY', '09:30:00'),
(16, 1, 'SUNDAY', '11:30:00'),
(16, 3, 'FRIDAY', '19:00:00'),
(16, 4, 'TUESDAY', '19:30:00'),

-- Église 17 - Porte de l'Espoir Marseille Centre
(17, 1, 'SUNDAY', '10:00:00'),
(17, 3, 'WEDNESDAY', '19:00:00'),
(17, 4, 'THURSDAY', '19:30:00'),

-- Église 18 - Source de Vie Marseille Nord
(18, 1, 'SUNDAY', '10:00:00'),
(18, 3, 'TUESDAY', '19:30:00'),
(18, 2, 'SATURDAY', '14:00:00'),

-- Église 19 - Impact Centre Chrétien La Valentine
(19, 1, 'SUNDAY', '10:30:00'),
(19, 3, 'FRIDAY', '19:00:00'),
(19, 4, 'WEDNESDAY', '19:30:00'),
(19, 2, 'SATURDAY', '15:30:00'),

-- Église 20 - ADD Marseille Prado
(20, 1, 'SUNDAY', '10:00:00'),
(20, 1, 'SUNDAY', '18:00:00'),
(20, 3, 'THURSDAY', '19:30:00'),

-- Église 21 - Église de la Victoire Aix-en-Provence
(21, 1, 'SUNDAY', '10:30:00'),
(21, 3, 'WEDNESDAY', '19:00:00'),
(21, 4, 'TUESDAY', '20:00:00'),
(21, 2, 'FRIDAY', '19:00:00'),

-- Église 22 - Le Rocher Aubagne
(22, 1, 'SUNDAY', '10:00:00'),
(22, 3, 'THURSDAY', '19:30:00'),
(22, 2, 'SATURDAY', '15:00:00'),

-- Église 23 - Porte de l'Espoir Bordeaux Centre
(23, 1, 'SUNDAY', '10:30:00'),
(23, 3, 'WEDNESDAY', '19:00:00'),
(23, 4, 'FRIDAY', '19:30:00'),

-- Église 24 - Source de Vie Bordeaux Lac
(24, 1, 'SUNDAY', '10:00:00'),
(24, 1, 'SUNDAY', '15:00:00'),
(24, 3, 'TUESDAY', '19:30:00'),
(24, 4, 'THURSDAY', '19:00:00'),
(24, 2, 'SATURDAY', '14:30:00'),

-- Église 25 - Impact Centre Chrétien Mérignac
(25, 1, 'SUNDAY', '10:00:00'),
(25, 3, 'WEDNESDAY', '19:30:00'),
(25, 4, 'MONDAY', '19:00:00'),

-- Église 26 - ADD Pessac
(26, 1, 'SUNDAY', '10:30:00'),
(26, 3, 'FRIDAY', '19:00:00'),
(26, 2, 'SATURDAY', '16:00:00'),

-- Église 27 - Église de la Victoire Talence
(27, 1, 'SUNDAY', '10:00:00'),
(27, 3, 'THURSDAY', '19:30:00'),
(27, 4, 'TUESDAY', '19:30:00'),

-- Église 28 - Le Rocher Cenon
(28, 1, 'SUNDAY', '10:00:00'),
(28, 3, 'WEDNESDAY', '19:00:00'),
(28, 2, 'SATURDAY', '15:00:00'),

-- Église 29 - Porte de l'Espoir Nantes Centre
(29, 1, 'SUNDAY', '10:30:00'),
(29, 3, 'TUESDAY', '19:30:00'),
(29, 4, 'THURSDAY', '19:00:00'),

-- Église 30 - Source de Vie Nantes Nord
(30, 1, 'SUNDAY', '10:00:00'),
(30, 3, 'WEDNESDAY', '19:00:00'),
(30, 2, 'FRIDAY', '19:30:00'),

-- Église 31 - Impact Centre Chrétien Saint-Herblain
(31, 1, 'SUNDAY', '09:30:00'),
(31, 1, 'SUNDAY', '11:30:00'),
(31, 3, 'MONDAY', '19:00:00'),
(31, 4, 'WEDNESDAY', '19:30:00'),
(31, 2, 'SATURDAY', '14:00:00'),

-- Église 32 - ADD Rezé
(32, 1, 'SUNDAY', '10:30:00'),
(32, 3, 'THURSDAY', '19:30:00'),
(32, 2, 'SATURDAY', '15:30:00'),

-- Église 33 - Église de la Victoire Orvault
(33, 1, 'SUNDAY', '10:00:00'),
(33, 3, 'WEDNESDAY', '19:00:00'),
(33, 4, 'FRIDAY', '19:30:00'),

-- Église 34 - Le Rocher Carquefou
(34, 1, 'SUNDAY', '10:00:00'),
(34, 3, 'TUESDAY', '19:30:00'),
(34, 2, 'SATURDAY', '15:00:00'),

-- Église 35 - Porte de l'Espoir Strasbourg Centre
(35, 1, 'SUNDAY', '10:30:00'),
(35, 3, 'WEDNESDAY', '19:00:00'),
(35, 4, 'THURSDAY', '19:30:00'),

-- Église 36 - Source de Vie Strasbourg Neudorf
(36, 1, 'SUNDAY', '10:00:00'),
(36, 3, 'FRIDAY', '19:00:00'),
(36, 4, 'TUESDAY', '19:30:00'),

-- Église 37 - Impact Centre Chrétien Schiltigheim
(37, 1, 'SUNDAY', '10:00:00'),
(37, 1, 'SUNDAY', '15:00:00'),
(37, 3, 'WEDNESDAY', '19:30:00'),
(37, 2, 'SATURDAY', '14:30:00'),

-- Église 38 - ADD Illkirch
(38, 1, 'SUNDAY', '10:30:00'),
(38, 3, 'THURSDAY', '19:00:00'),
(38, 4, 'MONDAY', '19:30:00'),

-- Église 39 - Église de la Victoire Lingolsheim
(39, 1, 'SUNDAY', '10:00:00'),
(39, 3, 'TUESDAY', '19:30:00'),
(39, 2, 'SATURDAY', '16:00:00'),

-- Église 40 - Le Rocher Hoenheim
(40, 1, 'SUNDAY', '10:00:00'),
(40, 3, 'WEDNESDAY', '19:00:00'),
(40, 4, 'FRIDAY', '19:30:00'),

-- Église 41 - Porte de l'Espoir Lille Centre
(41, 1, 'SUNDAY', '10:30:00'),
(41, 3, 'THURSDAY', '19:30:00'),
(41, 4, 'TUESDAY', '19:00:00'),

-- Église 42 - Source de Vie Lille Fives
(42, 1, 'SUNDAY', '10:00:00'),
(42, 3, 'WEDNESDAY', '19:00:00'),
(42, 2, 'SATURDAY', '15:00:00'),

-- Église 43 - Impact Centre Chrétien Roubaix
(43, 1, 'SUNDAY', '09:30:00'),
(43, 1, 'SUNDAY', '11:30:00'),
(43, 3, 'FRIDAY', '19:30:00'),
(43, 4, 'WEDNESDAY', '19:00:00'),
(43, 2, 'SATURDAY', '14:00:00'),

-- Église 44 - ADD Tourcoing
(44, 1, 'SUNDAY', '10:30:00'),
(44, 3, 'TUESDAY', '19:30:00'),
(44, 4, 'THURSDAY', '19:30:00'),

-- Église 45 - Église de la Victoire Villeneuve-d'Ascq
(45, 1, 'SUNDAY', '10:00:00'),
(45, 3, 'WEDNESDAY', '19:00:00'),
(45, 2, 'FRIDAY', '19:30:00'),
(45, 4, 'MONDAY', '19:00:00'),

-- Église 46 - Le Rocher Marcq-en-Baroeul
(46, 1, 'SUNDAY', '10:00:00'),
(46, 3, 'THURSDAY', '19:30:00'),
(46, 2, 'SATURDAY', '15:30:00'),

-- Église 47 - Porte de l'Espoir Toulouse Centre
(47, 1, 'SUNDAY', '10:30:00'),
(47, 3, 'WEDNESDAY', '19:00:00'),
(47, 4, 'FRIDAY', '19:30:00'),

-- Église 48 - Source de Vie Toulouse Mirail
(48, 1, 'SUNDAY', '10:00:00'),
(48, 3, 'TUESDAY', '19:30:00'),
(48, 2, 'SATURDAY', '14:30:00'),

-- Église 49 - Impact Centre Chrétien Blagnac
(49, 1, 'SUNDAY', '10:00:00'),
(49, 1, 'SUNDAY', '18:00:00'),
(49, 3, 'THURSDAY', '19:00:00'),
(49, 4, 'WEDNESDAY', '19:30:00'),
(49, 2, 'SATURDAY', '15:00:00'),

-- Église 50 - ADD Colomiers
(50, 1, 'SUNDAY', '10:30:00'),
(50, 3, 'FRIDAY', '19:30:00'),
(50, 4, 'TUESDAY', '19:00:00'),
(50, 2, 'SATURDAY', '16:00:00');

-- ============================================================
-- FIN DU BLOC 1 (Églises 1-50 terminées)
-- Demandez le bloc suivant pour les églises 51-550
-- ============================================================

SET FOREIGN_KEY_CHECKS = 1;

-- Vérification
SELECT 'Données insérées avec succès!' AS Status;
SELECT COUNT(*) AS 'Admins' FROM admins;
SELECT COUNT(*) AS 'Églises' FROM churches;
SELECT COUNT(*) AS 'Church Details' FROM church_details;
SELECT COUNT(*) AS 'Events' FROM events;
SELECT COUNT(*) AS 'Event Details' FROM event_details;
