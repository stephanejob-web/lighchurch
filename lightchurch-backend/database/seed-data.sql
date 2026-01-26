-- ============================================
-- SEED DATA - 1000 Eglises en France + Events
-- ============================================

SET FOREIGN_KEY_CHECKS = 0;

-- Vider les tables existantes (optionnel - décommenter si besoin)
-- TRUNCATE TABLE event_details;
-- TRUNCATE TABLE events;
-- TRUNCATE TABLE church_schedules;
-- TRUNCATE TABLE church_socials;
-- TRUNCATE TABLE church_details;
-- TRUNCATE TABLE churches;
-- TRUNCATE TABLE admins;
-- TRUNCATE TABLE denominations;
-- TRUNCATE TABLE church_unions;
-- TRUNCATE TABLE activity_types;
-- TRUNCATE TABLE languages;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- 1. LANGUAGES (Données de référence)
-- ============================================
INSERT IGNORE INTO languages (id, code, name_native, name_fr, flag_emoji, is_active, display_order) VALUES
(1, 'fr', 'Français', 'Français', '🇫🇷', 1, 1),
(2, 'en', 'English', 'Anglais', '🇬🇧', 1, 2),
(3, 'es', 'Español', 'Espagnol', '🇪🇸', 1, 3),
(4, 'pt', 'Português', 'Portugais', '🇵🇹', 1, 4),
(5, 'de', 'Deutsch', 'Allemand', '🇩🇪', 1, 5),
(6, 'it', 'Italiano', 'Italien', '🇮🇹', 1, 6),
(7, 'ar', 'العربية', 'Arabe', '🇸🇦', 1, 7),
(8, 'zh', '中文', 'Chinois', '🇨🇳', 1, 8),
(9, 'ln', 'Lingála', 'Lingala', '🇨🇩', 1, 9),
(10, 'fr', 'Français', 'Français', '🇫🇷', 1, 10);

-- ============================================
-- 2. CHURCH UNIONS (Fédérations)
-- ============================================
INSERT IGNORE INTO church_unions (id, name, abbreviation, website, is_active) VALUES
(1, 'Fédération Protestante de France', 'FPF', 'https://www.protestants.org', 1),
(2, 'Conseil National des Évangéliques de France', 'CNEF', 'https://www.lecnef.org', 1),
(3, 'Assemblées de Dieu de France', 'ADD', 'https://www.add-france.org', 1),
(4, 'Fédération des Églises Évangéliques Baptistes', 'FEEBF', 'https://www.feebf.com', 1),
(5, 'Union des Églises Évangéliques Libres', 'UEEL', 'https://www.ueel.org', 1),
(6, 'Mission Évangélique Tzigane', 'MET', 'https://www.vie-et-lumiere.org', 1),
(7, 'Églises Indépendantes', NULL, NULL, 1);

-- ============================================
-- 3. DENOMINATIONS (Dénominations)
-- ============================================
INSERT IGNORE INTO denominations (id, union_id, name, abbreviation, is_active) VALUES
(1, 1, 'Église Réformée', 'ERF', 1),
(2, 1, 'Église Luthérienne', 'ELF', 1),
(3, 2, 'Église Évangélique', 'EE', 1),
(4, 3, 'Assemblée de Dieu', 'ADD', 1),
(5, 4, 'Église Baptiste', 'EB', 1),
(6, 5, 'Église Libre', 'EL', 1),
(7, 2, 'Église Pentecôtiste', 'EP', 1),
(8, 6, 'Église Tzigane', 'ET', 1),
(9, 7, 'Église Charismatique', 'EC', 1),
(10, 7, 'Église Non-Dénominationnelle', 'END', 1),
(11, 2, 'Église Mennonite', 'EM', 1),
(12, 2, 'Église Méthodiste', 'EME', 1);

-- ============================================
-- 4. ACTIVITY TYPES (Types d'activités)
-- ============================================
INSERT IGNORE INTO activity_types (id, name, label_fr, icon) VALUES
(1, 'WORSHIP', 'Culte', 'church'),
(2, 'PRAYER', 'Réunion de prière', 'hands-praying'),
(3, 'BIBLE_STUDY', 'Étude biblique', 'book-open'),
(4, 'YOUTH', 'Groupe de jeunes', 'users'),
(5, 'KIDS', 'École du dimanche', 'child'),
(6, 'WOMEN', 'Groupe de femmes', 'female'),
(7, 'MEN', 'Groupe d''hommes', 'male'),
(8, 'CHOIR', 'Chorale', 'music'),
(9, 'EVANGELISM', 'Évangélisation', 'bullhorn'),
(10, 'COMMUNION', 'Sainte Cène', 'wine-glass');

-- ============================================
-- 5. ADMINS (1000 Pasteurs)
-- ============================================
-- Mot de passe hashé pour tous: "Password123!" (bcrypt)
-- $2b$10$rQZ5T8YjHvMvQPz6Y.fHYeXwQzYYvYxQzYYvYxQzYYvYxQzYYvYx

DROP PROCEDURE IF EXISTS generate_admins;
DELIMITER //
CREATE PROCEDURE generate_admins()
BEGIN
    DECLARE i INT DEFAULT 1;
    DECLARE first_names VARCHAR(1000) DEFAULT 'Jean,Pierre,Paul,Jacques,Philippe,André,Michel,François,David,Samuel,Daniel,Joseph,Emmanuel,Marc,Luc,Matthieu,Thomas,Simon,Benjamin,Nathan,Étienne,Josué,Caleb,Isaac,Abraham,Moïse,Élie,Jérémie,Ézéchiel,Jonas';
    DECLARE last_names VARCHAR(1000) DEFAULT 'Martin,Bernard,Dubois,Thomas,Robert,Richard,Petit,Durand,Leroy,Moreau,Simon,Laurent,Lefebvre,Michel,Garcia,David,Bertrand,Roux,Vincent,Fournier,Morel,Girard,André,Mercier,Dupont,Lambert,Bonnet,François,Martinez,Legrand';
    DECLARE fn VARCHAR(50);
    DECLARE ln VARCHAR(50);

    WHILE i <= 1000 DO
        SET fn = SUBSTRING_INDEX(SUBSTRING_INDEX(first_names, ',', 1 + (i % 30)), ',', -1);
        SET ln = SUBSTRING_INDEX(SUBSTRING_INDEX(last_names, ',', 1 + ((i * 7) % 30)), ',', -1);

        INSERT INTO admins (email, password_hash, role, status, first_name, last_name, created_at, allow_network_visibility)
        VALUES (
            CONCAT('pasteur', i, '@eglise.fr'),
            '$2b$10$YourHashedPasswordHere1234567890123456789012',
            'PASTOR',
            'VALIDATED',
            fn,
            ln,
            DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 365) DAY),
            1
        );
        SET i = i + 1;
    END WHILE;
END //
DELIMITER ;

CALL generate_admins();
DROP PROCEDURE generate_admins;

-- ============================================
-- 6. CHURCHES (1000 Églises en France)
-- ============================================
-- Villes françaises avec leurs coordonnées

DROP PROCEDURE IF EXISTS generate_churches;
DELIMITER //
CREATE PROCEDURE generate_churches()
BEGIN
    DECLARE i INT DEFAULT 1;
    DECLARE city_lat DECIMAL(10,7);
    DECLARE city_lng DECIMAL(10,7);
    DECLARE offset_lat DECIMAL(10,7);
    DECLARE offset_lng DECIMAL(10,7);
    DECLARE denom_id INT;
    DECLARE church_prefix VARCHAR(100);

    -- Tableau de villes (lat, lng) - 50 villes françaises
    -- Paris, Lyon, Marseille, Toulouse, Nice, Nantes, Strasbourg, Montpellier, Bordeaux, Lille
    -- Rennes, Reims, Le Havre, Saint-Étienne, Toulon, Grenoble, Dijon, Angers, Nîmes, Villeurbanne
    -- Le Mans, Aix-en-Provence, Clermont-Ferrand, Brest, Tours, Limoges, Amiens, Perpignan, Metz, Besançon
    -- Orléans, Rouen, Mulhouse, Caen, Nancy, Saint-Denis, Argenteuil, Montreuil, Roubaix, Tourcoing
    -- Avignon, Dunkerque, Poitiers, Versailles, Créteil, Pau, Calais, La Rochelle, Cannes, Antibes

    WHILE i <= 1000 DO
        -- Sélection de la ville basée sur l'index
        CASE (i % 50)
            WHEN 0 THEN SET city_lat = 48.8566, city_lng = 2.3522;      -- Paris
            WHEN 1 THEN SET city_lat = 45.7640, city_lng = 4.8357;      -- Lyon
            WHEN 2 THEN SET city_lat = 43.2965, city_lng = 5.3698;      -- Marseille
            WHEN 3 THEN SET city_lat = 43.6047, city_lng = 1.4442;      -- Toulouse
            WHEN 4 THEN SET city_lat = 43.7102, city_lng = 7.2620;      -- Nice
            WHEN 5 THEN SET city_lat = 47.2184, city_lng = -1.5536;     -- Nantes
            WHEN 6 THEN SET city_lat = 48.5734, city_lng = 7.7521;      -- Strasbourg
            WHEN 7 THEN SET city_lat = 43.6108, city_lng = 3.8767;      -- Montpellier
            WHEN 8 THEN SET city_lat = 44.8378, city_lng = -0.5792;     -- Bordeaux
            WHEN 9 THEN SET city_lat = 50.6292, city_lng = 3.0573;      -- Lille
            WHEN 10 THEN SET city_lat = 48.1173, city_lng = -1.6778;    -- Rennes
            WHEN 11 THEN SET city_lat = 49.2583, city_lng = 4.0317;     -- Reims
            WHEN 12 THEN SET city_lat = 49.4944, city_lng = 0.1079;     -- Le Havre
            WHEN 13 THEN SET city_lat = 45.4397, city_lng = 4.3872;     -- Saint-Étienne
            WHEN 14 THEN SET city_lat = 43.1242, city_lng = 5.9280;     -- Toulon
            WHEN 15 THEN SET city_lat = 45.1885, city_lng = 5.7245;     -- Grenoble
            WHEN 16 THEN SET city_lat = 47.3220, city_lng = 5.0415;     -- Dijon
            WHEN 17 THEN SET city_lat = 47.4784, city_lng = -0.5632;    -- Angers
            WHEN 18 THEN SET city_lat = 43.8367, city_lng = 4.3601;     -- Nîmes
            WHEN 19 THEN SET city_lat = 45.7676, city_lng = 4.8243;     -- Villeurbanne
            WHEN 20 THEN SET city_lat = 48.0061, city_lng = 0.1996;     -- Le Mans
            WHEN 21 THEN SET city_lat = 43.5297, city_lng = 5.4474;     -- Aix-en-Provence
            WHEN 22 THEN SET city_lat = 45.7772, city_lng = 3.0870;     -- Clermont-Ferrand
            WHEN 23 THEN SET city_lat = 48.3904, city_lng = -4.4861;    -- Brest
            WHEN 24 THEN SET city_lat = 47.3941, city_lng = 0.6848;     -- Tours
            WHEN 25 THEN SET city_lat = 45.8336, city_lng = 1.2611;     -- Limoges
            WHEN 26 THEN SET city_lat = 49.8941, city_lng = 2.2958;     -- Amiens
            WHEN 27 THEN SET city_lat = 42.6887, city_lng = 2.8948;     -- Perpignan
            WHEN 28 THEN SET city_lat = 49.1193, city_lng = 6.1757;     -- Metz
            WHEN 29 THEN SET city_lat = 47.2378, city_lng = 6.0241;     -- Besançon
            WHEN 30 THEN SET city_lat = 47.9029, city_lng = 1.9039;     -- Orléans
            WHEN 31 THEN SET city_lat = 49.4432, city_lng = 1.0999;     -- Rouen
            WHEN 32 THEN SET city_lat = 47.7508, city_lng = 7.3359;     -- Mulhouse
            WHEN 33 THEN SET city_lat = 49.1829, city_lng = -0.3707;    -- Caen
            WHEN 34 THEN SET city_lat = 48.6921, city_lng = 6.1844;     -- Nancy
            WHEN 35 THEN SET city_lat = 48.9362, city_lng = 2.3574;     -- Saint-Denis
            WHEN 36 THEN SET city_lat = 48.9472, city_lng = 2.2467;     -- Argenteuil
            WHEN 37 THEN SET city_lat = 48.8634, city_lng = 2.4484;     -- Montreuil
            WHEN 38 THEN SET city_lat = 50.6942, city_lng = 3.1746;     -- Roubaix
            WHEN 39 THEN SET city_lat = 50.7262, city_lng = 3.1612;     -- Tourcoing
            WHEN 40 THEN SET city_lat = 43.9493, city_lng = 4.8055;     -- Avignon
            WHEN 41 THEN SET city_lat = 51.0343, city_lng = 2.3768;     -- Dunkerque
            WHEN 42 THEN SET city_lat = 46.5802, city_lng = 0.3404;     -- Poitiers
            WHEN 43 THEN SET city_lat = 48.8014, city_lng = 2.1301;     -- Versailles
            WHEN 44 THEN SET city_lat = 48.7904, city_lng = 2.4556;     -- Créteil
            WHEN 45 THEN SET city_lat = 43.2951, city_lng = -0.3708;    -- Pau
            WHEN 46 THEN SET city_lat = 50.9513, city_lng = 1.8587;     -- Calais
            WHEN 47 THEN SET city_lat = 46.1603, city_lng = -1.1511;    -- La Rochelle
            WHEN 48 THEN SET city_lat = 43.5528, city_lng = 7.0174;     -- Cannes
            WHEN 49 THEN SET city_lat = 43.5804, city_lng = 7.1251;     -- Antibes
        END CASE;

        -- Ajouter un petit décalage aléatoire pour varier les positions
        SET offset_lat = (RAND() - 0.5) * 0.05;
        SET offset_lng = (RAND() - 0.5) * 0.05;

        -- Sélection de la dénomination
        SET denom_id = 1 + (i % 12);

        -- Préfixe du nom de l'église
        CASE (i % 10)
            WHEN 0 THEN SET church_prefix = 'Église de la Bonne Nouvelle';
            WHEN 1 THEN SET church_prefix = 'Église du Plein Évangile';
            WHEN 2 THEN SET church_prefix = 'Centre Chrétien';
            WHEN 3 THEN SET church_prefix = 'Église Vie Nouvelle';
            WHEN 4 THEN SET church_prefix = 'Temple Protestant';
            WHEN 5 THEN SET church_prefix = 'Église de Réveil';
            WHEN 6 THEN SET church_prefix = 'Assemblée Chrétienne';
            WHEN 7 THEN SET church_prefix = 'Église Lumière du Monde';
            WHEN 8 THEN SET church_prefix = 'Communauté Chrétienne';
            WHEN 9 THEN SET church_prefix = 'Église Parole de Vie';
        END CASE;

        INSERT INTO churches (admin_id, denomination_id, church_name, location, created_at)
        VALUES (
            i,
            denom_id,
            CONCAT(church_prefix, ' #', i),
            ST_GeomFromText(CONCAT('POINT(', city_lng + offset_lng, ' ', city_lat + offset_lat, ')')),
            DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 730) DAY)
        );

        SET i = i + 1;
    END WHILE;
END //
DELIMITER ;

CALL generate_churches();
DROP PROCEDURE generate_churches;

-- ============================================
-- 7. CHURCH DETAILS (Détails des 1000 églises)
-- ============================================

DROP PROCEDURE IF EXISTS generate_church_details;
DELIMITER //
CREATE PROCEDURE generate_church_details()
BEGIN
    DECLARE i INT DEFAULT 1;
    DECLARE city_name VARCHAR(100);
    DECLARE street_names VARCHAR(2000) DEFAULT 'Rue de la Paix,Avenue de la République,Boulevard Victor Hugo,Rue Jean Jaurès,Avenue du Général de Gaulle,Rue Pasteur,Boulevard Gambetta,Rue de la Liberté,Avenue Foch,Rue des Fleurs,Rue du Commerce,Boulevard Saint-Michel,Rue de Paris,Avenue de Verdun,Rue Lafayette';
    DECLARE descriptions VARCHAR(2000) DEFAULT 'Une église accueillante au coeur de la ville.,Communauté chrétienne dynamique et fraternelle.,Lieu de culte ouvert à tous dans un esprit de bienveillance.,Église familiale avec des activités pour tous les âges.,Assemblée vivante centrée sur la Parole de Dieu.,Communauté de foi engagée dans le service et l''amour du prochain.';
    DECLARE street VARCHAR(255);
    DECLARE descr TEXT;
    DECLARE postal VARCHAR(10);

    WHILE i <= 1000 DO
        -- Ville basée sur l'index
        CASE (i % 50)
            WHEN 0 THEN SET city_name = 'Paris', postal = '75001';
            WHEN 1 THEN SET city_name = 'Lyon', postal = '69001';
            WHEN 2 THEN SET city_name = 'Marseille', postal = '13001';
            WHEN 3 THEN SET city_name = 'Toulouse', postal = '31000';
            WHEN 4 THEN SET city_name = 'Nice', postal = '06000';
            WHEN 5 THEN SET city_name = 'Nantes', postal = '44000';
            WHEN 6 THEN SET city_name = 'Strasbourg', postal = '67000';
            WHEN 7 THEN SET city_name = 'Montpellier', postal = '34000';
            WHEN 8 THEN SET city_name = 'Bordeaux', postal = '33000';
            WHEN 9 THEN SET city_name = 'Lille', postal = '59000';
            WHEN 10 THEN SET city_name = 'Rennes', postal = '35000';
            WHEN 11 THEN SET city_name = 'Reims', postal = '51100';
            WHEN 12 THEN SET city_name = 'Le Havre', postal = '76600';
            WHEN 13 THEN SET city_name = 'Saint-Étienne', postal = '42000';
            WHEN 14 THEN SET city_name = 'Toulon', postal = '83000';
            WHEN 15 THEN SET city_name = 'Grenoble', postal = '38000';
            WHEN 16 THEN SET city_name = 'Dijon', postal = '21000';
            WHEN 17 THEN SET city_name = 'Angers', postal = '49000';
            WHEN 18 THEN SET city_name = 'Nîmes', postal = '30000';
            WHEN 19 THEN SET city_name = 'Villeurbanne', postal = '69100';
            WHEN 20 THEN SET city_name = 'Le Mans', postal = '72000';
            WHEN 21 THEN SET city_name = 'Aix-en-Provence', postal = '13100';
            WHEN 22 THEN SET city_name = 'Clermont-Ferrand', postal = '63000';
            WHEN 23 THEN SET city_name = 'Brest', postal = '29200';
            WHEN 24 THEN SET city_name = 'Tours', postal = '37000';
            WHEN 25 THEN SET city_name = 'Limoges', postal = '87000';
            WHEN 26 THEN SET city_name = 'Amiens', postal = '80000';
            WHEN 27 THEN SET city_name = 'Perpignan', postal = '66000';
            WHEN 28 THEN SET city_name = 'Metz', postal = '57000';
            WHEN 29 THEN SET city_name = 'Besançon', postal = '25000';
            WHEN 30 THEN SET city_name = 'Orléans', postal = '45000';
            WHEN 31 THEN SET city_name = 'Rouen', postal = '76000';
            WHEN 32 THEN SET city_name = 'Mulhouse', postal = '68100';
            WHEN 33 THEN SET city_name = 'Caen', postal = '14000';
            WHEN 34 THEN SET city_name = 'Nancy', postal = '54000';
            WHEN 35 THEN SET city_name = 'Saint-Denis', postal = '93200';
            WHEN 36 THEN SET city_name = 'Argenteuil', postal = '95100';
            WHEN 37 THEN SET city_name = 'Montreuil', postal = '93100';
            WHEN 38 THEN SET city_name = 'Roubaix', postal = '59100';
            WHEN 39 THEN SET city_name = 'Tourcoing', postal = '59200';
            WHEN 40 THEN SET city_name = 'Avignon', postal = '84000';
            WHEN 41 THEN SET city_name = 'Dunkerque', postal = '59140';
            WHEN 42 THEN SET city_name = 'Poitiers', postal = '86000';
            WHEN 43 THEN SET city_name = 'Versailles', postal = '78000';
            WHEN 44 THEN SET city_name = 'Créteil', postal = '94000';
            WHEN 45 THEN SET city_name = 'Pau', postal = '64000';
            WHEN 46 THEN SET city_name = 'Calais', postal = '62100';
            WHEN 47 THEN SET city_name = 'La Rochelle', postal = '17000';
            WHEN 48 THEN SET city_name = 'Cannes', postal = '06400';
            WHEN 49 THEN SET city_name = 'Antibes', postal = '06600';
        END CASE;

        SET street = SUBSTRING_INDEX(SUBSTRING_INDEX(street_names, ',', 1 + (i % 15)), ',', -1);
        SET descr = SUBSTRING_INDEX(SUBSTRING_INDEX(descriptions, ',', 1 + (i % 6)), ',', -1);

        INSERT INTO church_details (
            church_id, status, language_id, pastor_first_name, pastor_last_name,
            address, street_number, street_name, postal_code, city,
            phone, description, has_parking, parking_capacity, is_parking_free
        )
        SELECT
            i,
            'ACTIVE',
            1,
            a.first_name,
            a.last_name,
            CONCAT(FLOOR(1 + RAND() * 150), ' ', street, ', ', postal, ' ', city_name),
            FLOOR(1 + RAND() * 150),
            street,
            postal,
            city_name,
            CONCAT('0', FLOOR(1 + RAND() * 5), ' ', LPAD(FLOOR(RAND() * 100), 2, '0'), ' ', LPAD(FLOOR(RAND() * 100), 2, '0'), ' ', LPAD(FLOOR(RAND() * 100), 2, '0'), ' ', LPAD(FLOOR(RAND() * 100), 2, '0')),
            descr,
            IF(RAND() > 0.5, 1, 0),
            IF(RAND() > 0.5, FLOOR(10 + RAND() * 90), NULL),
            IF(RAND() > 0.3, 1, 0)
        FROM admins a WHERE a.id = i;

        SET i = i + 1;
    END WHILE;
END //
DELIMITER ;

CALL generate_church_details();
DROP PROCEDURE generate_church_details;

-- ============================================
-- 8. CHURCH SCHEDULES (Horaires des cultes)
-- ============================================

DROP PROCEDURE IF EXISTS generate_church_schedules;
DELIMITER //
CREATE PROCEDURE generate_church_schedules()
BEGIN
    DECLARE i INT DEFAULT 1;

    WHILE i <= 1000 DO
        -- Culte du dimanche matin (toutes les églises)
        INSERT INTO church_schedules (church_id, activity_type_id, day_of_week, start_time)
        VALUES (i, 1, 'SUNDAY', MAKETIME(9 + FLOOR(RAND() * 2), IF(RAND() > 0.5, 30, 0), 0));

        -- Réunion de prière en semaine (80% des églises)
        IF RAND() > 0.2 THEN
            INSERT INTO church_schedules (church_id, activity_type_id, day_of_week, start_time)
            VALUES (i, 2, ELT(1 + FLOOR(RAND() * 5), 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'),
                    MAKETIME(19 + FLOOR(RAND() * 2), IF(RAND() > 0.5, 30, 0), 0));
        END IF;

        -- Étude biblique (60% des églises)
        IF RAND() > 0.4 THEN
            INSERT INTO church_schedules (church_id, activity_type_id, day_of_week, start_time)
            VALUES (i, 3, ELT(1 + FLOOR(RAND() * 5), 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'),
                    MAKETIME(19 + FLOOR(RAND() * 2), IF(RAND() > 0.5, 30, 0), 0));
        END IF;

        -- Groupe de jeunes (50% des églises)
        IF RAND() > 0.5 THEN
            INSERT INTO church_schedules (church_id, activity_type_id, day_of_week, start_time)
            VALUES (i, 4, 'SATURDAY', MAKETIME(14 + FLOOR(RAND() * 4), 0, 0));
        END IF;

        SET i = i + 1;
    END WHILE;
END //
DELIMITER ;

CALL generate_church_schedules();
DROP PROCEDURE generate_church_schedules;

-- ============================================
-- 9. EVENTS (~3000 événements)
-- ============================================

DROP PROCEDURE IF EXISTS generate_events;
DELIMITER //
CREATE PROCEDURE generate_events()
BEGIN
    DECLARE i INT DEFAULT 1;
    DECLARE church_id INT;
    DECLARE admin_id INT;
    DECLARE event_count INT;
    DECLARE j INT;
    DECLARE event_lat DECIMAL(10,7);
    DECLARE event_lng DECIMAL(10,7);
    DECLARE event_start DATETIME;
    DECLARE event_title VARCHAR(255);
    DECLARE titles VARCHAR(2000) DEFAULT 'Conférence de réveil,Soirée de louange,Séminaire biblique,Concert gospel,Journée de jeûne et prière,Retraite spirituelle,Baptême,Culte spécial de Pâques,Célébration de Noël,Conférence pour les jeunes,Séminaire sur le mariage,Conférence des femmes,Rencontre des hommes,Évangélisation de rue,Nuit de prière,Convention annuelle,Culte d''action de grâce,Formation des leaders,Atelier de louange,Journée portes ouvertes';

    WHILE i <= 1000 DO
        -- 2 à 4 événements par église
        SET event_count = 2 + FLOOR(RAND() * 3);
        SET j = 1;

        -- Récupérer les coordonnées de l'église
        SELECT c.admin_id, ST_X(c.location), ST_Y(c.location)
        INTO admin_id, event_lng, event_lat
        FROM churches c WHERE c.id = i;

        WHILE j <= event_count DO
            -- Date de l'événement dans les 6 prochains mois
            SET event_start = DATE_ADD(NOW(), INTERVAL FLOOR(RAND() * 180) DAY);
            SET event_start = DATE_ADD(event_start, INTERVAL (14 + FLOOR(RAND() * 6)) HOUR);

            -- Titre aléatoire
            SET event_title = SUBSTRING_INDEX(SUBSTRING_INDEX(titles, ',', 1 + FLOOR(RAND() * 20)), ',', -1);

            INSERT INTO events (
                admin_id, church_id, title, language_id,
                start_datetime, end_datetime, event_location,
                interested_count, created_at
            )
            VALUES (
                admin_id,
                i,
                event_title,
                1,
                event_start,
                DATE_ADD(event_start, INTERVAL (2 + FLOOR(RAND() * 4)) HOUR),
                ST_GeomFromText(CONCAT('POINT(', event_lng + (RAND() - 0.5) * 0.01, ' ', event_lat + (RAND() - 0.5) * 0.01, ')')),
                FLOOR(RAND() * 50),
                DATE_SUB(event_start, INTERVAL (7 + FLOOR(RAND() * 30)) DAY)
            );

            SET j = j + 1;
        END WHILE;

        SET i = i + 1;
    END WHILE;
END //
DELIMITER ;

CALL generate_events();
DROP PROCEDURE generate_events;

-- ============================================
-- 10. EVENT DETAILS (Détails des événements)
-- ============================================

DROP PROCEDURE IF EXISTS generate_event_details;
DELIMITER //
CREATE PROCEDURE generate_event_details()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE evt_id INT;
    DECLARE city_name VARCHAR(100);
    DECLARE postal VARCHAR(10);
    DECLARE street_names VARCHAR(2000) DEFAULT 'Rue de la Paix,Avenue de la République,Boulevard Victor Hugo,Rue Jean Jaurès,Avenue du Général de Gaulle,Rue Pasteur,Boulevard Gambetta,Rue de la Liberté,Avenue Foch,Rue des Fleurs';
    DECLARE descriptions VARCHAR(2000) DEFAULT 'Venez nombreux pour ce moment de communion fraternelle.,Un temps fort de bénédiction vous attend.,Événement ouvert à tous dans une ambiance chaleureuse.,Moment de partage et d''édification pour toute la famille.,Rejoignez-nous pour cette occasion spéciale.';
    DECLARE speakers VARCHAR(500) DEFAULT 'Pasteur Jean Martin,Évangéliste Marie Dupont,Prophète Samuel Bernard,Dr. Pierre Lefebvre,Pasteur David Moreau,Apôtre François Laurent';

    DECLARE cur CURSOR FOR SELECT e.id FROM events e;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    OPEN cur;

    read_loop: LOOP
        FETCH cur INTO evt_id;
        IF done THEN
            LEAVE read_loop;
        END IF;

        -- Récupérer la ville depuis church_details via church_id
        SELECT cd.city, cd.postal_code INTO city_name, postal
        FROM events ev
        JOIN church_details cd ON ev.church_id = cd.church_id
        WHERE ev.id = evt_id
        LIMIT 1;

        IF city_name IS NULL THEN
            SET city_name = 'Paris';
            SET postal = '75001';
        END IF;

        INSERT INTO event_details (
            event_id, description, max_seats, address, street_number, street_name,
            postal_code, city, speaker_name, has_parking, parking_capacity,
            is_parking_free, is_free, registration_link
        )
        VALUES (
            evt_id,
            SUBSTRING_INDEX(SUBSTRING_INDEX(descriptions, ',', 1 + FLOOR(RAND() * 5)), ',', -1),
            IF(RAND() > 0.3, 50 + FLOOR(RAND() * 450), NULL),
            CONCAT(FLOOR(1 + RAND() * 150), ' ', SUBSTRING_INDEX(SUBSTRING_INDEX(street_names, ',', 1 + FLOOR(RAND() * 10)), ',', -1), ', ', postal, ' ', city_name),
            FLOOR(1 + RAND() * 150),
            SUBSTRING_INDEX(SUBSTRING_INDEX(street_names, ',', 1 + FLOOR(RAND() * 10)), ',', -1),
            postal,
            city_name,
            IF(RAND() > 0.4, SUBSTRING_INDEX(SUBSTRING_INDEX(speakers, ',', 1 + FLOOR(RAND() * 6)), ',', -1), NULL),
            IF(RAND() > 0.5, 1, 0),
            IF(RAND() > 0.5, FLOOR(20 + RAND() * 80), NULL),
            IF(RAND() > 0.2, 1, 0),
            IF(RAND() > 0.3, 1, 0),
            IF(RAND() > 0.6, CONCAT('https://inscription.eglise.fr/event/', evt_id), NULL)
        );
    END LOOP;

    CLOSE cur;
END //
DELIMITER ;

CALL generate_event_details();
DROP PROCEDURE generate_event_details;

-- ============================================
-- RÉSUMÉ
-- ============================================
SELECT 'Données insérées avec succès!' AS Status;
SELECT COUNT(*) AS 'Nombre d''admins' FROM admins;
SELECT COUNT(*) AS 'Nombre d''églises' FROM churches;
SELECT COUNT(*) AS 'Nombre de détails églises' FROM church_details;
SELECT COUNT(*) AS 'Nombre de schedules' FROM church_schedules;
SELECT COUNT(*) AS 'Nombre d''événements' FROM events;
SELECT COUNT(*) AS 'Nombre de détails événements' FROM event_details;
