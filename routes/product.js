const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/session');
const { checkRol } = require('../middleware/rol');
const { uploadMiddlewareMemory } = require('../utils/handleStorage');
const {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    addImage,
    addReview,
    deleteReview
} = require('../controllers/product');
const {
    validatorCreateProduct,
    validatorGetProductById,
    validatorUpdateProduct,
    validatorDeleteProduct,
    validatorAddImage,
    validatorAddReview,
    validatorDeleteReview
} = require('../validators/product');

/**
 * @openapi
 * /api/product:
 *   post:
 *     tags:
 *       - Product
 *     summary: Crear un nuevo producto
 *     description: Crea un producto con la información proporcionada
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - category
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               discount:
 *                 type: number
 *               stock:
 *                 type: number
 *               category:
 *                 type: string
 *               attributes:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     nombre:
 *                       type: string
 *                     valor:
 *                       type: string
 *     responses:
 *       '201':
 *         description: Producto creado correctamente
 *       '422':
 *         description: Error de validación
 *       '500':
 *         description: Error interno del servidor
 */
router.post('/', authMiddleware, checkRol(['admin']), validatorCreateProduct, createProduct);

/**
 * @openapi
 * /api/product:
 *   get:
 *     tags:
 *       - Product
 *     summary: Listar productos con filtros
 *     description: Obtiene productos y permite filtrar por precio, rating mínimo, categoría y ordenar por precio o más vendidos
 *     parameters:
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Precio mínimo filtrado
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Precio máximo filtrado
 *       - in: query
 *         name: minRating
 *         schema:
 *           type: number
 *         description: Rating promedio mínimo
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [sold, priceAsc, priceDesc]
 *         description: Ordenar por 'sold', 'priceAsc' o 'priceDesc'
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filtrar por categoría
 *     responses:
 *       '200':
 *         description: Lista de productos
 *       '500':
 *         description: Error interno del servidor
 */
router.get('/', getProducts);

/**
 * @openapi
 * /api/product/{id}:
 *   get:
 *     tags:
 *       - Product
 *     summary: Obtener un producto por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del producto
 *     responses:
 *       '200':
 *         description: Detalles del producto
 *       '404':
 *         description: Producto no encontrado
 *       '500':
 *         description: Error interno del servidor
 */
router.get('/:id', validatorGetProductById, getProductById);

/**
 * @openapi
 * /api/product/{id}:
 *   put:
 *     tags:
 *       - Product
 *     summary: Actualizar un producto
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del producto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               discount:
 *                 type: number
 *               stock:
 *                 type: number
 *               category:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Producto actualizado correctamente
 *       '404':
 *         description: Producto no encontrado
 *       '500':
 *         description: Error interno del servidor
 */
router.put('/:id', authMiddleware, checkRol(['admin']), validatorUpdateProduct, updateProduct);

/**
 * @openapi
 * /api/product/{id}:
 *   delete:
 *     tags:
 *       - Product
 *     summary: Eliminar un producto (borrado lógico)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del producto a eliminar
 *     responses:
 *       '200':
 *         description: Producto eliminado correctamente
 *       '404':
 *         description: Producto no encontrado
 *       '500':
 *         description: Error interno del servidor
 */
router.delete('/:id', authMiddleware, checkRol(['admin']), validatorDeleteProduct, deleteProduct);

/**
 * @openapi
 * /api/product/{id}/addimage:
 *   patch:
 *     tags:
 *       - Product
 *     summary: Añadir imagen a un producto
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del producto
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *               alt:
 *                 type: string
 *                 description: Texto alternativo de la imagen
 *     responses:
 *       '200':
 *         description: Imagen añadida correctamente
 *       '400':
 *         description: Error en la solicitud
 *       '500':
 *         description: Error interno del servidor
 */
router.patch(
    '/:id/addimage',
    authMiddleware,
    validatorAddImage,
    uploadMiddlewareMemory.single('image'),
    addImage
);

/**
 * @openapi
 * /api/product/{id}/review:
 *   post:
 *     tags:
 *       - Product
 *     summary: Añadir una reseña a un producto
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del producto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *               - comment
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *     responses:
 *       '201':
 *         description: Reseña añadida correctamente
 *       '400':
 *         description: Ya existe una reseña del usuario
 *       '404':
 *         description: Producto no encontrado
 *       '500':
 *         description: Error interno del servidor
 */
router.post('/:id/review', authMiddleware, validatorAddReview, addReview);

/**
 * @openapi
 * /api/product/{productId}/review/{reviewId}:
 *   delete:
 *     tags:
 *       - Product
 *     summary: Eliminar una reseña de un producto
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del producto
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la reseña a eliminar
 *     responses:
 *       '200':
 *         description: Reseña eliminada correctamente
 *       '403':
 *         description: No autorizado
 *       '404':
 *         description: Producto o reseña no encontrado
 *       '500':
 *         description: Error interno del servidor
 */
router.delete('/:productId/review/:reviewId', authMiddleware, validatorDeleteReview, deleteReview);

module.exports = router;
