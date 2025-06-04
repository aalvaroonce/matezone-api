const { matchedData } = require('express-validator');
const { handleHttpError } = require('../utils/handleError');
const { orderModel, productModel, userModel } = require('../models');
const path = require('path');
const fs = require('fs');
const { sendEmail } = require('../utils/handleMails');

const calculateFinalPrice = (price, discount) => {
    const desc = discount || 0;
    return price * (1 - desc / 100);
};

// Crear orden
const createOrder = async (req, res) => {
    const session = await orderModel.startSession();
    session.startTransaction();

    try {
        const clientId = req.user._id;
        const data = matchedData(req);

        let total = 0;
        const items = [];

        for (const item of data.items) {
            const product = await productModel.findById(item.product).session(session);
            if (!product) throw new Error(`Producto no encontrado: ${item.product}`);

            if (product.stock < item.quantity) {
                throw new Error(`Stock insuficiente para el producto: ${product.name}`);
            }

            // Actualiza stock y ventas
            product.stock -= item.quantity;
            product.sold += item.quantity;
            await product.save({ session });

            const unit_price = calculateFinalPrice(product.price, product.discount);
            total += unit_price * item.quantity;

            items.push({
                product: product._id,
                quantity: item.quantity,
                unit_price
            });
        }

        const newOrderData = {
            client: clientId,
            date: new Date(),
            deliveryMethod: data.deliveryMethod,
            shippingAddress: data.shippingAddress,
            items,
            total,
            state: 'pending'
        };

        const order = await orderModel.create([newOrderData], { session });

        await session.commitTransaction();
        session.endSession();

        const populatedOrder = await orderModel
            .findById(order[0]._id)
            .populate('items.product', 'name')
            .lean();

        console.log(populatedOrder);

        const client = await userModel.findById(clientId).lean();
        const templatePath = path.join(__dirname, '../templates/invoiceTemplate.html');
        let htmlTemplate = fs.readFileSync(templatePath, 'utf8');

        const itemsRows = populatedOrder.items
            .map(item => {
                return `
                <tr>
                    <td>${item.product.name}</td>
                    <td>${item.quantity}</td>
                    <td>$${item.unit_price.toFixed(2)}</td>
                    <td>$${(item.quantity * item.unit_price).toFixed(2)}</td>
                </tr>
            `;
            })
            .join('');

        const { street, number, postal, city, province } = populatedOrder.shippingAddress;
        const fullAddress = `${street} ${number}, ${postal}, ${city}, ${province}`;

        htmlTemplate = htmlTemplate
            .replace('{{clientName}}', client?.name || 'usuario')
            .replace('{{date}}', new Date(populatedOrder.date).toLocaleDateString())
            .replace('{{deliveryMethod}}', populatedOrder.deliveryMethod)
            .replace('{{address}}', fullAddress)
            .replace('{{itemsRows}}', itemsRows)
            .replace('{{total}}', populatedOrder.total.toFixed(2));

        sendEmail({
            subject: 'Tu factura de Matezone',
            html: htmlTemplate,
            from: process.env.EMAIL,
            to: client.email
        });

        res.status(201).send(order);
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
