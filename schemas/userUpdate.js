module.exports = {
    type: 'object',
    required: ['email, phoneNumber, name, surnames'],
    properties: {
        email: {
            type: 'string',
            example: 'a.car@immune.es'
        },
        phoneNumber: {
            type: 'string',
            example: '999999999'
        },
        name: {
            type: 'string',
            example: 'Alejandro'
        },
        surnames: {
            type: 'string',
            example: 'Gonzalez'
        }
    }
};
