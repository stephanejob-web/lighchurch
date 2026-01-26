const { body, validationResult } = require('express-validator');

// Middleware pour gérer les erreurs de validation
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Erreurs de validation',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// Validation pour la création/modification d'une église
const validateChurch = [
  // Informations de base de l'église
  body('church_name')
    .trim()
    .notEmpty().withMessage('Le nom de l\'église est obligatoire')
    .isLength({ min: 3, max: 255 }).withMessage('Le nom doit contenir entre 3 et 255 caractères'),

  body('denomination_id')
    .notEmpty().withMessage('La dénomination est obligatoire')
    .isInt({ min: 1 }).withMessage('La dénomination doit être un nombre valide'),

  body('latitude')
    .notEmpty().withMessage('La latitude est obligatoire')
    .isFloat({ min: -90, max: 90 }).withMessage('La latitude doit être comprise entre -90 et 90'),

  body('longitude')
    .notEmpty().withMessage('La longitude est obligatoire')
    .isFloat({ min: -180, max: 180 }).withMessage('La longitude doit être comprise entre -180 et 180'),

  // Détails de l'église
  body('language_id')
    .optional()
    .isInt({ min: 1 }).withMessage('La langue doit être un nombre valide'),

  body('pastor_first_name')
    .trim()
    .notEmpty().withMessage('Le prénom du pasteur est obligatoire')
    .isLength({ min: 2, max: 50 }).withMessage('Le prénom doit contenir entre 2 et 50 caractères')
    .matches(/^[a-zA-ZÀ-ÿ\s-]+$/).withMessage('Le prénom ne doit contenir que des lettres'),

  body('pastor_last_name')
    .trim()
    .notEmpty().withMessage('Le nom du pasteur est obligatoire')
    .isLength({ min: 2, max: 50 }).withMessage('Le nom doit contenir entre 2 et 50 caractères')
    .matches(/^[a-zA-ZÀ-ÿ\s-]+$/).withMessage('Le nom ne doit contenir que des lettres'),

  body('address')
    .trim()
    .notEmpty().withMessage('L\'adresse complète est obligatoire')
    .isLength({ max: 500 }).withMessage('L\'adresse ne doit pas dépasser 500 caractères'),

  // Champs d'adresse détaillés
  body('street_number')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 20 }).withMessage('Le numéro de rue ne doit pas dépasser 20 caractères'),

  body('street_name')
    .trim()
    .notEmpty().withMessage('Le nom de rue est obligatoire')
    .isLength({ max: 255 }).withMessage('Le nom de rue ne doit pas dépasser 255 caractères'),

  body('postal_code')
    .trim()
    .notEmpty().withMessage('Le code postal est obligatoire')
    .matches(/^[0-9]{5}$/).withMessage('Le code postal doit contenir 5 chiffres'),

  body('city')
    .trim()
    .notEmpty().withMessage('La ville est obligatoire')
    .isLength({ min: 2, max: 100 }).withMessage('Le nom de la ville doit contenir entre 2 et 100 caractères'),

  body('phone')
    .trim()
    .notEmpty().withMessage('Le numéro de téléphone est obligatoire')
    .matches(/^[0-9+\s()-]{10,20}$/).withMessage('Le numéro de téléphone n\'est pas valide'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('La description ne doit pas dépasser 2000 caractères'),

  body('website')
    .optional({ values: 'falsy' })
    .trim()
    .isURL().withMessage('L\'URL du site web n\'est pas valide'),

  body('has_parking')
    .optional()
    .isBoolean().withMessage('Le champ parking doit être vrai ou faux'),

  body('parking_capacity')
    .optional({ values: 'falsy' })
    .isInt({ min: 0, max: 10000 }).withMessage('La capacité du parking doit être entre 0 et 10000'),

  body('is_parking_free')
    .optional()
    .isBoolean().withMessage('Le champ parking gratuit doit être vrai ou faux'),

  // Horaires (tableau) - Au moins 1 horaire obligatoire
  body('schedules')
    .notEmpty().withMessage('Au moins un horaire est obligatoire')
    .isArray().withMessage('Les horaires doivent être un tableau')
    .isArray({ min: 1 }).withMessage('Au moins un horaire est obligatoire'),

  body('schedules.*.activity_type_id')
    .if(body('schedules').exists())
    .notEmpty().withMessage('Le type d\'activité est obligatoire')
    .isInt({ min: 1 }).withMessage('Le type d\'activité doit être un nombre valide'),

  body('schedules.*.day_of_week')
    .if(body('schedules').exists())
    .notEmpty().withMessage('Le jour de la semaine est obligatoire')
    .isIn(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'])
    .withMessage('Le jour de la semaine n\'est pas valide'),

  body('schedules.*.start_time')
    .if(body('schedules').exists())
    .notEmpty().withMessage('L\'heure de début est obligatoire')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('L\'heure doit être au format HH:MM'),

  // Réseaux sociaux (tableau)
  body('socials')
    .optional()
    .isArray().withMessage('Les réseaux sociaux doivent être un tableau'),

  body('socials.*.platform')
    .if(body('socials').exists())
    .notEmpty().withMessage('La plateforme est obligatoire')
    .isIn(['FACEBOOK', 'INSTAGRAM', 'YOUTUBE', 'TIKTOK', 'WHATSAPP', 'LINKEDIN'])
    .withMessage('La plateforme n\'est pas valide'),

  body('socials.*.url')
    .if(body('socials').exists())
    .notEmpty().withMessage('L\'URL est obligatoire')
    .isURL().withMessage('L\'URL du réseau social n\'est pas valide'),

  handleValidationErrors
];

module.exports = {
  validateChurch,
  handleValidationErrors
};