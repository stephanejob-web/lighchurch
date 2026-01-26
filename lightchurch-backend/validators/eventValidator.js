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

// Validation pour la création/modification d'un événement
const validateEvent = [
  // Informations de base de l'événement
  body('title')
    .trim()
    .notEmpty().withMessage('Le titre de l\'événement est obligatoire')
    .isLength({ min: 3, max: 255 }).withMessage('Le titre doit contenir entre 3 et 255 caractères'),

  body('language_id')
    .notEmpty().withMessage('La langue du speaker est obligatoire')
    .isInt({ min: 1 }).withMessage('La langue du speaker doit être un nombre valide'),

  body('translation_language_ids')
    .optional()
    .isArray().withMessage('Les langues de traduction doivent être un tableau')
    .custom((value) => {
      if (value && value.length > 0) {
        if (!value.every(id => Number.isInteger(id) && id > 0)) {
          throw new Error('Les IDs de langues de traduction doivent être des nombres valides');
        }
      }
      return true;
    }),

  body('start_datetime')
    .notEmpty().withMessage('La date de début est obligatoire')
    .isISO8601().withMessage('La date de début doit être une date valide (format ISO 8601)'),
    // Note: Removed past date validation to allow editing of ongoing/past events

  body('end_datetime')
    .notEmpty().withMessage('La date de fin est obligatoire')
    .isISO8601().withMessage('La date de fin doit être une date valide (format ISO 8601)')
    .custom((value, { req }) => {
      const startDate = new Date(req.body.start_datetime);
      const endDate = new Date(value);
      if (endDate <= startDate) {
        throw new Error('La date de fin doit être après la date de début');
      }
      return true;
    }),

  body('latitude')
    .notEmpty().withMessage('La latitude est obligatoire')
    .isFloat({ min: -90, max: 90 }).withMessage('La latitude doit être comprise entre -90 et 90'),

  body('longitude')
    .notEmpty().withMessage('La longitude est obligatoire')
    .isFloat({ min: -180, max: 180 }).withMessage('La longitude doit être comprise entre -180 et 180'),

  // Note: status is now computed automatically based on dates and is not validated/accepted from client
  // body('status') validation removed as status is calculated server-side

  // Détails de l'événement
  body('description')
    .optional()
    .trim()
    .isLength({ max: 50000 }).withMessage('La description ne doit pas dépasser 50 000 caractères'),

  body('max_seats')
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 0, max: 100000 }).withMessage('Le nombre de places doit être entre 0 et 100000'),

  body('address')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('L\'adresse ne doit pas dépasser 500 caractères'),

  body('speaker_name')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Le nom de l\'orateur ne doit pas dépasser 100 caractères'),

  body('has_parking')
    .optional({ nullable: true, checkFalsy: true })
    .isBoolean().withMessage('Le champ parking doit être vrai ou faux'),

  body('parking_capacity')
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 0, max: 10000 }).withMessage('La capacité du parking doit être entre 0 et 10000'),

  body('is_parking_free')
    .optional({ nullable: true, checkFalsy: true })
    .isBoolean().withMessage('Le champ parking gratuit doit être vrai ou faux'),

  body('parking_details')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Les détails du parking ne doivent pas dépasser 500 caractères'),

  body('is_free')
    .optional({ nullable: true, checkFalsy: true })
    .isBoolean().withMessage('Le champ événement gratuit doit être vrai ou faux'),

  body('registration_link')
    .optional()
    .trim()
    .isURL().withMessage('Le lien d\'inscription n\'est pas valide'),

  body('youtube_live')
    .optional()
    .trim()
    .isURL().withMessage('Le lien YouTube Live n\'est pas valide'),

  handleValidationErrors
];

module.exports = {
  validateEvent,
  handleValidationErrors
};
