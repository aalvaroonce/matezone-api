const express = require('express');
const { checkRol } = require('../middleware/rol');
const authMiddleware = require('../middleware/session');
const { uploadMiddlewareMemory } = require('../utils/handleStorage');
const {
    validatorRegister,
    validatorLogin,
    validatorEmailCode,
    validatorEmailRecover,
    validatorEmail,
    validatorChangePassword,
    validatorGetUser,
    validatorUpdate,
    validatorUpdateUserRole
} = require('../validators/user');
const {
    registerCtrl,
    loginCtrl,
    validateEmail,
    validateEmailRecover,
    recoverPass,
    registerEmail
} = require('../controllers/auth');
const {
    getUser,
    updateUser,
    deleteUser,
    restoreUser,
    changePassword,
    addImage,
    updateUserRole,
    getLoginAttempts,
    getUsers
} = require('../controllers/user');
const router = express.Router();

/**
 * @openapi
 * /api/user/:
 *   get:
 *     tags:
 *       - User
 *     summary: Obtener los datos de todos los usuarios
 *     responses:
 *       '200':
 *         description: Usuario obtenido
 *       '404':
 *         description: No se encontró el usuario
 *       '500':
 *         description: Error en el servidor
 *     security:
 *       - bearerAuth: []
 */
router.get('/', authMiddleware, checkRol(['admin']), getUsers);

// Obtener usuario especifivo
/**
 * @openapi
 * /api/user/profile:
 *   get:
 *     tags:
 *       - User
 *     summary: Obtener los datos del usuario
 *     responses:
 *       '200':
 *         description: Usuario obtenido
 *       '404':
 *         description: No se encontró el usuario
 *       '500':
 *         description: Error en el servidor
 *     security:
 *       - bearerAuth: []
 */
router.get('/profile', authMiddleware, getUser);

/**
 * @openapi
 * /api/user/register-email:
 *   post:
 *     tags:
 *       - User
 *     summary: Registro por email
 *     description: Registra un nuevo usuario solo con su email.
 *     requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: "#/components/schemas/mailUser"
 *     responses:
 *       '200':
 *         description: Usuario creado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/userData"
 *       '409':
 *         description: El usuario ya existe.
 *       '422':
 *         description: Error de validación.
 *       '500':
 *         description: Error en el servidor.
 */
router.post('/register-email', validatorEmail, registerEmail);

/**
 * @openapi
 * /api/user/register:
 *  post:
 *      tags:
 *      - User
 *      summary: User registration
 *      description: Registers a new user with an email and password
 *      requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: "#/components/schemas/userRegister"
 *      responses:
 *          '200':
 *              description: Returns the inserted object and JWT Token
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: "#/components/schemas/userData"
 *          '409':
 *              description: User exists.
 *          '422':
 *              description: Validation error. The request body contains invalid fields.
 *          '500':
 *              description: Internal server error.
 */
router.post('/register', validatorRegister, registerCtrl);

/**
 * @openapi
 * /api/user/login:
 *  post:
 *      tags:
 *      - User
 *      summary: "User login"
 *      description: Login a user with email and password
 *      requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: "#/components/schemas/userLogin"
 *      responses:
 *          '200':
 *              description: Ok. Returns the JWT Token.
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: "#/components/schemas/userDataLogin"
 *          '401':
 *              description: User is not validated.
 *          '404':
 *              description: User not found.
 *          '422':
 *              description: Validation error. The request body contains invalid fields.
 *          '500':
 *              description: Internal server error
 */
router.post('/login', validatorLogin, loginCtrl);

/**
 * @openapi
 * /api/user/validation-mail:
 *  put:
 *      tags:
 *      - User
 *      summary: "User email validation"
 *      description: Validates the user's mail
 *      requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: "#/components/schemas/mailCode"
 *      responses:
 *          '200':
 *              description: Ok. Changes status field to 1 and returns an object with acknowledged to true
 *          '401':
 *              description: Unauthorized. Authentication token is missing or invalid.
 *          '422':
 *              description: Validation error. The request body contains invalid fields.
 *          '500':
 *              description: Internal server error
 *      security:
 *          - bearerAuth: []
 */
router.put('/validation-mail', authMiddleware, validatorEmailCode, validateEmail);

/**
 * @openapi
 * /api/user/validation-psswd:
 *  put:
 *      tags:
 *      - User
 *      summary: "User email validation to recover password"
 *      description: Validates the user's mail
 *      requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: "#/components/schemas/mailRecover"
 *      responses:
 *          '200':
 *              description: Ok. Returns user and token to change the password
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: "#/components/schemas/userData"
 *          '401':
 *              description: Unauthorized. Authentication token is missing or invalid.
 *          '422':
 *              description: Validation error. The request body contains invalid fields.
 *          '500':
 *              description: Internal server error
 */
router.put('/validation-psswd', validatorEmailRecover, validateEmailRecover);

/**
 * @openapi
 * /api/user/recover-psswd:
 *  put:
 *      tags:
 *      - User
 *      summary: "Recover token"
 *      description: Recover user token to validate and change password
 *      requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: "#/components/schemas/mailUser"
 *      responses:
 *          '200':
 *              description: OK. Send mail with code to verify.
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: "#/components/schemas/userData"
 *          '404':
 *              description: User email not found.
 *          '409':
 *              description: User is not validated.
 *          '422':
 *              description: Validation error. The request body contains invalid fields.
 *          '500':
 *              description: Internal server error
 */
router.put('/recover-psswd', validatorEmail, recoverPass);

// Actualización de un usuario
/**
 * @openapi
 * /api/user/profile:
 *   put:
 *     tags:
 *       - User
 *     summary: Actualizar un usuario
 *     parameters:
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/userUpdate"
 *     responses:
 *       '200':
 *         description: Usuario actualizado
 *       '404':
 *         description: No se encontró el usuario
 *       '500':
 *         description: Error en el servidor
 *     security:
 *       - bearerAuth: []
 */
router.put('/profile', authMiddleware, validatorUpdate, updateUser);

/**
 * @openapi
 * /api/user/changepswd:
 *  put:
 *      tags:
 *      - User
 *      summary: Change password for a user
 *      description: Allows a user to update its password by verifying the current password.
 *      requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          currentPassword:
 *                              type: string
 *                              example: OldPassword123
 *                          newPassword:
 *                              type: string
 *                              example: NewPassword456
 *                      required:
 *                          - currentPassword
 *                          - newPassword
 *      responses:
 *          '200':
 *              description: Password successfully changed
 *          '401':
 *              description: Unauthorized - Incorrect current password
 *          '404':
 *              description: User not found
 *          '400':
 *              description: Validation error
 *          '500':
 *              description: Server error
 *      security:
 *          - bearerAuth: []
 */
router.put('/changepswd', authMiddleware, validatorChangePassword, changePassword);

// Eliminar un usuario
/**
 * @openapi
 * /api/user/:
 *   delete:
 *     tags:
 *       - User
 *     summary: Eliminar un usuario (borrado lógico o físico)
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID del usuario a restaurar
 *         required: true
 *         schema:
 *           type: string
 *       - name: logic
 *         in: query
 *         description: "true para borrado lógico, false para físico (por defecto físico)"
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Usuario eliminado
 *       '404':
 *         description: No se encontró el usuairo
 *       '500':
 *         description: Error en el servidor
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', authMiddleware, validatorGetUser, deleteUser);

/**
 * @openapi
 * /api/user/addimage:
 *  patch:
 *      tags:
 *      - User
 *      summary: Add an image to a user
 *      description: Adds an image to the image array of the specified user by its CIF
 *      requestBody:
 *          content:
 *              multipart/form-data:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          image:
 *                              type: string
 *                              format: binary
 *      responses:
 *          '200':
 *              description: Successfully added the image
 *          '400':
 *              description: Already existing image in db
 *          '403':
 *              description: Validation error
 *          '404':
 *              description: user not found
 *          '500':
 *              description: Server error
 *      security:
 *          - bearerAuth: []
 */
router.patch('/addimage', authMiddleware, uploadMiddlewareMemory.single('image'), addImage);

/**
 * @openapi
 * /api/user/updaterole:
 *   patch:
 *     tags:
 *       - User
 *     summary: Cambiar el rol de un usuario
 *     description: Solo los administradores pueden cambiar el rol de un usuario.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - newRole
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "661a2b4f6f0c2f3c58d8a456"
 *               newRole:
 *                 type: string
 *                 enum: [user, seller, admin]
 *                 example: "seller"
 *     responses:
 *       '200':
 *         description: Rol actualizado correctamente
 *       '403':
 *         description: No autorizado para cambiar roles
 *       '404':
 *         description: Usuario no encontrado
 *       '422':
 *         description: Error de validación en los campos
 *       '500':
 *         description: Error en el servidor
 *     security:
 *       - bearerAuth: []
 */
router.patch(
    '/updaterole',
    authMiddleware,
    checkRol(['admin']),
    validatorUpdateUserRole,
    updateUserRole
);

// Retornar un usuario
/**
 * @openapi
 * /api/user/restore/{id}:
 *   patch:
 *     tags:
 *       - User
 *     summary: Restaurar un usuario eliminado lógicamente
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID del usuario a restaurar
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Usuario restaurado
 *       '404':
 *         description: No se encontró el usuario o no está eliminado
 *       '500':
 *         description: Error en el servidor
 *     security:
 *       - bearerAuth: []
 */
router.patch('/restore/:id', authMiddleware, checkRol(['admin']), validatorGetUser, restoreUser);

/**
 * @openapi
 * /api/user/login-attempts:
 *   get:
 *     tags:
 *       - User
 *     summary: Obtener los intentos de login fallidos
 *     description: Retorna una lista de intentos fallidos de login registrados en el sistema. Solo accesible para administradores.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Lista de intentos de login fallidos obtenida exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: "66534ab27e56c1c8b888e334"
 *                   email:
 *                     type: string
 *                     example: "ejemplo@correo.com"
 *                   ip:
 *                     type: string
 *                     example: "192.168.1.10"
 *                   userAgent:
 *                     type: string
 *                     example: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)..."
 *                   reason:
 *                     type: string
 *                     example: "INVALID_PASSWORD"
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     example: "2025-05-26T18:13:45.123Z"
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *                     example: "2025-05-26T18:13:45.123Z"
 *       '403':
 *         description: Acceso denegado. Solo administradores pueden consultar esta ruta.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "ACCESS_DENIED"
 *       '500':
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "ERROR_GET_FAILED_LOGINS"
 */
router.get('/login-attempts', authMiddleware, checkRol(['admin']), getLoginAttempts);

module.exports = router;
