module.exports = {
    type: 'object',
    required: ['email', 'code'],
    properties: {
        email: {
            type: 'string',
            example: 'a.car@gmail.com'
        },
        code: {
            type: 'string',
            example: '000000'
        }
    }
};
