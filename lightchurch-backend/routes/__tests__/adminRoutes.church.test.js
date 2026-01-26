/**
 * Tests d'intégration pour les routes d'église (Admin)
 *
 * Tests couverts:
 * - Authentification SUPER_ADMIN uniquement
 * - Listage des églises avec pagination et filtres
 * - Récupération d'une église spécifique
 * - Mise à jour d'une église (mode admin)
 * - Récupération des villes disponibles
 */

const request = require('supertest');
const express = require('express');
const adminRoutes = require('../adminRoutes');
const db = require('../../config/db');
const jwt = require('jsonwebtoken');

// Mock database
jest.mock('../../config/db');

// Create test app
const app = express();
app.use(express.json());
app.use('/admin', adminRoutes);

describe('Admin Church Routes - Authorization', () => {
  let superAdminToken;
  let pastorToken;

  beforeEach(() => {
    superAdminToken = jwt.sign(
      { id: 1, email: 'admin@test.com', role: 'SUPER_ADMIN' },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );

    pastorToken = jwt.sign(
      { id: 2, email: 'pastor@test.com', role: 'PASTOR' },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );

    db.query = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('devrait rejeter les requêtes sans token', async () => {
    const response = await request(app)
      .get('/admin/churches');

    expect(response.status).toBe(403);
    expect(response.body.message).toContain('token');
  });

  it('devrait rejeter les requêtes d\'un PASTOR', async () => {
    const response = await request(app)
      .get('/admin/churches')
      .set('Authorization', `Bearer ${pastorToken}`);

    expect(response.status).toBe(403);
    expect(response.body.message).toContain('SUPER_ADMIN');
  });

  it('devrait accepter les requêtes d\'un SUPER_ADMIN', async () => {
    // Mock successful response
    db.query
      .mockResolvedValueOnce([[{ total: 0 }]]) // Count
      .mockResolvedValueOnce([[]]); // Empty list

    const response = await request(app)
      .get('/admin/churches')
      .set('Authorization', `Bearer ${superAdminToken}`);

    expect(response.status).toBe(200);
  });
});

describe('Admin Church Routes - GET /admin/churches', () => {
  let superAdminToken;

  beforeEach(() => {
    superAdminToken = jwt.sign(
      { id: 1, email: 'admin@test.com', role: 'SUPER_ADMIN' },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );

    db.query = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Pagination', () => {
    it('devrait retourner les églises avec pagination par défaut (page 1, limit 10)', async () => {
      const mockChurches = [
        { id: 1, church_name: 'Église 1', denomination: 'Baptiste', first_name: 'Jean', last_name: 'Dupont', city: 'Paris' },
        { id: 2, church_name: 'Église 2', denomination: 'Évangélique', first_name: 'Marie', last_name: 'Martin', city: 'Lyon' }
      ];

      db.query
        .mockResolvedValueOnce([[{ total: 25 }]]) // Total count
        .mockResolvedValueOnce([mockChurches]); // Churches list

      const response = await request(app)
        .get('/admin/churches')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('churches');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.pagination).toMatchObject({
        page: 1,
        limit: 10,
        total: 25,
        totalPages: 3
      });
      expect(response.body.churches).toHaveLength(2);
    });

    it('devrait accepter les paramètres de pagination personnalisés', async () => {
      db.query
        .mockResolvedValueOnce([[{ total: 50 }]]) // Count
        .mockResolvedValueOnce([[]]); // Churches

      const response = await request(app)
        .get('/admin/churches?page=2&limit=20')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.pagination).toMatchObject({
        page: 2,
        limit: 20,
        total: 50,
        totalPages: 3
      });

      // Verify offset calculation (page 2, limit 20 = offset 20)
      expect(db.query).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining([20, 20]) // limit, offset
      );
    });
  });

  describe('Filtres', () => {
    it('devrait filtrer par dénomination', async () => {
      db.query
        .mockResolvedValueOnce([[{ total: 5 }]]) // Count
        .mockResolvedValueOnce([[]]); // Churches

      const response = await request(app)
        .get('/admin/churches?denomination=1')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(response.status).toBe(200);

      // Verify denomination filter was applied (query params are strings)
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('c.denomination_id = ?'),
        expect.arrayContaining(['1'])
      );
    });

    it('devrait filtrer par ville', async () => {
      db.query
        .mockResolvedValueOnce([[{ total: 3 }]]) // Count
        .mockResolvedValueOnce([[]]); // Churches

      const response = await request(app)
        .get('/admin/churches?city=Paris')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(response.status).toBe(200);

      // Verify city filter was applied
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('cd.city = ?'),
        expect.arrayContaining(['Paris'])
      );
    });

    it('devrait rechercher par nom d\'église', async () => {
      db.query
        .mockResolvedValueOnce([[{ total: 2 }]]) // Count
        .mockResolvedValueOnce([[]]); // Churches

      const response = await request(app)
        .get('/admin/churches?search=Baptiste')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(response.status).toBe(200);

      // Verify search filter was applied
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('c.church_name LIKE ?'),
        expect.arrayContaining(['%Baptiste%'])
      );
    });

    it('devrait combiner plusieurs filtres', async () => {
      db.query
        .mockResolvedValueOnce([[{ total: 1 }]]) // Count
        .mockResolvedValueOnce([[]]); // Churches

      const response = await request(app)
        .get('/admin/churches?denomination=1&city=Paris&search=Test')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(response.status).toBe(200);

      // Verify multiple filters were applied (query params are strings)
      const queryCall = db.query.mock.calls[0];
      expect(queryCall[0]).toContain('c.denomination_id = ?');
      expect(queryCall[0]).toContain('cd.city = ?');
      expect(queryCall[0]).toContain('c.church_name LIKE ?');
      expect(queryCall[1]).toEqual(
        expect.arrayContaining(['1', 'Paris', '%Test%', '%Test%', '%Test%', '%Test%'])
      );
    });

    it('devrait ignorer les filtres vides ou "ALL"', async () => {
      db.query
        .mockResolvedValueOnce([[{ total: 10 }]]) // Count
        .mockResolvedValueOnce([[]]); // Churches

      const response = await request(app)
        .get('/admin/churches?denomination=ALL&city=&search=')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(response.status).toBe(200);

      // Verify only base WHERE clause
      const queryCall = db.query.mock.calls[0];
      expect(queryCall[0]).not.toContain('c.denomination_id = ?');
      expect(queryCall[0]).not.toContain('cd.city = ?');
    });
  });

  describe('Données retournées', () => {
    it('devrait retourner toutes les informations nécessaires pour chaque église', async () => {
      const mockChurches = [
        {
          id: 1,
          church_name: 'Église Test',
          denomination: 'Baptiste',
          denomination_id: 1,
          first_name: 'Jean',
          last_name: 'Dupont',
          created_at: new Date('2024-01-15'),
          city: 'Paris'
        }
      ];

      db.query
        .mockResolvedValueOnce([[{ total: 1 }]]) // Count
        .mockResolvedValueOnce([mockChurches]); // Churches

      const response = await request(app)
        .get('/admin/churches')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.churches[0]).toMatchObject({
        id: 1,
        church_name: 'Église Test',
        denomination: 'Baptiste',
        denomination_id: 1,
        first_name: 'Jean',
        last_name: 'Dupont',
        city: 'Paris'
      });
    });

    it('devrait retourner une liste vide si aucune église', async () => {
      db.query
        .mockResolvedValueOnce([[{ total: 0 }]]) // Count
        .mockResolvedValueOnce([[]]); // Empty list

      const response = await request(app)
        .get('/admin/churches')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.churches).toEqual([]);
      expect(response.body.pagination.total).toBe(0);
    });
  });

  describe('Gestion des erreurs', () => {
    it('devrait retourner 500 en cas d\'erreur de base de données', async () => {
      db.query.mockRejectedValueOnce(new Error('Database connection failed'));

      const response = await request(app)
        .get('/admin/churches')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(response.status).toBe(500);
      expect(response.body.message).toContain('Erreur serveur');
    });
  });
});

describe('Admin Church Routes - GET /admin/cities', () => {
  let superAdminToken;

  beforeEach(() => {
    superAdminToken = jwt.sign(
      { id: 1, email: 'admin@test.com', role: 'SUPER_ADMIN' },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );

    db.query = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('devrait retourner la liste de toutes les villes', async () => {
    const mockCities = [
      { city: 'Paris' },
      { city: 'Lyon' },
      { city: 'Marseille' }
    ];

    db.query.mockResolvedValueOnce([mockCities]);

    const response = await request(app)
      .get('/admin/cities')
      .set('Authorization', `Bearer ${superAdminToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(['Paris', 'Lyon', 'Marseille']);
  });

  it('devrait retourner une liste vide si aucune ville', async () => {
    db.query.mockResolvedValueOnce([[]]);

    const response = await request(app)
      .get('/admin/cities')
      .set('Authorization', `Bearer ${superAdminToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it('devrait exclure les villes NULL ou vides', async () => {
    // Verify the SQL query filters out NULL and empty cities
    db.query.mockResolvedValueOnce([[]]);

    const response = await request(app)
      .get('/admin/cities')
      .set('Authorization', `Bearer ${superAdminToken}`);

    expect(response.status).toBe(200);
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('WHERE city IS NOT NULL AND city != \'\'')
    );
  });
});

describe('Admin Church Routes - GET /admin/churches/:id', () => {
  let superAdminToken;

  beforeEach(() => {
    superAdminToken = jwt.sign(
      { id: 1, email: 'admin@test.com', role: 'SUPER_ADMIN' },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );

    db.query = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('devrait retourner une église complète avec toutes ses relations', async () => {
    const mockChurch = {
      id: 1,
      church_name: 'Église Test',
      admin_id: 5,
      denomination_id: 1,
      longitude: 2.3522,
      latitude: 48.8566
    };

    const mockDetails = {
      church_id: 1,
      description: 'Description',
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

    const mockEvents = [
      {
        id: 1,
        title: 'Culte de dimanche',
        start_datetime: new Date('2025-01-05 10:00:00'),
        end_datetime: new Date('2025-01-05 12:00:00'),
        cancelled_at: null,
        cancellation_reason: null,
        cancelled_by: null,
        description: 'Culte hebdomadaire'
      }
    ];

    db.query
      .mockResolvedValueOnce([[mockChurch]]) // SELECT church
      .mockResolvedValueOnce([[mockDetails]]) // SELECT details
      .mockResolvedValueOnce([mockSocials]) // SELECT socials
      .mockResolvedValueOnce([mockSchedules]) // SELECT schedules
      .mockResolvedValueOnce([mockEvents]); // SELECT events

    const response = await request(app)
      .get('/admin/churches/1')
      .set('Authorization', `Bearer ${superAdminToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: 1,
      church_name: 'Église Test',
      admin_id: 5,
      details: expect.objectContaining({
        description: 'Description'
      }),
      socials: expect.arrayContaining([
        expect.objectContaining({ platform: 'FACEBOOK' })
      ]),
      schedules: expect.arrayContaining([
        expect.objectContaining({ day_of_week: 'SUNDAY' })
      ]),
      events: expect.any(Array)
    });
  });

  it('devrait retourner 404 si l\'église n\'existe pas', async () => {
    db.query.mockResolvedValueOnce([[]]); // No church found

    const response = await request(app)
      .get('/admin/churches/999')
      .set('Authorization', `Bearer ${superAdminToken}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toContain('non trouvée');
  });

  it('devrait retourner des objets/tableaux vides pour les relations manquantes', async () => {
    const mockChurch = {
      id: 2,
      church_name: 'Église Simple',
      admin_id: 3,
      denomination_id: 1,
      longitude: 2.3522,
      latitude: 48.8566
    };

    db.query
      .mockResolvedValueOnce([[mockChurch]]) // Church found
      .mockResolvedValueOnce([[]]) // No details
      .mockResolvedValueOnce([[]]) // No socials
      .mockResolvedValueOnce([[]]) // No schedules
      .mockResolvedValueOnce([[]]); // No events

    const response = await request(app)
      .get('/admin/churches/2')
      .set('Authorization', `Bearer ${superAdminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.details).toEqual({});
    expect(response.body.socials).toEqual([]);
    expect(response.body.schedules).toEqual([]);
    expect(response.body.events).toEqual([]);
  });

  it('devrait enrichir les événements avec leur statut calculé', async () => {
    const mockChurch = {
      id: 1,
      church_name: 'Église Test',
      admin_id: 5,
      denomination_id: 1,
      longitude: 2.3522,
      latitude: 48.8566
    };

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);

    const mockEvents = [
      {
        id: 1,
        title: 'Culte futur',
        start_datetime: futureDate,
        end_datetime: new Date(futureDate.getTime() + 2 * 60 * 60 * 1000),
        cancelled_at: null,
        cancellation_reason: null,
        cancelled_by: null,
        description: 'Test'
      }
    ];

    db.query
      .mockResolvedValueOnce([[mockChurch]]) // Church
      .mockResolvedValueOnce([[]]) // Details
      .mockResolvedValueOnce([[]]) // Socials
      .mockResolvedValueOnce([[]]) // Schedules
      .mockResolvedValueOnce([mockEvents]); // Events

    const response = await request(app)
      .get('/admin/churches/1')
      .set('Authorization', `Bearer ${superAdminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.events).toHaveLength(1);
    // The enrichEventsWithStatus function should add a status field
    expect(response.body.events[0]).toHaveProperty('status');
  });
});

describe('Admin Church Routes - PUT /admin/churches/:id', () => {
  let superAdminToken;
  let mockConnection;

  beforeEach(() => {
    superAdminToken = jwt.sign(
      { id: 1, email: 'admin@test.com', role: 'SUPER_ADMIN' },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );

    mockConnection = {
      query: jest.fn(),
      beginTransaction: jest.fn(),
      commit: jest.fn(),
      rollback: jest.fn(),
      release: jest.fn()
    };

    db.getConnection = jest.fn().mockResolvedValue(mockConnection);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Mise à jour réussie', () => {
    it('devrait mettre à jour une église existante', async () => {
      mockConnection.query
        .mockResolvedValueOnce([{ affectedRows: 1 }]) // UPDATE church
        .mockResolvedValueOnce([[{ church_id: 5 }]]) // SELECT existing details
        .mockResolvedValueOnce([{ affectedRows: 1 }]) // UPDATE details
        .mockResolvedValueOnce([{ affectedRows: 2 }]) // DELETE old socials
        .mockResolvedValueOnce([{ affectedRows: 1 }]) // INSERT new socials
        .mockResolvedValueOnce([{ affectedRows: 3 }]) // DELETE old schedules
        .mockResolvedValueOnce([{ affectedRows: 2 }]); // INSERT new schedules

      const churchData = {
        church_name: 'Église Mise à Jour',
        denomination_id: 2,
        latitude: 43.6047,
        longitude: 1.4442,
        address: '45 Avenue Test',
        street_number: '45',
        street_name: 'Avenue Test',
        postal_code: '31000',
        city: 'Toulouse',
        phone: '0561234567',
        pastor_first_name: 'Marie',
        pastor_last_name: 'Martin',
        has_parking: true,
        parking_capacity: 50,
        is_parking_free: true,
        socials: [
          { platform: 'FACEBOOK', url: 'https://facebook.com/church' }
        ],
        schedules: [
          { activity_type_id: 1, day_of_week: 'SUNDAY', start_time: '10:00' },
          { activity_type_id: 2, day_of_week: 'WEDNESDAY', start_time: '19:00' }
        ]
      };

      const response = await request(app)
        .put('/admin/churches/5')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(churchData);

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('mise à jour');
      expect(mockConnection.commit).toHaveBeenCalled();
      expect(mockConnection.rollback).not.toHaveBeenCalled();
      expect(mockConnection.release).toHaveBeenCalled();
    });

    it('devrait créer les détails s\'ils n\'existent pas', async () => {
      mockConnection.query
        .mockResolvedValueOnce([{ affectedRows: 1 }]) // UPDATE church
        .mockResolvedValueOnce([[]]) // No existing details
        .mockResolvedValueOnce([{ insertId: 1 }]) // INSERT new details
        .mockResolvedValueOnce([{ affectedRows: 0 }]) // DELETE socials
        .mockResolvedValueOnce([{ affectedRows: 0 }]) // DELETE schedules
        .mockResolvedValueOnce([{ affectedRows: 1 }]); // INSERT schedules

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
        .put('/admin/churches/10')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(churchData);

      expect(response.status).toBe(200);

      // Verify INSERT was called for details
      expect(mockConnection.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO church_details'),
        expect.any(Array)
      );
    });

    it('devrait gérer les champs optionnels (description, website, logo_url)', async () => {
      mockConnection.query
        .mockResolvedValueOnce([{ affectedRows: 1 }]) // UPDATE church
        .mockResolvedValueOnce([[{ church_id: 1 }]]) // Existing details
        .mockResolvedValueOnce([{ affectedRows: 1 }]) // UPDATE details
        .mockResolvedValueOnce([{ affectedRows: 0 }]) // DELETE socials
        .mockResolvedValueOnce([{ affectedRows: 0 }]) // DELETE schedules
        .mockResolvedValueOnce([{ affectedRows: 1 }]); // INSERT schedules

      const churchData = {
        church_name: 'Église Complète',
        denomination_id: 1,
        latitude: 48.8566,
        longitude: 2.3522,
        address: '123 Rue Test',
        street_number: '123',
        street_name: 'Rue Test',
        postal_code: '75001',
        city: 'Paris',
        phone: '0123456789',
        website: 'https://www.eglise-test.fr',
        description: 'Une belle église',
        logo_url: 'https://example.com/logo.png',
        pastor_first_name: 'Jean',
        pastor_last_name: 'Dupont',
        has_parking: false,
        schedules: [
          { activity_type_id: 1, day_of_week: 'SUNDAY', start_time: '10:00' }
        ]
      };

      const response = await request(app)
        .put('/admin/churches/1')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(churchData);

      expect(response.status).toBe(200);
      expect(mockConnection.commit).toHaveBeenCalled();
    });

    it('devrait remplacer complètement les socials et schedules', async () => {
      mockConnection.query
        .mockResolvedValueOnce([{ affectedRows: 1 }]) // UPDATE church
        .mockResolvedValueOnce([[{ church_id: 1 }]]) // Existing details
        .mockResolvedValueOnce([{ affectedRows: 1 }]) // UPDATE details
        .mockResolvedValueOnce([{ affectedRows: 3 }]) // DELETE old socials
        .mockResolvedValueOnce([{ affectedRows: 2 }]) // INSERT new socials
        .mockResolvedValueOnce([{ affectedRows: 5 }]) // DELETE old schedules
        .mockResolvedValueOnce([{ affectedRows: 1 }]); // INSERT new schedules

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
        socials: [
          { platform: 'FACEBOOK', url: 'https://facebook.com/new' },
          { platform: 'YOUTUBE', url: 'https://youtube.com/new' }
        ],
        schedules: [
          { activity_type_id: 1, day_of_week: 'SUNDAY', start_time: '11:00' }
        ]
      };

      const response = await request(app)
        .put('/admin/churches/1')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(churchData);

      expect(response.status).toBe(200);

      // Verify DELETE was called for both
      expect(mockConnection.query).toHaveBeenCalledWith(
        'DELETE FROM church_socials WHERE church_id = ?',
        expect.any(Array)
      );
      expect(mockConnection.query).toHaveBeenCalledWith(
        'DELETE FROM church_schedules WHERE church_id = ?',
        expect.any(Array)
      );
    });
  });

  describe('Gestion des erreurs', () => {
    it('devrait effectuer un rollback en cas d\'erreur SQL', async () => {
      mockConnection.query
        .mockResolvedValueOnce([{ affectedRows: 1 }]) // UPDATE church success
        .mockRejectedValueOnce(new Error('SQL Error')); // SELECT details fails

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
        .put('/admin/churches/1')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(churchData);

      expect(response.status).toBe(500);
      expect(response.body.message).toContain('Erreur serveur');
      expect(mockConnection.rollback).toHaveBeenCalled();
      expect(mockConnection.commit).not.toHaveBeenCalled();
      expect(mockConnection.release).toHaveBeenCalled();
    });

    it('devrait gérer les erreurs de connexion à la base', async () => {
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
        .put('/admin/churches/1')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(churchData);

      expect(response.status).toBe(500);
    });
  });
});
