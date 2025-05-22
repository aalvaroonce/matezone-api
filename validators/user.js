const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');

const disposableDomains = [
    'tempmail.com',
    'mailinator.com',
    '10minutemail.com',
    'guerrillamail.com',
    'trashmail.com',
    'example.com'
];

const validatorRegister = [
    check('name').optional().isLength({ max: 100 }),
    check('surnames').optional().isLength({ max: 100 }),
    check('rol').optional().isIn(['user', 'seller']),
    check('email')
        .exists()
        .notEmpty()
        .isEmail()
        .custom(value => {
            // Bloquear correos temporales
            const domain = value.split('@')[1];
            if (disposableDomains.includes(domain)) {
                throw new Error('No se permiten correos temporales');
            }
            return true;
        }),
    check('password')
        .exists()
        .notEmpty()
        .isLength({ min: 8, max: 64 })
        .matches(/[A-Z]/)
        .matches(/[a-z]/)
        .matches(/[0-9]/)
        .matches(/[!@#$%^&*(),.?":{}|<>]/),
    check('phoneNumber').exists().notEmpty().isMobilePhone(),
    (req, res, next) => {
        return validateResults(req, res, next);
    }
];

const validatorLogin = [
    check('email').exists().notEmpty().isEmail(),
    check('password')
        .exists()
        .notEmpty()
        .isLength({ min: 8, max: 64 })
        .matches(/[A-Z]/)
        .matches(/[a-z]/)
        .matches(/[0-9]/)
        .matches(/[!@#$%^&*(),.?":{}|<>]/),
    (req, res, next) => {
        return validateResults(req, res, next);
    }
];

const validatorEmailCode = [
    check('code').exists().notEmpty().isLength({ min: 6, max: 6 }),
    (req, res, next) => {
        return validateResults(req, res, next);
    }
];

const validatorEmailRecover = [
    check('email').exists().notEmpty().isEmail(),
    check('code').exists().notEmpty().isLength({ min: 6, max: 6 }),
    (req, res, next) => {
        return validateResults(req, res, next);
    }
];

const validatorEmail = [
    check('email').exists().notEmpty().isEmail(),
    (req, res, next) => {
        return validateResults(req, res, next);
    }
];

const validatorChangePassword = [
    check('currentPassword')
        .exists()
        .withMessage('La contraseña es obligatoria')
        .notEmpty()
        .withMessage('El campo contraseña no puede estar vacío')
        .isLength({ min: 8, max: 64 })
        .withMessage('La contraseña debe tener entre 8 y 64 caracteres')
        .matches(/[A-Z]/)
        .withMessage('La contraseña debe contener al menos una letra mayúscula')
        .matches(/[a-z]/)
        .withMessage('La contraseña debe contener al menos una letra minúscula')
        .matches(/[0-9]/)
        .withMessage('La contraseña debe contener al menos un número')
        .matches(/[!@#$%^&*(),.?":{}|<>]/)
        .withMessage('La contraseña debe contener al menos un carácter especial'),

    check('newPassword')
        .exists()
        .withMessage('La contraseña es obligatoria')
        .notEmpty()
        .withMessage('El campo contraseña no puede estar vacío')
        .isLength({ min: 8, max: 64 })
        .withMessage('La contraseña debe tener entre 8 y 64 caracteres')
        .matches(/[A-Z]/)
        .withMessage('La contraseña debe contener al menos una letra mayúscula')
        .matches(/[a-z]/)
        .withMessage('La contraseña debe contener al menos una letra minúscula')
        .matches(/[0-9]/)
        .withMessage('La contraseña debe contener al menos un número')
        .matches(/[!@#$%^&*(),.?":{}|<>]/)
        .withMessage('La contraseña debe contener al menos un carácter especial'),

    (req, res, next) => {
        return validateResults(req, res, next);
    }
];

const validatorGetUser = [
    check('id').exists().notEmpty().isMongoId(),
    (req, res, next) => validateResults(req, res, next)
];

const validatorUpdate = [
    check('email').optional(),
    check('name').optional(),
    check('surnames').optional(),
    check('notifications').optional(),
    (req, res, next) => validateResults(req, res, next)
];

const validatorUpdateUserRole = [
    check('userId').exists().notEmpty().isMongoId(),
    check('newRole').exists().notEmpty().isIn(['user', 'seller', 'admin']),

    (req, res, next) => validateResults(req, res, next)
];

module.exports = {
    validatorRegister,
    validatorLogin,
    validatorEmailCode,
    validatorEmailRecover,
    validatorEmail,
    validatorChangePassword,
    validatorGetUser,
    validatorUpdate,
    validatorUpdateUserRole
};
