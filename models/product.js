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
        stock: {
            type: Number,
            default: 0
        },
        category: {
            type: String,
            required: true
        },
        attributes: [
            {
                nombre: String,
                valor: String
            }
        ],
        images: [
            {
                url: String,
                alt: String
            }
        ]
    },
    {
        timestamps: true
    }
);

ProductoSchema.plugin(mongooseDelete, { overrideMethods: 'all' });
module.exports = mongoose.model('product', ProductSchema);
