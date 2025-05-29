module.exports = {
    type: 'object',
    required: ['items', 'total', 'shippingAddress'],
    properties: {
        items: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    product: {
                        type: 'string',
                        example: '64fc78a1b60e4100234b9f21'
                    },
                    quantity: {
                        type: 'integer',
                        example: 2
                    },
                    unit_price: {
                        type: 'number',
                        example: 19.99
                    }
                }
            }
        },
        total: {
            type: 'number',
            example: 39.98
        },
        deliveryMethod: {
            type: 'string',
            enum: ['standard', 'express', 'urgent'],
            example: 'express'
        },
        shippingAddress: {
            type: 'object',
            properties: {
                street: {
                    type: 'string',
                    example: 'Calle Falsa'
                },
                number: {
                    type: 'string',
                    example: '123'
                },
                postal: {
                    type: 'string',
                    example: '28080'
                },
                city: {
                    type: 'string',
                    example: 'Madrid'
                },
                province: {
                    type: 'string',
                    example: 'Madrid'
                }
            }
        }
    }
};
