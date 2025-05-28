const { matchedData } = require('express-validator');
const { handleHttpError } = require('../utils/handleError');
const { productModel } = require('../models');
const { uploadToPinata } = require('../utils/handleUploadIPFS');

// Crear producto
const VALID_PRICE_RANGES = {
    mates: { min: 20, max: 60 },
    bombillas: { min: 8, max: 20 },
    yerbas: { min: 5, max: 11 },
    termos: { min: 20, max: 60 }
};

const calculateFinalPrice = (price, discount) => {
    const desc = discount || 0;
    return price * (1 - desc / 100);
};

const createProduct = async (req, res) => {
    try {
        const body = matchedData(req);
        const { price, discount, category, name } = body;

        const finalPrice = calculateFinalPrice(price, discount);
        const limits = VALID_PRICE_RANGES[category];

        if (!limits) {
            await sendAlertMail({
                subject: 'Intento de creación con categoría inválida',
                text: `Categoría no reconocida: ${category} para el producto "${name}".`
            });
            return handleHttpError(res, 'INVALID_CATEGORY', 400);
        }

        const isValidPrice = finalPrice >= limits.min && finalPrice <= limits.max;

        if (!isValidPrice) {
            await sendAlertMail({
                subject: 'Alerta de precio fuera de rango',
                text: `Intento de creación sospechoso:\nProducto: ${name}\nCategoría: ${category}\nPrecio original: ${price}\nDescuento: ${discount}%\nPrecio final: ${finalPrice.toFixed(2)}\nRango permitido: ${limits.min} - ${limits.max}`
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
        const { minPrice, maxPrice, minRating, sortBy, category, name } = req.query;

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
            filter.name = name;
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

        // Búsqueda inicial
        let products = await productModel.find(filter).sort(sort);

        // Filtrado final por rating promedio
        if (minRating) {
            const minR = parseFloat(minRating);
            if (!isNaN(minR)) {
                products = products.filter(p => {
                    const avgRating =
                        p.reviews.reduce((acc, r) => acc + r.rating, 0) / (p.reviews.length || 1);
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
        const product = await productModel.findById(id).populate('reviews.user', 'name');
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

// Eliminar producto (lógica)
const deleteProduct = async (req, res) => {
    try {
        const { id } = matchedData(req);
        const deleted = await productModel.delete({ _id: id });
        res.send(deleted);
    } catch (err) {
        console.error(err);
        handleHttpError(res, 'ERROR_DELETE_PRODUCT');
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
