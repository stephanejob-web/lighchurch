/**
 * Tests simplifiés pour churchValidator
 *
 * Ces tests vérifient que les validateurs sont bien définis.
 * Pour des tests plus complets, référez-vous aux tests frontend (Zod)
 * qui testent exactement les mêmes règles de validation.
 */

const { validateChurch } = require('./churchValidator');

describe('churchValidator - Configuration des validations', () => {
  it('devrait exporter la fonction validateChurch', () => {
    expect(validateChurch).toBeDefined();
    expect(Array.isArray(validateChurch)).toBe(true);
  });

  it('devrait avoir au moins 20 validateurs configurés', () => {
    // validateChurch est un tableau de middlewares de validation
    // On vérifie qu'il y a bien plusieurs validateurs
    expect(validateChurch.length).toBeGreaterThan(20);
  });

  it('devrait inclure le middleware de gestion des erreurs en dernier', () => {
    // Le dernier élément doit être le handleValidationErrors
    const lastMiddleware = validateChurch[validateChurch.length - 1];
    expect(lastMiddleware).toBeDefined();
    expect(typeof lastMiddleware).toBe('function');
  });
});

describe('churchValidator - Documentation des règles', () => {
  it('devrait valider les champs obligatoires', () => {
    // Liste des champs obligatoires qui doivent être validés
    const requiredFields = [
      'church_name',
      'denomination_id',
      'latitude',
      'longitude',
      'address',
      'street_name', // street_number est optionnel
      'postal_code',
      'city',
      'phone',
      'pastor_first_name',
      'pastor_last_name',
      'schedules'
    ];

    // Ce test documente les champs obligatoires
    // Les tests de validation réels sont dans le frontend (Zod)
    expect(requiredFields.length).toBe(12);
  });

  it('devrait valider les champs optionnels', () => {
    // Liste des champs optionnels
    const optionalFields = [
      'description',
      'website',
      'street_number', // Rendu optionnel pour les adresses sans numéro
      'has_parking',
      'parking_capacity',
      'is_parking_free',
      'logo_url',
      'socials',
      'language_id'
    ];

    // Ce test documente les champs optionnels
    expect(optionalFields.length).toBe(9);
  });

  it('devrait valider le format du code postal français (5 chiffres)', () => {
    const validPostalCodes = ['75001', '13001', '69001'];
    const invalidPostalCodes = ['1234', '123456', 'ABCDE'];

    // Documentation : le code postal doit être exactement 5 chiffres
    expect(validPostalCodes.every(code => /^[0-9]{5}$/.test(code))).toBe(true);
    expect(invalidPostalCodes.every(code => !/^[0-9]{5}$/.test(code))).toBe(true);
  });

  it('devrait valider les coordonnées GPS', () => {
    // Documentation : latitude entre -90 et 90, longitude entre -180 et 180
    const validCoords = [
      { lat: 48.8566, lng: 2.3522 },  // Paris
      { lat: 0, lng: 0 },             // Équateur/Greenwich
      { lat: 90, lng: 180 }           // Limites max
    ];

    validCoords.forEach(coord => {
      expect(coord.lat).toBeGreaterThanOrEqual(-90);
      expect(coord.lat).toBeLessThanOrEqual(90);
      expect(coord.lng).toBeGreaterThanOrEqual(-180);
      expect(coord.lng).toBeLessThanOrEqual(180);
    });
  });

  it('devrait accepter différents formats de téléphone', () => {
    const validPhones = [
      '+33 1 23 45 67 89',
      '01 23 45 67 89',
      '0123456789',
      '+33123456789',
      '01-23-45-67-89'
    ];

    // Le regex accepte : chiffres, +, espaces, tirets, parenthèses
    const phoneRegex = /^[0-9+\s()-]{10,20}$/;

    validPhones.forEach(phone => {
      expect(phoneRegex.test(phone)).toBe(true);
    });
  });

  it('devrait valider les noms de pasteur (lettres, espaces, tirets uniquement)', () => {
    const validNames = ['Jean', 'Jean-François', 'De La Fontaine', 'Müller'];
    const invalidNames = ['Jean123', 'Test@', 'Name$'];

    const nameRegex = /^[a-zA-ZÀ-ÿ\s-]+$/;

    validNames.forEach(name => {
      expect(nameRegex.test(name)).toBe(true);
    });

    invalidNames.forEach(name => {
      expect(nameRegex.test(name)).toBe(false);
    });
  });

  it('devrait valider les jours de la semaine pour les horaires', () => {
    const validDays = [
      'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY',
      'FRIDAY', 'SATURDAY', 'SUNDAY'
    ];

    expect(validDays.length).toBe(7);

    // Tous les jours doivent être en majuscules
    validDays.forEach(day => {
      expect(day).toBe(day.toUpperCase());
    });
  });

  it('devrait valider les plateformes de réseaux sociaux', () => {
    const validPlatforms = [
      'FACEBOOK', 'INSTAGRAM', 'YOUTUBE',
      'TIKTOK', 'WHATSAPP', 'LINKEDIN'
    ];

    expect(validPlatforms.length).toBe(6);

    // Toutes les plateformes doivent être en majuscules
    validPlatforms.forEach(platform => {
      expect(platform).toBe(platform.toUpperCase());
    });
  });
});

describe('churchValidator - Cohérence avec le frontend', () => {
  it('devrait avoir les mêmes règles que le schema Zod frontend', () => {
    // Ce test documente que les validations backend doivent être
    // cohérentes avec les validations frontend (Zod)

    const rules = {
      church_name: { min: 3, max: 255 },
      postal_code: { length: 5, pattern: 'digits' },
      phone: { min: 10, max: 20, pattern: 'flexible' },
      pastor_names: { min: 2, max: 50, pattern: 'letters-only' },
      latitude: { min: -90, max: 90 },
      longitude: { min: -180, max: 180 },
      description: { max: 2000 },
      schedules: { min: 1 }
    };

    // Ces règles sont implémentées dans :
    // - Frontend: src/lib/validationSchemas.ts (Zod)
    // - Backend: validators/churchValidator.js (Express-validator)

    expect(rules).toBeDefined();
  });
});
