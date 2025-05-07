const {
    registerCtrl,
    validateEmail,
    validateEmailRecover,
    recoverPass
} = require('../controllers/auth');
const authMiddleware = require('../middleware/session');
const {
    validatorRegister,
    validatorEmailCode,
    validatorEmailRecover,
    validatorLogin,
    validatorEmail
} = require('../validators/user');
const router = express.Router();

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
 * /api/user/validation:
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
router.put('/validation', authMiddleware, validatorEmailCode, validateEmail);

/**
 * @openapi
 * /api/user/validation:
 *  post:
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
router.post('/validation', validatorEmailRecover, validateEmailRecover);

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
 * /api/user/recover:
 *  post:
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
 *                          $ref: "#/components/schemas/userDataRecover"
 *          '404':
 *              description: User email not found.
 *          '409':
 *              description: User is not validated.
 *          '422':
 *              description: Validation error. The request body contains invalid fields.
 *          '500':
 *              description: Internal server error
 */
router.post('/recover', validatorEmail, recoverPass);

module.exports = router;
