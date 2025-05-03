const swaggerJsdoc = require("swagger-jsdoc");
const establishment = require("../schemas/establishment");

const options = {

    definition: {
            openapi: "3.1.0",

            info: {
                title: " MATEZONE ",
                version: "0.1.0",
                description: "This is an API for an online shop",

                license: {
                    name: "MIT",
                    url: "https://spdx.org/licenses/MIT.html",
                },

                contact: {
                    name: "Álvaro Caravaca Díez",
                    url: "https://immune.institute",
                    email: "alvaro.caravaca@immune.institute",

                },

            },

            servers: [

                {
                    url: "http://localhost:8000",
                },

            ],
            components: {
                securitySchemes: {
                    bearerAuth: {
                        type: "http",
                        scheme: "bearer"
                    },
                },
                
                schemas:{
                    usersLogin: require("../schemas/usersLogin"),
                    usersRegister: require("../schemas/usersRegister"),
                }
            }
    },

    apis: ["./routes/*.js"],

};

module.exports = swaggerJsdoc(options)