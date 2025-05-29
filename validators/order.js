const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');

// Crear orden
const validatorCreateOrder = [
    check('items').isArray({ min: 1 }).withMessage('Debe incluir al menos un ítem en la orden'),

    check('items.*.product').isMongoId().withMessage('ID de producto inválido'),

    check('items.*.quantity').isInt({ min: 1 }).withMessage('Cantidad debe ser mayor que 0'),

    check('items.*.unit_price')
        .isFloat({ min: 0 })
        .withMessage('Precio unitario debe ser un número válido'),

    check('total').isFloat({ min: 0 }).withMessage('Total debe ser un número positivo'),

    check('deliveryMethod')
        .optional()
        .isIn(['standard', 'express', 'urgent'])
        .withMessage('Método de entrega inválido'),

    check('shippingAddress.street').notEmpty().withMessage('Calle requerida'),

    check('shippingAddress.number').notEmpty().withMessage('Número requerido'),

    check('shippingAddress.postal').notEmpty().withMessage('Código postal requerido'),

    check('shippingAddress.city').notEmpty().withMessage('Ciudad requerida'),

    check('shippingAddress.province').notEmpty().withMessage('Provincia requerida'),

    (req, res, next) => validateResults(req, res, next)
];

// Validar ID de orden (para get/delete por id)
const validatorGetOrder = [
    check('id').isMongoId().withMessage('ID inválido'),

    (req, res, next) => validateResults(req, res, next)
];

// Validar cambio de estado de orden
const validatorUpdateOrderStatus = [
    check('id').isMongoId().withMessage('ID inválido'),

    check('state')
        .isIn(['pending', 'in-process', 'sent', 'received', 'cancelled'])
        .withMessage('Estado de orden inválido'),

    (req, res, next) => validateResults(req, res, next)
];

module.exports = {
    validatorCreateOrder,
    validatorGetOrder,
    validatorUpdateOrderStatus
};
