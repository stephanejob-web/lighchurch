const fs = require('fs');

// ============================================
// DONNÉES DE BASE
// ============================================

const prenomsFrancais = [
  'Jean', 'Pierre', 'Paul', 'Jacques', 'Philippe', 'Marc', 'Luc', 'André', 'Simon', 'Thomas',
  'Matthieu', 'François', 'Michel', 'Alain', 'Bernard', 'Daniel', 'Patrick', 'Christian', 'Eric', 'Olivier',
  'Nicolas', 'Christophe', 'Laurent', 'Stéphane', 'Bruno', 'David', 'Emmanuel', 'Frédéric', 'Jérôme', 'Vincent',
  'Sébastien', 'Guillaume', 'Antoine', 'Julien', 'Cédric', 'Yannick', 'Fabrice', 'Arnaud', 'Sylvain', 'Grégory',
  'Romain', 'Damien', 'Maxime', 'Florian', 'Kévin', 'Jérémy', 'Benjamin', 'Alexandre', 'Mathieu', 'Ludovic'
];

const prenomsAfricains = [
  'Emmanuel', 'Samuel', 'David', 'Joseph', 'Daniel', 'Moïse', 'Isaac', 'Abraham', 'Jacob', 'Josué',
  'Ezéchiel', 'Jérémie', 'Elie', 'Amos', 'Nathan', 'Caleb', 'Aaron', 'Salomon', 'Gédéon', 'Jonas',
  'Etienne', 'Barnabé', 'Timothée', 'Silas', 'Apollos', 'Tite', 'Philémon', 'Lazare', 'Nicodème', 'Zachée',
  'Faustin', 'Prosper', 'Dieudonné', 'Bienvenu', 'Parfait', 'Innocent', 'Félicien', 'Augustin', 'Célestin', 'Firmin',
  'Blaise', 'Clément', 'Serge', 'William', 'Patrick', 'Joël', 'Michaël', 'Gabriel', 'Raphaël', 'Archange'
];

const nomsFrancais = [
  'Dupont', 'Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Richard', 'Petit', 'Durand', 'Leroy',
  'Moreau', 'Simon', 'Laurent', 'Lefebvre', 'Michel', 'Garcia', 'David', 'Bertrand', 'Roux', 'Vincent',
  'Fournier', 'Morel', 'Girard', 'André', 'Mercier', 'Blanc', 'Guerin', 'Boyer', 'Garnier', 'Chevalier',
  'Francois', 'Legrand', 'Gauthier', 'Muller', 'Henry', 'Rousseau', 'Lambert', 'Faure', 'Fontaine', 'Bonnet',
  'Lemoine', 'Schmitt', 'Meyer', 'Masson', 'Denis', 'Duval', 'Roger', 'Renaud', 'Perrin', 'Colin'
];

const nomsAfricains = [
  'Kongo', 'Moukoko', 'Mbemba', 'Nzongo', 'Makosso', 'Mutombo', 'Nguema', 'Diallo', 'Obiang', 'Kouassi',
  'Bongo', 'Ndiaye', 'Mboma', 'Touré', 'Lukaku', 'Fofana', 'Essomba', 'Kamara', 'Traoré', 'Konaté',
  'Ouédraogo', 'Sawadogo', 'Compaoré', 'Zongo', 'Kaboré', 'Somé', 'Diabaté', 'Coulibaly', 'Sanogo', 'Keita',
  'Bakayoko', 'Dembélé', 'Sissoko', 'Kanté', 'Mendy', 'Gomis', 'Sané', 'Gueye', 'Diop', 'Fall',
  'Ndongo', 'Owono', 'Mba', 'Nze', 'Ekang', 'Ondo', 'Mboumba', 'Mouele', 'Leyama', 'Bouanga'
];

const domaines = ['gmail.com', 'outlook.fr', 'yahoo.fr', 'hotmail.fr', 'orange.fr', 'free.fr', 'sfr.fr', 'laposte.net'];

const villes = [
  { nom: 'Paris', cp: '75001', lat: 48.8566, lng: 2.3522 },
  { nom: 'Paris', cp: '75010', lat: 48.8761, lng: 2.3616 },
  { nom: 'Paris', cp: '75011', lat: 48.8591, lng: 2.3780 },
  { nom: 'Paris', cp: '75012', lat: 48.8412, lng: 2.3876 },
  { nom: 'Paris', cp: '75013', lat: 48.8322, lng: 2.3561 },
  { nom: 'Paris', cp: '75014', lat: 48.8331, lng: 2.3264 },
  { nom: 'Paris', cp: '75015', lat: 48.8421, lng: 2.2988 },
  { nom: 'Paris', cp: '75016', lat: 48.8637, lng: 2.2769 },
  { nom: 'Paris', cp: '75017', lat: 48.8867, lng: 2.3166 },
  { nom: 'Paris', cp: '75018', lat: 48.8925, lng: 2.3444 },
  { nom: 'Paris', cp: '75019', lat: 48.8867, lng: 2.3822 },
  { nom: 'Paris', cp: '75020', lat: 48.8638, lng: 2.3987 },
  { nom: 'Marseille', cp: '13001', lat: 43.2965, lng: 5.3698 },
  { nom: 'Marseille', cp: '13002', lat: 43.3026, lng: 5.3654 },
  { nom: 'Marseille', cp: '13003', lat: 43.3097, lng: 5.3787 },
  { nom: 'Marseille', cp: '13004', lat: 43.3058, lng: 5.3989 },
  { nom: 'Marseille', cp: '13005', lat: 43.2953, lng: 5.3956 },
  { nom: 'Marseille', cp: '13006', lat: 43.2887, lng: 5.3812 },
  { nom: 'Marseille', cp: '13008', lat: 43.2621, lng: 5.3876 },
  { nom: 'Lyon', cp: '69001', lat: 45.7676, lng: 4.8344 },
  { nom: 'Lyon', cp: '69002', lat: 45.7560, lng: 4.8320 },
  { nom: 'Lyon', cp: '69003', lat: 45.7589, lng: 4.8574 },
  { nom: 'Lyon', cp: '69004', lat: 45.7747, lng: 4.8282 },
  { nom: 'Lyon', cp: '69005', lat: 45.7598, lng: 4.8201 },
  { nom: 'Lyon', cp: '69006', lat: 45.7701, lng: 4.8503 },
  { nom: 'Lyon', cp: '69007', lat: 45.7432, lng: 4.8413 },
  { nom: 'Lyon', cp: '69008', lat: 45.7369, lng: 4.8701 },
  { nom: 'Toulouse', cp: '31000', lat: 43.6047, lng: 1.4442 },
  { nom: 'Toulouse', cp: '31100', lat: 43.5912, lng: 1.4018 },
  { nom: 'Toulouse', cp: '31200', lat: 43.6256, lng: 1.4765 },
  { nom: 'Toulouse', cp: '31300', lat: 43.5878, lng: 1.4234 },
  { nom: 'Toulouse', cp: '31400', lat: 43.5756, lng: 1.4587 },
  { nom: 'Toulouse', cp: '31500', lat: 43.6123, lng: 1.4876 },
  { nom: 'Nice', cp: '06000', lat: 43.7102, lng: 7.2620 },
  { nom: 'Nice', cp: '06100', lat: 43.7196, lng: 7.2822 },
  { nom: 'Nice', cp: '06200', lat: 43.7087, lng: 7.2287 },
  { nom: 'Nice', cp: '06300', lat: 43.7234, lng: 7.2512 },
  { nom: 'Nantes', cp: '44000', lat: 47.2184, lng: -1.5536 },
  { nom: 'Nantes', cp: '44100', lat: 47.2321, lng: -1.5234 },
  { nom: 'Nantes', cp: '44200', lat: 47.1987, lng: -1.5687 },
  { nom: 'Nantes', cp: '44300', lat: 47.2456, lng: -1.5123 },
  { nom: 'Strasbourg', cp: '67000', lat: 48.5734, lng: 7.7521 },
  { nom: 'Strasbourg', cp: '67100', lat: 48.5621, lng: 7.7234 },
  { nom: 'Strasbourg', cp: '67200', lat: 48.5987, lng: 7.7654 },
  { nom: 'Montpellier', cp: '34000', lat: 43.6108, lng: 3.8767 },
  { nom: 'Montpellier', cp: '34070', lat: 43.6234, lng: 3.8456 },
  { nom: 'Montpellier', cp: '34080', lat: 43.5987, lng: 3.8912 },
  { nom: 'Bordeaux', cp: '33000', lat: 44.8378, lng: -0.5792 },
  { nom: 'Bordeaux', cp: '33100', lat: 44.8234, lng: -0.5456 },
  { nom: 'Bordeaux', cp: '33200', lat: 44.8567, lng: -0.6123 },
  { nom: 'Bordeaux', cp: '33300', lat: 44.8612, lng: -0.5234 },
  { nom: 'Lille', cp: '59000', lat: 50.6292, lng: 3.0573 },
  { nom: 'Lille', cp: '59160', lat: 50.6123, lng: 3.0234 },
  { nom: 'Lille', cp: '59260', lat: 50.6456, lng: 3.0876 },
  { nom: 'Rennes', cp: '35000', lat: 48.1173, lng: -1.6778 },
  { nom: 'Rennes', cp: '35200', lat: 48.1234, lng: -1.6456 },
  { nom: 'Rennes', cp: '35700', lat: 48.1087, lng: -1.7012 },
  { nom: 'Reims', cp: '51100', lat: 49.2583, lng: 4.0317 },
  { nom: 'Le Havre', cp: '76600', lat: 49.4944, lng: 0.1079 },
  { nom: 'Saint-Etienne', cp: '42000', lat: 45.4397, lng: 4.3872 },
  { nom: 'Toulon', cp: '83000', lat: 43.1242, lng: 5.9280 },
  { nom: 'Toulon', cp: '83100', lat: 43.1156, lng: 5.9456 },
  { nom: 'Toulon', cp: '83200', lat: 43.1312, lng: 5.9087 },
  { nom: 'Grenoble', cp: '38000', lat: 45.1885, lng: 5.7245 },
  { nom: 'Grenoble', cp: '38100', lat: 45.1756, lng: 5.7456 },
  { nom: 'Dijon', cp: '21000', lat: 47.3220, lng: 5.0415 },
  { nom: 'Angers', cp: '49000', lat: 47.4784, lng: -0.5632 },
  { nom: 'Nîmes', cp: '30000', lat: 43.8367, lng: 4.3601 },
  { nom: 'Villeurbanne', cp: '69100', lat: 45.7676, lng: 4.8799 },
  { nom: 'Saint-Denis', cp: '93200', lat: 48.9362, lng: 2.3574 },
  { nom: 'Aix-en-Provence', cp: '13100', lat: 43.5297, lng: 5.4474 },
  { nom: 'Le Mans', cp: '72000', lat: 48.0061, lng: 0.1996 },
  { nom: 'Clermont-Ferrand', cp: '63000', lat: 45.7772, lng: 3.0870 },
  { nom: 'Brest', cp: '29200', lat: 48.3904, lng: -4.4861 },
  { nom: 'Tours', cp: '37000', lat: 47.3941, lng: 0.6848 },
  { nom: 'Limoges', cp: '87000', lat: 45.8336, lng: 1.2611 },
  { nom: 'Amiens', cp: '80000', lat: 49.8941, lng: 2.2958 },
  { nom: 'Perpignan', cp: '66000', lat: 42.6887, lng: 2.8948 },
  { nom: 'Metz', cp: '57000', lat: 49.1193, lng: 6.1757 },
  { nom: 'Besançon', cp: '25000', lat: 47.2378, lng: 6.0241 },
  { nom: 'Orléans', cp: '45000', lat: 47.9029, lng: 1.9039 },
  { nom: 'Mulhouse', cp: '68100', lat: 47.7508, lng: 7.3359 },
  { nom: 'Rouen', cp: '76000', lat: 49.4432, lng: 1.0993 },
  { nom: 'Caen', cp: '14000', lat: 49.1829, lng: -0.3707 },
  { nom: 'Nancy', cp: '54000', lat: 48.6921, lng: 6.1844 },
  { nom: 'Argenteuil', cp: '95100', lat: 48.9472, lng: 2.2467 },
  { nom: 'Montreuil', cp: '93100', lat: 48.8638, lng: 2.4433 },
  { nom: 'Saint-Paul', cp: '97460', lat: -21.0105, lng: 55.2708 },
  { nom: 'Roubaix', cp: '59100', lat: 50.6942, lng: 3.1746 },
  { nom: 'Tourcoing', cp: '59200', lat: 50.7262, lng: 3.1612 },
  { nom: 'Avignon', cp: '84000', lat: 43.9493, lng: 4.8055 },
  { nom: 'Dunkerque', cp: '59140', lat: 51.0343, lng: 2.3768 },
  { nom: 'Poitiers', cp: '86000', lat: 46.5802, lng: 0.3404 },
  { nom: 'Versailles', cp: '78000', lat: 48.8014, lng: 2.1301 },
  { nom: 'Créteil', cp: '94000', lat: 48.7909, lng: 2.4551 },
  { nom: 'Pau', cp: '64000', lat: 43.2951, lng: -0.3708 },
  { nom: 'La Rochelle', cp: '17000', lat: 46.1603, lng: -1.1511 },
  { nom: 'Calais', cp: '62100', lat: 50.9513, lng: 1.8587 },
  { nom: 'Antibes', cp: '06600', lat: 43.5808, lng: 7.1239 },
  { nom: 'Béziers', cp: '34500', lat: 43.3442, lng: 3.2150 },
  { nom: 'Cannes', cp: '06400', lat: 43.5528, lng: 7.0174 }
];

const rues = [
  'rue de la Paix', 'avenue de la République', 'rue du Commerce', 'boulevard Voltaire', 'rue des Martyrs',
  'avenue Jean Jaurès', 'rue de la Liberté', 'place de l\'Église', 'rue Victor Hugo', 'avenue Gambetta',
  'rue Pasteur', 'rue de la Gare', 'avenue de la Victoire', 'rue du Général de Gaulle', 'place de la Mairie',
  'rue Saint-Michel', 'avenue des Champs', 'rue de l\'Espérance', 'boulevard de la Fraternité', 'rue Émile Zola',
  'avenue Foch', 'rue Jean Moulin', 'place de la Libération', 'rue Nationale', 'boulevard Carnot',
  'rue de la Croix', 'avenue de l\'Europe', 'rue des Lilas', 'place de la Concorde', 'rue de Verdun',
  'avenue du Maréchal Leclerc', 'rue Pierre Curie', 'boulevard Haussmann', 'rue Saint-Jacques', 'place Saint-Pierre',
  'rue de Belleville', 'avenue de Paris', 'rue des Roses', 'boulevard Raspail', 'rue Thiers'
];

const nomsEglises = [
  'Assemblée de Dieu', 'Église Évangélique', 'Centre Chrétien', 'Église Pentecôtiste', 'Temple Protestant',
  'Église Baptiste', 'Mission Évangélique', 'Centre Missionnaire', 'Église de la Bonne Nouvelle', 'Communauté Chrétienne',
  'Église du Plein Évangile', 'Centre Biblique', 'Église Apostolique', 'Tabernacle de Gloire', 'Église de Réveil',
  'Maison de Prière', 'Église la Porte Ouverte', 'Impact Centre Chrétien', 'Église Vie Nouvelle', 'Centre d\'Évangélisation',
  'Église Source de Vie', 'Ministère de la Parole', 'Église Parole de Vie', 'Centre de Foi', 'Église du Rocher',
  'Église Lumière du Monde', 'Communauté de l\'Alliance', 'Église Grâce Divine', 'Temple de la Foi', 'Église Vie Abondante'
];

const descriptions = [
  'Notre église est une communauté chaleureuse et accueillante où chacun peut grandir dans sa foi. Nous croyons en l\'amour de Dieu pour tous et nous nous efforçons de partager cet amour à travers nos actions et notre témoignage.',
  'Fondée sur les principes bibliques, notre assemblée offre un espace de prière, d\'adoration et d\'enseignement de la Parole de Dieu. Rejoignez-nous pour vivre une expérience spirituelle enrichissante.',
  'Nous sommes une église dynamique et multiculturelle qui accueille des personnes de tous horizons. Notre mission est de glorifier Dieu et de faire des disciples de toutes les nations.',
  'Notre communauté est un lieu de rencontre avec Dieu où la louange et l\'adoration occupent une place centrale. Venez découvrir la joie de servir le Seigneur ensemble.',
  'Église familiale où l\'on prend soin les uns des autres. Nous proposons des activités pour tous les âges et nous nous engageons à servir notre quartier.',
  'Centre chrétien engagé dans l\'évangélisation et l\'action sociale. Nous croyons que l\'Évangile transforme les vies et les communautés.',
  'Notre église est un havre de paix où vous pouvez trouver le réconfort et l\'espérance. Nous prêchons un message d\'amour, de grâce et de réconciliation.',
  'Communauté vivante et fraternelle où la Parole de Dieu est enseignée avec fidélité. Nous encourageons chaque membre à découvrir et utiliser ses dons spirituels.',
  'Assemblée pentecôtiste où le Saint-Esprit est à l\'œuvre. Nous croyons aux miracles et à la puissance de la prière.',
  'Église missionnaire tournée vers l\'évangélisation locale et mondiale. Nous formons des disciples et envoyons des missionnaires.',
  'Notre vision est de voir des vies transformées par la puissance de l\'Évangile. Nous investissons dans la formation et l\'accompagnement spirituel.',
  'Communauté de foi où règne l\'unité dans la diversité. Nous célébrons nos différences culturelles tout en étant unis dans le Christ.',
  'Église ancrée dans la prière et l\'intercession. Nous croyons que la prière change les situations et ouvre les portes.',
  'Centre d\'enseignement biblique approfondi. Nous proposons des études bibliques et des formations pour grandir dans la connaissance de Dieu.',
  'Notre église est engagée dans le service communautaire : aide alimentaire, soutien scolaire, accompagnement des familles.',
  'Assemblée charismatique où l\'adoration est expressive et joyeuse. Venez expérimenter la présence de Dieu dans nos cultes.',
  'Église locale avec une vision globale. Nous soutenons des projets humanitaires et des œuvres missionnaires dans le monde entier.',
  'Communauté accueillante pour les jeunes et les familles. Nous proposons des programmes adaptés à chaque génération.',
  'Notre mission : annoncer l\'Évangile, former des disciples, servir notre prochain. Rejoignez une église qui fait la différence.',
  'Lieu de guérison et de restauration où chacun peut trouver l\'espérance. Nous accompagnons les personnes dans leurs difficultés.'
];

const titresEvenements = [
  'Conférence de réveil spirituel',
  'Séminaire sur la prière',
  'Concert de louange et d\'adoration',
  'Journée d\'évangélisation',
  'Retraite spirituelle',
  'Conférence pour les jeunes',
  'Séminaire de formation biblique',
  'Culte spécial d\'action de grâces',
  'Conférence sur la famille chrétienne',
  'Nuit de prière et d\'intercession',
  'Festival de la foi',
  'Séminaire sur le leadership chrétien',
  'Journée de jeûne et prière',
  'Conférence des femmes',
  'Conférence des hommes',
  'Camp de jeunes',
  'Célébration de Pâques',
  'Célébration de Noël',
  'Baptêmes et témoignages',
  'Soirée de miracles',
  'Conférence prophétique',
  'Séminaire sur le mariage',
  'Journée missionnaire',
  'Culte en plein air',
  'Atelier de louange',
  'Séminaire sur la guérison divine',
  'Rencontre inter-églises',
  'Veillée de prière',
  'Conférence sur le Saint-Esprit',
  'Journée portes ouvertes'
];

const descriptionsEvenements = [
  'Venez vivre un temps fort de renouvellement spirituel. Des orateurs de renom partageront la Parole de Dieu avec onction et puissance.',
  'Apprenez à développer une vie de prière efficace. Ce séminaire vous donnera des outils pratiques pour approfondir votre communion avec Dieu.',
  'Une soirée exceptionnelle de louange avec des artistes chrétiens talentueux. Préparez-vous à être touché par la présence de Dieu.',
  'Participez à une journée d\'évangélisation dans notre quartier. Distribution de traités, témoignages de rue et prière pour les passants.',
  'Éloignez-vous du quotidien pour vous rapprocher de Dieu. Un week-end de ressourcement spirituel dans un cadre paisible.',
  'Un événement spécialement conçu pour la jeunesse. Des messages percutants, de la musique contemporaine et des ateliers interactifs.',
  'Approfondissez votre connaissance des Écritures avec des enseignants qualifiés. Plusieurs thèmes seront abordés durant ce séminaire.',
  'Rendons grâce à Dieu pour ses bienfaits. Un culte spécial pour célébrer sa fidélité et ses bénédictions.',
  'Des conseils bibliques pour fortifier votre famille. Des intervenants partageront leur expérience et leur sagesse.',
  'Une nuit entière consacrée à la prière. Intercédons ensemble pour notre ville, notre pays et les nations.',
  'Un grand rassemblement de croyants de toute la région. Louange, enseignements et moments de communion fraternelle.',
  'Développez vos capacités de leader selon les principes bibliques. Formation pratique et inspirante.',
  'Humilions-nous devant Dieu et cherchons sa face. Une journée de consécration et de sanctification.',
  'Mesdames, cet événement est pour vous ! Des messages qui touchent le cœur des femmes et répondent à leurs besoins.',
  'Messieurs, venez vous ressourcer et être encouragés dans votre rôle d\'hommes de Dieu.',
  'Une semaine inoubliable pour les jeunes : activités, enseignements, jeux et moments de partage.',
  'Célébrons ensemble la résurrection de notre Seigneur Jésus-Christ. Un culte festif et rempli d\'espérance.',
  'Fêtons la naissance du Sauveur dans la joie et la reconnaissance. Programme spécial pour toute la famille.',
  'Assistez aux baptêmes de nouveaux convertis et écoutez leurs témoignages de transformation.',
  'Dieu fait encore des miracles aujourd\'hui ! Venez avec foi et expectative pour recevoir votre miracle.',
  'Un temps pour écouter ce que l\'Esprit dit à l\'Église. Des paroles prophétiques pour notre temps.',
  'Fortifiez votre couple avec des enseignements bibliques sur le mariage. Pour les couples mariés et fiancés.',
  'Découvrez le travail missionnaire dans le monde et comment vous pouvez y participer.',
  'Un culte en plein air pour toucher notre communauté. Invitez vos voisins, amis et collègues.',
  'Apprenez à conduire la louange et à jouer d\'un instrument pour la gloire de Dieu.',
  'Jésus guérit encore aujourd\'hui. Enseignements sur la guérison divine et temps de ministère.',
  'Plusieurs églises se rassemblent pour un temps de communion et de célébration. L\'unité fait la force.',
  'Une veillée de prière pour terminer l\'année en beauté et entrer dans la nouvelle année avec Dieu.',
  'Découvrez ou redécouvrez le Saint-Esprit et ses dons. Un séminaire transformateur.',
  'Curieux de découvrir notre église ? C\'est le moment idéal ! Visite des locaux, présentation des activités et pot de bienvenue.'
];

const speakers = [
  'Pasteur Jean-Marc Thobois', 'Pasteur Samuel Peterschmitt', 'Pasteur Franck Alexandre', 'Pasteur Yvan Castanou',
  'Pasteur Mamadou Karambiri', 'Pasteur Daniel Kolenda', 'Évangéliste Carlos Annacondia', 'Pasteur David Maasbach',
  'Pasteur Sunday Adelaja', 'Pasteur Benny Hinn', 'Pasteur Reinhard Bonnke', 'Pasteur T.D. Jakes',
  'Pasteur Joyce Meyer', 'Pasteur Joel Osteen', 'Pasteur Joseph Prince', 'Pasteur Bill Johnson',
  'Pasteur Guillermo Maldonado', 'Pasteur Cash Luna', 'Pasteur Claudio Freidzon', 'Pasteur Dante Gebel',
  'Pasteur Jean-Louis Jayet', 'Pasteur Gérard Peilhon', 'Pasteur Philippe Joret', 'Pasteur Claude Houde',
  'Pasteur Joël Spinks', 'Pasteur David Théry', 'Pasteur Éric Célérier', 'Pasteur Dorothée Rajiah',
  'Pasteur Yves Castanou', 'Pasteur Marcello Tunasi'
];

// ============================================
// FONCTIONS UTILITAIRES
// ============================================

function randomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function escapeSQL(str) {
  return str.replace(/'/g, "''");
}

function generatePhone() {
  const prefixes = ['01', '02', '03', '04', '05', '06', '07', '09'];
  const prefix = randomElement(prefixes);
  let phone = prefix;
  for (let i = 0; i < 4; i++) {
    phone += ' ' + randomInt(10, 99).toString().padStart(2, '0');
  }
  return phone;
}

function generateFutureDate(monthsAhead) {
  const date = new Date();
  date.setMonth(date.getMonth() + randomInt(1, monthsAhead));
  date.setDate(randomInt(1, 28));
  date.setHours(randomInt(9, 20), randomInt(0, 1) * 30, 0);
  return date;
}

function formatDateTime(date) {
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

function addHours(date, hours) {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

// ============================================
// GÉNÉRATION DES DONNÉES
// ============================================

let sql = '';

// Header
sql += `-- ============================================
-- SEED REALISTE - Light Church
-- 1000 pasteurs, 1000 églises, 4000 événements
-- Données ultra réalistes - Églises évangéliques en France
-- Généré automatiquement
-- ============================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- 1. LANGUAGES (15 langues)
-- ============================================
DELETE FROM languages;
INSERT INTO languages (id, code, name_native, name_fr, flag_emoji, is_active, display_order) VALUES
(1, 'fr', 'Français', 'Français', '🇫🇷', 1, 1),
(2, 'en', 'English', 'Anglais', '🇬🇧', 1, 2),
(3, 'pt', 'Português', 'Portugais', '🇵🇹', 1, 3),
(4, 'es', 'Español', 'Espagnol', '🇪🇸', 1, 4),
(5, 'ln', 'Lingála', 'Lingala', '🇨🇩', 1, 5),
(6, 'sw', 'Kiswahili', 'Swahili', '🇰🇪', 1, 6),
(7, 'ht', 'Kreyòl ayisyen', 'Créole haïtien', '🇭🇹', 1, 7),
(8, 'mg', 'Malagasy', 'Malgache', '🇲🇬', 1, 8),
(9, 'zh', '中文', 'Chinois', '🇨🇳', 1, 9),
(10, 'ko', '한국어', 'Coréen', '🇰🇷', 1, 10),
(11, 'ar', 'العربية', 'Arabe', '🇸🇦', 1, 11),
(12, 'fa', 'فارسی', 'Persan', '🇮🇷', 1, 12),
(13, 'vi', 'Tiếng Việt', 'Vietnamien', '🇻🇳', 1, 13),
(14, 'ro', 'Română', 'Roumain', '🇷🇴', 1, 14),
(15, 'pl', 'Polski', 'Polonais', '🇵🇱', 1, 15);

-- ============================================
-- 2. CHURCH UNIONS (8 unions)
-- ============================================
DELETE FROM church_unions;
INSERT INTO church_unions (id, name, abbreviation, website, logo_url, is_active) VALUES
(1, 'Conseil National des Évangéliques de France', 'CNEF', 'https://www.lecnef.org', NULL, 1),
(2, 'Fédération Protestante de France', 'FPF', 'https://www.protestants.org', NULL, 1),
(3, 'Assemblées de Dieu de France', 'ADD', 'https://www.add-france.org', NULL, 1),
(4, 'Fédération des Églises Évangéliques Baptistes de France', 'FEEBF', 'https://www.feebf.com', NULL, 1),
(5, 'Union des Églises Évangéliques Libres', 'UEEL', 'https://www.ueel.org', NULL, 1),
(6, 'Communauté des Églises d''Expression Africaine de France', 'CEAF', NULL, NULL, 1),
(7, 'Mission Évangélique Tzigane de France', 'METF', 'https://www.vie-et-lumiere.fr', NULL, 1),
(8, 'Union des Églises Évangéliques de Réveil', 'UEER', NULL, NULL, 1);

-- ============================================
-- 3. DENOMINATIONS (15 dénominations)
-- ============================================
DELETE FROM denominations;
INSERT INTO denominations (id, union_id, name, abbreviation, is_active) VALUES
(1, 3, 'Assemblées de Dieu', 'ADD', 1),
(2, 4, 'Église Baptiste', NULL, 1),
(3, 1, 'Église Pentecôtiste', NULL, 1),
(4, 5, 'Église Évangélique Libre', 'EEL', 1),
(5, 1, 'Église Apostolique', NULL, 1),
(6, 1, 'Centre Missionnaire Évangélique', 'CME', 1),
(7, 1, 'Église du Plein Évangile', 'EPE', 1),
(8, 7, 'Mission Évangélique Tzigane', 'MET', 1),
(9, 2, 'Église Protestante Unie', 'EPU', 1),
(10, NULL, 'Église Évangélique Indépendante', NULL, 1),
(11, 6, 'Église Évangélique Africaine', NULL, 1),
(12, 1, 'Église de Dieu en France', 'EDF', 1),
(13, 8, 'Église Évangélique de Réveil', NULL, 1),
(14, 1, 'Église Charismatique', NULL, 1),
(15, 1, 'Église Méthodiste Évangélique', NULL, 1);

-- ============================================
-- 4. ACTIVITY TYPES (10 types)
-- ============================================
DELETE FROM activity_types;
INSERT INTO activity_types (id, name, label_fr, icon) VALUES
(1, 'worship', 'Culte', 'church'),
(2, 'prayer', 'Réunion de prière', 'hands-praying'),
(3, 'evangelism', 'Évangélisation', 'megaphone'),
(4, 'bible_study', 'Étude biblique', 'book'),
(5, 'youth_group', 'Groupe de jeunes', 'users'),
(6, 'sunday_school', 'École du dimanche', 'child'),
(7, 'choir', 'Chorale / Louange', 'music'),
(8, 'women_group', 'Groupe de femmes', 'female'),
(9, 'men_group', 'Groupe d''hommes', 'male'),
(10, 'cell_group', 'Groupe de maison', 'home');

`;

// Générer les admins (2 super admins + 1000 pasteurs)
const passwordHash = '$2b$10$jEpsbA/NyxEHkkRRtN3lIOuxBI2ZedxfchnxbwJd2BuiklCeA6boS';

sql += `-- ============================================
-- 5. ADMINS (2 super admins + 1000 pasteurs)
-- ============================================
DELETE FROM event_details;
DELETE FROM events;
DELETE FROM church_socials;
DELETE FROM church_schedules;
DELETE FROM church_details;
DELETE FROM churches;
DELETE FROM admins;

-- Super Admins
INSERT INTO admins (id, email, password_hash, role, status, first_name, last_name, created_at, allow_network_visibility) VALUES
(1, 'admin@gmail.com', '${passwordHash}', 'SUPER_ADMIN', 'VALIDATED', 'Admin', 'Principal', NOW(), 1),
(2, 'admin2@gmail.com', '${passwordHash}', 'SUPER_ADMIN', 'VALIDATED', 'Admin', 'Secondaire', NOW(), 1);

-- Pasteurs (1000)
INSERT INTO admins (id, email, password_hash, role, status, first_name, last_name, created_at, allow_network_visibility) VALUES
`;

const usedEmails = new Set(['admin@gmail.com', 'admin2@gmail.com']);
const pasteurs = [];

for (let i = 0; i < 10000; i++) {
  let prenom, nom, email;

  // Alterner entre noms français et africains
  if (i % 2 === 0) {
    prenom = randomElement(prenomsFrancais);
    nom = randomElement(nomsFrancais);
  } else {
    prenom = randomElement(prenomsAfricains);
    nom = randomElement(nomsAfricains);
  }

  // Générer un email unique
  let baseEmail = `${prenom.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')}.${nom.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')}`;
  let domain = randomElement(domaines);
  email = `${baseEmail}@${domain}`;

  let counter = 1;
  while (usedEmails.has(email)) {
    email = `${baseEmail}${counter}@${domain}`;
    counter++;
  }
  usedEmails.add(email);

  pasteurs.push({ id: i + 3, prenom, nom, email });

  const comma = i < 9999 ? ',' : ';';
  sql += `(${i + 3}, '${escapeSQL(email)}', '${passwordHash}', 'PASTOR', 'VALIDATED', '${escapeSQL(prenom)}', '${escapeSQL(nom)}', NOW(), 1)${comma}\n`;
}

// Générer les églises
sql += `
-- ============================================
-- 6. CHURCHES (1000 églises)
-- ============================================
INSERT INTO churches (id, admin_id, denomination_id, church_name, location, created_at) VALUES
`;

const eglises = [];

for (let i = 0; i < 10000; i++) {
  const pasteur = pasteurs[i];
  const ville = villes[i % villes.length];
  const nomEglise = randomElement(nomsEglises);
  const denominationId = randomInt(1, 15);

  // Ajouter une légère variation aux coordonnées
  const lat = ville.lat + (Math.random() - 0.5) * 0.02;
  const lng = ville.lng + (Math.random() - 0.5) * 0.02;

  const churchName = `${nomEglise} de ${ville.nom}`;

  eglises.push({
    id: i + 1,
    adminId: pasteur.id,
    denominationId,
    nom: churchName,
    ville: ville.nom,
    cp: ville.cp,
    lat,
    lng,
    pasteurPrenom: pasteur.prenom,
    pasteurNom: pasteur.nom
  });

  const comma = i < 9999 ? ',' : ';';
  sql += `(${i + 1}, ${pasteur.id}, ${denominationId}, '${escapeSQL(churchName)}', ST_GeomFromText('POINT(${lng.toFixed(6)} ${lat.toFixed(6)})'), NOW())${comma}\n`;
}

// Générer les church_details
sql += `
-- ============================================
-- 7. CHURCH_DETAILS (1000 détails)
-- ============================================
INSERT INTO church_details (church_id, status, language_id, pastor_first_name, pastor_last_name, address, street_number, street_name, postal_code, city, phone, description, website, has_parking, parking_capacity, is_parking_free) VALUES
`;

for (let i = 0; i < 10000; i++) {
  const eglise = eglises[i];
  const rue = randomElement(rues);
  const numero = randomInt(1, 150);
  const description = randomElement(descriptions);
  const phone = generatePhone();
  const languageId = randomInt(1, 7); // Langues principales
  const hasParking = randomInt(0, 1);
  const parkingCapacity = hasParking ? randomInt(10, 100) : null;
  const isParkingFree = hasParking ? randomInt(0, 1) : 1;

  const fullAddress = `${numero} ${rue}, ${eglise.cp} ${eglise.ville}`;
  const website = i % 3 === 0 ? `https://www.${eglise.nom.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')}.fr` : 'NULL';

  const comma = i < 9999 ? ',' : ';';
  sql += `(${eglise.id}, 'ACTIVE', ${languageId}, '${escapeSQL(eglise.pasteurPrenom)}', '${escapeSQL(eglise.pasteurNom)}', '${escapeSQL(fullAddress)}', '${numero}', '${escapeSQL(rue)}', '${eglise.cp}', '${escapeSQL(eglise.ville)}', '${phone}', '${escapeSQL(description)}', ${website === 'NULL' ? 'NULL' : `'${website}'`}, ${hasParking}, ${parkingCapacity || 'NULL'}, ${isParkingFree})${comma}\n`;
}

// Générer les church_schedules
sql += `
-- ============================================
-- 8. CHURCH_SCHEDULES (~4000 horaires)
-- ============================================
INSERT INTO church_schedules (church_id, activity_type_id, day_of_week, start_time) VALUES
`;

const schedules = [];
const jours = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

for (let i = 0; i < 10000; i++) {
  const eglise = eglises[i];

  // Culte du dimanche (obligatoire)
  schedules.push(`(${eglise.id}, 1, 'SUNDAY', '10:00:00')`);

  // Réunion de prière (mercredi ou jeudi)
  const jourPriere = randomElement(['WEDNESDAY', 'THURSDAY']);
  schedules.push(`(${eglise.id}, 2, '${jourPriere}', '19:00:00')`);

  // Étude biblique ou groupe de jeunes
  if (randomInt(0, 1)) {
    schedules.push(`(${eglise.id}, 4, 'TUESDAY', '19:30:00')`);
  }
  if (randomInt(0, 1)) {
    schedules.push(`(${eglise.id}, 5, 'FRIDAY', '19:00:00')`);
  }

  // Évangélisation le samedi (parfois)
  if (randomInt(0, 2) === 0) {
    schedules.push(`(${eglise.id}, 3, 'SATURDAY', '14:00:00')`);
  }
}

sql += schedules.join(',\n') + ';\n';

// Générer les church_socials
sql += `
-- ============================================
-- 9. CHURCH_SOCIALS (~2500 réseaux sociaux)
-- ============================================
INSERT INTO church_socials (church_id, platform, url) VALUES
`;

const socials = [];
const platforms = ['FACEBOOK', 'INSTAGRAM', 'YOUTUBE'];

for (let i = 0; i < 10000; i++) {
  const eglise = eglises[i];
  const slug = eglise.nom.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '').substring(0, 30);

  // Facebook (presque toutes)
  if (randomInt(0, 4) > 0) {
    socials.push(`(${eglise.id}, 'FACEBOOK', 'https://www.facebook.com/${slug}')`);
  }

  // Instagram (beaucoup)
  if (randomInt(0, 2) > 0) {
    socials.push(`(${eglise.id}, 'INSTAGRAM', 'https://www.instagram.com/${slug}')`);
  }

  // YouTube (certaines)
  if (randomInt(0, 3) === 0) {
    socials.push(`(${eglise.id}, 'YOUTUBE', 'https://www.youtube.com/@${slug}')`);
  }
}

sql += socials.join(',\n') + ';\n';

// Générer les events (4 par église)
sql += `
-- ============================================
-- 10. EVENTS (4000 événements)
-- ============================================
INSERT INTO events (id, admin_id, church_id, title, language_id, start_datetime, end_datetime, event_location, created_at) VALUES
`;

const events = [];
let eventId = 1;

for (let i = 0; i < 10000; i++) {
  const eglise = eglises[i];
  const pasteur = pasteurs[i];

  for (let j = 0; j < 4; j++) {
    const titre = randomElement(titresEvenements);
    const startDate = generateFutureDate(12);
    const endDate = addHours(startDate, randomInt(2, 5));
    const languageId = randomInt(1, 5);

    // Légère variation de position pour l'événement
    const lat = eglise.lat + (Math.random() - 0.5) * 0.01;
    const lng = eglise.lng + (Math.random() - 0.5) * 0.01;

    events.push({
      id: eventId,
      adminId: pasteur.id,
      churchId: eglise.id,
      titre,
      startDate,
      endDate,
      lat,
      lng,
      ville: eglise.ville,
      cp: eglise.cp
    });

    const comma = eventId < 40000 ? ',' : ';';
    sql += `(${eventId}, ${pasteur.id}, ${eglise.id}, '${escapeSQL(titre)}', ${languageId}, '${formatDateTime(startDate)}', '${formatDateTime(endDate)}', ST_GeomFromText('POINT(${lng.toFixed(6)} ${lat.toFixed(6)})'), NOW())${comma}\n`;

    eventId++;
  }
}

// Générer les event_details
sql += `
-- ============================================
-- 11. EVENT_DETAILS (4000 détails)
-- ============================================
INSERT INTO event_details (event_id, description, max_seats, address, street_number, street_name, postal_code, city, speaker_name, has_parking, parking_capacity, is_parking_free, is_free, registration_link) VALUES
`;

for (let i = 0; i < events.length; i++) {
  const event = events[i];
  const description = randomElement(descriptionsEvenements);
  const maxSeats = randomInt(50, 500);
  const rue = randomElement(rues);
  const numero = randomInt(1, 150);
  const speaker = randomElement(speakers);
  const hasParking = randomInt(0, 1);
  const parkingCapacity = hasParking ? randomInt(20, 100) : null;
  const isParkingFree = randomInt(0, 1);
  const isFree = randomInt(0, 3) > 0 ? 1 : 0; // La plupart gratuits
  const registrationLink = isFree === 0 || randomInt(0, 1) ? 'NULL' : `'https://www.billetweb.fr/event-${event.id}'`;

  const fullAddress = `${numero} ${rue}, ${event.cp} ${event.ville}`;

  const comma = i < events.length - 1 ? ',' : ';';
  sql += `(${event.id}, '${escapeSQL(description)}', ${maxSeats}, '${escapeSQL(fullAddress)}', '${numero}', '${escapeSQL(rue)}', '${event.cp}', '${escapeSQL(event.ville)}', '${escapeSQL(speaker)}', ${hasParking}, ${parkingCapacity || 'NULL'}, ${isParkingFree}, ${isFree}, ${registrationLink})${comma}\n`;
}

sql += `
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DU SEED
-- Total: 2 super admins + 1000 pasteurs + 1000 églises + 4000 événements
-- ============================================
`;

// Écrire le fichier
fs.writeFileSync('/home/stephane/Documents/Code_Lab/Version_Control/Github/lighchurch/lightchurch-backend/database/seed-realiste.sql', sql);

console.log('Fichier seed-realiste.sql généré avec succès !');
console.log('Total admins: 1002');
console.log('Total églises: 1000');
console.log('Total événements: 4000');
console.log(`Total schedules: ${schedules.length}`);
console.log(`Total socials: ${socials.length}`);
