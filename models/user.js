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
        status: {
            type: Number,
            default: 0
        },
        lastTry: {
            type: Date
        },
        role: {
            type: String,
            enum: ['user', 'admin', 'seller'],
            default: 'user'
        },
        address: [
            {
                name: String,
                street: String,
                number: String,
                postal: String,
                city: String,
                province: String,
                isDefault: {
                    type: Boolean,
                    default: false
                }
            }
        ],
        urlToAvatar: {
            type: String
        }
    },
    {
        timestamps: true
    }
);

UserScheme.plugin(mongooseDelete, { overrideMethods: 'all' });
module.exports = mongoose.model('user', UserScheme);
