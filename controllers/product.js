const { matchedData } = require('express-validator');
const { handleHttpError } = require('../utils/handleError');
const { productModel, userModel } = require('../models');
const { uploadToPinata } = require('../utils/handleUploadIPFS');
const { sendEmail } = require('../utils/handleMails');
const path = require('path');
const fs = require('fs');

// Crear producto
const VALID_PRICE_RANGES = {
    mates: { min: 20, max: 60 },
    bombillas: { min: 8, max: 30 },
    yerbas: { min: 5, max: 40 },
    termos: { min: 20, max: 80 }
};

const calculateFinalPrice = (price, discount) => {
    const desc = discount || 0;
    return price * (1 - desc / 100);
};

const createProduct = async (req, res) => {
    try {
        const id = req.user._id;
        const body = matchedData(req);
        const { price, discount, category, name } = body;

        const finalPrice = calculateFinalPrice(price, discount);
        const limits = VALID_PRICE_RANGES[category];

        if (!limits) {
            return handleHttpError(res, 'INVALID_CATEGORY', 400);
        }

        const isValidPrice = finalPrice >= limits.min && finalPrice <= limits.max;

        if (!isValidPrice) {
            const user = await userModel.findById(id);
            const templatePath = path.join(__dirname, '../templates/priceOutOfRangeAlert.html');
            let htmlTemplate = fs.readFileSync(templatePath, 'utf8');

            htmlTemplate = htmlTemplate
                .replace('{{name}}', name)
                .replace('{{category}}', category)
                .replace('{{price}}', price)
                .replace('{{discount}}', discount)
                .replace('{{finalPrice}}', finalPrice.toFixed(2))
                .replace('{{min}}', limits.min)
                .replace('{{max}}', limits.max)
                .replace('{{seller}}', `${user.name} ${user.surnames}`);

            await sendEmail({
                subject: 'Alerta de precio fuera de rango',
                html: htmlTemplate,
                from: process.env.EMAIL,
                to: process.env.EMAIL
            });
            return handleHttpError(res, 'INVALID_PRODUCT_PRICE', 400);
        }

        const product = await productModel.create(body);
        res.status(201).send(product);
    } catch (err) {
        console.error(err);
        handleHttpError(res, 'ERROR_CREATE_PRODUCT');
    }
};

// Obtener productos con filtros
const getProducts = async (req, res) => {
    try {
        const { minPrice, maxPrice, minRating, sortBy, category, name, deleted } = req.query;

        const filter = {};

        // --- Filtrado por precio sólo si son números válidos ---
        const minP = parseFloat(minPrice);
        const maxP = parseFloat(maxPrice);
        if (!isNaN(minP) || !isNaN(maxP)) {
            filter.price = {};
            if (!isNaN(minP)) filter.price.$gte = minP;
            if (!isNaN(maxP)) filter.price.$lte = maxP;
        }

        if (category) {
            filter.category = category;
        }

        if (name) {
            filter.name = { $regex: name, $options: 'i' };
        }

        // Filtrado por rating (sólo existencia de reseñas)
        if (minRating) {
            filter.reviews = { $exists: true, $not: { $size: 0 } };
        }

        // Orden
        let sort = {};
        if (sortBy === 'sold') sort = { sold: -1 };
        else if (sortBy === 'priceAsc') sort = { price: 1 };
        else if (sortBy === 'priceDesc') sort = { price: -1 };

        let query;

        if (deleted == 'true') {
            query = productModel
                .findDeleted(filter)
                .sort(sort)
                .populate('reviews.reviewTexts.user', 'name');
        } else {
            query = productModel
                .find(filter)
                .sort(sort)
                .populate('reviews.reviewTexts.user', 'name');
        }

        let products = await query;

        // Filtrado final por rating promedio
        if (minRating) {
            const minR = parseFloat(minRating);
            if (!isNaN(minR)) {
                products = products.filter(p => {
                    const avgRating =
                        p.reviews.reviewTexts.reduce((acc, r) => acc + r.rating, 0) /
                        (p.reviews.length || 1);
                    return avgRating >= minR;
                });
            }
        }

        res.status(200).send(products);
    } catch (err) {
        console.error(err);
        handleHttpError(res, 'ERROR_GET_PRODUCTS');
    }
};

// Obtener un producto por ID
const getProductById = async (req, res) => {
    try {
        const { id } = matchedData(req);
        const product = await productModel
            .findById(id)
            .populate('reviews.reviewTexts.user', 'name');
        if (!product) return handleHttpError(res, 'PRODUCT_NOT_FOUND', 404);
        res.send(product);
    } catch (err) {
        console.error(err);
        handleHttpError(res, 'ERROR_GET_PRODUCT');
    }
};

// Actualizar producto
const updateProduct = async (req, res) => {
    try {
        const { id } = matchedData(req);
        const product = await productModel.findById(id);
        if (!product) return handleHttpError(res, 'PRODUCT_NOT_FOUND', 404);
        const data = matchedData(req, { locations: ['body'] });
        const updated = await productModel.findByIdAndUpdate(id, data, { new: true });
        res.send(updated);
    } catch (err) {
        console.error(err);
        handleHttpError(res, 'ERROR_UPDATE_PRODUCT');
    }
};

// Eliminar producto
const deleteProduct = async (req, res) => {
    try {
        const { id } = matchedData(req);
        const { logic } = req.query;
        if (logic === 'true') {
            const deleteLogical = await productModel.delete({ _id: id });
            if (!deleteLogical) {
                return res.status(404).send(`USER_${id}_NOT_FOUND`);
            }
            res.status(200).send(deleteLogical);
        } else {
            const productToDelete = await productModel.findOne({ _id: id });

            if (!productToDelete) {
                return res.status(404).send('USER_NOT_FOUND');
            }

            if (productToDelete.images.length !== 0) {
                for (const image of productToDelete.images) {
                    const parts = image.split('/ipfs/');
                    const imageCid = parts.length > 1 ? parts[1] : null;
                    if (imageCid) {
                        deleteFromPinata(imageCid);
                    }
                }
            }

            const deleted = await userModel.findOneAndDelete({ _id: id });
            if (!deleted) {
                return res.status(404).send(`USER_NOT_FOUND_WITH_${id}`);
            }
            res.status(200).send(deleted);
        }
    } catch (err) {
        console.log(err);
        handleHttpError(res, 'ERROR_DELETE_USER');
    }
};

// Añadir imagen
const addImage = async (req, res) => {
    try {
        const userId = req.user._id;
        const { productId } = matchedData(req);
        const fileBuffer = req.file.buffer;
        const fileName = req.file.originalname;
        const pinataResponse = await uploadToPinata(fileBuffer, fileName, userId);
        const ipfsFile = pinataResponse.IpfsHash;
        const ipfs = `https://${process.env.PINATA_GATEWAY_URL}/ipfs/${ipfsFile}`;
        const data = await productModel.updateOne(
            { _id: productId },
            {
                $push: {
                    images: ipfs
                }
            }
        );

        res.status(200).send(data);
    } catch (err) {
        console.log(err);
        res.status(500).send('ERROR_ADDING_IMAGE_TO_CLOUD');
    }
};

// Añadir reseña
const addReview = async (req, res) => {
    try {
        const { id } = matchedData(req);
        const userId = req.user._id;
        const { rating, comment } = matchedData(req);

        const product = await productModel.findById(id);
        if (!product) return handleHttpError(res, 'PRODUCT_NOT_FOUND', 404);

        const alreadyReviewed = product.reviews.reviewTexts.find(
            r => r.user.toString() === userId.toString()
        );
        if (alreadyReviewed) return handleHttpError(res, 'ALREADY_REVIEWED', 400);

        product.reviews.reviewTexts.push({ user: userId, rating, comment });

        const totalRatings = product.reviews.reviewTexts.length;
        const sumRatings = product.reviews.reviewTexts.reduce((sum, r) => sum + r.rating, 0);
        const avgRating = totalRatings > 0 ? sumRatings / totalRatings : 0;

        product.reviews.totalRatings = totalRatings;
        product.reviews.scoring = parseFloat(avgRating.toFixed(2));

        await product.save();

        res.status(201).send(product);
    } catch (err) {
        console.error(err);
        handleHttpError(res, 'ERROR_ADD_REVIEW');
    }
};

// Eliminar reseña
const deleteReview = async (req, res) => {
    try {
        const { productId, reviewId } = matchedData(req);
        const userId = req.user._id;

        const product = await productModel.findById(productId);
        if (!product) return handleHttpError(res, 'PRODUCT_NOT_FOUND', 404);

        const reviewIndex = product.reviews.reviewTexts.findIndex(
            r => r._id.toString() === reviewId
        );
        if (reviewIndex === -1) return handleHttpError(res, 'REVIEW_NOT_FOUND', 404);

        if (product.reviews.reviewTexts[reviewIndex].user.toString() !== userId.toString()) {
            return handleHttpError(res, 'UNAUTHORIZED', 403);
        }

        product.reviews.reviewTexts.splice(reviewIndex, 1);

        const totalRatings = product.reviews.reviewTexts.length;
        const sumRatings = product.reviews.reviewTexts.reduce((sum, r) => sum + r.rating, 0);
        const avgRating = totalRatings > 0 ? sumRatings / totalRatings : 0;

        product.reviews.totalRatings = totalRatings;
        product.reviews.scoring = parseFloat(avgRating.toFixed(2));

        await product.save();

        res.status(200).send({ message: 'REVIEW_DELETED' });
    } catch (err) {
        console.error(err);
        handleHttpError(res, 'ERROR_DELETE_REVIEW');
    }
};

module.exports = {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    addImage,
    addReview,
    deleteReview
};
