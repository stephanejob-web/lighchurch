import { z } from 'zod';

// ===============================
// SCHÉMAS D'AUTHENTIFICATION
// ===============================

export const registerSchema = z.object({
  first_name: z
    .string()
    .min(2, 'Le prénom doit contenir au moins 2 caractères')
    .max(50, 'Le prénom ne doit pas dépasser 50 caractères')
    .regex(/^[a-zA-ZÀ-ÿ\s-]+$/, 'Le prénom ne doit contenir que des lettres'),

  last_name: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(50, 'Le nom ne doit pas dépasser 50 caractères')
    .regex(/^[a-zA-ZÀ-ÿ\s-]+$/, 'Le nom ne doit contenir que des lettres'),

  email: z
    .string()
    .min(1, 'L\'email est obligatoire')
    .email('L\'email n\'est pas valide'),

  password: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
    .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
    .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre'),

  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

export type RegisterFormData = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'L\'email est obligatoire')
    .email('L\'email n\'est pas valide'),

  password: z
    .string()
    .min(1, 'Le mot de passe est obligatoire'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'Le mot de passe actuel est obligatoire'),

  newPassword: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
    .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
    .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre'),

  confirmNewPassword: z.string()
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmNewPassword'],
});

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

// ===============================
// SCHÉMAS ÉGLISE
// ===============================

export const scheduleSchema = z.object({
  activity_type_id: z
    .number({ required_error: 'Le type d\'activité est obligatoire' })
    .int()
    .positive('Le type d\'activité doit être valide'),

  day_of_week: z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'], {
    errorMap: () => ({ message: 'Le jour de la semaine n\'est pas valide' })
  }),

  start_time: z
    .string()
    .min(1, 'L\'heure est obligatoire'),
});

export const socialSchema = z.object({
  platform: z.enum(['FACEBOOK', 'INSTAGRAM', 'YOUTUBE', 'TIKTOK', 'WHATSAPP', 'LINKEDIN'], {
    errorMap: () => ({ message: 'La plateforme n\'est pas valide' })
  }),

  url: z
    .string()
    .url('L\'URL n\'est pas valide'),
});

export const churchSchema = z.object({
  church_name: z
    .string()
    .min(3, 'Le nom de l\'église doit contenir au moins 3 caractères')
    .max(255, 'Le nom ne doit pas dépasser 255 caractères'),

  denomination_id: z
    .number({
      required_error: 'La dénomination est obligatoire',
      invalid_type_error: 'La dénomination est obligatoire'
    })
    .int()
    .positive('La dénomination doit être valide'),

  latitude: z
    .number({ required_error: 'La latitude est obligatoire' })
    .min(-90, 'La latitude doit être entre -90 et 90')
    .max(90, 'La latitude doit être entre -90 et 90'),

  longitude: z
    .number({ required_error: 'La longitude est obligatoire' })
    .min(-180, 'La longitude doit être entre -180 et 180')
    .max(180, 'La longitude doit être entre -180 et 180'),

  // Détails (optionnels)
  description: z
    .string()
    .max(2000, 'La description ne doit pas dépasser 2000 caractères')
    .optional(),

  // Adresse complète (obligatoire)
  address: z
    .string()
    .min(1, 'L\'adresse complète est obligatoire')
    .max(500, 'L\'adresse ne doit pas dépasser 500 caractères'),

  // Champs d'adresse détaillés
  street_number: z
    .string()
    .max(20, 'Le numéro de rue ne doit pas dépasser 20 caractères')
    .optional(),

  street_name: z
    .string()
    .min(1, 'Le nom de rue est obligatoire')
    .max(255, 'Le nom de rue ne doit pas dépasser 255 caractères'),

  postal_code: z
    .string()
    .min(1, 'Le code postal est obligatoire')
    .regex(/^[0-9]{5}$/, 'Le code postal doit contenir 5 chiffres'),

  city: z
    .string()
    .min(2, 'Le nom de la ville doit contenir au moins 2 caractères')
    .max(100, 'Le nom de la ville ne doit pas dépasser 100 caractères'),

  // Contact (obligatoire)
  phone: z
    .string()
    .min(1, 'Le numéro de téléphone est obligatoire')
    .regex(/^[0-9+\s()-]{10,20}$/, 'Le numéro de téléphone n\'est pas valide'),

  // Site web (optionnel)
  website: z
    .string()
    .optional()
    .refine((val) => !val || /^https?:\/\/.+/.test(val), {
      message: 'L\'URL du site web n\'est pas valide'
    }),

  // Prénom et nom du pasteur (obligatoires)
  pastor_first_name: z
    .string()
    .min(2, 'Le prénom du pasteur est obligatoire')
    .max(50, 'Le prénom ne doit pas dépasser 50 caractères')
    .regex(/^[a-zA-ZÀ-ÿ\s-]+$/, 'Le prénom ne doit contenir que des lettres'),

  pastor_last_name: z
    .string()
    .min(2, 'Le nom du pasteur est obligatoire')
    .max(50, 'Le nom ne doit pas dépasser 50 caractères')
    .regex(/^[a-zA-ZÀ-ÿ\s-]+$/, 'Le nom ne doit contenir que des lettres'),

  has_parking: z.boolean().optional(),

  parking_capacity: z
    .union([z.number().int().min(0).max(10000), z.null(), z.undefined()])
    .optional()
    .nullable(),

  is_parking_free: z.boolean().optional(),

  logo_url: z.string().optional(),

  // Visibilité réseau pastoral (opt-in RGPD)
  allow_network_visibility: z.boolean().optional(),

  // Relations
  schedules: z
    .array(scheduleSchema)
    .min(1, 'Au moins un horaire est obligatoire'),
  socials: z.array(socialSchema).optional(),
});

export type ChurchFormData = z.infer<typeof churchSchema>;

// ===============================
// SCHÉMAS ÉVÉNEMENT
// ===============================

export const eventSchema = z.object({
  title: z
    .string()
    .min(3, 'Le titre doit contenir au moins 3 caractères')
    .max(255, 'Le titre ne doit pas dépasser 255 caractères'),

  language_id: z
    .number({ required_error: 'La langue est obligatoire' })
    .int()
    .positive('La langue doit être valide'),

  start_datetime: z
    .string()
    .min(1, 'La date de début est obligatoire')
    .refine((val) => {
      const date = new Date(val);
      return date > new Date();
    }, 'La date de début ne peut pas être dans le passé'),

  end_datetime: z
    .string()
    .min(1, 'La date de fin est obligatoire'),

  latitude: z
    .number({ required_error: 'La latitude est obligatoire' })
    .min(-90, 'La latitude doit être entre -90 et 90')
    .max(90, 'La latitude doit être entre -90 et 90'),

  longitude: z
    .number({ required_error: 'La longitude est obligatoire' })
    .min(-180, 'La longitude doit être entre -180 et 180')
    .max(180, 'La longitude doit être entre -180 et 180'),

  status: z
    .enum(['PUBLISHED', 'CANCELLED', 'DRAFT', 'COMPLETED'])
    .optional(),

  // Détails optionnels
  description: z
    .string()
    .max(5000, 'La description ne doit pas dépasser 5000 caractères')
    .optional(),

  address: z
    .string()
    .max(500, 'L\'adresse ne doit pas dépasser 500 caractères')
    .optional(),

  speaker_name: z
    .string()
    .max(100, 'Le nom de l\'orateur ne doit pas dépasser 100 caractères')
    .optional(),

  max_seats: z
    .number()
    .int()
    .min(0, 'Le nombre de places doit être positif')
    .max(100000, 'Le nombre de places ne peut pas dépasser 100000')
    .optional()
    .nullable(),

  image_url: z.string().optional(),

  has_parking: z.boolean().optional(),

  parking_capacity: z
    .number()
    .int()
    .min(0, 'La capacité doit être positive')
    .max(10000, 'La capacité ne peut pas dépasser 10000')
    .optional()
    .nullable(),

  is_parking_free: z.boolean().optional(),

  parking_details: z
    .string()
    .max(500, 'Les détails du parking ne doivent pas dépasser 500 caractères')
    .optional(),

  is_free: z.boolean().optional(),

  registration_link: z
    .string()
    .url('Le lien d\'inscription n\'est pas valide')
    .optional()
    .or(z.literal('')),

  youtube_live: z
    .string()
    .url('Le lien YouTube Live n\'est pas valide')
    .optional()
    .or(z.literal('')),
}).refine((data) => {
  const start = new Date(data.start_datetime);
  const end = new Date(data.end_datetime);
  return end > start;
}, {
  message: 'La date de fin doit être après la date de début',
  path: ['end_datetime'],
});

export type EventFormData = z.infer<typeof eventSchema>;
