const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');

const UserScheme = new mongoose.Schema(
    {
        name: {
            type: String
        },
        surnames: {
            type: String
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        emailCode: {
            type: String
        },
        attempt: {
            type: Number,
            default: 0
        },
        phoneNumber: {
            type: String
        },
        password: {
            type: String,
            select: false
        },
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user'
        },
        address: {
            street: String,
            number: String,
            postal: String,
            city: String,
            province: String
        },
        notifications: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

UserScheme.plugin(mongooseDelete, { overrideMethods: 'all' });
module.exports = mongoose.model('user', UserScheme);
