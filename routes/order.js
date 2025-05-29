const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/session');
const { checkRol } = require('../middleware/rol');
const {
    validatorCreateOrder,
    validatorGetOrder,
    validatorUpdateOrderStatus
} = require('../validators/order');
const {
    createOrder,
    getOrders,
    getOrderById,
    updateOrderStatus,
    deleteOrder
} = require('../controllers/order');

// Crear orden
/**
 * @openapi
 * /api/order:
 *   post:
 *     tags:
 *       - Order
 *     summary: Crear una nueva orden
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/createOrder'
 *     responses:
 *       201:
 *         description: Orden creada exitosamente
 *       500:
 *         description: Error en el servidor
 *     security:
 *       - bearerAuth: []
 */
router.post('/', authMiddleware, validatorCreateOrder, createOrder);

// Obtener todas las órdenes del usuario autenticado
/**
 * @openapi
 * /api/order:
 *   get:
 *     tags:
 *       - Order
 *     summary: Obtener todas las órdenes del usuario
 *     responses:
 *       200:
 *         description: Lista de órdenes
 *       500:
 *         description: Error en el servidor
 *     security:
 *       - bearerAuth: []
 */
router.get('/', authMiddleware, getOrders);

// Obtener una orden por ID
/**
 * @openapi
 * /api/order/{id}:
 *   get:
 *     tags:
 *       - Order
 *     summary: Obtener una orden por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la orden
 *     responses:
 *       200:
 *         description: Detalle de la orden
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Orden no encontrada
 *       500:
 *         description: Error en el servidor
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', authMiddleware, validatorGetOrder, getOrderById);

// Actualizar estado de la orden (solo admin)
/**
 * @openapi
 * /api/order/status:
 *   patch:
 *     tags:
 *       - Order
 *     summary: Actualizar el estado de una orden
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/updateOrderStatus'
 *     responses:
 *       200:
 *         description: Orden actualizada
 *       404:
 *         description: Orden no encontrada
 *       500:
 *         description: Error en el servidor
 *     security:
 *       - bearerAuth: []
 */
router.patch(
    '/status',
    authMiddleware,
    checkRol(['admin']),
    validatorUpdateOrderStatus,
    updateOrderStatus
);

// Eliminar una orden (lógica)
/**
 * @openapi
 * /api/order/{id}:
 *   delete:
 *     tags:
 *       - Order
 *     summary: Eliminar una orden (borrado lógico)
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la orden
 *     responses:
 *       200:
 *         description: Orden eliminada
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Orden no encontrada
 *       500:
 *         description: Error en el servidor
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', authMiddleware, validatorGetOrder, deleteOrder);

module.exports = router;
