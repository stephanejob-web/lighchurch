import { describe, it, expect } from 'vitest';
import { churchSchema, scheduleSchema, socialSchema } from './validationSchemas';

describe('churchSchema - Validation du formulaire église', () => {
  // Données valides de base pour les tests
  const validChurchData = {
    church_name: 'Église Évangélique de Paris',
    denomination_id: 1,
    latitude: 48.8566,
    longitude: 2.3522,
    address: '10 Rue de la Paix, 75002 Paris',
    street_number: '10',
    street_name: 'Rue de la Paix',
    postal_code: '75002',
    city: 'Paris',
    phone: '+33 1 23 45 67 89',
    pastor_first_name: 'Jean',
    pastor_last_name: 'Dupont',
    schedules: [
      {
        activity_type_id: 1,
        day_of_week: 'SUNDAY' as const,
        start_time: '10:00'
      }
    ]
  };

  describe('Champs obligatoires', () => {
    it('devrait accepter des données valides complètes', () => {
      const result = churchSchema.safeParse(validChurchData);
      expect(result.success).toBe(true);
    });

    it('devrait rejeter si church_name est vide', () => {
      const data = { ...validChurchData, church_name: '' };
      const result = churchSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('3 caractères');
      }
    });

    it('devrait rejeter si church_name est trop court (< 3 caractères)', () => {
      const data = { ...validChurchData, church_name: 'AB' };
      const result = churchSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('devrait rejeter si church_name est trop long (> 255 caractères)', () => {
      const data = { ...validChurchData, church_name: 'A'.repeat(256) };
      const result = churchSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('devrait rejeter si denomination_id est manquant', () => {
      const data = { ...validChurchData, denomination_id: undefined };
      const result = churchSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('devrait rejeter si denomination_id est 0 ou négatif', () => {
      const data1 = { ...validChurchData, denomination_id: 0 };
      const result1 = churchSchema.safeParse(data1);
      expect(result1.success).toBe(false);

      const data2 = { ...validChurchData, denomination_id: -1 };
      const result2 = churchSchema.safeParse(data2);
      expect(result2.success).toBe(false);
    });

    it('devrait rejeter si address est vide', () => {
      const data = { ...validChurchData, address: '' };
      const result = churchSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('devrait accepter une adresse sans street_number (optionnel)', () => {
      const data = { ...validChurchData, street_number: '' };
      const result = churchSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('devrait rejeter si street_name est vide', () => {
      const data = { ...validChurchData, street_name: '' };
      const result = churchSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('devrait rejeter si postal_code n\'est pas au format français (5 chiffres)', () => {
      const data1 = { ...validChurchData, postal_code: '1234' }; // 4 chiffres
      const result1 = churchSchema.safeParse(data1);
      expect(result1.success).toBe(false);

      const data2 = { ...validChurchData, postal_code: '123456' }; // 6 chiffres
      const result2 = churchSchema.safeParse(data2);
      expect(result2.success).toBe(false);

      const data3 = { ...validChurchData, postal_code: 'ABCDE' }; // lettres
      const result3 = churchSchema.safeParse(data3);
      expect(result3.success).toBe(false);
    });

    it('devrait rejeter si city est vide ou trop court', () => {
      const data1 = { ...validChurchData, city: '' };
      const result1 = churchSchema.safeParse(data1);
      expect(result1.success).toBe(false);

      const data2 = { ...validChurchData, city: 'A' };
      const result2 = churchSchema.safeParse(data2);
      expect(result2.success).toBe(false);
    });

    it('devrait rejeter si phone est vide ou invalide', () => {
      const data1 = { ...validChurchData, phone: '' };
      const result1 = churchSchema.safeParse(data1);
      expect(result1.success).toBe(false);

      const data2 = { ...validChurchData, phone: '123' }; // trop court
      const result2 = churchSchema.safeParse(data2);
      expect(result2.success).toBe(false);

      const data3 = { ...validChurchData, phone: 'abcdefghij' }; // pas de chiffres
      const result3 = churchSchema.safeParse(data3);
      expect(result3.success).toBe(false);
    });

    it('devrait accepter différents formats de téléphone valides', () => {
      const validPhones = [
        '+33 1 23 45 67 89',
        '01 23 45 67 89',
        '0123456789',
        '+33123456789',
        '01-23-45-67-89',
        '(01) 23 45 67 89'
      ];

      validPhones.forEach(phone => {
        const data = { ...validChurchData, phone };
        const result = churchSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('Nom du pasteur', () => {
    it('devrait rejeter si pastor_first_name est vide', () => {
      const data = { ...validChurchData, pastor_first_name: '' };
      const result = churchSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('devrait rejeter si pastor_last_name est vide', () => {
      const data = { ...validChurchData, pastor_last_name: '' };
      const result = churchSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('devrait rejeter si le nom contient des chiffres', () => {
      const data1 = { ...validChurchData, pastor_first_name: 'Jean123' };
      const result1 = churchSchema.safeParse(data1);
      expect(result1.success).toBe(false);

      const data2 = { ...validChurchData, pastor_last_name: 'Dupont456' };
      const result2 = churchSchema.safeParse(data2);
      expect(result2.success).toBe(false);
    });

    it('devrait accepter les noms avec accents et tirets', () => {
      const data = {
        ...validChurchData,
        pastor_first_name: 'Jean-François',
        pastor_last_name: 'Müller'
      };
      const result = churchSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe('Coordonnées GPS', () => {
    it('devrait rejeter si latitude est hors limites (-90 à 90)', () => {
      const data1 = { ...validChurchData, latitude: -91 };
      const result1 = churchSchema.safeParse(data1);
      expect(result1.success).toBe(false);

      const data2 = { ...validChurchData, latitude: 91 };
      const result2 = churchSchema.safeParse(data2);
      expect(result2.success).toBe(false);
    });

    it('devrait rejeter si longitude est hors limites (-180 à 180)', () => {
      const data1 = { ...validChurchData, longitude: -181 };
      const result1 = churchSchema.safeParse(data1);
      expect(result1.success).toBe(false);

      const data2 = { ...validChurchData, longitude: 181 };
      const result2 = churchSchema.safeParse(data2);
      expect(result2.success).toBe(false);
    });

    it('devrait accepter des coordonnées GPS valides', () => {
      const validCoordinates = [
        { latitude: 0, longitude: 0 }, // Équateur/Greenwich
        { latitude: 48.8566, longitude: 2.3522 }, // Paris
        { latitude: -33.8688, longitude: 151.2093 }, // Sydney
        { latitude: 90, longitude: 180 }, // Limites max
        { latitude: -90, longitude: -180 } // Limites min
      ];

      validCoordinates.forEach(coords => {
        const data = { ...validChurchData, ...coords };
        const result = churchSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('Champs optionnels', () => {
    it('devrait accepter une église sans description', () => {
      const data = { ...validChurchData, description: undefined };
      const result = churchSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('devrait rejeter une description trop longue (> 2000 caractères)', () => {
      const data = { ...validChurchData, description: 'A'.repeat(2001) };
      const result = churchSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('devrait accepter une église sans site web', () => {
      const data = { ...validChurchData, website: undefined };
      const result = churchSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('devrait rejeter un site web avec URL invalide', () => {
      const data = { ...validChurchData, website: 'not-a-url' };
      const result = churchSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('devrait accepter des URLs valides pour le site web', () => {
      const validUrls = [
        'https://example.com',
        'http://example.com',
        'https://www.example.com/page',
        'https://example.com/path?query=value'
      ];

      validUrls.forEach(website => {
        const data = { ...validChurchData, website };
        const result = churchSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('Parking', () => {
    it('devrait accepter has_parking comme optionnel', () => {
      const data = { ...validChurchData, has_parking: undefined };
      const result = churchSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('devrait accepter parking_capacity entre 0 et 10000', () => {
      const data1 = { ...validChurchData, parking_capacity: 0 };
      const result1 = churchSchema.safeParse(data1);
      expect(result1.success).toBe(true);

      const data2 = { ...validChurchData, parking_capacity: 50 };
      const result2 = churchSchema.safeParse(data2);
      expect(result2.success).toBe(true);

      const data3 = { ...validChurchData, parking_capacity: 10000 };
      const result3 = churchSchema.safeParse(data3);
      expect(result3.success).toBe(true);
    });

    it('devrait accepter parking_capacity comme null ou undefined', () => {
      const data1 = { ...validChurchData, parking_capacity: null };
      const result1 = churchSchema.safeParse(data1);
      expect(result1.success).toBe(true);

      const data2 = { ...validChurchData, parking_capacity: undefined };
      const result2 = churchSchema.safeParse(data2);
      expect(result2.success).toBe(true);
    });
  });

  describe('Horaires (schedules)', () => {
    it('devrait rejeter si aucun horaire n\'est fourni', () => {
      const data = { ...validChurchData, schedules: [] };
      const result = churchSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Au moins un horaire');
      }
    });

    it('devrait accepter plusieurs horaires valides', () => {
      const data = {
        ...validChurchData,
        schedules: [
          { activity_type_id: 1, day_of_week: 'SUNDAY' as const, start_time: '10:00' },
          { activity_type_id: 2, day_of_week: 'WEDNESDAY' as const, start_time: '19:00' },
          { activity_type_id: 1, day_of_week: 'SATURDAY' as const, start_time: '18:00' }
        ]
      };
      const result = churchSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe('Réseaux sociaux (socials)', () => {
    it('devrait accepter une église sans réseaux sociaux', () => {
      const data = { ...validChurchData, socials: undefined };
      const result = churchSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('devrait accepter une église avec un tableau vide de réseaux sociaux', () => {
      const data = { ...validChurchData, socials: [] };
      const result = churchSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('devrait accepter des réseaux sociaux valides', () => {
      const data = {
        ...validChurchData,
        socials: [
          { platform: 'FACEBOOK' as const, url: 'https://facebook.com/church' },
          { platform: 'YOUTUBE' as const, url: 'https://youtube.com/church' }
        ]
      };
      const result = churchSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });
});

describe('scheduleSchema - Validation des horaires', () => {
  it('devrait accepter un horaire valide', () => {
    const validSchedule = {
      activity_type_id: 1,
      day_of_week: 'SUNDAY' as const,
      start_time: '10:00'
    };
    const result = scheduleSchema.safeParse(validSchedule);
    expect(result.success).toBe(true);
  });

  it('devrait rejeter si activity_type_id est manquant ou invalide', () => {
    const data1 = { day_of_week: 'SUNDAY', start_time: '10:00' };
    const result1 = scheduleSchema.safeParse(data1);
    expect(result1.success).toBe(false);

    const data2 = { activity_type_id: 0, day_of_week: 'SUNDAY', start_time: '10:00' };
    const result2 = scheduleSchema.safeParse(data2);
    expect(result2.success).toBe(false);
  });

  it('devrait rejeter un jour de semaine invalide', () => {
    const data = {
      activity_type_id: 1,
      day_of_week: 'INVALID_DAY',
      start_time: '10:00'
    };
    const result = scheduleSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('devrait accepter tous les jours de la semaine valides', () => {
    const validDays = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

    validDays.forEach(day => {
      const data = {
        activity_type_id: 1,
        day_of_week: day,
        start_time: '10:00'
      };
      const result = scheduleSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  it('devrait rejeter si start_time est vide', () => {
    const data = {
      activity_type_id: 1,
      day_of_week: 'SUNDAY',
      start_time: ''
    };
    const result = scheduleSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});

describe('socialSchema - Validation des réseaux sociaux', () => {
  it('devrait accepter un réseau social valide', () => {
    const validSocial = {
      platform: 'FACEBOOK' as const,
      url: 'https://facebook.com/church'
    };
    const result = socialSchema.safeParse(validSocial);
    expect(result.success).toBe(true);
  });

  it('devrait accepter toutes les plateformes valides', () => {
    const validPlatforms = ['FACEBOOK', 'INSTAGRAM', 'YOUTUBE', 'TIKTOK', 'WHATSAPP', 'LINKEDIN'];

    validPlatforms.forEach(platform => {
      const data = {
        platform,
        url: 'https://example.com/church'
      };
      const result = socialSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  it('devrait rejeter une plateforme invalide', () => {
    const data = {
      platform: 'TWITTER', // Non supporté
      url: 'https://twitter.com/church'
    };
    const result = socialSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('devrait rejeter une URL invalide', () => {
    const data = {
      platform: 'FACEBOOK' as const,
      url: 'not-a-url'
    };
    const result = socialSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});
