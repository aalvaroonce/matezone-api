const swaggerJsdoc = require('swagger-jsdoc');
const orderUpdateStatus = require('../schemas/orderUpdateStatus');

const options = {
    definition: {
        openapi: '3.1.0',

        info: {
            title: ' MATEZONE ',
            version: '0.1.0',
            description: 'This is an API for an online shop',

            license: {
                name: 'MIT',
                url: 'https://spdx.org/licenses/MIT.html'
            },

            contact: {
                name: 'Álvaro Caravaca Díez',
                url: 'https://immune.institute',
                email: 'alvaro.caravaca@immune.institute'
            }
        },

        servers: [
            {
                url: 'http://localhost:8000'
            }
        ],

        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer'
                }
            },

            schemas: {
                userLogin: require('../schemas/usersLogin'),
                userRegister: require('../schemas/usersRegister'),
                userDataLogin: require('../schemas/userDataLogin'),
                userData: require('../schemas/userData'),
                userUpdate: require('../schemas/userUpdate'),
                mailCode: require('../schemas/mailCode'),
                mailRecover: require('../schemas/mailRecover'),
                mailUser: require('../schemas/mailUser'),
                createOrder: require('../schemas/createOrder'),
                orderUpdateStatus: require('../schemas/orderUpdateStatus')
            }
        }
    },

    apis: ['./routes/*.js']
};

module.exports = swaggerJsdoc(options);
