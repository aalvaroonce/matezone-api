const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');

const OrderSchema = new mongoose.Schema(
    {
        client: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: true
        },
        date: {
            type: Date,
            default: Date.now
        },
        total: {
            type: Number,
            required: true
        },
        state: {
            type: String,
            enum: ['pending', 'in-process', 'sent', 'recived', 'cancelled'],
            default: 'pending'
        },
        items: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'product'
                },
                name: String,
                quantity: Number,
                unit_price: Number
            }
        ],
        shippingAddress: {
            street: String,
            number: String,
            postal: String,
            city: String,
            province: String
        }
    },
    {
        timestamps: true
    }
);

OrderSchema.plugin(mongooseDelete, { overrideMethods: 'all' });
module.exports = mongoose.model('order', OrderSchema);
