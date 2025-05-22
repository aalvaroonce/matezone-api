const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');

const ProductSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        description: {
            type: String
        },
        price: {
            type: Number,
            required: true
        },
        discount: {
            type: Number, // porcentaje: 0-100
            default: 0
        },
        stock: {
            type: Number,
            default: 0
        },
        category: {
            type: String,
            required: true
        },
        sold: {
            type: Number,
            default: 0
        },
        attributes: [
            {
                nombre: String,
                valor: String
            }
        ],
        images: [String],
        reviews: {
            scoring: {
                type: Number,
                default: 0
            },
            totalRatings: {
                type: Number,
                default: 0
            },
            reviewTexts: [
                {
                    user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
                    rating: { type: Number, min: 1, max: 5 },
                    comment: String,
                    createdAt: { type: Date, default: Date.now }
                }
            ]
        }
    },
    {
        timestamps: true
    }
);

ProductSchema.plugin(mongooseDelete, { overrideMethods: 'all' });
module.exports = mongoose.model('product', ProductSchema);
