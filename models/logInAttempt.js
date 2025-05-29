const mongoose = require('mongoose');

const LoginAttemptSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true
        },
        ip: {
            type: String
        },
        userAgent: {
            type: String
        },
        reason: {
            type: String, // Ej: 'Usuario no existe', 'Contraseña incorrecta'
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('login_attempts', LoginAttemptSchema);
