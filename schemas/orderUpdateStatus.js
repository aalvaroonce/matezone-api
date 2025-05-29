module.exports = {
    type: 'object',
    required: ['id', 'state'],
    properties: {
        id: {
            type: 'string',
            example: '64fc78a1b60e4100234b9f21'
        },
        state: {
            type: 'string',
            enum: ['pending', 'in-process', 'sent', 'received', 'cancelled'],
            example: 'sent'
        }
    }
};
