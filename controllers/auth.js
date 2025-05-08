const { matchedData } = require('express-validator');
const { tokenSign } = require('../utils/handleToken');
const { encrypt, compare } = require('../utils/handlePassword');
const { generateVerificationCode, sendEmail } = require('../utils/handleMails');
const { handleHttpError } = require('../utils/handleError');
const { userModel } = require('../models');
const path = require('path');
const fs = require('fs');

const registerCtrl = async (req, res) => {
    try {
        req = matchedData(req);
        const password = await encrypt(req.password);
        const emailCode = generateVerificationCode();
        req.email = req.email.toLowerCase();
        const filter = { email: req.email };
        const user = await userModel.findOne(filter).select('email status role company');

        if (user && user.status >= 1) {
            handleHttpError(res, 'USER_EXISTS', 409);
            return;
        }

        const templatePath = path.join(__dirname, '../templates/verificationCodeMail.html');
        let htmlTemplate = fs.readFileSync(templatePath, 'utf8');

        htmlTemplate = htmlTemplate.replace('verifyCode', emailCode);

        sendEmail({
            subject: 'Tu código de verificación de Matezone',
            html: htmlTemplate,
            from: process.env.EMAIL,
            to: req.email
        });

        const body = {
            ...req,
            password,
            emailCode
        };

        let dataUser;

        if (!user) {
            dataUser = await userModel.create(body);
        } else {
            await userModel.updateOne(filter, { $set: body });
            dataUser = user;
        }

        dataUser.set('password', undefined, { strict: false });
        dataUser.set('emailCode', undefined, { strict: false });

        const data = {
            token: tokenSign(dataUser),
            user: dataUser
        };

        res.send(data);
    } catch (err) {
        console.log(err);
        handleHttpError(res, 'ERROR_REGISTER_USER');
    }
};

const loginCtrl = async (req, res) => {
    try {
        req = matchedData(req);
        req.email = req.email.toLowerCase();

        const user = await userModel
            .findOne({ email: req.email })
            .select(
                'password name role email status nif company needCompleteOnboarding onboardingStep'
            );

        if (!user) {
            handleHttpError(res, 'USER_NOT_EXIST', 404);
            return;
        }

        if (user.status === 0) {
            handleHttpError(res, 'USER_NOT_VALIDATED', 401);
            return;
        }

        const hashPassword = user.password;
        const check = await compare(req.password, hashPassword);

        if (!check) {
            handleHttpError(res, 'INVALID_PASSWORD', 401);
            return;
        }

        user.set('password', undefined, { strict: false });
        user.set('company', undefined, { strict: false });
        user.set('nif', undefined, { strict: false });
        user.set('needCompleteOnboarding', undefined, { strict: false });
        user.set('onboardingStep', undefined, { strict: false });

        const data = {
            token: tokenSign(user),
            user
        };
        res.send(data);
    } catch (err) {
        console.log(err);
        handleHttpError(res, 'ERROR_LOGIN_USER', 403);
    }
};

const validateEmail = async (req, res) => {
    try {
        userId = req.user._id;
        const { code } = matchedData(req);
        const data = await userModel.findById(userId);

        if (data.emailCode === code && data.attempt < 10) {
            const doc = await userModel.updateOne({ _id: userId }, { status: 1 });
            res.send(doc);
        } else {
            const counter = data.attempt + 1;
            await userModel.updateOne({ _id: userId }, { $set: { attempt: counter } });
            handleHttpError(res, 'ERROR_MAIL_CODE', 400);
        }
    } catch (err) {
        console.log(err);
        handleHttpError(res, 'ERROR_VALIDATE_USER_EMAIL');
    }
};

const validateEmailRecover = async (req, res) => {
    try {
        req = matchedData(req);
        const user = await userModel
            .findOne({ email: req.email })
            .select('email role status emailCode attempt');
        if (user.emailCode === req.code && user.attempt < 10) {
            const data = {
                token: tokenSign(user),
                user: user
            };
            if (user.attempt > 0) {
                await userModel.updateOne({ email: req.email }, { $set: { attempt: 0 } });
            }
            res.send(data);
        } else {
            const counter = user.attempt + 1;
            await userModel.updateOne({ email: req.email }, { $set: { attempt: counter } });
            handleHttpError(res, 'ERROR_MAIL_CODE');
        }
    } catch (err) {
        console.log(err);
        handleHttpError(res, 'ERROR_VALIDATE_USER_EMAIL_RECOVER');
    }
};

const recoverPass = async (req, res) => {
    try {
        req = matchedData(req);
        const emailCode = generateVerificationCode();
        req.email = req.email.toLowerCase();
        filter = { email: req.email };
        const user = await userModel.findOne(filter).select('email role status');

        if (!user) {
            handleHttpError(res, 'USER_NOT_EXISTS', 404);
            return;
        }

        if (user.status === 0) {
            handleHttpError(res, 'USER_NOT_VALIDATED', 409);
            return;
        }
        const templatePath = path.join(__dirname, '../templates/passwordRecoveryCodeMail.html');
        let htmlTemplate = fs.readFileSync(templatePath, 'utf8');
        htmlTemplate = htmlTemplate.replace('verifyCode', emailCode);

        sendEmail({
            subject: 'Tu código de recuperación de Matezone',
            html: htmlTemplate,
            from: process.env.EMAIL,
            to: req.email
        });

        await userModel.updateOne(filter, { $set: { emailCode: emailCode } });

        const data = {
            user: user
        };
        res.send(data);
    } catch (err) {
        console.log(err);
        handleHttpError(res, 'ERROR_RECOVER_PASSWORD');
    }
};

module.exports = { registerCtrl, loginCtrl, validateEmail, validateEmailRecover, recoverPass };
