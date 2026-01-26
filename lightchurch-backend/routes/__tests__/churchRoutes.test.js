/**
 * Tests d'intégration pour les routes d'église (Pastor)
 *
 * Tests couverts:
 * - Authentification et autorisation
 * - Validation des données
 * - Création et mise à jour d'église
 * - Relations (socials, schedules)
 * - Transactions et rollbacks
 */

const request = require('supertest');
const express = require('express');
const churchRoutes = require('../churchRoutes');
const db = require('../../config/db');
const jwt = require('jsonwebtoken');

// Mock database
jest.mock('../../config/db');

// Create test app
const app = express();
app.use(express.json());
app.use('/church', churchRoutes);

describe('Church Routes - Pastor (POST /church/my-church)', () => {
  let validToken;
  let mockConnection;

  beforeEach(() => {
    // Generate a valid token for a pastor
    validToken = jwt.sign(
      { id: 1, email: 'pastor@test.com', role: 'PASTOR' },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );

    // Mock database connection
    mockConnection = {
      query: jest.fn(),
      beginTransaction: jest.fn(),
      commit: jest.fn(),
      rollback: jest.fn(),
      release: jest.fn()
    };

    db.getConnection = jest.fn().mockResolvedValue(mockConnection);
    db.query = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Authentication and Authorization', () => {
    it('devrait rejeter les requêtes sans token', async () => {
      const response = await request(app)
        .post('/church/my-church')
        .send({});

      expect(response.status).toBe(403);
      expect(response.body.message).toContain('token');
    });

    it('devrait rejeter les requêtes avec token invalide', async () => {
      const response = await request(app)
        .post('/church/my-church')
        .set('Authorization', 'Bearer invalid-token')
        .send({});

      expect(response.status).toBe(401);
    });

    it('devrait rejeter les requêtes d\'un utilisateur non-pastor', async () => {
      const evangelistToken = jwt.sign(
        { id: 2, email: 'evangelist@test.com', role: 'EVANGELIST' },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .post('/church/my-church')
        .set('Authorization', `Bearer ${evangelistToken}`)
        .send({});

      expect(response.status).toBe(403);
      expect(response.body.message).toContain('PASTOR');
    });
  });

  describe('Validation des données', () => {
    it('devrait rejeter une requête avec church_name manquant', async () => {
      const response = await request(app)
        .post('/church/my-church')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          denomination_id: 1,
          latitude: 48.8566,
          longitude: 2.3522
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('validation');
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'church_name'
          })
        ])
      );
    });

    it('devrait rejeter church_name trop court (< 3 caractères)', async () => {
      const response = await request(app)
        .post('/church/my-church')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          church_name: 'AB',
          denomination_id: 1,
          latitude: 48.8566,
          longitude: 2.3522
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'church_name',
            message: expect.stringContaining('3')
          })
        ])
      );
    });

    it('devrait rejeter latitude invalide (> 90)', async () => {
      const response = await request(app)
        .post('/church/my-church')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          church_name: 'Test Church',
          denomination_id: 1,
          latitude: 95,
          longitude: 2.3522
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'latitude'
          })
        ])
      );
    });

    it('devrait rejeter un code postal invalide (pas 5 chiffres)', async () => {
      const response = await request(app)
        .post('/church/my-church')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          church_name: 'Test Church',
          denomination_id: 1,
          latitude: 48.8566,
          longitude: 2.3522,
          postal_code: '1234' // Seulement 4 chiffres
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'postal_code',
            message: expect.stringContaining('5 chiffres')
          })
        ])
      );
    });

    it('devrait rejeter un nom de pasteur avec chiffres', async () => {
      const response = await request(app)
        .post('/church/my-church')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          church_name: 'Test Church',
          denomination_id: 1,
          latitude: 48.8566,
          longitude: 2.3522,
          pastor_first_name: 'Jean123' // Chiffres non autorisés
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'pastor_first_name',
            message: expect.stringContaining('lettres')
          })
        ])
      );
    });

    it('devrait rejeter une requête sans horaires', async () => {
      const response = await request(app)
        .post('/church/my-church')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          church_name: 'Test Church',
          denomination_id: 1,
          latitude: 48.8566,
          longitude: 2.3522,
          schedules: [] // Vide, au moins 1 requis
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'schedules',
            message: expect.stringContaining('Au moins un horaire')
          })
        ])
      );
    });

    it('devrait rejeter un horaire avec format invalide', async () => {
      const response = await request(app)
        .post('/church/my-church')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          church_name: 'Test Church',
          denomination_id: 1,
          latitude: 48.8566,
          longitude: 2.3522,
          schedules: [
            {
              activity_type_id: 1,
              day_of_week: 'SUNDAY',
              start_time: '25:00' // Heure invalide
            }
          ]
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'schedules[0].start_time',
            message: expect.stringContaining('HH:MM')
          })
        ])
      );
    });

    it('devrait rejeter une plateforme sociale invalide', async () => {
      const response = await request(app)
        .post('/church/my-church')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          church_name: 'Test Church',
          denomination_id: 1,
          latitude: 48.8566,
          longitude: 2.3522,
          schedules: [
            {
              activity_type_id: 1,
              day_of_week: 'SUNDAY',
              start_time: '10:00'
            }
          ],
          socials: [
            {
              platform: 'TWITTER', // Pas dans la liste autorisée
              url: 'https://twitter.com/test'
            }
          ]
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'socials[0].platform'
          })
        ])
      );
    });
  });

  describe('Création d\'une nouvelle église', () => {
    it('devrait créer une église avec succès (données minimales)', async () => {
      // Mock: Pas d'église existante
      mockConnection.query
        .mockResolvedValueOnce([[]]) // SELECT existing churches
        .mockResolvedValueOnce([{ insertId: 10 }]) // INSERT church
        .mockResolvedValueOnce([[]]) // SELECT existing details
        .mockResolvedValueOnce([{ insertId: 1 }]); // INSERT details

      const churchData = {
        church_name: 'Église Test',
        denomination_id: 1,
        latitude: 48.8566,
        longitude: 2.3522,
        address: '123 Rue de Test',
        street_number: '123',
        street_name: 'Rue de Test',
        postal_code: '75001',
        city: 'Paris',
        phone: '0123456789',
        pastor_first_name: 'Jean',
        pastor_last_name: 'Dupont',
        has_parking: false,
        schedules: [
          {
            activity_type_id: 1,
            day_of_week: 'SUNDAY',
            start_time: '10:00'
          }
        ]
      };

      const response = await request(app)
        .post('/church/my-church')
        .set('Authorization', `Bearer ${validToken}`)
        .send(churchData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Église sauvegardée avec succès');
      expect(response.body).toHaveProperty('churchId', 10);
      expect(mockConnection.beginTransaction).toHaveBeenCalled();
      expect(mockConnection.commit).toHaveBeenCalled();
      expect(mockConnection.release).toHaveBeenCalled();
    });

    it('devrait créer une église avec toutes les données optionnelles', async () => {
      mockConnection.query
        .mockResolvedValueOnce([[]]) // No existing church
        .mockResolvedValueOnce([{ insertId: 11 }]) // INSERT church
        .mockResolvedValueOnce([[]]) // No existing details
        .mockResolvedValueOnce([{ insertId: 1 }]) // INSERT details
        .mockResolvedValueOnce([{ affectedRows: 0 }]) // DELETE socials (aucun à supprimer)
        .mockResolvedValueOnce([{ affectedRows: 2 }]) // INSERT socials
        .mockResolvedValueOnce([{ affectedRows: 0 }]) // DELETE schedules
        .mockResolvedValueOnce([{ affectedRows: 2 }]); // INSERT schedules

      const churchData = {
        church_name: 'Église Complète',
        denomination_id: 2,
        latitude: 43.6047,
        longitude: 1.4442,
        address: '45 Avenue Victor Hugo',
        street_number: '45',
        street_name: 'Avenue Victor Hugo',
        postal_code: '31000',
        city: 'Toulouse',
        phone: '+33 5 61 23 45 67',
        website: 'https://www.eglise-test.fr',
        pastor_first_name: 'Marie',
        pastor_last_name: 'Martin',
        description: 'Une belle église accueillante',
        has_parking: true,
        parking_capacity: 50,
        is_parking_free: true,
        logo_url: 'https://example.com/logo.png',
        socials: [
          { platform: 'FACEBOOK', url: 'https://facebook.com/eglise' },
          { platform: 'YOUTUBE', url: 'https://youtube.com/eglise' }
        ],
        schedules: [
          { activity_type_id: 1, day_of_week: 'SUNDAY', start_time: '09:00' },
          { activity_type_id: 2, day_of_week: 'WEDNESDAY', start_time: '19:00' }
        ]
      };

      const response = await request(app)
        .post('/church/my-church')
        .set('Authorization', `Bearer ${validToken}`)
        .send(churchData);

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('succès');
      expect(mockConnection.commit).toHaveBeenCalled();
    });
  });

  describe('Mise à jour d\'une église existante', () => {
    it('devrait mettre à jour une église existante', async () => {
      // Mock: Église existante trouvée
      mockConnection.query
        .mockResolvedValueOnce([[{ id: 5 }]]) // SELECT existing church
        .mockResolvedValueOnce([{ affectedRows: 1 }]) // UPDATE church
        .mockResolvedValueOnce([[{ church_id: 5 }]]) // SELECT existing details
        .mockResolvedValueOnce([{ affectedRows: 1 }]) // UPDATE details
        .mockResolvedValueOnce([{ affectedRows: 2 }]) // DELETE old socials
        .mockResolvedValueOnce([{ affectedRows: 1 }]) // INSERT new socials
        .mockResolvedValueOnce([{ affectedRows: 3 }]) // DELETE old schedules
        .mockResolvedValueOnce([{ affectedRows: 1 }]); // INSERT new schedules

      const churchData = {
        church_name: 'Église Mise à Jour',
        denomination_id: 1,
        latitude: 48.8566,
        longitude: 2.3522,
        address: '789 Boulevard Nouveau',
        street_number: '789',
        street_name: 'Boulevard Nouveau',
        postal_code: '75002',
        city: 'Paris',
        phone: '0198765432',
        pastor_first_name: 'Paul',
        pastor_last_name: 'Lefebvre',
        has_parking: false,
        socials: [
          { platform: 'INSTAGRAM', url: 'https://instagram.com/eglise' }
        ],
        schedules: [
          { activity_type_id: 1, day_of_week: 'SUNDAY', start_time: '11:00' }
        ]
      };

      const response = await request(app)
        .post('/church/my-church')
        .set('Authorization', `Bearer ${validToken}`)
        .send(churchData);

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('succès');

      // Verify UPDATE was called instead of INSERT for church
      expect(mockConnection.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE churches'),
        expect.any(Array)
      );
    });

    it('devrait remplacer les réseaux sociaux et horaires existants', async () => {
      mockConnection.query
        .mockResolvedValueOnce([[{ id: 6 }]]) // Existing church
        .mockResolvedValueOnce([{ affectedRows: 1 }]) // UPDATE church
        .mockResolvedValueOnce([[{ church_id: 6 }]]) // Existing details
        .mockResolvedValueOnce([{ affectedRows: 1 }]) // UPDATE details
        .mockResolvedValueOnce([{ affectedRows: 2 }]) // DELETE socials
        .mockResolvedValueOnce([{ affectedRows: 0 }]) // No new socials
        .mockResolvedValueOnce([{ affectedRows: 1 }]) // DELETE schedules
        .mockResolvedValueOnce([{ affectedRows: 2 }]); // INSERT new schedules

      const churchData = {
        church_name: 'Église Test',
        denomination_id: 1,
        latitude: 48.8566,
        longitude: 2.3522,
        address: '123 Rue Test',
        street_number: '123',
        street_name: 'Rue Test',
        postal_code: '75001',
        city: 'Paris',
        phone: '0123456789',
        pastor_first_name: 'Jean',
        pastor_last_name: 'Dupont',
        has_parking: false,
        socials: [], // Suppression de tous les réseaux sociaux
        schedules: [
          { activity_type_id: 1, day_of_week: 'SUNDAY', start_time: '10:00' },
          { activity_type_id: 1, day_of_week: 'SUNDAY', start_time: '18:00' }
        ]
      };

      const response = await request(app)
        .post('/church/my-church')
        .set('Authorization', `Bearer ${validToken}`)
        .send(churchData);

      expect(response.status).toBe(200);

      // Verify DELETE was called for socials
      expect(mockConnection.query).toHaveBeenCalledWith(
        'DELETE FROM church_socials WHERE church_id = ?',
        expect.any(Array)
      );

      // Verify DELETE was called for schedules
      expect(mockConnection.query).toHaveBeenCalledWith(
        'DELETE FROM church_schedules WHERE church_id = ?',
        expect.any(Array)
      );
    });
  });

  describe('Gestion des erreurs et rollback', () => {
    it('devrait effectuer un rollback en cas d\'erreur SQL', async () => {
      mockConnection.query
        .mockResolvedValueOnce([[]]) // SELECT existing
        .mockRejectedValueOnce(new Error('SQL Error')); // INSERT fails

      const churchData = {
        church_name: 'Église Test',
        denomination_id: 1,
        latitude: 48.8566,
        longitude: 2.3522,
        address: '123 Rue Test',
        street_number: '123',
        street_name: 'Rue Test',
        postal_code: '75001',
        city: 'Paris',
        phone: '0123456789',
        pastor_first_name: 'Jean',
        pastor_last_name: 'Dupont',
        has_parking: false,
        schedules: [
          { activity_type_id: 1, day_of_week: 'SUNDAY', start_time: '10:00' }
        ]
      };

      const response = await request(app)
        .post('/church/my-church')
        .set('Authorization', `Bearer ${validToken}`)
        .send(churchData);

      expect(response.status).toBe(500);
      expect(response.body.message).toContain('Erreur serveur');
      expect(mockConnection.rollback).toHaveBeenCalled();
      expect(mockConnection.commit).not.toHaveBeenCalled();
      expect(mockConnection.release).toHaveBeenCalled();
    });

    it('devrait gérer les erreurs de connexion à la base de données', async () => {
      db.getConnection.mockRejectedValueOnce(new Error('Connection failed'));

      const churchData = {
        church_name: 'Église Test',
        denomination_id: 1,
        latitude: 48.8566,
        longitude: 2.3522,
        address: '123 Rue Test',
        street_number: '123',
        street_name: 'Rue Test',
        postal_code: '75001',
        city: 'Paris',
        phone: '0123456789',
        pastor_first_name: 'Jean',
        pastor_last_name: 'Dupont',
        has_parking: false,
        schedules: [
          { activity_type_id: 1, day_of_week: 'SUNDAY', start_time: '10:00' }
        ]
      };

      const response = await request(app)
        .post('/church/my-church')
        .set('Authorization', `Bearer ${validToken}`)
        .send(churchData);

      expect(response.status).toBe(500);
    });
  });

  describe('Champs conditionnels parking', () => {
    it('devrait accepter parking_capacity si has_parking est true', async () => {
      mockConnection.query
        .mockResolvedValueOnce([[]]) // No existing
        .mockResolvedValueOnce([{ insertId: 12 }]) // INSERT church
        .mockResolvedValueOnce([[]]) // No details
        .mockResolvedValueOnce([{ insertId: 1 }]) // INSERT details
        .mockResolvedValueOnce([{ affectedRows: 0 }]) // DELETE socials
        .mockResolvedValueOnce([{ affectedRows: 0 }]) // DELETE schedules
        .mockResolvedValueOnce([{ affectedRows: 1 }]); // INSERT schedules

      const churchData = {
        church_name: 'Église avec Parking',
        denomination_id: 1,
        latitude: 48.8566,
        longitude: 2.3522,
        address: '123 Rue Test',
        street_number: '123',
        street_name: 'Rue Test',
        postal_code: '75001',
        city: 'Paris',
        phone: '0123456789',
        pastor_first_name: 'Jean',
        pastor_last_name: 'Dupont',
        has_parking: true,
        parking_capacity: 100,
        is_parking_free: true,
        schedules: [
          { activity_type_id: 1, day_of_week: 'SUNDAY', start_time: '10:00' }
        ]
      };

      const response = await request(app)
        .post('/church/my-church')
        .set('Authorization', `Bearer ${validToken}`)
        .send(churchData);

      expect(response.status).toBe(200);
      expect(mockConnection.commit).toHaveBeenCalled();
    });

    it('devrait accepter has_parking false sans parking_capacity', async () => {
      mockConnection.query
        .mockResolvedValueOnce([[]]) // No existing
        .mockResolvedValueOnce([{ insertId: 13 }]) // INSERT church
        .mockResolvedValueOnce([[]]) // No details
        .mockResolvedValueOnce([{ insertId: 1 }]) // INSERT details
        .mockResolvedValueOnce([{ affectedRows: 0 }]) // DELETE socials
        .mockResolvedValueOnce([{ affectedRows: 0 }]) // DELETE schedules
        .mockResolvedValueOnce([{ affectedRows: 1 }]); // INSERT schedules

      const churchData = {
        church_name: 'Église sans Parking',
        denomination_id: 1,
        latitude: 48.8566,
        longitude: 2.3522,
        address: '123 Rue Test',
        street_number: '123',
        street_name: 'Rue Test',
        postal_code: '75001',
        city: 'Paris',
        phone: '0123456789',
        pastor_first_name: 'Jean',
        pastor_last_name: 'Dupont',
        has_parking: false,
        schedules: [
          { activity_type_id: 1, day_of_week: 'SUNDAY', start_time: '10:00' }
        ]
      };

      const response = await request(app)
        .post('/church/my-church')
        .set('Authorization', `Bearer ${validToken}`)
        .send(churchData);

      expect(response.status).toBe(200);
    });
  });
});

describe('Church Routes - Pastor (GET /church/my-church)', () => {
  let validToken;

  beforeEach(() => {
    validToken = jwt.sign(
      { id: 1, email: 'pastor@test.com', role: 'PASTOR' },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );

    db.query = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Récupération de l\'église', () => {
    it('devrait retourner l\'église avec toutes ses relations', async () => {
      const mockChurch = {
        id: 1,
        church_name: 'Église Test',
        denomination_id: 1,
        longitude: 2.3522,
        latitude: 48.8566
      };

      const mockDetails = {
        church_id: 1,
        description: 'Description test',
        address: '123 Rue Test',
        city: 'Paris',
        phone: '0123456789'
      };

      const mockSocials = [
        { church_id: 1, platform: 'FACEBOOK', url: 'https://facebook.com/test' }
      ];

      const mockSchedules = [
        { church_id: 1, activity_type_id: 1, day_of_week: 'SUNDAY', start_time: '10:00:00' }
      ];

      db.query
        .mockResolvedValueOnce([[mockChurch]]) // SELECT churches
        .mockResolvedValueOnce([[mockDetails]]) // SELECT details
        .mockResolvedValueOnce([mockSocials]) // SELECT socials
        .mockResolvedValueOnce([mockSchedules]); // SELECT schedules

      const response = await request(app)
        .get('/church/my-church')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: 1,
        church_name: 'Église Test',
        details: expect.objectContaining({
          description: 'Description test'
        }),
        socials: expect.arrayContaining([
          expect.objectContaining({ platform: 'FACEBOOK' })
        ]),
        schedules: expect.arrayContaining([
          expect.objectContaining({ day_of_week: 'SUNDAY' })
        ])
      });
    });

    it('devrait retourner 404 si aucune église n\'existe pour le pasteur', async () => {
      db.query.mockResolvedValueOnce([[]]); // No churches found

      const response = await request(app)
        .get('/church/my-church')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toContain('Aucune église associée');
    });

    it('devrait retourner des tableaux vides si pas de socials/schedules', async () => {
      const mockChurch = {
        id: 2,
        church_name: 'Église Simple',
        denomination_id: 1,
        longitude: 2.3522,
        latitude: 48.8566
      };

      db.query
        .mockResolvedValueOnce([[mockChurch]]) // Church found
        .mockResolvedValueOnce([[]]) // No details
        .mockResolvedValueOnce([[]]) // No socials
        .mockResolvedValueOnce([[]]); // No schedules

      const response = await request(app)
        .get('/church/my-church')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.details).toEqual({});
      expect(response.body.socials).toEqual([]);
      expect(response.body.schedules).toEqual([]);
    });
  });

  describe('Gestion des erreurs', () => {
    it('devrait retourner 500 en cas d\'erreur serveur', async () => {
      db.query.mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app)
        .get('/church/my-church')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(500);
      expect(response.body.message).toContain('Erreur serveur');
    });
  });
});
