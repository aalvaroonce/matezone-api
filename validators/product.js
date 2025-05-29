const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');

const validatorCreateProduct = [
    check('name')
        .exists()
        .withMessage('El nombre es obligatorio')
        .notEmpty()
        .withMessage('El nombre no puede estar vacío')
        .isLength({ max: 100 })
        .withMessage('El nombre no puede superar los 100 caracteres'),
    check('description').optional().isString().withMessage('La descripción debe ser un texto'),
    check('price')
        .exists()
        .withMessage('El precio es obligatorio')
        .isFloat({ gt: 0 })
        .withMessage('El precio debe ser un número mayor que 0'),
    check('discount')
        .optional()
        .isInt({ min: 0, max: 100 })
        .withMessage('El descuento debe ser un entero entre 0 y 100'),
    check('stock')
        .optional()
        .isInt({ min: 0 })
        .withMessage('El stock debe ser un entero mayor o igual que 0'),
    check('category')
        .exists()
        .withMessage('La categoría es obligatoria')
        .notEmpty()
        .withMessage('La categoría no puede estar vacía')
        .isString()
        .withMessage('La categoría debe ser un texto')
        .isIn(['mates', 'bombillas', 'yerbas', 'termos'])
        .withMessage('La categoría debe ser: mates, bombillas, yerbas, termos'),
    check('attributes').optional().isArray().withMessage('Attributes debe ser un array'),
    check('attributes.*.nombre')
        .optional()
        .isString()
        .withMessage('El nombre del atributo debe ser un texto'),
    check('attributes.*.valor')
        .optional()
        .isString()
        .withMessage('El valor del atributo debe ser un texto'),
    (req, res, next) => validateResults(req, res, next)
];

const validatorGetProductById = [
    check('id')
        .exists()
        .withMessage('El id es obligatorio')
        .isMongoId()
        .withMessage('El id debe ser un MongoID válido'),
    (req, res, next) => validateResults(req, res, next)
];

const validatorUpdateProduct = [
    check('id')
        .exists()
        .withMessage('El id es obligatorio')
        .isMongoId()
        .withMessage('El id debe ser un MongoID válido'),
    check('name')
        .optional()
        .isLength({ max: 100 })
        .withMessage('El nombre no puede superar los 100 caracteres'),
    check('description').optional().isString(),
    check('price')
        .optional()
        .isFloat({ gt: 0 })
        .withMessage('El precio debe ser un número mayor que 0'),
    check('discount').optional().isInt({ min: 0, max: 100 }),
    check('stock').optional().isInt({ min: 0 }),
    check('category').optional().isString(),
    (req, res, next) => validateResults(req, res, next)
];

const validatorDeleteProduct = [
    check('id')
        .exists()
        .withMessage('El id es obligatorio')
        .isMongoId()
        .withMessage('El id debe ser un MongoID válido'),
    (req, res, next) => validateResults(req, res, next)
];

const validatorAddImage = [
    check('productId')
        .exists()
        .withMessage('El id es obligatorio')
        .isMongoId()
        .withMessage('El id debe ser un MongoID válido'),
    (req, res, next) => validateResults(req, res, next)
];

const validatorAddReview = [
    check('id')
        .exists()
        .withMessage('El id es obligatorio')
        .isMongoId()
        .withMessage('El id debe ser un MongoID válido'),
    check('rating')
        .exists()
        .withMessage('El rating es obligatorio')
        .isInt({ min: 1, max: 5 })
        .withMessage('El rating debe estar entre 1 y 5'),
    check('comment')
        .exists()
        .withMessage('El comentario es obligatorio')
        .isString()
        .withMessage('El comentario debe ser un texto'),
    (req, res, next) => validateResults(req, res, next)
];

const validatorDeleteReview = [
    check('productId')
        .exists()
        .withMessage('El productId es obligatorio')
        .isMongoId()
        .withMessage('El productId debe ser un MongoID válido'),
    check('reviewId')
        .exists()
        .withMessage('El reviewId es obligatorio')
        .isMongoId()
        .withMessage('El reviewId debe ser un MongoID válido'),
    (req, res, next) => validateResults(req, res, next)
];

module.exports = {
    validatorCreateProduct,
    validatorGetProductById,
    validatorUpdateProduct,
    validatorDeleteProduct,
    validatorAddImage,
    validatorAddReview,
    validatorDeleteReview
};
