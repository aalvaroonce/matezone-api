const { matchedData } = require('express-validator');
const { handleHttpError } = require('../utils/handleError');
const { orderModel, productModel } = require('../models');

// Crear orden
const createOrder = async (req, res) => {
    const session = await orderModel.startSession();
    session.startTransaction();

    try {
        const clientId = req.user._id;
        const data = matchedData(req);

        for (const item of data.items) {
            const product = await productModel.findById(item.product).session(session);

            if (!product) {
                throw new Error(`Producto no encontrado: ${item.product}`);
            }

            if (product.stock < item.quantity) {
                throw new Error(`Stock insuficiente para el producto: ${product.name}`);
            }
            if ((product.stock -= item.quantity) >= 0) {
                product.stock -= item.quantity;
            }
            product.sold += item.quantity;
            await product.save({ session });
        }

        const order = await orderModel.create(
            [
                {
                    ...data,
                    client: clientId,
                    date: new Date()
                }
            ],
            { session }
        );

        await session.commitTransaction();
        session.endSession();

        res.status(201).send(order[0]);
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
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
