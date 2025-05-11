const { matchedData } = require('express-validator');
const { handleHttpError } = require('../utils/handleError');
const { orderModel } = require('../models');

// Crear orden
const createOrder = async (req, res) => {
    try {
        const clientId = req.user._id;
        const data = matchedData(req);
        const order = await orderModel.create({
            ...data,
            client: clientId,
            date: new Date()
        });
        res.status(201).send(order);
    } catch (err) {
        console.error(err);
        handleHttpError(res, 'ERROR_CREATE_ORDER');
    }
};

// Obtener todas las órdenes (admin o usuario)
const getOrders = async (req, res) => {
    try {
        const userId = req.user._id;

        const filter = { client: userId };

        const orders = await orderModel
            .find(filter)
            .populate('client', 'name email')
            .populate('items.product', 'name price');

        res.send(orders);
    } catch (err) {
        console.error(err);
        handleHttpError(res, 'ERROR_GET_ORDERS');
    }
};

// Obtener una orden por ID
const getOrderById = async (req, res) => {
    try {
        const { id } = matchedData(req);
        const order = await orderModel
            .findById(id)
            .populate('client', 'name email')
            .populate('items.product', 'name price');

        if (!order) return handleHttpError(res, 'ORDER_NOT_FOUND', 404);

        const isOwner = order.client._id.toString() === req.user._id.toString();

        if (!isOwner) return handleHttpError(res, 'UNAUTHORIZED', 403);

        res.send(order);
    } catch (err) {
        console.error(err);
        handleHttpError(res, 'ERROR_GET_ORDER');
    }
};

// Actualizar estado de la orden (admin)
const updateOrderStatus = async (req, res) => {
    try {
        const { id, state } = matchedData(req);

        const updated = await orderModel.findByIdAndUpdate(id, { state }, { new: true });

        if (!updated) return handleHttpError(res, 'ORDER_NOT_FOUND', 404);

        res.send(updated);
    } catch (err) {
        console.error(err);
        handleHttpError(res, 'ERROR_UPDATE_ORDER');
    }
};

// Eliminar orden (lógica)
const deleteOrder = async (req, res) => {
    try {
        const { id } = matchedData(req);
        const order = await orderModel.findById(id);
        if (!order) return handleHttpError(res, 'ORDER_NOT_FOUND', 404);

        const isOwner = order.client.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';

        if (!isOwner && !isAdmin) return handleHttpError(res, 'UNAUTHORIZED', 403);

        await order.delete();
        res.send({ message: 'ORDER_DELETED' });
    } catch (err) {
        console.error(err);
        handleHttpError(res, 'ERROR_DELETE_ORDER');
    }
};

module.exports = {
    createOrder,
    getOrders,
    getOrderById,
    updateOrderStatus,
    deleteOrder
};
