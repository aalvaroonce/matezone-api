const { userModel } = require('../models');
const { verifyToken } = require('../utils/handleToken');
const { handleHttpError } = require('../utils/handleError');

const authMiddleware = async (req, res, next) => {
    try {
        if (!req.headers.authorization) {
            res.status(401).send('AUTHORIZATION_TOKEN_NEEDED');
            return;
        }

        const token = req.headers.authorization?.split(' ').pop() || req.query.token;

        if (!token) return handleHttpError(res, 'NOT_TOKEN', 401);

        // Del token, miramos en Payload (revisar verifyToken de utils/handleToken)
        const dataToken = verifyToken(token);

        if (!dataToken || !dataToken._id) return handleHttpError(res, 'ERROR_ID_TOKEN', 401);

        const user = await userModel.findById(dataToken._id);

        req.user = user;

        if (!req.body.code && user?.status === 0)
            return handleHttpError(res, 'USER_NOT_VALIDATED', 401);

        next();
    } catch (err) {
        console.log(err);
        return handleHttpError(res, 'NOT_SESSION', 401);
    }
};

module.exports = authMiddleware;
