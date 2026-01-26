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

// Validation pour l'inscription (register)
const validateRegister = [
  body('email')
    .trim()
    .notEmpty().withMessage('L\'email est obligatoire')
    .isEmail().withMessage('L\'email n\'est pas valide'),

  body('password')
    .notEmpty().withMessage('Le mot de passe est obligatoire')
    .isLength({ min: 8 }).withMessage('Le mot de passe doit contenir au moins 8 caractères')
    .matches(/[A-Z]/).withMessage('Le mot de passe doit contenir au moins une majuscule')
    .matches(/[a-z]/).withMessage('Le mot de passe doit contenir au moins une minuscule')
    .matches(/[0-9]/).withMessage('Le mot de passe doit contenir au moins un chiffre'),

  body('first_name')
    .trim()
    .notEmpty().withMessage('Le prénom est obligatoire')
    .isLength({ min: 2, max: 50 }).withMessage('Le prénom doit contenir entre 2 et 50 caractères')
    .matches(/^[a-zA-ZÀ-ÿ\s-]+$/).withMessage('Le prénom ne doit contenir que des lettres'),

  body('last_name')
    .trim()
    .notEmpty().withMessage('Le nom est obligatoire')
    .isLength({ min: 2, max: 50 }).withMessage('Le nom doit contenir entre 2 et 50 caractères')
    .matches(/^[a-zA-ZÀ-ÿ\s-]+$/).withMessage('Le nom ne doit contenir que des lettres'),

  handleValidationErrors
];

// Validation pour la connexion (login)
const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('L\'email est obligatoire')
    .isEmail().withMessage('L\'email n\'est pas valide'),

  body('password')
    .notEmpty().withMessage('Le mot de passe est obligatoire'),

  handleValidationErrors
];

module.exports = {
  validateRegister,
  validateLogin,
  handleValidationErrors
};
