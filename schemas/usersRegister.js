module.exports = {
    type: "object", 
    required: ["email, password, name, surnames, nif, keys"],
    properties: {
        email: {
            type: "string", 
            example: "alejandro@gmail.com"
        },
        password: {
            type: "string",
            example: "A123456789!"
        },
        name: {
            type: "string", 
            example: "Alejandro"
        },
        surnames: {
            type: "string",
            example: "Pepe Gonzalez"
        }
    }
}