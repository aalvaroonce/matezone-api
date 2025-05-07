module.exports = {
    type: 'object',
    required: ['email, password, name, surnames, nif, keys'],
    properties: {
        email: {
            type: 'string',
            example: 'a.car@immune.es'
        },
        password: {
            type: 'string',
            example: 'Contra3$.12'
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
