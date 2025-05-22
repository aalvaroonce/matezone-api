const { matchedData } = require('express-validator');
const { userModel } = require('../models');
const { compare, encrypt } = require('../utils/handlePassword');
const { uploadToPinata, deleteFromPinata } = require('../utils/handleUploadIPFS');
const { handleHttpError } = require('../utils/handleError');

const getUser = async (req, res) => {
    try {
        const userId = req.user._id;
        const data = await userModel.findById(userId).select('-attempt -status -role -emailCode');
        if (!data) {
            handleHttpError(res, 'USER_NOT_FOUND', 404);
            return;
        }

        res.send(data);
    } catch (err) {
        handleHttpError(res, 'ERROR_GETTING_USER');
    }
};

// Actualizar un usuario
const updateUser = async (req, res) => {
    try {
        const id = req.user._id;
        const body = matchedData(req);

        const data = await userModel
            .updateOne({ _id: id }, body, {
                new: true
            })
            .select('-password');
        res.status(200).send(data);
    } catch (err) {
        handleHttpError(res, 'ERROR_UPDATE_USER');
    }
};

const changePassword = async (req, res) => {
    const id = req.user._id;
    const { currentPassword, newPassword } = matchedData(req);

    try {
        // Intentar encontrar un usuario por email en userModel
        let user = await userModel.findOne({ _id: id }).select('+password');

        // Si no encuentra un usuario, buscar en userModel
        if (!user) {
            return res.status(404).send({ message: 'USER_NOT_EXISTS' });
        }
        console.log(user);
        const hashPassword = user.password;
        console.log(currentPassword, hashPassword);
        const isPasswordValid = await compare(currentPassword, hashPassword);

        if (!isPasswordValid) {
            return res.status(401).send({ message: 'LAST_PASSWORD_INCORRECT' });
        } else {
            const newPasswordHashed = await encrypt(newPassword);
            await userModel.findOneAndUpdate(
                { _id: id },
                { password: newPasswordHashed },
                { new: true }
            );
            return res.status(200).send({ message: 'CORRECT_PASSWORD', data: true });
        }
    } catch (err) {
        console.error('Error en el cambio de contraseña:', err);
        return handleHttpError(res, {
            message: 'Error al comprobar y añadir la contraseña',
            error: err.message
        });
    }
};

const addImage = async (req, res) => {
    try {
        const userId = req.user._id;
        const fileBuffer = req.file.buffer;
        const fileName = req.file.originalname;
        const pinataResponse = await uploadToPinata(fileBuffer, fileName, userId);
        const ipfsFile = pinataResponse.IpfsHash;
        const ipfs = `https://${process.env.PINATA_GATEWAY_URL}/ipfs/${ipfsFile}`;
        const data = await userModel.updateOne(
            { _id: userId },
            { urlToAvatar: ipfs },
            { new: true }
        );

        res.status(200).send(data);
    } catch (err) {
        console.log(err);
        res.status(500).send('ERROR_ADDING_IMAGE_TO_CLOUD');
    }
};

// Eliminar usuario
const deleteUser = async (req, res) => {
    try {
        const id = req.user._id;
        const { logic } = req.query;
        if (logic === 'true') {
            const deleteLogical = await userModel.delete({ _id: id });
            if (!deleteLogical) {
                return res.status(404).send(`USER_${id}_NOT_FOUND`);
            }
            res.status(200).send(deleteLogical);
        } else {
            const userToDelete = await userModel.findOne({ _id: id });

            if (!userToDelete) {
                return res.status(404).send('USER_NOT_FOUND');
            }

            if (userToDelete.urlToAvatar) {
                const imageCid = userToDelete.urlToAvatar.split('/ipfs/') ? parts[1] : null;
                deleteFromPinata(imageCid);
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

// Retornar usuario
const restoreUser = async (req, res) => {
    try {
        const { id } = matchedData(req);
        const exist = await userModel.findOneWithDeleted({ _id: id });
        if (!exist) {
            return res.status(404).send('USER_NOT_FOUND');
        }
        if (!exist.deleted) {
            return res.status(404).send('USER_NOT_ELIMMINATED');
        }
        const restored = await userModel.restore({ _id: id });
        res.status(200).send(restored);
    } catch (err) {
        console.log(err);
        res.status(500).send('ERROR_RECOVERING_USER');
    }
};

const updateUserRole = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return handleHttpError(res, 'FORBIDDEN_ROLE_CHANGE', 403);
        }

        const { userId, newRole } = matchedData(req);

        const user = await userModel.findById(userId);
        if (!user) {
            return handleHttpError(res, 'USER_NOT_FOUND', 404);
        }

        user.role = newRole;
        await user.save();

        res.send('ROL_UPDATED');
    } catch (err) {
        console.log(err);
        handleHttpError(res, 'ERROR_UPDATE_USER_ROLE');
    }
};

module.exports = {
    getUser,
    updateUser,
    deleteUser,
    restoreUser,
    changePassword,
    addImage,
    updateUserRole
};
