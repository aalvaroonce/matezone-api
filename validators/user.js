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
    ,
    (req, res, next) => {
        return validateResults(req, res, next);
    }
];

const validatorLogin = [
    check('email').exists().notEmpty().isEmail(),
    check('password').exists().notEmpty().isLength({ min: 8, max: 16 }),
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

module.exports = {
    validatorRegister,
    validatorLogin,
    validatorEmailCode,
    validatorEmailRecover,
    validatorEmail
};
